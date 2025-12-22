import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

// --- CUSTOM SEARCHABLE DROPDOWN COMPONENT ---
const SearchableDropdown = ({ label, options, selectedVal, onSelect, displayKey, placeholder, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // Filter options based on search
  const filteredOptions = options.filter(option => {
    const valueToCheck = displayKey ? option[displayKey] : option;
    return String(valueToCheck).toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="relative mb-4" ref={wrapperRef}>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      
      <div 
        className={`w-full p-3 border rounded-lg flex justify-between items-center cursor-pointer bg-white transition-all ${disabled ? 'bg-slate-100 cursor-not-allowed text-slate-400' : 'hover:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 border-slate-300'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={`block truncate ${!selectedVal ? 'text-slate-400' : 'text-slate-800'}`}>
          {selectedVal 
            ? (displayKey ? selectedVal[displayKey] : selectedVal) 
            : placeholder}
        </span>
        <svg className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-auto">
          {/* Search Input Sticky Header */}
          <div className="sticky top-0 bg-white p-2 border-b border-slate-100">
            <input
              type="text"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Type to search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          
          {/* Options List */}
          <ul className="py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, idx) => (
                <li 
                  key={idx}
                  className="px-4 py-2.5 hover:bg-blue-50 text-slate-700 cursor-pointer text-sm transition-colors"
                  onClick={() => {
                    onSelect(option);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                >
                  {displayKey ? option[displayKey] : option}
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-slate-400 text-sm text-center italic">No results found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

// --- MAIN REGISTER COMPONENT ---
export default function Register() {
  const navigate = useNavigate();
  
  // States
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    rollNumber: '',
    collegeId: '',
    courseId: ''
  });

  const [colleges, setColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedRoll, setSelectedRoll] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch Colleges
  useEffect(() => {
    axios.get('http://localhost:5000/api/college/all')
      .then(res => setColleges(res.data))
      .catch(err => console.error("Error fetching colleges:", err));
  }, []);

  // Standard Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit Logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      alert("Registration Successful! Please Login.");
      navigate('/login');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Registration failed";
      alert("Error: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      
      {/* LEFT: Form Section */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white z-10 w-full lg:w-[600px]">
        <div className="mx-auto w-full max-w-lg">
          <div className="mb-10">
            <Link to="/" className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
                DT
              </div>
              <span className="text-2xl font-bold text-slate-900 tracking-tight">Skills</span>
            </Link>
            <h2 className="text-3xl font-extrabold text-slate-900">Start your Journey</h2>
            <p className="mt-2 text-sm text-slate-600">Create your student account to access the internship portal.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2">
            
            {/* 1. College Search */}
            <SearchableDropdown 
              label="College Name"
              placeholder="Select or search your college"
              options={colleges}
              displayKey="name" // Matches 'name' in your College Model
              selectedVal={selectedCollege}
              onSelect={(college) => {
                setSelectedCollege(college);
                setSelectedCourse(null); // Reset children
                setSelectedRoll(null);
                setFormData({ ...formData, collegeId: college._id, courseId: '', rollNumber: '' });
              }}
            />

            {/* 2. Course/Dept Search */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SearchableDropdown 
                label="Department / Course"
                placeholder={selectedCollege ? "Search course..." : "Select College first"}
                disabled={!selectedCollege}
                options={selectedCollege ? selectedCollege.courses : []}
                displayKey="courseName" // Matches 'courseName' in your data
                selectedVal={selectedCourse}
                onSelect={(course) => {
                  setSelectedCourse(course);
                  setSelectedRoll(null);
                  setFormData({ ...formData, courseId: course._id, rollNumber: '' });
                }}
              />

              {/* 3. Roll Number Search */}
              <SearchableDropdown 
                label="Roll Number"
                placeholder={selectedCourse ? "Search roll no..." : "Select Course first"}
                disabled={!selectedCourse}
                options={selectedCourse ? selectedCourse.rollNumbers.filter(r => !r.isRegistered) : []}
                displayKey="number" // Matches 'number' in your data
                selectedVal={selectedRoll}
                onSelect={(rollObj) => {
                  setSelectedRoll(rollObj);
                  setFormData({ ...formData, rollNumber: rollObj.number });
                }}
              />
            </div>

            {/* Standard Fields */}
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Username</label>
                <input 
                  type="text" name="username" required 
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="johndoe123"
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" name="email" required 
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="john@example.com"
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                <input 
                  type="password" name="password" required 
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="••••••••"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="pt-6">
              <button 
                type="submit" 
                disabled={loading}
                className={`w-full bg-slate-900 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-slate-800 transition transform hover:-translate-y-0.5 shadow-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Creating Account...' : 'Register Now'}
              </button>
            </div>

          </form>

          <p className="mt-8 text-center text-sm text-slate-600">
            Already registered? <Link to="/login" className="font-bold text-blue-600 hover:text-blue-500">Sign in to Dashboard</Link>
          </p>
        </div>
      </div>

      {/* RIGHT: Feature Image */}
      <div className="hidden lg:block relative w-0 flex-1 overflow-hidden bg-slate-50">
        <div className="absolute inset-0 h-full w-full bg-slate-900">
          <svg className="absolute left-0 top-0 h-full w-full opacity-20" fill="currentColor" viewBox="0 0 100 100" preserveAspectRatio="none">
             <path d="M0 100 C 20 0 50 0 100 100 Z" />
          </svg>
          <div className="flex flex-col items-center justify-center h-full px-20 text-center">
            <h1 className="text-4xl font-extrabold text-white mb-6">
              Verify & Get Hired.
            </h1>
            <p className="text-blue-200 text-lg">
              "This platform connects your academic progress directly with our company HR. Registering correctly ensures your internship offer letter is generated automatically."
            </p>
            <div className="mt-10 flex gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></span>
              <span className="w-3 h-3 bg-white rounded-full animate-bounce delay-100"></span>
              <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}