const MikrotikApi = require('mikrotik-node');

export default async function handler(req, res) {
  const device = new MikrotikApi({
    host: '59.152.99.22', // আপনার রিয়েল আইপি
    user: 'billing',      // ইউজারনেম
    password: 'Rahul78858',
    port: 8728,           // API পোর্ট
    timeout: 10
  });

  try {
    const conn = await device.connect();
    
    // লাইভ একটিভ ইউজার এবং ইউজার ডাটাবেস থেকে তথ্য সংগ্রহ
    const [activeUsers, allUsers] = await Promise.all([
      conn.write('/ip/hotspot/active/print'),
      conn.write('/ip/hotspot/user/print')
    ]);
    
    const combinedData = activeUsers.map(active => {
      const details = allUsers.find(u => u.name === active.user);
      return {
        name: active.user,
        ip: active.address,
        mac: active['mac-address'],
        uptime: active.uptime,
        download: parseInt(active['bytes-out'] || 0), 
        upload: parseInt(active['bytes-in'] || 0),
        limit: details ? details['limit-uptime'] : 'No Limit',
        comment: details ? details.comment : ''
      };
    });

    device.close();
    res.status(200).json(combinedData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "রাউটার কানেক্ট হতে পারছে না। পোর্ট ৮৭২৮ চেক করুন।" });
  }
}
