import { useState, useEffect } from 'react';
import axios from 'axios';
import { CSVLink } from 'react-csv';
import {
  Users,
  BookOpen,
  Award,
  Briefcase,
  CalendarDays,
  Mail
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HodDashboard = () => {
  const [collegeData, setCollegeData] = useState(null);
  const [students, setStudents] = useState([]);
  const [view, setView] = useState('course'); // course | internship
  const navigate = useNavigate();

  const hodDept = localStorage.getItem('hodDept');
  const hodCollegeId = localStorage.getItem('hodCollegeId');

  useEffect(() => {
    if (!hodCollegeId || !hodDept) {
      navigate('/hod-login');
      return;
    }

    const fetchDetails = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/college/${hodCollegeId}`
        );
        setCollegeData(res.data);
        processStudents(res.data, hodDept);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDetails();
  }, [hodCollegeId, hodDept, navigate]);

  const processStudents = (data, dept) => {
    const list = [];
    const targetCourse = data.courses.find(c => c.courseName === dept);
    if (!targetCourse) return;

    targetCourse.rollNumbers.forEach(roll => {
      if (!roll.isRegistered || !roll.studentId) return;

      const enrollment = roll.studentId.enrolledCourses?.[0] || {};
      const course = enrollment.courseId || {};

      // Internship status
      let internshipStatus = 'Locked';
      if (enrollment.internshipUnlocked) {
        internshipStatus = enrollment.internshipCompleted
          ? 'Completed'
          : 'Ongoing';
      }

      list.push({
        // STUDENT
        name: roll.studentId.username,
        email: roll.studentId.email,
        rollNo: roll.number,
        department: dept,
        college: data.name,

        // COURSE
        courseName: course.title || 'N/A',
        courseStatus: enrollment.courseCompleted ? 'Completed' : 'In Progress',

        // INTERNSHIP
        internshipStatus,
        internshipStart: enrollment.internshipStartedAt
          ? new Date(enrollment.internshipStartedAt).toLocaleDateString()
          : '—',
        internshipEnd: enrollment.internshipEndsAt
          ? new Date(enrollment.internshipEndsAt).toLocaleDateString()
          : '—',
        internshipDuration: enrollment.internshipStartedAt
          ? '45 days'
          : '—',
        internshipCertificate: enrollment.internshipCertificateIssued
          ? 'Yes'
          : 'No',
        githubRepo: enrollment.internshipGithubRepo || '—'
      });
    });

    setStudents(list);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/hod-login');
  };

  if (!collegeData) {
    return <div className="p-10 text-center">Loading dashboard…</div>;
  }

  const csvData =
    view === 'course'
      ? students.map(s => ({
          Name: s.name,
          Email: s.email,
          Roll: s.rollNo,
          Course: s.courseName,
          Status: s.courseStatus
        }))
      : students.map(s => ({
          Name: s.name,
          Email: s.email,
          Roll: s.rollNo,
          InternshipStatus: s.internshipStatus,
          StartDate: s.internshipStart,
          EndDate: s.internshipEnd,
          Duration: s.internshipDuration,
          Certificate: s.internshipCertificate
        }));

  return (
    <div className="min-h-screen bg-gray-50 p-8">

      {/* HEADER */}
      <header className="mb-6 flex justify-between items-center bg-white p-6 rounded-xl shadow">
        <div>
          <h1 className="text-3xl font-bold">HOD Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {collegeData.name} |{' '}
            <span className="text-blue-600 font-bold">{hodDept}</span>
          </p>
        </div>

        <div className="flex gap-3">
          <CSVLink
            data={csvData}
            filename={`${hodDept}_${view}_report.csv`}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold"
          >
            Export CSV
          </CSVLink>

          <button
            onClick={handleLogout}
            className="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-semibold"
          >
            Logout
          </button>
        </div>
      </header>

      {/* VIEW SWITCH */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setView('course')}
          className={`px-4 py-2 rounded-lg font-bold ${
            view === 'course'
              ? 'bg-blue-600 text-white'
              : 'bg-white border'
          }`}
        >
          Courses
        </button>
        <button
          onClick={() => setView('internship')}
          className={`px-4 py-2 rounded-lg font-bold ${
            view === 'internship'
              ? 'bg-blue-600 text-white'
              : 'bg-white border'
          }`}
        >
          Internship
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Roll</th>

              {view === 'course' ? (
                <>
                  <th className="p-3">Course</th>
                  <th className="p-3">Status</th>
                </>
              ) : (
                <>
                  <th className="p-3">Status</th>
                  <th className="p-3">Start</th>
                  <th className="p-3">End</th>
                  <th className="p-3">Duration</th>
                </>
              )}
            </tr>
          </thead>

          <tbody className="divide-y">
            {students.map((s, i) => (
              <tr key={i}>
                <td className="p-3">{s.name}</td>
                <td className="p-3 flex items-center gap-1">
                  <Mail size={12} /> {s.email}
                </td>
                <td className="p-3">{s.rollNo}</td>

                {view === 'course' ? (
                  <>
                    <td className="p-3">{s.courseName}</td>
                    <td className="p-3">{s.courseStatus}</td>
                  </>
                ) : (
                  <>
                    <td className="p-3 font-bold">{s.internshipStatus}</td>
                    <td className="p-3">{s.internshipStart}</td>
                    <td className="p-3">{s.internshipEnd}</td>
                    <td className="p-3">{s.internshipDuration}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HodDashboard;
