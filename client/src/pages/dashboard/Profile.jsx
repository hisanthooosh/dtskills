import React, { useState, useEffect } from 'react';

const Profile = () => {
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('student');
    if (data) {
      setStudent(JSON.parse(data));
    }
  }, []);

  if (!student) return (
    <div className="flex justify-center items-center h-64 text-slate-400 font-medium">
      Loading Profile...
    </div>
  );

  return (
    <div className="font-sans text-slate-900">
      
      {/* --- 1. HERO SECTION (Cleaner Design) --- */}
      <div className="relative mb-8">
        
        {/* Banner Background */}
        <div className="h-48 w-full bg-gradient-to-r from-slate-800 to-slate-900 rounded-t-2xl shadow-sm"></div>
        
        {/* Profile Header Content */}
        <div className="bg-white px-8 pb-8 rounded-b-2xl shadow-sm border-x border-b border-slate-200 -mt-1 relative flex flex-col md:flex-row items-end gap-6">
          
          {/* Avatar (Overlapping) */}
          <div className="-mt-12 relative">
            <div className="w-32 h-32 rounded-2xl bg-white p-1.5 shadow-lg ring-1 ring-slate-100">
              <div className="w-full h-full bg-blue-600 rounded-xl flex items-center justify-center text-4xl text-white font-bold">
                {student.username?.charAt(0).toUpperCase()}
              </div>
            </div>
            {/* Online Dot */}
            <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
          </div>
          
          {/* Main Info */}
          <div className="flex-1 mb-2">
            <h1 className="text-3xl font-bold text-slate-900">{student.username}</h1>
            <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
              <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-md font-bold border border-blue-100">STUDENT</span>
              <span>{student.collegeId || 'DT Technical Institute'}</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mb-2 flex gap-3">
             <button className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition">
                Edit Profile
             </button>
             <button className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition shadow-lg shadow-slate-200">
                Download Resume
             </button>
          </div>
        </div>
      </div>

      {/* --- 2. MAIN CONTENT GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Personal Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Course Progress</p>
              <p className="text-2xl font-bold text-slate-900">35%</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Assignments</p>
              <p className="text-2xl font-bold text-slate-900">12/15</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Attendance</p>
              <p className="text-2xl font-bold text-green-600">92%</p>
            </div>
          </div>

          {/* About / Details */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Full Name</label>
                <div className="text-slate-800 font-medium">{student.username}</div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Email</label>
                <div className="text-slate-800 font-medium">{student.email}</div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Roll Number</label>
                <div className="text-slate-800 font-mono bg-slate-100 inline-block px-2 py-1 rounded text-sm">
                  {student.rollNumber || 'Not Assigned'}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Phone</label>
                <div className="text-slate-400 italic font-medium">Not provided</div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Department</label>
                <div className="text-slate-800 font-medium">Computer Science</div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Academic Year</label>
                <div className="text-slate-800 font-medium">2024 - 2025</div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {['JavaScript', 'React', 'Node.js', 'MongoDB', 'HTML/CSS'].map((skill) => (
                <span key={skill} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200">
                  {skill}
                </span>
              ))}
              <button className="text-blue-600 text-sm font-medium px-3 py-1.5 hover:bg-blue-50 rounded-lg transition">
                + Add Skill
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Internship Status */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Status Card */}
          <div className="bg-slate-900 rounded-xl p-6 text-white shadow-xl">
            <h3 className="font-bold text-lg mb-1">Internship Status</h3>
            <p className="text-slate-400 text-sm mb-6">Track your certification progress.</p>
            
            <div className="space-y-6 relative">
              {/* Vertical Line */}
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-700"></div>

              <div className="relative flex gap-4">
                <div className="w-6 h-6 rounded-full bg-green-500 border-4 border-slate-900 z-10"></div>
                <div>
                  <p className="text-sm font-bold text-green-400">Registered</p>
                  <p className="text-xs text-slate-500">Account verified</p>
                </div>
              </div>

              <div className="relative flex gap-4">
                <div className="w-6 h-6 rounded-full bg-blue-500 border-4 border-slate-900 z-10"></div>
                <div>
                  <p className="text-sm font-bold text-white">Coursework</p>
                  <p className="text-xs text-slate-400">In Progress (35%)</p>
                </div>
              </div>

              <div className="relative flex gap-4 opacity-50">
                <div className="w-6 h-6 rounded-full bg-slate-700 border-4 border-slate-900 z-10"></div>
                <div>
                  <p className="text-sm font-bold text-white">Capstone Project</p>
                  <p className="text-xs text-slate-500">Locked</p>
                </div>
              </div>
            </div>
          </div>

          {/* Downloads */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-4">Documents</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50 hover:border-blue-300 transition cursor-pointer group">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📄</span>
                  <div>
                    <p className="text-sm font-bold text-slate-700 group-hover:text-blue-600">Offer Letter</p>
                    <p className="text-[10px] text-slate-400">PDF • 2MB</p>
                  </div>
                </div>
                <button onClick={() => alert("Downloading...")} className="text-slate-400 hover:text-blue-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-dashed border-slate-300 bg-white opacity-60">
                <div className="flex items-center gap-3">
                  <span className="text-xl grayscale">🎓</span>
                  <div>
                    <p className="text-sm font-bold text-slate-500">Certificate</p>
                    <p className="text-[10px] text-slate-400">Locked</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-medium px-2 py-1 bg-slate-100 rounded">
                  Pending
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;