import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminManageAdmins() {
  const [admins, setAdmins] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const adminToken = localStorage.getItem('adminToken');

  const fetchAdmins = async () => {
    const res = await axios.get(
      'http://localhost:5000/api/admin-manage/course-admins',
      {
        headers: {
          Authorization: adminToken   // ✅ FIXED
        }
      }
    );
    setAdmins(res.data);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const createAdmin = async () => {
    if (!email || !password) {
      alert('Enter email and password');
      return;
    }

    await axios.post(
      'http://localhost:5000/api/admin-manage/create-course-admin',
      { email, password },
      {
        headers: {
          Authorization: adminToken   // ✅ FIXED
        }
      }
    );

    setEmail('');
    setPassword('');
    fetchAdmins();
  };

  const toggleAdmin = async (id) => {
    await axios.put(
      `http://localhost:5000/api/admin-manage/toggle-course-admin/${id}`,
      {},
      {
        headers: {
          Authorization: adminToken   // ✅ FIXED
        }
      }
    );
    fetchAdmins();
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Manage Course Admins</h1>

      {/* CREATE ADMIN */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="font-bold mb-2">Create Course Admin</h2>
        <input
          className="border p-2 mr-2"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className="border p-2 mr-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button
          onClick={createAdmin}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create
        </button>
      </div>

      {/* LIST ADMINS */}
      <div className="bg-white rounded shadow">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Email</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {admins.map(a => (
              <tr key={a._id} className="border-t">
                <td className="p-3">{a.email}</td>
                <td className="p-3">
                  {a.isActive ? '✅ Active' : '❌ Disabled'}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => toggleAdmin(a._id)}
                    className="text-blue-600 underline"
                  >
                    Toggle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
