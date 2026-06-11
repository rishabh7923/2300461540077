const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const CACHE_FILE = path.resolve(__dirname, '.token_cache.json');
const AUTH_URL = `${process.env.ROOT_URL}/evaluation-service/auth`;

async function getAccessToken() {
    let cache = {};
    try { cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8')); } catch (_) { }
    if (cache?.access_token && Date.now() < cache.expires_at - 60000) return cache.access_token;

    const res = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: process.env.EMAIL,
            name: process.env.NAME,
            rollNo: process.env.ROLLNO,
            accessCode: process.env.ACCESS_CODE,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET
        }),
    });

    if (!res.ok) throw new Error(`Auth failed (${res.status}): ${await res.text()}`);

    const { access_token, token, expires_in = 3600 } = await res.json();
    const data = { access_token: access_token || token, expires_at: Date.now() + expires_in * 1000 };

    fs.writeFileSync(CACHE_FILE, JSON.stringify(data), 'utf-8');
    return data.access_token;
}

module.exports = { getAccessToken };