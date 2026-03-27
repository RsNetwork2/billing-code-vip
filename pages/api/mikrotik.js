const MikrotikApi = require('mikrotik-node');

export default async function handler(req, res) {
  const device = new MikrotikApi({
    host: '59.152.99.22', 
    user: 'billing',
    password: 'Rahul78858',
    port: 8728
  });

  try {
    const conn = await device.connect();
    const activeUsers = await conn.write('/ip/hotspot/active/print');
    const hotspotUsers = await conn.write('/ip/hotspot/user/print');

    const combinedData = activeUsers.map(active => {
      const userData = hotspotUsers.find(u => u.name === active.user);
      return {
        user: active.user,
        address: active.address,
        mac: active['mac-address'],
        uptime: active.uptime,
        bytesOut: active['bytes-out'],
        bytesIn: active['bytes-in'],
        limitUptime: userData ? userData['limit-uptime'] : 'Unlimited',
        comment: userData ? userData.comment : ''
      };
    });

    device.close();
    return res.status(200).json(combinedData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
