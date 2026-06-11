const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { STACKS, LEVELS, BACKEND_PACKAGES, FRONTEND_PACKAGES, SHARED_PACKAGES } = require('./constant');
const { getAccessToken } = require('../../helper/getAccessToken');

/**
 * Reusable Log function that makes an API call to the Test Server.
 */
async function Log(stack, level, pkg, message) {
    const normalizedStack = stack.toLowerCase();
    const normalizedLevel = level.toLowerCase();
    const normalizedPkg = pkg.toLowerCase();

    if (!STACKS.includes(normalizedStack)) throw `Invalid stack: ${stack}`;
    if (!LEVELS.includes(normalizedLevel)) throw `Invalid level: ${level}`;

    let validPackages = [];
    if (normalizedStack === 'backend') validPackages = [...BACKEND_PACKAGES, ...SHARED_PACKAGES];
    else if (normalizedStack === 'frontend') validPackages = [...FRONTEND_PACKAGES, ...SHARED_PACKAGES];

    if (!validPackages.includes(normalizedPkg)) throw `Invalid package: ${pkg}`;

    try {
        const res = await fetch(process.env.ROOT_URL + '/evaluation-service/logs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await getAccessToken()}`,
            },
            body: JSON.stringify({ stack, level, package: pkg, message }),
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`[LOG] Log API failed (${res.status}): ${errText}`);
        }

        return res.json();
    } catch (error) {
        console.error('[LOG] Logging Middleware Error:', error.message);
    }
}

module.exports = { Log };
