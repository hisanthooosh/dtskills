import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const LandingPage = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/courses`)
          ;
        setCourses(
          Array.isArray(response.data)
            ? response.data
            : response.data.courses || []
        );

      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900">

      {/* --- NAVBAR --- */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
                DT
              </div>
              <span className="text-2xl font-bold text-slate-800 tracking-tight">Skills</span>
            </div>
            <div className="hidden md:flex space-x-8 items-center">
              <a href="#process" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition">The Process</a>
              <a href="#courses" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition">Programs</a>
              <Link to="/login" className="text-sm font-medium text-slate-900 hover:text-blue-600">Log in</Link>
              <Link to="/register" className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-800 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Join Now
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <div className="relative pt-20 pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-20 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-8 shadow-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            AICTE Approved Internship Provider
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-tight">
            Learn Skills. Get Hired. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
              Intern With Us For Free.
            </span>
          </h1>

          <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-600 mb-10">
            We are an <strong>AICTE Approved Company</strong>. Pay only for your training.
            Once certified, you join our internal team for a <span className="underline decoration-yellow-400 decoration-4 underline-offset-4">Guaranteed Free Internship</span> to launch your career.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="#courses" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-blue-200 shadow-xl hover:bg-blue-700 transition hover:-translate-y-1">
              Find Your Course
            </a>
            <a href="#process" className="bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 transition">
              How It Works
            </a>
          </div>
        </div>
      </div>

      {/* --- TRUST STATS STRIP --- */}
      <div className="bg-slate-900 py-12 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-white mb-1">AICTE</p>
              <p className="text-slate-400 text-sm uppercase tracking-wide">Approved Partner</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-1">100%</p>
              <p className="text-slate-400 text-sm uppercase tracking-wide">Internship Guarantee</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-1">Live</p>
              <p className="text-slate-400 text-sm uppercase tracking-wide">Real-time Projects</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-1">Zero</p>
              <p className="text-slate-400 text-sm uppercase tracking-wide">Internship Fees</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- THE PROCESS SECTION (Crucial Logic) --- */}
      <section id="process" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-blue-600 font-bold uppercase tracking-widest text-sm mb-2">Your Roadmap</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900">From Student to Professional in 3 Steps</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 transform translate-y-4 -z-10"></div>

            {/* Step 1 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 relative text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg shadow-blue-200 rotate-3 transform hover:rotate-6 transition">
                1
              </div>
              <h4 className="text-xl font-bold mb-3 text-slate-900">Enrol in a Course</h4>
              <p className="text-slate-500 leading-relaxed">
                Choose your stack. Pay a one-time fee for premium live training and project-based learning.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 relative text-center">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg shadow-indigo-200 -rotate-3 transform hover:-rotate-6 transition">
                2
              </div>
              <h4 className="text-xl font-bold mb-3 text-slate-900">Complete Training</h4>
              <p className="text-slate-500 leading-relaxed">
                Master the skills. Build real-time apps. Pass the assessment to prove you are industry-ready.
              </p>
            </div>

            {/* Step 3 (Highlight) */}
            <div className="bg-gradient-to-b from-yellow-50 to-white p-8 rounded-2xl border-2 border-yellow-400 shadow-2xl shadow-yellow-100 relative text-center transform scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-extrabold px-4 py-1 rounded-full uppercase tracking-wider">
                Our Commitment
              </div>
              <div className="w-16 h-16 bg-yellow-400 text-yellow-900 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg shadow-yellow-200">
                3
              </div>
              <h4 className="text-xl font-bold mb-3 text-slate-900">Join Us as an Intern</h4>
              <p className="text-slate-600 leading-relaxed font-medium">
                You become eligible for a <strong>Free Internship at DT Skills</strong>. Work on live company projects and get your AICTE certificate.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* --- NEW SECTION: DOMAINS & TOOLS --- */}
      <section className="py-20 bg-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left Side: Domains */}
            <div>
              <h2 className="text-blue-400 font-bold uppercase tracking-wider text-sm mb-2">Future-Ready Skills</h2>
              <h3 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight">
                Master the Technologies <br /> Defining Tomorrow.
              </h3>
              <p className="text-slate-400 mb-8 text-lg">
                We don't just teach coding; we specialize in advanced domains that top product companies are hiring for right now.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: "Artificial Intelligence", icon: "🤖" },
                  { name: "Data Science", icon: "📊" },
                  { name: "Machine Learning", icon: "🧠" },
                  { name: "NLP", icon: "🗣️" },
                  { name: "Cloud Computing", icon: "☁️" },
                  { name: "Full Stack Dev", icon: "💻" },
                ].map((tech, index) => (
                  <div key={index} className="flex items-center gap-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700 hover:border-blue-500 transition duration-300">
                    <span className="text-2xl">{tech.icon}</span>
                    <span className="font-semibold text-slate-200">{tech.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side: Tools Training */}
            <div className="relative">
              {/* Decorative Blur */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-30"></div>

              <div className="relative bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl">
                <h4 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-yellow-400 rounded-full"></span>
                  Industry Standard Tooling
                </h4>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center text-2xl border border-blue-700 shrink-0">
                      📝
                    </div>
                    <div>
                      <h5 className="font-bold text-white text-lg">VS Code Mastery</h5>
                      <p className="text-slate-400 text-sm mt-1">
                        Stop coding like a beginner. Learn extensions, debugging, and shortcuts used by senior devs.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center text-2xl border border-gray-600 shrink-0">
                      🐙
                    </div>
                    <div>
                      <h5 className="font-bold text-white text-lg">GitHub Collaboration</h5>
                      <p className="text-slate-400 text-sm mt-1">
                        Real-world projects require version control. Master branches, pull requests, and code reviews.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-indigo-900 rounded-lg flex items-center justify-center text-2xl border border-indigo-700 shrink-0">
                      🚀
                    </div>
                    <div>
                      <h5 className="font-bold text-white text-lg">Deployment Pipelines</h5>
                      <p className="text-slate-400 text-sm mt-1">
                        Don't just run it locally. Learn to deploy your AI models and Apps to the Cloud live.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>
      {/* --- COURSES SECTION (Dynamic) --- */}
      <section id="courses" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Select Your Path</h2>
              <p className="text-slate-600 text-lg max-w-xl">
                Industry-standard curriculums designed to get you ready for your internship with us.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {courses.length > 0 ? (
              courses.map((course) => (
                <div key={course._id} className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col h-full">

                  {/* Card Header / Image */}
                  <div className="h-56 bg-slate-900 relative overflow-hidden flex items-center justify-center group-hover:bg-blue-900 transition">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/10"></div>
                    <h3 className="text-white text-3xl font-extrabold tracking-tight relative z-10">
                      {course.title ? course.title.substring(0, 15) : 'COURSE'}
                    </h3>
                  </div>

                  <div className="p-8 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase">
                        Certification
                      </span>
                      <span className="text-slate-400 text-sm line-through">₹{course.price * 2}</span>
                    </div>

                    <h4 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition">
                      {course.title}
                    </h4>

                    <p className="text-slate-500 mb-6 flex-grow">
                      {course.description ? course.description.substring(0, 120) : "Comprehensive training program..."}...
                    </p>

                    <ul className="space-y-3 mb-8">
                      <li className="flex items-center text-slate-600 text-sm">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span> Live Classes
                      </li>
                      <li className="flex items-center text-slate-600 text-sm">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span> Capstone Projects
                      </li>
                      <li className="flex items-center text-slate-900 font-bold text-sm">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span> Free AICTE Internship included
                      </li>
                    </ul>

                    <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="block text-xs text-slate-400">Total Fee</span>
                        <span className="text-3xl font-bold text-slate-900">₹{course.price}</span>
                      </div>
                      <Link
                        to={`/register`}
                        className="bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition"
                      >
                        Enroll Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                <p className="text-slate-400 text-lg">Loading available courses...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* --- ADVANCED FOOTER --- */}
      <footer className="bg-slate-950 text-slate-300 border-t border-slate-900 font-sans">

        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

            {/* Column 1: Brand & About */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">DT</div>
                <span className="text-xl font-bold text-white">DT Skills</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">
                The leading AICTE-approved internship platform. We bridge the gap between academic learning and industry demands through real-time project experience.
              </p>
              <div className="flex gap-4 pt-2">
                {/* Social Placeholders */}
                <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition text-white">𝕏</a>
                <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition text-white">in</a>
                <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition text-white">f</a>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-6">Platform</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition">Browse Courses</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Internship Process</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Verify Certificate</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Success Stories</a></li>
              </ul>
            </div>

            {/* Column 3: Contact Info */}
            <div>
              <h4 className="text-white font-semibold mb-6">Contact Us</h4>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 mt-0.5">📍</span>
                  <span>
                    Tech Park, Sector 5<br />
                    Bangalore, Karnataka - 560100
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-blue-500">📧</span>
                  <a href="mailto:support@dtskills.com" className="hover:text-white">support@dtskills.com</a>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-blue-500">📞</span>
                  <span>+91 98765 43210</span>
                </li>
              </ul>
            </div>

            {/* Column 4: Newsletter */}
            <div>
              <h4 className="text-white font-semibold mb-6">Stay Updated</h4>
              <p className="text-xs text-slate-500 mb-4">
                Get the latest hiring trends and new course alerts directly to your inbox.
              </p>
              <form className="space-y-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                />
                <button className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition text-sm">
                  Subscribe
                </button>
              </form>
            </div>

          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="border-t border-slate-900 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} DT Skills Pvt Ltd. All rights reserved.
            </p>
            <div className="flex gap-6 text-xs text-slate-500">
              <a href="#" className="hover:text-white transition">Privacy Policy</a>
              <a href="#" className="hover:text-white transition">Terms of Service</a>
              <a href="#" className="hover:text-white transition">Refund Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;