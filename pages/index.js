import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';

export default function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pin, setPin] = useState('');
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ username: '', password: '', package: '30 Day' });

  // আপনার প্যানেলের সিকিউরিটি পিন (এখানে আপনার পছন্দমতো পিন দিন)
  const SECURITY_PIN = "1234"; 

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      const userList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
    });
    return () => unsub();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === SECURITY_PIN) {
      setIsLoggedIn(true);
    } else {
      alert("ভুল পিন! সঠিক পিন দিন।");
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) return alert("সব ঘর পূরণ করুন!");
    try {
      await addDoc(collection(db, 'users'), formData);
      setFormData({ username: '', password: '', package: '30 Day' });
      alert("ইউজার সফলভাবে যোগ হয়েছে!");
    } catch (err) { alert("এরর: " + err.message); }
  };

  const handleDelete = async (id, name) => {
    if (confirm(`${name} কে ডিলিট করতে চান?`)) {
      await deleteDoc(doc(db, 'users', id));
    }
  };

  // লগইন স্ক্রিন
  if (!isLoggedIn) {
    return (
      <div style={{ backgroundColor: '#1e293b', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <form onSubmit={handleLogin} style={{ backgroundColor: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', textAlign: 'center', width: '320px' }}>
          <h2 style={{ color: '#1e40af', marginBottom: '20px' }}>VIP NETWORK</h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>অ্যাডমিন পিন দিয়ে প্রবেশ করুন</p>
          <input 
            type="password" 
            placeholder="Enter PIN" 
            value={pin} 
            onChange={(e) => setPin(e.target.value)}
            style={{ width: '100%', padding: '12px', marginBottom: '20px', border: '2px solid #e2e8f0', borderRadius: '8px', textAlign: 'center', fontSize: '18px', outline: 'none' }}
          />
          <button style={{ width: '100%', backgroundColor: '#2563eb', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Login</button>
        </form>
      </div>
    );
  }

  // মেইন ড্যাশবোর্ড স্ক্রিন
  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        
        <div style={{ backgroundColor: '#1d4ed8', padding: '25px', color: 'white', textAlign: 'center', position: 'relative' }}>
          <h1 style={{ margin: 0, fontSize: '24px' }}>VIP NETWORK ISP Panel</h1>
          <button onClick={() => setIsLoggedIn(false)} style={{ position: 'absolute', right: '20px', top: '25px', backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}>Logout</button>
        </div>

        <div style={{ padding: '30px' }}>
          <form onSubmit={handleAddUser} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '35px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <input style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }} placeholder="Username" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
            <input style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }} placeholder="Password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
            <select style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: 'white' }} value={formData.package} onChange={(e) => setFormData({...formData, package: e.target.value})}>
              <option value="30 Day">30 Day Profile</option>
              <option value="15 Day">15 Day Profile</option>
            </select>
            <button style={{ backgroundColor: '#2563eb', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>+ Add User</button>
          </form>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9' }}>
                  <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>Username</th>
                  <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>Password</th>
                  <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>Package</th>
                  <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '15px', fontWeight: '600' }}>{user.username}</td>
                    <td style={{ padding: '15px', color: '#64748b' }}>{user.password}</td>
                    <td style={{ padding: '15px' }}><span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>{user.package}</span></td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <button onClick={() => handleDelete(user.id, user.username)} style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Delete</button>
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
