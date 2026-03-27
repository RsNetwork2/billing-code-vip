const MikrotikApi = require('mikrotik-node');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { username, password, profile, action } = req.body;

  const device = new MikrotikApi({
    host: '59.152.99.22',
    user: 'billing',
    password: 'Rahul78858',
    port: 8728
  });

  try {
    const conn = await device.connect();
    
    if (action === 'add') {
      await conn.write('/ppp/secret/add', [
        `=name=${username}`,
        `=password=${password}`,
        `=profile=${profile}`,
        `=service=pppoe`
      ]);
      return res.status(200).json({ success: true, message: 'User added' });
    }

    if (action === 'delete') {
      const users = await conn.write('/ppp/secret/print', [`?name=${username}`]);
      if (users.length > 0) {
        await conn.write('/ppp/secret/remove', [`=.id=${users[0]['.id']}`]);
      }
      return res.status(200).json({ success: true, message: 'User deleted' });
    }

    device.close();
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
