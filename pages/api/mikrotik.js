const MikrotikApi = require('mikrotik-node');

export default async function handler(req, res) {
  const device = new MikrotikApi({
    host: '59.152.99.22', // আপনার রাউটার আইপি
    user: 'billing',      // আপনার রাউটার ইউজার
    password: 'Rahul78858',
    port: 8728            // আপনার ফরওয়ার্ড করা এপিআই পোর্ট
  });

  try {
    const conn = await device.connect();
    
    // একটিভ ইউজারদের তথ্য সংগ্রহ
    const activeUsers = await conn.write('/ip/hotspot/active/print');
    
    // ইউজারদের প্রোফাইল থেকে লিমিট বা মেয়াদের তথ্য সংগ্রহ (ঐচ্ছিক কিন্তু দরকারি)
    const hostpotUsers = await conn.write('/ip/hotspot/user/print');

    // ডাটা কম্বাইন করা
    const combinedData = activeUsers.map(active => {
      const userData = hostpotUsers.find(u => u.name === active.user);
      return {
        ...active,
        limit_uptime: userData ? userData['limit-uptime'] : 'Unlimited',
        comment: userData ? userData.comment : ''
      };
    });

    device.close();
    return res.status(200).json(combinedData);
  } catch (error) {
    console.error("Mikrotik Error:", error);
    return res.status(500).json({ error: "রাউটার কানেক্ট করা যাচ্ছে না। পোর্ট ৮৭২৮ চেক করুন।" });
  }
}
