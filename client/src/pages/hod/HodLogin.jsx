import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, School } from 'lucide-react';

const HodLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post(
        'http://localhost:5000/api/college/login',
        { email, password }
      );

      localStorage.setItem('hodCollegeId', res.data.collegeId);
      localStorage.setItem('hodCollegeName', res.data.collegeName);
      localStorage.setItem('hodDept', res.data.deptName);

      navigate('/hod-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 px-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">

        {/* HEADER */}
        <div className="bg-slate-900 text-white p-6">
          <div className="flex items-center gap-2">
            <School className="text-yellow-400" />
            <h1 className="text-xl font-bold">HOD Portal</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Department access for colleges
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
            Login
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Use your official college credentials
          </p>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">

            <div>
              <label className="text-xs font-bold text-slate-600 uppercase">
                Official Email
              </label>
              <input
                type="email"
                placeholder="hod@college.edu"
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition shadow-md"
            >
              Login to Dashboard
            </button>

          </form>
        </div>

        {/* FOOTER */}
        <div className="bg-slate-50 text-center py-3 text-xs text-slate-400 border-t">
          © {new Date().getFullYear()} DT Skills · College Portal
        </div>

      </div>
    </div>
  );
};

export default HodLogin;
