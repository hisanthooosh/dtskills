import { useEffect, useState } from 'react';
import adminAxios from '../utils/adminAxios';
import { PlusCircle, ShieldCheck, Power } from 'lucide-react';

export default function AdminManageAdmins() {
  const [admins, setAdmins] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAdmins = async () => {
    try {
      const res = await adminAxios.get('/admin-manage/course-admins');
      setAdmins(res.data);
    } catch (err) {
      alert('Unauthorized or session expired');
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const createAdmin = async () => {
    if (!email || !password) {
      alert('Enter email and password');
      return;
    }

    try {
      setLoading(true);
      await adminAxios.post('/admin-manage/create-course-admin', {
        email,
        password
      });

      setEmail('');
      setPassword('');
      fetchAdmins();
    } catch (err) {
      alert(err.response?.data?.error || 'Error creating admin');
    } finally {
      setLoading(false);
    }
  };

  const toggleAdmin = async (id) => {
    if (!confirm('Are you sure you want to toggle this admin?')) return;

    try {
      await adminAxios.put(`/admin-manage/toggle-course-admin/${id}`);
      fetchAdmins();
    } catch (err) {
      alert('Error updating admin');
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">

      {/* PAGE HEADER */}
      <div className="flex items-center gap-3 mb-8">
        <ShieldCheck className="text-blue-600" size={28} />
        <h1 className="text-3xl font-bold text-slate-800">
          Manage Course Admins
        </h1>
      </div>

      {/* CREATE ADMIN CARD */}
      <div className="bg-white p-6 rounded-2xl shadow border border-slate-200 mb-10">
        <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
          <PlusCircle size={20} /> Create Course Admin
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            className="border px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Admin Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <input
            className="border px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <button
            onClick={createAdmin}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6 py-3 transition shadow disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Admin'}
          </button>
        </div>
      </div>

      {/* ADMINS LIST */}
      <div className="bg-white rounded-2xl shadow border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-100 border-b">
            <tr>
              <th className="p-4 font-bold text-slate-600">Email</th>
              <th className="p-4 font-bold text-slate-600">Status</th>
              <th className="p-4 font-bold text-slate-600">Action</th>
            </tr>
          </thead>

          <tbody>
            {admins.length === 0 && (
              <tr>
                <td colSpan="3" className="p-6 text-center text-slate-400 italic">
                  No course admins created yet
                </td>
              </tr>
            )}

            {admins.map(admin => (
              <tr
                key={admin._id}
                className="border-b hover:bg-slate-50 transition"
              >
                <td className="p-4 font-medium text-slate-700">
                  {admin.email}
                </td>

                <td className="p-4">
                  {admin.isActive ? (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                      Active
                    </span>
                  ) : (
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                      Disabled
                    </span>
                  )}
                </td>

                <td className="p-4">
                  <button
                    onClick={() => toggleAdmin(admin._id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition
                      ${admin.isActive
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                  >
                    <Power size={16} />
                    {admin.isActive ? 'Disable' : 'Enable'}
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
