const MikrotikApi = require('mikrotik-node');

export default async function handler(req, res) {
  // Vercel Environment Variables থেকে ডাটা নেওয়া
  const device = new MikrotikApi({
    host: process.env.MK_IP || '59.152.99.22', 
    user: process.env.MK_USER || 'billing',
    password: process.env.MK_PASS || 'Rahul78858',
    port: 8728,
    timeout: 30 // কানেকশন স্থিতিশীল রাখতে সময় বাড়ানো হয়েছে
  });

  try {
    const conn = await device.connect();
    // একটিভ হটস্পট ইউজারদের ডাটা রিড করা
    const activeUsers = await conn.write('/ip/hotspot/active/print');
    device.close();

    // ডাটা ফরমেটিং
    const formattedData = activeUsers.map(u => ({
      name: u.user || 'Unknown',
      ip: u.address || '0.0.0.0',
      uptime: u.uptime || '0s',
      download: (parseInt(u['bytes-out'] || 0) / (1024 * 1024)).toFixed(2) + " MB",
      limit: u['limit-uptime'] || 'No Limit'
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    console.error("MikroTik Error:", error);
    res.status(500).json({ error: "রাউটার কানেক্ট হচ্ছে না। আপনার মাইক্রোটিক লগ চেক করুন।" });
  }
}
