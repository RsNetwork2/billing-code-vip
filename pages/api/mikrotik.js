import MikrotikApi from 'mikrotik-node';

export default async function handler(req, res) {
  const device = new MikrotikApi({
    host: '59.152.99.22', // আপনার রিয়েল আইপি
    user: 'billing',      // আপনার ইউজারনেম
    password: 'আপনার_পাসওয়ার্ড', 
    port: 8728,
    timeout: 30
  });

  try {
    const conn = await device.connect();
    const activeUsers = await conn.write('/ip/hotspot/active/print');
    device.close();

    // ডাটা ফরমেট করা
    const users = activeUsers.map(u => ({
      name: u.user || 'Unknown',
      ip: u.address || '-',
      uptime: u.uptime || '-',
      download: (parseInt(u['bytes-out'] || 0) / (1024 * 1024)).toFixed(2) + " MB",
      limit: u['limit-uptime'] || 'No Limit'
    }));

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "রাউটার কানেকশন রিফিউজ করেছে। মাইক্রোটিক লগ চেক করুন।" });
  }
}
