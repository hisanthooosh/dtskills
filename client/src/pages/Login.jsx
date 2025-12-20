import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Send Login Request
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      
      // 2. Save User Data to LocalStorage
      localStorage.setItem('student', JSON.stringify(res.data));
      
      // 3. Redirect to Dashboard
      navigate('/dashboard');
    } catch (err) {
      alert("Login Failed: " + (err.response?.data?.message || "Server Error"));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-slate-100">
        <h2 className="text-2xl font-bold mb-2 text-center text-slate-800">Welcome Back</h2>
        <p className="text-center text-slate-500 mb-6">Login to continue your internship</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              onChange={e => setFormData({...formData, password: e.target.value})} 
              required 
            />
          </div>
          
          <button className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition">
            Login
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-slate-600">
          Don't have an account? <Link to="/register" className="text-blue-600 font-bold hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
}