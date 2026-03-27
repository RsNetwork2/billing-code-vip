import { MikrotikClient } from 'mikrotik-client';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { username, password, profile, action } = req.body;

  // আপনার দেওয়া রাউটার ডিটেইলস
  const client = new MikrotikClient({
    host: '59.152.99.22',
    user: 'billing',
    password: 'Rahul78858',
    port: 8728,
    timeout: 10
  });

  try {
    if (action === 'add') {
      // পিপিওই (PPPoE) ইউজার তৈরি করা
      await client.connect();
      await client.write('/ppp/secret/add', {
        name: username,
        password: password,
        profile: profile,
        service: 'pppoe'
      });
      await client.close();
      return res.status(200).json({ success: true, message: 'User added to MikroTik' });
    }
    
    if (action === 'delete') {
      await client.connect();
      // ইউজার খুঁজে বের করে ডিলিট করা
      const users = await client.write('/ppp/secret/print', { '.proplist': '.id', 'name': username });
      if (users.length > 0) {
        await client.write('/ppp/secret/remove', { '.id': users[0]['.id'] });
      }
      await client.close();
      return res.status(200).json({ success: true, message: 'User removed from MikroTik' });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
