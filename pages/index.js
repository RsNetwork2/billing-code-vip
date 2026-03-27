import { useState, useEffect } from 'react';

export default function VIPLiveMonitor() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getStatus = async () => {
    try {
      const res = await fetch('/api/mikrotik');
      
      // যদি রেসপন্স ঠিক না থাকে (যেমন ৪0৪ বা ৫০0 এরর)
      if (!res.ok) {
        throw new Error("সার্ভার থেকে সঠিক রেসপন্স পাওয়া যাচ্ছে না।");
      }

      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        // নিশ্চিত করা যে ডাটা একটি অ্যারে (Array)
        setUsers(Array.isArray(data) ? data : []);
        setError(null);
      }
    } catch (e) {
      // JSON পার্সিং এরর বা নেটওয়ার্ক এরর হ্যান্ডেল করা
      setError("কানেকশন এরর: রাউটার বা API খুঁজে পাওয়া যাচ্ছে না।");
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
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#fff', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* হেডার সেকশন */}
      <div style={{ background: '#1e293b', padding: '20px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <h2 style={{ color: '#38bdf8', margin: 0 }}>VIP NETWORK MONITOR (LIVE)</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
           <button onClick={getStatus} style={{ background: '#334155', color: '#fff', border: 'none', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer' }}>
            Refresh
          </button>
          <div style={{ background: '#0ea5e9', padding: '5px 15px', borderRadius: '5px', fontWeight: 'bold' }}>
            Active: {users.length}
          </div>
        </div>
      </div>

      {/* এরর মেসেজ প্রদর্শন */}
      {error && (
        <div style={{ background: '#ef444433', border: '1px solid #ef4444', padding: '15px', borderRadius: '8px', color: '#fecaca', marginBottom: '20px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* ডাটা টেবিল */}
      <div style={{ overflowX: 'auto', background: '#1e293b', borderRadius: '10px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
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
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>
                  Connecting to MikroTik...
                </td>
              </tr>
            ) : users.length === 0 && !error ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>
                  বর্তমানে কোনো ইউজার একটিভ নেই।
                </td>
              </tr>
            ) : (
              users.map((u, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #334155', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1e293b'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '15px', color: '#38bdf8', fontWeight: 'bold' }}>{u.name}</td>
                  <td style={{ color: '#cbd5e1' }}>{u.ip}</td>
                  <td style={{ color: '#fbbf24' }}>{u.uptime}</td>
                  <td style={{ color: '#4ade80' }}>{u.download}</td>
                  <td style={{ color: '#94a3b8' }}>{u.limit || 'Unlimited'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
