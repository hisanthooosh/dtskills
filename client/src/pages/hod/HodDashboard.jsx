import { useState, useEffect } from 'react';
import axios from 'axios';
import { CSVLink } from 'react-csv';
import { Users, BookOpen, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HodDashboard = () => {
  const [collegeData, setCollegeData] = useState(null);
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();

  // Retrieve HOD details from storage
  const hodDept = localStorage.getItem('hodDept'); // e.g., "CSE"
  const hodCollegeId = localStorage.getItem('hodCollegeId');

  useEffect(() => {
    // Redirect if not logged in
    if (!hodCollegeId || !hodDept) {
      navigate('/hod-login');
      return;
    }

    const fetchDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/college/${hodCollegeId}`);
        setCollegeData(res.data);
        
        // AUTOMATICALLY process ONLY the logged-in HOD's department
        processStudents(res.data, hodDept);
      } catch (err) {
        console.error("Failed to fetch college data", err);
      }
    };
    
    fetchDetails();
  }, [hodCollegeId, hodDept, navigate]);

  // Process data ONLY for the specific department
  const processStudents = (data, myDept) => {
    let allStudents = [];
    
    // Find the specific course/department matching the HOD
    const targetCourse = data.courses.find(c => c.courseName === myDept);

    if (targetCourse) {
      targetCourse.rollNumbers.forEach(roll => {
        // Only add students who have actually registered (have a studentId)
        if (roll.isRegistered && roll.studentId) {
          allStudents.push({
            name: roll.studentId.username || "Unknown",
            email: roll.studentId.email || "N/A",
            rollNo: roll.number,
            department: targetCourse.courseName,
            // Calculate progress if available, else default
            module: roll.studentId.enrolledCourses?.length > 0 
                    ? `${roll.studentId.enrolledCourses.length} Courses Enrolled` 
                    : "Not Started",
            status: "Active"
          });
        }
      });
    }
    
    setStudents(allStudents);
  };

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('hodCollegeId');
    localStorage.removeItem('hodCollegeName');
    localStorage.removeItem('hodDept');
    navigate('/hod-login');
  };

  if (!collegeData) return <div className="p-10 text-center">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <header className="mb-8 flex justify-between items-center bg-white p-6 rounded-lg shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">HOD Dashboard</h1>
          <p className="text-gray-600 mt-1">
            <span className="font-semibold">{collegeData.name}</span> | <span className="text-blue-600 font-bold">{hodDept} Department</span>
          </p>
        </div>
        
        <div className="flex gap-3">
          {/* CSV Export Button */}
          {students.length > 0 && (
            <CSVLink 
              data={students} 
              filename={`${hodDept}_student_report.csv`}
              className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 font-semibold transition flex items-center gap-2"
            >
              Download Report
            </CSVLink>
          )}
          
          <button 
            onClick={handleLogout}
            className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded hover:bg-red-100 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500 flex items-center">
          <div className="p-3 bg-blue-100 rounded-full mr-4 text-blue-600"><Users size={24}/></div>
          <div>
            <p className="text-gray-500 text-sm">Students Enrolled</p>
            <h3 className="text-2xl font-bold">{students.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500 flex items-center">
          <div className="p-3 bg-green-100 rounded-full mr-4 text-green-600"><Award size={24}/></div>
          <div>
            <p className="text-gray-500 text-sm">Certified Students</p>
            <h3 className="text-2xl font-bold">0</h3> {/* Logic for this can be added later */}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-500 flex items-center">
          <div className="p-3 bg-yellow-100 rounded-full mr-4 text-yellow-600"><BookOpen size={24}/></div>
          <div>
            <p className="text-gray-500 text-sm">Avg. Assessment Score</p>
            <h3 className="text-2xl font-bold">--</h3> {/* Logic for this can be added later */}
          </div>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Student Progress ({hodDept})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Roll No</th>
                <th className="p-4">Email</th>
                <th className="p-4">Progress</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.length > 0 ? (
                students.map((student, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-medium text-gray-900">{student.name}</td>
                    <td className="p-4 text-gray-600 font-mono text-sm">{student.rollNo}</td>
                    <td className="p-4 text-gray-600">{student.email}</td>
                    <td className="p-4 text-blue-600 font-medium">{student.module}</td>
                    <td className="p-4">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500 italic">
                    No students have registered for {hodDept} department yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HodDashboard;