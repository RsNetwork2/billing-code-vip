import { useState, useEffect } from 'react';

export default function VoucherMonitor() {
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // প্রতি ৫ সেকেন্ড পর পর ডাটা আপডেট হবে (Real-time Feel)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/mikrotik');
        const data = await res.json();
        setActiveUsers(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchUsers();
    const interval = setInterval(fetchUsers, 5000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', backgroundColor: '#0f172a', minHeight: '100vh', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Live Voucher Monitor (VIP NETWORK)</h2>
        <div style={{ background: '#2563eb', padding: '10px 20px', borderRadius: '8px' }}>
          Active: {activeUsers.length}
        </div>
      </div>

      {loading ? <p>Loading Users...</p> : (
        <div style={{ overflowX: 'auto', background: '#1e293b', borderRadius: '12px', padding: '15px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #334155', color: '#94a3b8' }}>
                <th style={{ padding: '12px' }}>Voucher / User</th>
                <th>IP Address</th>
                <th>MAC Address</th>
                <th>Uptime</th>
                <th>Live Speed</th>
              </tr>
            </thead>
            <tbody>
              {activeUsers.map((user, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '12px', color: '#38bdf8', fontWeight: 'bold' }}>{user.user}</td>
                  <td>{user.address}</td>
                  <td style={{ fontSize: '12px', color: '#94a3b8' }}>{user['mac-address']}</td>
                  <td>{user.uptime}</td>
                  <td>
                    <span style={{ color: '#4ad991' }}>↓ {user['bytes-out'] ? (user['bytes-out']/1024/1024).toFixed(2) : 0} MB</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
