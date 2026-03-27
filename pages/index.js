import { useState, useEffect } from 'react';

export default function VIPLiveMonitor() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/mikrotik');
      if (!response.ok) throw new Error("API ফাইলটি সার্ভারে পাওয়া যাচ্ছে না। ফোল্ডার নাম চেক করুন।");
      
      const data = await response.json();
      if (data.error) setErrorMsg(data.error);
      else {
        setUsers(data);
        setErrorMsg(null);
      }
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // ১০ সেকেন্ড পর পর আপডেট
    return () => clearInterval(interval);
  }, []);

  const toMB = (bytes) => (bytes / (1024 * 1024)).toFixed(2) + " MB";

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#f8fafc', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b', padding: '15px 25px', borderRadius: '12px', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '20px', color: '#38bdf8' }}>VIP NETWORK LIVE MONITOR</h1>
        <div style={{ background: '#0ea5e9', padding: '8px 15px', borderRadius: '8px', fontWeight: 'bold' }}>Active Now: {users.length}</div>
      </header>

      {errorMsg && (
        <div style={{ background: '#7f1d1d', borderLeft: '5px solid #ef4444', color: '#fecaca', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <strong>Error:</strong> {errorMsg}
        </div>
      )}

      <div style={{ overflowX: 'auto', background: '#1e293b', borderRadius: '15px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '850px' }}>
          <thead>
            <tr style={{ textAlign: 'left', background: '#334155', color: '#cbd5e1' }}>
              <th style={{ padding: '15px' }}>Voucher ID</th>
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
              users.map((u, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '15px' }}><span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{u.name}</span><br/><small style={{color: '#64748b'}}>{u.mac}</small></td>
                  <td>{u.ip}</td>
                  <td style={{ color: '#fbbf24' }}>{u.uptime}</td>
                  <td style={{ color: '#4ade80' }}>↓ {toMB(u.download)}</td>
                  <td style={{ color: '#f87171' }}>↑ {toMB(u.upload)}</td>
                  <td>{u.limit}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>বর্তমানে কোনো ইউজার একটিভ নেই।</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
