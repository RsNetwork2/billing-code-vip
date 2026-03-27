import { useState, useEffect } from 'react';

export default function VoucherMonitor() {
  const [activeUsers, setActiveUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/mikrotik');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setActiveUsers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 10000); // প্রতি ১০ সেকেন্ডে রিফ্রেশ
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(2) + ' MB';
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Segoe UI, Tahoma', backgroundColor: '#0f172a', minHeight: '100vh', color: '#e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b', padding: '15px 25px', borderRadius: '12px', marginBottom: '25px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#38bdf8' }}>VIP NETWORK LIVE MONITOR</h1>
        <div style={{ background: '#0ea5e9', padding: '8px 15px', borderRadius: '8px', fontWeight: 'bold' }}>
          Active Now: {activeUsers.length}
        </div>
      </div>

      {error && <div style={{ background: '#7f1d1d', color: '#fecaca', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>Error: {error}</div>}

      {loading && activeUsers.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <div className="spinner"></div>
          <p>Connecting to MikroTik...</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', background: '#1e293b', borderRadius: '15px', padding: '10px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #334155', color: '#94a3b8' }}>
                <th style={{ padding: '15px' }}>Voucher ID</th>
                <th>IP Address</th>
                <th>Uptime</th>
                <th>Download</th>
                <th>Upload</th>
                <th>Remaining/Limit</th>
              </tr>
            </thead>
            <tbody>
              {activeUsers.map((user, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #334155', transition: '0.3s' }} onMouseOver={e => e.currentTarget.style.backgroundColor='#2d3748'} onMouseOut={e => e.currentTarget.style.backgroundColor='transparent'}>
                  <td style={{ padding: '15px', color: '#f8fafc', fontWeight: '600' }}>{user.user}</td>
                  <td style={{ color: '#94a3b8' }}>{user.address}</td>
                  <td style={{ color: '#fbbf24' }}>{user.uptime}</td>
                  <td style={{ color: '#4ade80' }}>↓ {formatBytes(user['bytes-out'])}</td>
                  <td style={{ color: '#f87171' }}>↑ {formatBytes(user['bytes-in'])}</td>
                  <td style={{ color: '#cbd5e1' }}>{user.limit_uptime || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <style jsx>{`
        .spinner { border: 4px solid rgba(255,255,255,0.1); width: 36px; height: 36px; border-radius: 50%; border-left-color: #38bdf8; animation: spin 1s linear infinite; margin: 0 auto 15px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
