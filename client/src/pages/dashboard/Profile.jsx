import React, { useState, useEffect } from 'react';

const Profile = () => {
  const [student, setStudent] = useState(null);

  useEffect(() => {
    // Load student data
    const data = JSON.parse(localStorage.getItem('student'));
    setStudent(data);
  }, []);

  if (!student) return <div>Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Student Profile</h1>
        <p className="text-slate-400 mt-1">Manage your account and download certifications.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT COL: PERSONAL DETAILS --- */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">
              Personal Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Full Name</label>
                <div className="text-slate-900 font-medium text-lg">{student.username}</div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email Address</label>
                <div className="text-slate-900 font-medium text-lg">{student.email}</div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Roll Number</label>
                <div className="text-slate-900 font-medium text-lg">{student.rollNumber || 'Not assigned'}</div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">College</label>
                <div className="text-slate-900 font-medium text-lg">
                  {/* If you saved collegeName in login response use that, otherwise placeholder */}
                  {student.collegeId || "DT Technical Institute"} 
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Internship Status</h2>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-4">
              <div className="bg-green-100 p-2 rounded-full text-green-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <h4 className="font-bold text-green-800">Active Intern</h4>
                <p className="text-sm text-green-700 mt-1">You are currently eligible for the AICTE Internship program. Complete your capstone project to unlock the certificate.</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT COL: CERTIFICATES --- */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Certificates</h2>
            
            <div className="space-y-4">
              
              {/* Certificate Item 1 */}
              <div className="border border-slate-100 rounded-xl p-4 hover:border-blue-200 transition-all hover:shadow-md group">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center text-xl">
                    🏆
                  </div>
                  <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded">PENDING</span>
                </div>
                <h3 className="font-bold text-slate-800">MERN Stack Internship</h3>
                <p className="text-xs text-slate-500 mt-1">Issued by AICTE & DT Skills</p>
                
                <button disabled className="mt-4 w-full py-2 bg-slate-100 text-slate-400 font-bold text-sm rounded-lg cursor-not-allowed">
                  Complete Course to Download
                </button>
              </div>

              {/* Offer Letter (Available Immediately) */}
              <div className="border border-blue-100 bg-blue-50/50 rounded-xl p-4 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">READY</span>
                </div>
                <h3 className="font-bold text-slate-800">Internship Offer Letter</h3>
                <p className="text-xs text-slate-500 mt-1">Official Joining Letter</p>
                
                <button 
                  onClick={() => alert("Downloading Offer Letter PDF...")}
                  className="mt-4 w-full py-2 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download PDF
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;