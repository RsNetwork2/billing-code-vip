import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';

export default function ProfessionalISPPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pin, setPin] = useState('');
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({ username: '', password: '', package: '5 Mbps', phone: '', status: 'Active' });

  const SECURITY_PIN = "1234"; // আপনার লগইন পিন

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      const userList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
    });
    return () => unsub();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === SECURITY_PIN) setIsLoggedIn(true);
    else alert("ভুল পিন!");
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.phone) return alert("ইউজার এবং ফোন নম্বর দিন!");
    try {
      await addDoc(collection(db, 'users'), { ...formData, createdAt: new Date().toLocaleDateString() });
      setFormData({ username: '', password: '', package: '5 Mbps', phone: '', status: 'Active' });
      alert("নতুন গ্রাহক সফলভাবে যোগ হয়েছে!");
    } catch (err) { alert("Error: " + err.message); }
  };

  const handleDelete = async (id) => {
    if (confirm("আপনি কি নিশ্চিতভাবে এই গ্রাহককে ডিলিট করতে চান?")) await deleteDoc(doc(db, 'users', id));
  };

  // সার্চ ফিল্টার
  const filteredUsers = users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()) || u.phone.includes(search));

  if (!isLoggedIn) {
    return (
      <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial' }}>
        <form onSubmit={handleLogin} style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '20px', textAlign: 'center', width: '350px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
          <h2 style={{ color: '#1e40af', margin: '0 0 10px' }}>VIP NETWORK</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '25px' }}>Admin Dashboard Login</p>
          <input type="password" placeholder="Enter Admin PIN" value={pin} onChange={(e) => setPin(e.target.value)} style={{ width: '90%', padding: '15px', marginBottom: '20px', border: '2px solid #e2e8f0', borderRadius: '10px', textAlign: 'center', fontSize: '20px' }} />
          <button style={{ width: '100%', backgroundColor: '#2563eb', color: 'white', padding: '15px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>UNLOCK PANEL</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>
      {/* টপ হেডার */}
      <nav style={{ backgroundColor: '#1e40af', padding: '15px 30px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: 0 }}>VIP NETWORK - Billing System</h2>
        <button onClick={() => setIsLoggedIn(false)} style={{ backgroundColor: '#ef4444', border: 'none', color: 'white', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>Logout</button>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
        
        {/* পরিসংখ্যান কার্ড (Race Online Style) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', borderLeft: '5px solid #3b82f6', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <p style={{ margin: 0, color: '#64748b' }}>Total Customers</p>
            <h2 style={{ margin: '10px 0 0' }}>{users.length}</h2>
          </div>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', borderLeft: '5px solid #10b981', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <p style={{ margin: 0, color: '#64748b' }}>Active Lines</p>
            <h2 style={{ margin: '10px 0 0' }}>{users.filter(u => u.status === 'Active').length}</h2>
          </div>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', borderLeft: '5px solid #f59e0b', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <p style={{ margin: 0, color: '#64748b' }}>Expired Soon</p>
            <h2 style={{ margin: '10px 0 0' }}>0</h2>
          </div>
        </div>

        {/* গ্রাহক যোগ করার ফর্ম */}
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', marginBottom: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Add New Customer</h3>
          <form onSubmit={handleAddUser} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
            <input placeholder="Customer Name" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            <input placeholder="Phone Number" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            <input placeholder="Password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            <select value={formData.package} onChange={(e) => setFormData({...formData, package: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <option>5 Mbps</option>
              <option>10 Mbps</option>
              <option>20 Mbps</option>
            </select>
            <button style={{ backgroundColor: '#10b981', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Save Data</button>
          </form>
        </div>

        {/* ইউজার টেবিল ও সার্চ */}
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ margin: 0 }}>Customer Database</h3>
            <input placeholder="Search by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '250px' }} />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f8fafc', color: '#64748b' }}>
                <tr>
                  <th style={{ padding: '15px', textAlign: 'left' }}>NAME</th>
                  <th style={{ padding: '15px', textAlign: 'left' }}>PHONE</th>
                  <th style={{ padding: '15px', textAlign: 'left' }}>PACKAGE</th>
                  <th style={{ padding: '15px', textAlign: 'left' }}>STATUS</th>
                  <th style={{ padding: '15px', textAlign: 'center' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '15px', fontWeight: '600' }}>{user.username}</td>
                    <td style={{ padding: '15px' }}>{user.phone}</td>
                    <td style={{ padding: '15px' }}>{user.package}</td>
                    <td style={{ padding: '15px' }}>
                      <span style={{ backgroundColor: user.status === 'Active' ? '#dcfce7' : '#fee2e2', color: user.status === 'Active' ? '#166534' : '#991b1b', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                        {user.status}
                      </span>
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <button onClick={() => handleDelete(user.id)} style={{ backgroundColor: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
