const MikrotikApi = require('mikrotik-node');

export default async function handler(req, res) {
  const device = new MikrotikApi({
    host: '59.152.99.22', 
    user: 'billing',
    password: 'Rahul78858',
    port: 8728,
    timeout: 15
  });

  try {
    const conn = await device.connect();
    const [activeUsers, allUsers] = await Promise.all([
      conn.write('/ip/hotspot/active/print'),
      conn.write('/ip/hotspot/user/print')
    ]);
    
    const data = activeUsers.map(active => {
      const userDetails = allUsers.find(u => u.name === active.user);
      return {
        name: active.user,
        ip: active.address,
        mac: active['mac-address'],
        uptime: active.uptime,
        download: (parseInt(active['bytes-out'] || 0) / (1024 * 1024)).toFixed(2) + " MB",
        limit: userDetails ? userDetails['limit-uptime'] : 'No Limit'
      };
    });

    device.close();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "রাউটার কানেক্ট করা যাচ্ছে না।" });
  }
}
