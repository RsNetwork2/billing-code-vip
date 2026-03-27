const MikrotikApi = require('mikrotik-node');

export default async function handler(req, res) {
  const device = new MikrotikApi({
    host: '59.152.99.22', // আপনার রাউটার আইপি
    user: 'billing',      // উইজারনেম
    password: 'Rahul78858',
    port: 8728,           // API পোর্ট
    timeout: 15
  });

  try {
    const conn = await device.connect();
    
    // লাইভ একটিভ ইউজার এবং ইউজার লিস্ট সংগ্রহ
    const [activeUsers, hotspotUsers] = await Promise.all([
      conn.write('/ip/hotspot/active/print'),
      conn.write('/ip/hotspot/user/print')
    ]);
    
    const formattedData = activeUsers.map(active => {
      const userProfile = hotspotUsers.find(u => u.name === active.user);
      return {
        name: active.user,
        ip: active.address,
        mac: active['mac-address'],
        uptime: active.uptime,
        download: (parseInt(active['bytes-out'] || 0) / (1024 * 1024)).toFixed(2) + " MB",
        limit: userProfile ? userProfile['limit-uptime'] : 'No Limit'
      };
    });

    device.close();
    res.status(200).json(formattedData);
  } catch (error) {
    res.status(500).json({ error: "রাউটার কানেক্ট হতে পারছে না। পোর্ট ৮৭২৮ বা আইপি চেক করুন।" });
  }
}
