import { useState, useEffect } from 'react';

export default function VIPMonitor() {
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/mikrotik');
        const data = await res.json();
        if (data.error) setErr(data.error);
        else setUsers(data);
      } catch (e) { setErr("সার্ভার এরর!"); }
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#fff', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#38bdf8', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>VIP NETWORK LIVE MONITOR</h2>
      {err && <p style={{ color: '#ef4444' }}>{err}</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ textAlign: 'left', background: '#1e293b' }}>
            <th style={{ padding: '12px' }}>User ID</th>
            <th>Uptime</th>
            <th>Usage</th>
            <th>Limit</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #334155' }}>
              <td style={{ padding: '12px' }}>{u.name}</td>
              <td style={{ color: '#fbbf24' }}>{u.uptime}</td>
              <td style={{ color: '#4ade80' }}>{u.download}</td>
              <td>{u.limit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
