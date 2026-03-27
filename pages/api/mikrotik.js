const { RouterOSClient } = require('node-routeros');

export default async function handler(req, res) {
    const client = new RouterOSClient({
        host: '59.152.99.22', // আপনার রিয়েল আইপি
        user: 'billing',      // আপনার API ইউজার
        password: 'আপনার_পাসওয়ার্ড', // মাইক্রোটিক billing ইউজারের পাসওয়ার্ড
        port: 8728,
        keepalive: true,
        timeout: 10
    });

    try {
        const conn = await client.connect();
        // একটিভ ইউজার লিস্ট রিড করা
        const activeUsers = await conn.menu('/ip/hotspot/active').print();
        await client.close();

        // ডাটা ফরমেট করা
        const formattedUsers = activeUsers.map(u => ({
            name: u.user || 'Unknown',
            ip: u.address || '-',
            uptime: u.uptime || '-',
            download: (parseInt(u['bytes-out'] || 0) / (1024 * 1024)).toFixed(2) + " MB",
            limit: u['limit-uptime'] || 'No Limit'
        }));

        res.status(200).json(formattedUsers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "রাউটার কানেক্ট করা যাচ্ছে না। আপনার পোর্ট বা পাসওয়ার্ড চেক করুন।" });
    }
}
