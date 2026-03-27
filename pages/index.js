import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';

export default function UltimateISPPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pin, setPin] = useState('');
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({ 
    username: '', phone: '', password: '', package: '10 Mbps', price: '500', address: '', status: 'Active' 
  });

  const SECURITY_PIN = "1234"; // আপনার লগইন পিন

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('username', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const userList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
    });
    return () => unsub();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === SECURITY_PIN) setIsLoggedIn(true);
    else alert("ভুল পিন! সঠিক পিন দিন।");
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.phone) return alert("নাম এবং ফোন নম্বর অবশ্যই দিতে হবে!");
    try {
      await addDoc(collection(db, 'users'), { ...formData, expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString() });
      setFormData({ username: '', phone: '', password: '', package: '10 Mbps', price: '500', address: '', status: 'Active' });
      alert("নতুন গ্রাহক ডাটাবেসে সেভ হয়েছে!");
    } catch (err) { alert("Error: " + err.message); }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Expired' : 'Active';
    await updateDoc(doc(db, 'users', id), { status: newStatus });
  };

  const handleDelete = async (id) => {
    if (confirm("আপনি কি এই গ্রাহককে চিরতরে মুছে ফেলতে চান?")) await deleteDoc(doc(db, 'users', id));
  };

  const filteredUsers = users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()) || u.phone.includes(search));

  if (!isLoggedIn) {
    return (
      <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial' }}>
        <form onSubmit={handleLogin} style={{ backgroundColor: '#fff', padding: '50px', borderRadius: '24px', textAlign: 'center', width: '380px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
          <h1 style={{ color: '#1e3a8a', fontSize: '28px', margin: '0 0 10px' }}>VIP NETWORK</h1>
          <p style={{ color: '#64748b', marginBottom: '30px' }}>ISP Management Software</p>
          <input type="password" placeholder="••••" value={pin} onChange={(e) => setPin(e.target.value)} style={{ width: '100%', padding: '15px', marginBottom: '25px', border: '2px solid #e2e8f0', borderRadius: '12px', textAlign: 'center', fontSize: '24px', outline: 'none' }} />
          <button style={{ width: '100%', backgroundColor: '#2563eb', color: 'white', padding: '15px', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px' }}>Login to Dashboard</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>
      {/* Sidebar-style Header */}
      <header style={{ backgroundColor: '#1e293b', color: 'white', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '40px', height: '40px', backgroundColor: '#3b82f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>VIP</div>
          <h2 style={{ margin: 0, letterSpacing: '1px' }}>ADMIN PANEL</h2>
        </div>
        <button onClick={() => setIsLoggedIn(false)} style={{ backgroundColor: '#ef4444', border: 'none', color: 'white', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Logout</button>
      </header>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '30px' }}>
        
        {/* Statistics Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px', marginBottom: '40px' }}>
          {[
            { label: 'Total Clients', value: users.length, color: '#3b82f6' },
            { label: 'Active Users', value: users.filter(u => u.status === 'Active').length, color: '#10b981' },
            { label: 'Expired/Inactive', value: users.filter(u => u.status !== 'Active').length, color: '#ef4444' },
            { label: 'Monthly Revenue', value: '৳ ' + users.reduce((acc, curr) => acc + parseInt(curr.price || 0), 0), color: '#8b5cf6' }
          ].map((item, i) => (
            <div key={i} style={{ backgroundColor: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderBottom: `4px solid ${item.color}` }}>
              <p style={{ margin: 0, color: '#64748b', fontWeight: '600', fontSize: '14px' }}>{item.label}</p>
              <h2 style={{ margin: '10px 0 0', color: '#1e293b', fontSize: '32px' }}>{item.value}</h2>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '30px' }}>
          {/* Left Side: Add User Form */}
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', height: 'fit-content' }}>
            <h3 style={{ margin: '0 0 25px', color: '#1e293b' }}>Register New User</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input placeholder="Customer Name" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} style={inputStyle} />
              <input placeholder="Phone Number" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={inputStyle} />
              <input placeholder="Address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} style={inputStyle} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <select value={formData.package} onChange={(e) => setFormData({...formData, package: e.target.value})} style={inputStyle}>
                  <option>5 Mbps</option><option>10 Mbps</option><option>20 Mbps</option><option>50 Mbps</option>
                </select>
                <input placeholder="Price" type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} style={inputStyle} />
              </div>
              <button onClick={handleAddUser} style={{ backgroundColor: '#2563eb', color: 'white', padding: '15px', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>Add Customer</button>
            </div>
          </div>

          {/* Right Side: Customer Table */}
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h3 style={{ margin: 0 }}>Customer Directory</h3>
              <input placeholder="🔍 Search name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: '12px 20px', borderRadius: '30px', border: '1px solid #e2e8f0', width: '300px', outline: 'none' }} />
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                    <th style={{ padding: '15px', color: '#64748b' }}>CUSTOMER</th>
                    <th style={{ padding: '15px', color: '#64748b' }}>PACKAGE/PRICE</th>
                    <th style={{ padding: '15px', color: '#64748b' }}>EXPIRY</th>
                    <th style={{ padding: '15px', color: '#64748b' }}>STATUS</th>
                    <th style={{ padding: '15px', textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '20px 15px' }}>
                        <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{user.username}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{user.phone}</div>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ fontWeight: '600' }}>{user.package}</div>
                        <div style={{ fontSize: '13px', color: '#10b981' }}>৳ {user.price}</div>
                      </td>
                      <td style={{ padding: '15px', color: '#64748b', fontSize: '14px' }}>{user.expiryDate}</td>
                      <td style={{ padding: '15px' }}>
                        <button onClick={() => toggleStatus(user.id, user.status)} style={{ border: 'none', borderRadius: '20px', padding: '5px 15px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: user.status === 'Active' ? '#dcfce7' : '#fee2e2', color: user.status === 'Active' ? '#166534' : '#991b1b' }}>
                          {user.status}
                        </button>
                      </td>
                      <td style={{ padding: '15px', textAlign: 'right' }}>
                        <button onClick={() => handleDelete(user.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = { padding: '12px 15px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', outline: 'none' };
