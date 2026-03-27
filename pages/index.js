import { useState, useEffect } from 'react';

export default function VIPLiveMonitor() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const fetchLiveStatus = async () => {
    try {
      const response = await fetch('/api/mikrotik');
      if (!response.ok) throw new Error("API থেকে ডাটা পাওয়া যাচ্ছে না।");
      const data = await response.json();
      
      if (data.error) {
        setErr(data.error);
      } else {
        setUsers(data);
        setErr(null);
      }
    } catch (e) {
      setErr("সার্ভার এরর: এপিআই ফাইলটি খুঁজে পাওয়া যাচ্ছে না।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveStatus();
    const interval = setInterval(fetchLiveStatus, 8000); // প্রতি ৮ সেকেন্ডে লাইভ আপডেট
    return () => clearInterval(interval);
  }, []);

  const formatData = (bytes) => {
    if (bytes === 0) return "0 MB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#f8fafc', padding: '20px', fontFamily: 'Segoe UI, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b', padding: '20px', borderRadius: '12px', marginBottom: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
        <h1 style={{ margin: 0, fontSize: '22px', color: '#38bdf8' }}>VIP NETWORK LIVE MONITOR</h1>
        <div style={{ background: '#0ea5e9', padding: '8px 20px', borderRadius: '8px', fontWeight: 'bold' }}>
          Active Now: {users.length}
        </div>
      </header>

      {err && (
        <div style={{ background: '#7f1d1d', borderLeft: '5px solid #ef4444', color: '#fecaca', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <strong>Error:</strong> {err}
        </div>
      )}

      <div style={{ overflowX: 'auto', background: '#1e293b', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
          <thead>
            <tr style={{ textAlign: 'left', background: '#334155', color: '#cbd5e1' }}>
              <th style={{ padding: '18px' }}>Voucher ID</th>
              <th>IP Address</th>
              <th>Uptime</th>
              <th>Download</th>
              <th>Upload</th>
              <th>Time Limit</th>
            </tr>
          </thead>
          <tbody>
            {loading && users.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '50px' }}>Connecting to MikroTik...</td></tr>
            ) : users.length > 0 ? (
              users.map((user, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #334155', transition: '0.3s' }}>
                  <td style={{ padding: '18px' }}>
                    <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{user.name}</span>
                    <br/><small style={{ color: '#64748b' }}>{user.mac}</small>
                  </td>
                  <td style={{ color: '#94a3b8' }}>{user.ip}</td>
                  <td style={{ color: '#fbbf24' }}>{user.uptime}</td>
                  <td style={{ color: '#4ade80' }}>↓ {formatData(user.download)}</td>
                  <td style={{ color: '#f87171' }}>↑ {formatData(user.upload)}</td>
                  <td style={{ color: '#cbd5e1' }}>{user.limit}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>কোনো ইউজার বর্তমানে নেট চালাচ্ছে না।</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
