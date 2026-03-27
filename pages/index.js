import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ username: '', password: '', package: '30 Day' });

  // ফায়ারবেস থেকে রিয়েল-টাইম ডাটা লোড করা
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
    await addDoc(collection(db, 'users'), formData);
    setFormData({ username: '', password: '', package: '30 Day' });
    alert("ইউজার সফলভাবে যোগ হয়েছে!");
  };

  const handleDelete = async (id, name) => {
    if (confirm(`${name} কে ডিলিট করতে চান?`)) {
      await deleteDoc(doc(db, 'users', id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-5 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
        <div className="bg-blue-700 p-6">
          <h1 className="text-2xl font-bold text-white text-center">VIP NETWORK ISP Panel</h1>
        </div>

        <div className="p-6">
          <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <input className="p-3 border rounded shadow-sm focus:ring-2 focus:ring-blue-500" placeholder="Username" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
            <input className="p-3 border rounded shadow-sm focus:ring-2 focus:ring-blue-500" placeholder="Password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
            <select className="p-3 border rounded shadow-sm bg-white" value={formData.package} onChange={(e) => setFormData({...formData, package: e.target.value})}>
              <option value="30 Day">30 Day Profile</option>
              <option value="15 Day">15 Day Profile</option>
            </select>
            <button className="bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition">Add User</button>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-4 border-b">Username</th>
                  <th className="p-4 border-b">Password</th>
                  <th className="p-4 border-b">Package</th>
                  <th className="p-4 border-b text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="p-4 border-b font-semibold">{user.username}</td>
                    <td className="p-4 border-b text-gray-600">{user.password}</td>
                    <td className="p-4 border-b text-blue-600 font-bold">{user.package}</td>
                    <td className="p-4 border-b text-center">
                      <button onClick={() => handleDelete(user.id, user.username)} className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600">Delete</button>
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
