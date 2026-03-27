const MikrotikApi = require('mikrotik-node');

export default async function handler(req, res) {
  const device = new MikrotikApi({
    host: process.env.MK_IP || '59.152.99.22', // আপনার পাবলিক আইপি
    user: 'billing',
    password: process.env.MK_PASSWORD || 'Rahul78858',
    port: 8728,
    timeout: 10
  });

  try {
    const conn = await device.connect();
    const activeUsers = await conn.write('/ip/hotspot/active/print');
    device.close();
    res.status(200).json(activeUsers);
  } catch (error) {
    res.status(500).json({ error: "রাউটার কানেক্ট হচ্ছে না। পোর্টে সমস্যা হতে পারে।" });
  }
}
