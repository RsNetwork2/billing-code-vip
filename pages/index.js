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

  const SECURITY_PIN = "1234"; 

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
    if (!formData.username || !formData.password) return alert("Username এবং Password অবশ্যই দিন!");
    
    try {
      const res = await fetch('/api/mikrotik', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, action: 'add' })
      });
      const result = await res.json();

      if (result.success) {
        await addDoc(collection(db, 'users'), { 
          ...formData, 
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString() 
        });
        setFormData({ username: '', phone: '', password: '', package: '10 Mbps', price: '500', address: '', status: 'Active' });
        alert("সফলভাবে রাউটার ও ডাটাবেসে যোগ হয়েছে!");
      } else {
        alert("রাউটারে সমস্যা: " + result.error);
      }
    } catch (err) { alert("Error: " + err.message); }
  };

  const handleDelete = async (id, username) => {
    if (confirm(`${username}-কে কি ডিলিট করতে চান? এটি রাউটার থেকেও মুছে যাবে।`)) {
      const res = await fetch('/api/mikrotik', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, action: 'delete' })
      });
      const result = await res.json();
      if (result.success) await deleteDoc(doc(db, 'users', id));
      else alert("রাউটার থেকে মুছে ফেলা যায়নি।");
    }
  };

  // UI ডিজাইন আপনার আগের প্রফেশনাল লুক অনুযায়ী থাকবে (স্ক্রিনশট ২৫৬ এর মতো)
  if (!isLoggedIn) {
    return (
      <div style={{ background: '#1e293b', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <form onSubmit={handleLogin} style={{ background: '#fff', padding: '40px', borderRadius: '20px', textAlign: 'center' }}>
          <h2 style={{ color: '#1e3a8a' }}>VIP NETWORK</h2>
          <input type="password" placeholder="Enter PIN" value={pin} onChange={(e) => setPin(e.target.value)} style={{ width: '100%', padding: '12px', margin: '20px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
          <button style={{ background: '#2563eb', color: '#fff', padding: '12px 30px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Login</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', backgroundColor: '#f8fafc' }}>
      <h1>ISP Admin Dashboard</h1>
      {/* বাকি টেবিল এবং ফর্ম কোড এখানে থাকবে */}
    </div>
  );
}
