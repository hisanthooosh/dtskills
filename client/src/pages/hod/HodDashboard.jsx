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
  const [view, setView] = useState('course'); // course | internship | students

  const navigate = useNavigate();

  const hodDept = localStorage.getItem('hodDept');
  const hodCollegeId = localStorage.getItem('hodCollegeId');

  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (!hodCollegeId || !hodDept) {
      navigate('/hod-login');
      return;
    }

    const fetchDetails = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/college/${hodCollegeId}`
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
      c => c.courseName.trim().toLowerCase() === dept.trim().toLowerCase()
    );
    if (!targetCourse) {
      console.warn('Course not found for dept:', dept);
      return;
    }


    if (!targetCourse) return;

    targetCourse.rollNumbers.forEach(roll => {
      if (!roll.isRegistered || !roll.studentId) return;

      const enrollment = roll.studentId.enrolledCourses?.[0] || {};


      // Internship status
      let internshipStatus = 'Locked';
      if (enrollment.internshipUnlocked) {
        internshipStatus = enrollment.internshipCompleted
          ? 'Completed'
          : 'Ongoing';
      }
      const enrolledCourse = enrollment.courseId || {};

      list.push({
        // STUDENT
        _id: roll.studentId._id,
        name: roll.studentId.username,
        email: roll.studentId.email,
        rollNo: roll.number,
        department: dept,
        college: data.name,
        companyName: 'Doneswari Technologies LLP',

        // COURSE


        courseName: enrolledCourse.title || targetCourse.courseName,


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
        githubRepo: enrollment.internshipGithubRepo || '—',
        courseCertificateIssued: enrollment.courseCertificateIssued || false,
        internshipCertificateIssued: enrollment.internshipCertificateIssued || false,
        courseCertLink: enrollment.courseCertificateIssued
          ? `${import.meta.env.VITE_API_BASE_URL}/certificates/course/${roll.studentId._id}`
          : '',

        offerLetterLink: enrollment.offerLetterIssued
          ? `${import.meta.env.VITE_API_BASE_URL}/certificates/offer-letter/${roll.studentId._id}`
          : '',

        internshipCertLink: enrollment.internshipCertificateIssued
          ? `${import.meta.env.VITE_API_BASE_URL}/certificates/internship/${roll.studentId._id}`
          : '',

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
        Company: s.companyName,
        Status: s.courseStatus,
        CourseCertificateStatus: s.courseCertificateIssued ? 'Issued' : 'Pending',
        CourseCertificateLink: s.courseCertificateIssued
          ? s.courseCertLink
          : ''
      }))
      : view === 'internship'
        ? students.map(s => ({
          Name: s.name,
          Email: s.email,
          Roll: s.rollNo,
          Course: s.courseName,
          Company: s.companyName,
          InternshipStatus: s.internshipStatus,
          StartDate: s.internshipStart,
          EndDate: s.internshipEnd,
          Duration: s.internshipDuration,
          InternshipCertificateStatus: s.internshipCertificateIssued ? 'Issued' : 'Pending',
          InternshipCertificateLink: s.internshipCertificateIssued
            ? s.internshipCertLink
            : ''
        }))
        : students.map(s => ({
          Name: s.name,
          Roll: s.rollNo,
          Email: s.email,

          CourseCertificateStatus: s.courseCertificateIssued ? 'Issued' : 'Pending',
          CourseCertificateLink: s.courseCertLink || '',

          InternshipCertificateStatus: s.internshipCertificateIssued ? 'Issued' : 'Pending',
          InternshipCertificateLink: s.internshipCertLink || ''
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

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setView('course')}
          className={`px-4 py-2 rounded-lg font-bold ${view === 'course'
            ? 'bg-blue-600 text-white'
            : 'bg-white border'
            }`}
        >
          Courses
        </button>

        <button
          onClick={() => setView('internship')}
          className={`px-4 py-2 rounded-lg font-bold ${view === 'internship'
            ? 'bg-blue-600 text-white'
            : 'bg-white border'
            }`}
        >
          Internship
        </button>

        {/* ✅ NEW TAB */}
        <button
          onClick={() => setView('students')}
          className={`px-4 py-2 rounded-lg font-bold ${view === 'students'
            ? 'bg-blue-600 text-white'
            : 'bg-white border'
            }`}
        >
          Students
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

              {view === 'course' && (
                <>
                  <th className="p-3">Course</th>
                  <th className="p-3">Company</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Certificate</th>
                </>
              )}


              {view === 'internship' && (
                <>
                  <th className="p-3">Course</th>
                  <th className="p-3">Company</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Start</th>
                  <th className="p-3">End</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Certificate</th>
                </>
              )}


              {view === 'students' && (
                <>
                  <th className="p-3">Course Cert</th>
                  <th className="p-3">Internship Cert</th>
                  <th className="p-3">Action</th>
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
                {view === 'students' && (
                  <>
                    {/* COURSE CERTIFICATE */}
                    <td className="p-3 text-xs">
                      {s.courseCertificateIssued ? (
                        <>
                          <div className="text-green-600 font-bold">Issued</div>
                          <a
                            href={s.courseCertLink}
                            target="_blank"
                            className="text-blue-600 underline"
                          >
                            View
                          </a>
                        </>
                      ) : (
                        <span className="text-slate-400">Pending</span>
                      )}
                    </td>

                    {/* INTERNSHIP CERTIFICATE */}
                    <td className="p-3 text-xs">
                      {s.internshipCertificateIssued ? (
                        <>
                          <div className="text-green-600 font-bold">Issued</div>
                          <a
                            href={s.internshipCertLink}
                            target="_blank"
                            className="text-blue-600 underline"
                          >
                            View
                          </a>
                        </>
                      ) : (
                        <span className="text-slate-400">Pending</span>
                      )}
                    </td>

                    {/* ACTION */}
                    <td className="p-3">
                      <button
                        onClick={() => {
                          setSelectedStudent(s);
                          setShowResetModal(true);
                        }}
                        className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-bold"
                      >
                        Reset Password
                      </button>
                    </td>
                  </>
                )}



                {view === 'course' && (
                  <>
                    <td className="p-3">{s.courseName}</td>
                    <td className="p-3">{s.companyName}</td>
                    <td className="p-3">{s.courseStatus}</td>

                    <td className="p-3 text-xs">
                      {s.courseCertificateIssued ? (
                        <a
                          href={s.courseCertLink}
                          target="_blank"
                          className="text-blue-600 underline font-bold"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </>
                )}


                {view === 'internship' && (
                  <>
                    <td className="p-3">{s.courseName}</td>
                    <td className="p-3">{s.companyName}</td>
                    <td className="p-3 font-bold">{s.internshipStatus}</td>
                    <td className="p-3">{s.internshipStart}</td>
                    <td className="p-3">{s.internshipEnd}</td>
                    <td className="p-3">{s.internshipDuration}</td>

                    <td className="p-3 text-xs">
                      {s.internshipCertificateIssued ? (
                        <a
                          href={s.internshipCertLink}
                          target="_blank"
                          className="text-blue-600 underline font-bold"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </>
                )}


                {/* students → no extra cells */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showResetModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-lg">

            <h2 className="text-xl font-bold mb-4">
              Reset Password
            </h2>

            <div className="mb-3 text-sm">
              <p><b>Name:</b> {selectedStudent.name}</p>
              <p><b>Email:</b> {selectedStudent.email}</p>
              <p><b>Roll:</b> {selectedStudent.rollNo}</p>
            </div>

            <input
              type="password"
              placeholder="New Password"
              className="w-full border p-2 rounded mb-3"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full border p-2 rounded mb-4"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                disabled={loading}
                onClick={async () => {
                  if (!newPassword || !confirmPassword) {
                    alert('Please fill all fields');
                    return;
                  }

                  if (newPassword !== confirmPassword) {
                    alert('Passwords do not match');
                    return;
                  }

                  try {
                    setLoading(true);

                    await axios.post(
                      `${import.meta.env.VITE_API_BASE_URL}/college/reset-student-password`,
                      {
                        studentId: selectedStudent._id,
                        newPassword,
                        collegeId: hodCollegeId,
                        dept: hodDept
                      }
                    );

                    alert('Password updated successfully');

                    setShowResetModal(false);
                    setNewPassword('');
                    setConfirmPassword('');

                  } catch (err) {
                    console.error(err);
                    alert(err.response?.data?.message || 'Failed to reset password');
                  } finally {
                    setLoading(false);
                  }
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded font-bold"
              >
                {loading ? 'Updating...' : 'Update'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>

  );
};


export default HodDashboard;
