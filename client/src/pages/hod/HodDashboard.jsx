import { useState, useEffect } from 'react';
import axios from 'axios';
import { CSVLink } from 'react-csv';
import { Users, BookOpen, Award, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HodDashboard = () => {
  const [collegeData, setCollegeData] = useState(null);
  const [students, setStudents] = useState([]);
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

    const targetCourse = data.courses.find(
      c => c.courseName === dept
    );

    if (!targetCourse) return;

    targetCourse.rollNumbers.forEach(roll => {
      if (!roll.isRegistered || !roll.studentId) return;

      const enrollment = roll.studentId.enrolledCourses?.[0] || {};
      const course = enrollment.courseId || {};

      list.push({
        name: roll.studentId.username,
        email: roll.studentId.email,
        rollNo: roll.number,
        department: dept,

        courseName: course.title || 'N/A',
        courseStatus: enrollment.courseCompleted ? 'Completed' : 'In Progress',
        courseCertificate: enrollment.courseCertificateIssued ? 'Yes' : 'No',

        internshipStatus: enrollment.internshipUnlocked
          ? enrollment.internshipCompleted
            ? 'Completed'
            : 'Ongoing'
          : 'Locked',

        internshipCertificate: enrollment.internshipCertificateIssued
          ? 'Yes'
          : 'No',

        githubRepo: enrollment.internshipGithubRepo || 'Not Submitted',
        projectSubmittedAt: enrollment.internshipSubmittedAt
          ? new Date(enrollment.internshipSubmittedAt).toLocaleDateString()
          : '—'
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">

      {/* HEADER */}
      <header className="mb-8 flex justify-between items-center bg-white p-6 rounded-xl shadow">
        <div>
          <h1 className="text-3xl font-bold">HOD Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {collegeData.name} | <span className="text-blue-600 font-bold">{hodDept}</span>
          </p>
        </div>

        <div className="flex gap-3">
          {students.length > 0 && (
            <CSVLink
              data={students}
              filename={`${hodDept}_students_report.csv`}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold"
            >
              Export CSV
            </CSVLink>
          )}

          <button
            onClick={handleLogout}
            className="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-semibold"
          >
            Logout
          </button>
        </div>
      </header>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Stat icon={Users} label="Students" value={students.length} />
        <Stat
          icon={Award}
          label="Course Completed"
          value={students.filter(s => s.courseStatus === 'Completed').length}
        />
        <Stat
          icon={Briefcase}
          label="Internship Completed"
          value={students.filter(s => s.internshipStatus === 'Completed').length}
        />
        <Stat
          icon={BookOpen}
          label="Certificates Issued"
          value={students.filter(s => s.internshipCertificate === 'Yes').length}
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Roll</th>
              <th className="p-4">Course</th>
              <th className="p-4">Course Status</th>
              <th className="p-4">Internship</th>
              <th className="p-4">GitHub</th>
              <th className="p-4">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {students.map((s, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="p-4 font-medium">{s.name}</td>
                <td className="p-4 font-mono">{s.rollNo}</td>
                <td className="p-4">{s.courseName}</td>
                <td className="p-4">{s.courseStatus}</td>
                <td className="p-4">{s.internshipStatus}</td>
                <td className="p-4 text-blue-600 truncate max-w-xs">
                  {s.githubRepo !== 'Not Submitted' ? (
                    <a href={s.githubRepo} target="_blank" rel="noreferrer">
                      View Repo
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="p-4">{s.projectSubmittedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Stat = ({ icon: Icon, label, value }) => (
  <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
    <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
      <Icon size={22} />
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <h3 className="text-2xl font-bold">{value}</h3>
    </div>
  </div>
);

export default HodDashboard;
