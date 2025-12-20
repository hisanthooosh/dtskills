import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { BookOpen, Award, CheckCircle, ArrowRight, User } from 'lucide-react';

export default function LandingPage() {
  const [courses, setCourses] = useState([]);

  // Fetch courses to display them
  useEffect(() => {
    axios.get('http://localhost:5000/api/courses')
      .then(res => setCourses(res.data))
      .catch(err => console.log("Backend not running?"));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* --- NAVBAR --- */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            <BookOpen className="w-8 h-8" />
            DT Skills
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-slate-600 font-medium hover:text-blue-600 transition">
              Log In
            </Link>
            <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold transition">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="px-6 py-20 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold mb-6">
            AICTE Registered Internship Partner
          </div>
          <h1 className="text-5xl font-extrabold text-slate-900 leading-tight mb-6">
            Launch Your Career with <span className="text-blue-600">Real Experience.</span>
          </h1>
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            The smartest way for B.Tech students to complete their **Summer Internship**. 
            Learn MERN Stack, build GitHub projects, and get your **College Submission Report** in 45 days.
          </p>
          
          <div className="flex gap-4">
            <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition flex items-center gap-2">
              Start Internship <ArrowRight />
            </Link>
            <a href="#courses" className="bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 transition">
              View Courses
            </a>
          </div>
          
          <p className="mt-6 text-sm text-slate-500 flex items-center gap-2">
            <User size={16} /> Join 1,200+ students from 15 colleges
          </p>
        </div>

        {/* Hero Image / Features */}
        <div className="hidden md:grid gap-6">
           <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex items-start gap-4 transform hover:-translate-y-1 transition duration-300">
             <div className="bg-green-100 p-4 rounded-full text-green-600"><Award size={28}/></div>
             <div>
               <h3 className="font-bold text-lg text-slate-800">Valid Certificates</h3>
               <p className="text-slate-500">Accepted for NAAC & NBA credits.</p>
             </div>
           </div>
           
           <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex items-start gap-4 transform hover:-translate-y-1 transition duration-300">
             <div className="bg-purple-100 p-4 rounded-full text-purple-600"><CheckCircle size={28}/></div>
             <div>
               <h3 className="font-bold text-lg text-slate-800">Project-Based Learning</h3>
               <p className="text-slate-500">Build 5+ real projects for your resume.</p>
             </div>
           </div>
        </div>
      </header>

      {/* --- COURSES SECTION --- */}
      <section id="courses" className="bg-white py-20 px-6 border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Choose Your Internship Path</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Select a track to start learning. All tracks include certification and project evaluation.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {courses.length > 0 ? courses.map(course => (
              <div key={course._id} className="group border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:border-blue-200 transition duration-300 bg-white">
                <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl mb-6 flex items-center justify-center font-bold text-xl group-hover:bg-blue-600 group-hover:text-white transition">
                  {course.title.substring(0,2).toUpperCase()}
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">{course.title}</h3>
                <p className="text-slate-500 text-sm mb-6 line-clamp-2">{course.description}</p>
                
                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <div>
                    <span className="block text-xs text-slate-400">Fee</span>
                    <span className="text-lg font-bold text-slate-900">₹{course.price || 200}</span>
                  </div>
                  <Link to="/register" className="text-blue-600 font-bold text-sm hover:underline">
                    Enroll Now →
                  </Link>
                </div>
              </div>
            )) : (
              <div className="col-span-3 text-center py-10">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-400">Loading courses from server...</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}