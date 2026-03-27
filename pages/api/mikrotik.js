const MikrotikApi = require('mikrotik-node');

export default async function handler(req, res) {
  const device = new MikrotikApi({
    host: '59.152.99.22', // আপনার রিয়েল আইপি
    user: 'billing',
    password: 'Rahul78858',
    port: 8728
  });

  try {
    const conn = await device.connect();
    // একটিভ হটস্পট ইউজারদের লিস্ট নিয়ে আসা
    const activeUsers = await conn.write('/ip/hotspot/active/print');
    
    device.close();
    return res.status(200).json(activeUsers);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
