const path = require('path');
const { getAccessToken } = require('../../helper/getAccessToken');

const BASE = `${process.env.ROOT_URL}/evaluation-service`;

async function get(endpoint) {
    const token = await getAccessToken();
    const res = await fetch(`${BASE}/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`GET ${endpoint} failed: ${res.status}`);
    return res.json();
}

async function main() {
    const [{ depots }, { vehicles }] = await Promise.all([get('depots'), get('vehicles')]);

    const sorted = [...vehicles].sort((a, b) => (b.Impact / b.Duration) - (a.Impact / a.Duration));

    const hours = Object.fromEntries(depots.map(d => [d.ID, d.MechanicHours]));
    const schedule = Object.fromEntries(depots.map(d => [d.ID, []]));

    for (const v of sorted) {
        const depot = depots
            .filter(d => hours[d.ID] >= v.Duration)
            .sort((a, b) => hours[b.ID] - hours[a.ID])[0];

        if (depot) {
            schedule[depot.ID].push(v.TaskID);
            hours[depot.ID] -= v.Duration;
        }
    }

    const payload = {
        depots: depots.map(d => ({ ID: d.ID, TaskIDs: schedule[d.ID] }))
    };

    console.log(payload);
}

main().catch(console.error);
