const { RouterOSClient } = require('node-routeros');

export default async function handler(req, res) {
    const client = new RouterOSClient({
        host: '59.152.99.22', // আপনার রাউটার আইপি
        user: 'billing',      // আপনার এপিআই ইউজার
        password: 'আপনার_পাসওয়ার্ড',
        port: 8728,
        keepalive: true
    });

    try {
        const conn = await client.connect();
        const activeUsers = await conn.menu('/ip/hotspot/active').print();
        await client.close();

        const formattedUsers = activeUsers.map(u => ({
            name: u.user || 'Unknown',
            ip: u.address || '-',
            uptime: u.uptime || '-',
            download: (parseInt(u['bytes-out'] || 0) / (1024 * 1024)).toFixed(2) + " MB",
            limit: u['limit-uptime'] || 'No Limit'
        }));

        res.status(200).json(formattedUsers);
    } catch (error) {
        console.error("Mikrotik Connection Error:", error);
        res.status(500).json({ error: "রাউটার কানেক্ট করা যাচ্ছে না।" });
    }
}
