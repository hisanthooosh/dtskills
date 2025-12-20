import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', collegeName: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      alert("Registration Successful! Please Login.");
      navigate('/login');
    } catch (err) {
      alert("Error: " + err.response.data.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Student Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Full Name" className="w-full p-3 border rounded" 
            onChange={e => setFormData({...formData, name: e.target.value})} required />
          <input type="email" placeholder="Email Address" className="w-full p-3 border rounded" 
            onChange={e => setFormData({...formData, email: e.target.value})} required />
          <input type="password" placeholder="Password" className="w-full p-3 border rounded" 
            onChange={e => setFormData({...formData, password: e.target.value})} required />
          <input type="text" placeholder="College Name" className="w-full p-3 border rounded" 
            onChange={e => setFormData({...formData, collegeName: e.target.value})} required />
          
          <button className="w-full bg-blue-600 text-white p-3 rounded font-bold hover:bg-blue-700">Register</button>
        </form>
        <p className="mt-4 text-center">Already have an account? <Link to="/login" className="text-blue-600">Login</Link></p>
      </div>
    </div>
  );
}