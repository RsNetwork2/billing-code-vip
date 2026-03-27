import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ username: '', password: '', package: '30 Day' });

  // ১. ফায়ারবেস থেকে রিয়েল-টাইম ডাটা লোড করা
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      const userList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
    });
    return () => unsub();
  }, []);

  // ২. নতুন ইউজার যোগ করার ফাংশন
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) return alert("সবগুলো ঘর পূরণ করুন!");
    
    await addDoc(collection(db, 'users'), formData);
    setFormData({ username: '', password: '', package: '30 Day' }); // ফর্ম খালি করা
    alert("ইউজার ফায়ারবেসে যোগ হয়েছে!");
  };

  // ৩. ইউজার ডিলিট করার ফাংশন
  const handleDelete = async (id, username) => {
    if (confirm(`আপনি কি নিশ্চিত যে ${username} কে ডিলিট করতে চান?`)) {
      await deleteDoc(doc(db, 'users', id));
      alert("ইউজার ডিলিট করা হয়েছে। মাইক্রোটিক থেকে এটি অটোমেটিক মুছে যাবে।");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-700 mb-8 text-center">VIP NETWORK ISP Panel</h1>

        {/* নতুন ইউজার যোগ করার ফর্ম */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-10 border-t-4 border-blue-500">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Add New User</h2>
          <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input 
              className="p-2 border rounded shadow-sm focus:outline-blue-500"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
            <input 
              className="p-2 border rounded shadow-sm focus:outline-blue-500"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            <select 
              className="p-2 border rounded shadow-sm bg-white"
              value={formData.package}
              onChange={(e) => setFormData({...formData, package: e.target.value})}
            >
              <option value="30 Day">30 Day Profile</option>
              <option value="15 Day">15 Day Profile</option>
              <option value="default">Default Profile</option>
            </select>
            <button className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition">
              Add User
            </button>
          </form>
        </div>

        {/* ইউজার লিস্ট টেবিল */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="p-4 border-b">User ID / Name</th>
                <th className="p-4 border-b">Password</th>
                <th className="p-4 border-b">Profile/Package</th>
                <th className="p-4 border-b text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-blue-50 transition">
                  <td className="p-4 border-b font-medium text-gray-800">{user.username}</td>
                  <td className="p-4 border-b text-gray-600">{user.password}</td>
                  <td className="p-4 border-b"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">{user.package}</span></td>
                  <td className="p-4 border-b text-center">
                    <button 
                      onClick={() => handleDelete(user.id, user.username)}
                      className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 text-sm"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p className="text-center p-10 text-gray-400 italic">No active users found.</p>}
        </div>
      </div>
    </div>
  );
}