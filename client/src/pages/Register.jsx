import { useState, useEffect } from 'react'; // <--- Added useEffect here
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();

  // 1. Unified State for all inputs
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    rollNumber: '',
    collegeId: '',
    courseId: ''
  });

  // 2. State for Dropdowns
  const [colleges, setColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // 3. Fetch Colleges on Load
  useEffect(() => {
    axios.get('http://localhost:5000/api/college/all')
      .then(res => setColleges(res.data))
      .catch(err => console.error("Error fetching colleges:", err));
  }, []);

  // 4. Handle Input Changes (Standard fields)
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 5. Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send the unified formData to the backend
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      alert("Registration Successful! Please Login.");
      navigate('/login');
    } catch (err) {
      // Safe error handling
      const errorMsg = err.response?.data?.message || err.message || "Registration failed";
      alert("Error: " + errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Student Account</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* --- 1. COLLEGE DROPDOWN --- */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">College</label>
            <select 
              className="w-full px-3 py-2 border rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => {
                const college = colleges.find(c => c._id === e.target.value);
                setSelectedCollege(college);
                setSelectedCourse(null); // Reset course
                setFormData({ ...formData, collegeId: e.target.value, rollNumber: '' }); // Update state
              }}
              required
            >
              <option value="">Select Your College</option>
              {colleges.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* --- 2. COURSE DROPDOWN --- */}
          {selectedCollege && (
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Course / Dept</label>
              <select 
                className="w-full px-3 py-2 border rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => {
                  const course = selectedCollege.courses.find(c => c._id === e.target.value);
                  setSelectedCourse(course);
                  setFormData({ ...formData, courseId: e.target.value, rollNumber: '' });
                }}
                required
              >
                <option value="">Select Course</option>
                {selectedCollege.courses.map(course => (
                  <option key={course._id} value={course._id}>{course.courseName}</option>
                ))}
              </select>
            </div>
          )}

          {/* --- 3. ROLL NUMBER DROPDOWN --- */}
          {selectedCourse && (
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Roll Number</label>
              <select 
                className="w-full px-3 py-2 border rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="rollNumber"
                onChange={handleChange}
                required
              >
                <option value="">Select Your Roll Number</option>
                {selectedCourse.rollNumbers
                  .filter(r => !r.isRegistered) // Filter out taken numbers
                  .map(r => (
                    <option key={r._id} value={r.number}>{r.number}</option>
                  ))}
              </select>
            </div>
          )}

          {/* --- 4. STANDARD INPUTS --- */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
            <input 
              type="text" 
              name="username" 
              placeholder="Create a username" 
              className="w-full px-3 py-2 border rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              required 
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
            <input 
              type="email" 
              name="email" 
              placeholder="Enter your email" 
              className="w-full px-3 py-2 border rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              required 
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input 
              type="password" 
              name="password" 
              placeholder="Create a password" 
              className="w-full px-3 py-2 border rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              required 
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
          >
            Register
          </button>

        </form>
        
        <p className="mt-4 text-center">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}