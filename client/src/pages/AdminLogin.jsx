
console.log("API BASE URL:", import.meta.env.VITE_API_BASE_URL);


import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/admin-auth/login`
,
        { email, password }
      );

      localStorage.setItem('admin', JSON.stringify(res.data.admin));
      localStorage.setItem('adminToken', res.data.token);

      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">

        {/* HEADER */}
        <div className="bg-slate-900 text-white p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-green-400" />
            <h1 className="text-xl font-bold">DT Skills Admin</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Super Admin & Course Admin Access
          </p>
        </div>

        {/* BODY */}
        <div className="p-8">

          {/* BACK BUTTON */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-6"
          >
            <ArrowLeft size={16} />
            Back to Home
          </button>

          <h2 className="text-2xl font-bold text-slate-800 mb-1">
            Admin Login
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Authorized personnel only
          </p>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">

            <div>
              <label className="text-xs font-bold text-slate-600 uppercase">
                Admin Email
              </label>
              <input
                type="email"
                placeholder="admin@dtskills.com"
                className="w-full mt-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 uppercase">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full mt-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition shadow-lg"
            >
              Login to Admin Panel
            </button>

          </form>
        </div>

        {/* FOOTER */}
        <div className="bg-slate-50 text-center py-3 text-xs text-slate-400 border-t">
          © {new Date().getFullYear()} DT Skills · Admin Panel
        </div>

      </div>
    </div>
  );
}
