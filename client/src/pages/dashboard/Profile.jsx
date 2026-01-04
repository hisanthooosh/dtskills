import { useEffect, useState } from 'react';

export default function Profile() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const local = JSON.parse(localStorage.getItem('student'));
        if (!local || !local._id) return;

        const res = await fetch(
          `http://localhost:5000/api/student/${local._id}`
        );
        const data = await res.json();

        setStudent(data);
        localStorage.setItem('student', JSON.stringify(data));
      } catch (err) {
        console.error('Profile load failed', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading || !student) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 font-medium">
        Loading Profile...
      </div>
    );
  }

  // 🔑 MVP: single course
  const enrollment = student.enrolledCourses?.[0];
  const course = enrollment?.courseId;

  const courseCompleted = enrollment?.courseCompleted;
  const certificateIssued = enrollment?.courseCertificateIssued;
  const internshipUnlocked = enrollment?.internshipUnlocked;

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* ================= HEADER ================= */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-5">
        <div className="w-16 h-16 bg-blue-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold">
          {student.username?.charAt(0)}
        </div>

        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {student.username}
          </h1>
          <p className="text-sm text-slate-500">{student.email}</p>
          <p className="text-xs text-slate-400">
            {student.collegeName || 'DT Technical Institute'}
          </p>
        </div>
      </div>

      {/* ================= STATUS TIMELINE ================= */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-6">
          Learning Progress
        </h2>

        <div className="space-y-5">

          {/* Registration */}
          <StatusRow
            label="Registered"
            active={true}
            description="Account verified"
          />

          {/* Course */}
          <StatusRow
            label="Course Learning"
            active={true}
            description={
              courseCompleted
                ? 'Completed'
                : 'In progress (Modules 1–5)'
            }
          />

          {/* Certificate */}
          <StatusRow
            label="Course Certificate"
            active={certificateIssued}
            description={
              certificateIssued
                ? 'Certificate available'
                : 'Locked until course completion'
            }
          />

          {/* Internship */}
          <StatusRow
            label="Internship Access"
            active={internshipUnlocked}
            description={
              internshipUnlocked
                ? 'Unlocked'
                : 'Locked until verification'
            }
          />
        </div>
      </div>

      {/* ================= COURSE CARD ================= */}
      {course && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">
            Enrolled Course
          </h2>

          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-slate-900">
                {course.title}
              </p>
              <p className="text-xs text-slate-400">
                Modules 1–5 (Course Phase)
              </p>
            </div>

            {certificateIssued ? (
              <button
                onClick={() =>
                  alert('PDF download endpoint comes next')
                }
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition"
              >
                Download Certificate
              </button>
            ) : (
              <span className="text-xs px-3 py-1 bg-slate-100 text-slate-400 rounded-full">
                Certificate Locked
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= STATUS ROW COMPONENT ================= */

function StatusRow({ label, active, description }) {
  return (
    <div className="flex items-center gap-4">
      <div
        className={`w-3 h-3 rounded-full ${
          active ? 'bg-green-500' : 'bg-slate-300'
        }`}
      />
      <div>
        <p className="text-sm font-semibold text-slate-800">
          {label}
        </p>
        <p className="text-xs text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}
