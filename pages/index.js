import { useState, useEffect } from 'react';

export default function VIPLiveMonitor() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getStatus = async () => {
    try {
      const res = await fetch('/api/mikrotik');
      const data = await res.json();
      
      if (data.error) setError(data.error);
      else {
        setUsers(data);
        setError(null);
      }
    } catch (e) {
      setError("সার্ভার এরর: ডাটা পাওয়া যাচ্ছে না।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStatus();
    const timer = setInterval(getStatus, 10000); // ১০ সেকেন্ড পর পর অটো আপডেট
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#fff', padding: '20px', fontFamily: 'Arial' }}>
      <div style={{ background: '#1e293b', padding: '20px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ color: '#38bdf8', margin: 0 }}>VIP NETWORK MONITOR (LIVE)</h2>
        <div style={{ background: '#0ea5e9', padding: '5px 15px', borderRadius: '5px', fontWeight: 'bold' }}>
          Active Users: {users.length}
        </div>
      </div>

      {error && (
        <div style={{ background: '#ef4444', padding: '10px', borderRadius: '5px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div style={{ overflowX: 'auto', background: '#1e293b', borderRadius: '10px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', background: '#334155' }}>
              <th style={{ padding: '15px' }}>User ID</th>
              <th>IP Address</th>
              <th>Uptime</th>
              <th>Usage</th>
              <th>Time Limit</th>
            </tr>
          </thead>
          <tbody>
            {loading && users.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}>Loading...</td></tr>
            ) : users.map((u, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: '15px', color: '#38bdf8' }}>{u.name}</td>
                <td>{u.ip}</td>
                <td style={{ color: '#fbbf24' }}>{u.uptime}</td>
                <td style={{ color: '#4ade80' }}>{u.download}</td>
                <td>{u.limit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
