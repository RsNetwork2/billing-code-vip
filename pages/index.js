import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';

export default function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pin, setPin] = useState('');
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ username: '', password: '', package: '30 Day' });

  const SECURITY_PIN = "1234"; // আপনার পিন এটি

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
    if (!formData.username || !formData.password) return alert("সব ঘর পূরণ করুন!");
    try {
      await addDoc(collection(db, 'users'), formData);
      setFormData({ username: '', password: '', package: '30 Day' });
      alert("সফলভাবে যোগ হয়েছে!");
    } catch (err) { alert("এরর: " + err.message); }
  };

  const handleDelete = async (id, name) => {
    if (confirm(`${name} কে ডিলিট করতে চান?`)) await deleteDoc(doc(db, 'users', id));
  };

  if (!isLoggedIn) {
    return (
      <div style={{ backgroundColor: '#1e293b', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <form onSubmit={handleLogin} style={{ backgroundColor: 'white', padding: '40px', borderRadius: '15px', textAlign: 'center', width: '320px' }}>
          <h2 style={{ color: '#1e40af' }}>VIP NETWORK</h2>
          <input type="password" placeholder="Enter PIN" value={pin} onChange={(e) => setPin(e.target.value)} style={{ width: '90%', padding: '12px', margin: '20px 0', border: '2px solid #ddd', borderRadius: '8px', textAlign: 'center' }} />
          <button style={{ width: '100%', backgroundColor: '#2563eb', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Login</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ backgroundColor: '#1d4ed8', padding: '20px', color: 'white', textAlign: 'center' }}>
          <h1>VIP NETWORK ISP Panel</h1>
        </div>
        <div style={{ padding: '20px' }}>
          <form onSubmit={handleAddUser} style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <input style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} placeholder="Username" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
            <input style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} placeholder="Password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
            <button style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Add User</button>
          </form>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ backgroundColor: '#f1f5f9' }}><th style={{ padding: '10px' }}>User</th><th style={{ padding: '10px' }}>Pass</th><th style={{ padding: '10px' }}>Action</th></tr></thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>{user.username}</td>
                  <td style={{ padding: '10px' }}>{user.password}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}><button onClick={() => handleDelete(user.id, user.username)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
