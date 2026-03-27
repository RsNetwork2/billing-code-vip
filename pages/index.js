import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ username: '', password: '', package: '30 Day' });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      const userList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
    });
    return () => unsub();
  }, []);

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

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        
        <div style={{ backgroundColor: '#1d4ed8', padding: '20px', color: 'white', textAlign: 'center' }}>
          <h1 style={{ margin: 0 }}>VIP NETWORK ISP Panel</h1>
        </div>

        <div style={{ padding: '20px' }}>
          {/* ইউজার অ্যাড করার ফর্ম */}
          <form onSubmit={handleAddUser} style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
            <input style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} placeholder="Username" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
            <input style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} placeholder="Password" type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
            <select style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} value={formData.package} onChange={(e) => setFormData({...formData, package: e.target.value})}>
              <option value="30 Day">30 Day Profile</option>
              <option value="15 Day">15 Day Profile</option>
            </select>
            <button style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Add User</button>
          </form>

          {/* ইউজার লিস্ট টেবিল */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #eee' }}>
                  <th style={{ padding: '12px' }}>Username</th>
                  <th style={{ padding: '12px' }}>Password</th>
                  <th style={{ padding: '12px' }}>Package</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{user.username}</td>
                    <td style={{ padding: '12px', color: '#666' }}>{user.password}</td>
                    <td style={{ padding: '12px', color: '#1d4ed8', fontWeight: 'bold' }}>{user.package}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button onClick={() => handleDelete(user.id, user.username)} style={{ backgroundColor: '#ef4444', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Delete</button>
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
