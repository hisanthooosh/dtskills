import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/login`,

        formData
      );

      localStorage.setItem('student', JSON.stringify(res.data));
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Invalid credentials. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">

      {/* LEFT SIDE */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white z-10">
        <div className="mx-auto w-full max-w-sm lg:w-96">

          {/* BRAND */}
          <div className="mb-8">
            <Link to="/" className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                DT
              </div>
              <span className="text-2xl font-bold text-slate-900">
                Skills
              </span>
            </Link>

            <h2 className="text-3xl font-extrabold text-slate-900">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Choose your role and sign in
            </p>
          </div>

          {/* 🔑 ROLE LOGIN BUTTONS */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => navigate('/hod-login')}
              className="py-3 rounded-lg border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              HOD Login
            </button>

            <button
              onClick={() => navigate('/admin-login')}
              className="py-3 rounded-lg border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              Admin Login
            </button>
          </div>

          {/* DIVIDER */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">
                Student Login
              </span>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* STUDENT LOGIN FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                required
                className="mt-1 w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                onChange={e =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                required
                className="mt-1 w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                onChange={e =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/register"
              className="text-blue-600 font-bold hover:underline"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE BANNER */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 to-indigo-900 text-white p-12 items-center">
        <div>
          <h2 className="text-4xl font-bold mb-6">
            Your Career Starts Here
          </h2>
          <p className="text-blue-100 max-w-md">
            Learn, build real projects, complete internships, and download
            verified certificates — all in one platform.
          </p>
        </div>
      </div>
    </div>
  );
}
