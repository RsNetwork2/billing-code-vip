import { useState, useEffect } from 'react';

export default function VIPLiveMonitor() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getStatus = async () => {
    try {
      const res = await fetch('/api/mikrotik');
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setUsers(Array.isArray(data) ? data : []);
        setError(null);
      }
    } catch (e) {
      setError("সার্ভার এরর: এপিআই ফাইলটি খুঁজে পাওয়া যাচ্ছে না।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStatus();
    const timer = setInterval(getStatus, 10000); 
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#fff', padding: '20px', fontFamily: 'Arial' }}>
      <div style={{ background: '#1e293b', padding: '20px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
        <h2 style={{ color: '#38bdf8', margin: 0 }}>VIP NETWORK MONITOR (LIVE)</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={getStatus} style={{ background: '#334155', color: '#fff', border: 'none', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer' }}>Refresh</button>
          <div style={{ background: '#0ea5e9', padding: '5px 15px', borderRadius: '5px', fontWeight: 'bold' }}>
            Active: {users.length}
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: '#ef444433', border: '1px solid #ef4444', padding: '10px', borderRadius: '5px', marginBottom: '20px', color: '#fecaca' }}>
          {error}
        </div>
      )}

      <div style={{ overflowX: 'auto', background: '#1e293b', borderRadius: '10px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', background: '#334155' }}>
              <th style={{ padding: '15px' }}>Voucher ID</th>
              <th>IP Address</th>
              <th>Uptime</th>
              <th>Download</th>
              <th>Time Limit</th>
            </tr>
          </thead>
          <tbody>
            {loading && users.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}>Loading...</td></tr>
            ) : users.length === 0 && !error ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}>কোনো ইউজার বর্তমানে একটিভ নেই।</td></tr>
            ) : (
              users.map((u, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '15px', color: '#38bdf8', fontWeight: 'bold' }}>{u.name}</td>
                  <td>{u.ip}</td>
                  <td style={{ color: '#fbbf24' }}>{u.uptime}</td>
                  <td style={{ color: '#4ade80' }}>{u.download}</td>
                  <td>{u.limit}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
