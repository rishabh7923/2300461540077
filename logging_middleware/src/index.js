require('dotenv').config({ path: '../.env' });
const { STACKS, LEVELS, BACKEND_PACKAGES, FRONTEND_PACKAGES, SHARED_PACKAGES } = require('./constant');

let accessTokenJson = null;

/**
 * Fetches a new access token from the authentication service.
 */
async function getAccessToken() {
    const payload = {
        email: process.env.EMAIL,
        name: process.env.NAME,
        rollNo: process.env.ROLLNO,
        accessCode: process.env.ACCESS_CODE,
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET
    };

    try {
        const response = await fetch(process.env.ROOT_URL + '/evaluation-service/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
            accessTokenJson = data;
            return accessTokenJson.access_token;
        } else {
            console.error('[LOGING] Failed to authenticate:', await response.text());
        }
    } catch (error) {
        console.error('[LOGING] Authentication Error:', error.message);
    }
}

/**
 * Reusable Log function that makes an API call to the Test Server.
 */
async function Log(stack, level, pkg, message) {
    const normalizedStack = stack.toLowerCase();
    const normalizedLevel = level.toLowerCase();
    const normalizedPkg = pkg.toLowerCase();

    if (!STACKS.includes(normalizedStack)) throw `Invalid stack: ${stack}`
    if (!LEVELS.includes(normalizedLevel)) throw `Invalid level: ${level}`

    let validPackages = [];
    if (normalizedStack === 'backend') validPackages = [...BACKEND_PACKAGES, ...SHARED_PACKAGES];
    else if (normalizedStack === 'frontend') validPackages = [...FRONTEND_PACKAGES, ...SHARED_PACKAGES];

    if (!validPackages.includes(normalizedPkg)) throw `Invalid package: ${pkg}`;

    const currentTime = Math.floor(Date.now() / 1000);
    if (!accessTokenJson || accessTokenJson.expires_in <= currentTime) await getAccessToken();

    try {
        const response = await fetch(process.env.ROOT_URL + '/evaluation-service/logs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessTokenJson.access_token}`
            },
            body: JSON.stringify(
                {
                    stack: normalizedStack,
                    level: normalizedLevel,
                    package: normalizedPkg,
                    message: message
                }
            )
        });

        const data = await response.json();

        if (response.ok) return data;
        else console.log('Failed to send log to server: ', data);
    } catch (error) {
        console.error('Logging Middleware Error:', error.message);
    }
}

module.exports = { Log };
