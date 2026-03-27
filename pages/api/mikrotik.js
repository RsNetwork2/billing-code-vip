const MikrotikApi = require('mikrotik-node');

export default async function handler(req, res) {
  const device = new MikrotikApi({
    host: process.env.MK_IP, 
    user: process.env.MK_USER, 
    password: process.env.MK_PASS,
    port: 8728, 
    timeout: 20 // টাইমআউট একটু বাড়িয়ে দেওয়া হলো
  });

  try {
    const conn = await device.connect();
    const activeUsers = await conn.write('/ip/hotspot/active/print');
    
    // ডাটা ফরমেটিং
    const users = activeUsers.map(u => ({
      name: u.user,
      ip: u.address,
      uptime: u.uptime,
      download: (parseInt(u['bytes-out'] || 0) / (1024 * 1024)).toFixed(2) + " MB"
    }));

    device.close();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "রাউটার থেকে রেসপন্স পাওয়া যাচ্ছে না।" });
  }
}
