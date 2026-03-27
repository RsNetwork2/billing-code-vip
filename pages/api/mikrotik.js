import { RouterOSClient } from 'node-routeros';

export default async function handler(req, res) {
    // আপনার রাউটার তথ্য
    const client = new RouterOSClient({
        host: '59.152.99.22', 
        user: 'billing',      
        password: 'আপনার_পাসওয়ার্ড', //
        port: 8728,
        keepalive: true
    });

    try {
        const conn = await client.connect();
        // একটিভ হটস্পট ইউজার ডাটা রিড করা
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
        console.error("Connection Error:", error);
        res.status(500).json({ error: "রাউটার কানেক্ট করা যাচ্ছে না। পোর্টে সমস্যা থাকতে পারে।" });
    }
}
