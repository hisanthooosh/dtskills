import { useEffect, useState } from 'react';
import {
  CheckCircle,
  Lock,
  Download,
  Eye,
  FileText,
  Award,
  X
} from 'lucide-react';

export default function Profile() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Preview modal
  const [previewUrl, setPreviewUrl] = useState(null);


  useEffect(() => {
    const loadProfile = async () => {
      try {
        const local = JSON.parse(localStorage.getItem('student'));
        if (!local?._id) return;

        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/student/${local._id}`

        );
        const data = await res.json();

        setStudent(data);
        localStorage.setItem('student', JSON.stringify(data));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading || !student) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400">
        Loading profile…
      </div>
    );
  }

  // ===== SAFE DATA =====
  const enrollment = student.enrolledCourses?.find(
    e => e.courseId?._id
  ) || {};

  const course = enrollment.courseId;

  const courseCompleted = enrollment.courseCompleted;
  const courseCert = enrollment.courseCertificateIssued;

  const offerLetter = enrollment.offerLetterIssued;

  const internshipUnlocked = enrollment.internshipUnlocked;
  const internshipCompleted = enrollment.internshipCompleted;
  const internshipCert = enrollment.internshipCertificateIssued;

  const internshipStartedAt = enrollment.internshipStartedAt
    ? new Date(enrollment.internshipStartedAt)
    : null;

  const internshipEndsAt = enrollment.internshipEndsAt
    ? new Date(enrollment.internshipEndsAt)
    : null;

  // ⏳ Calculate remaining days
  let daysRemaining = null;

  if (internshipEndsAt) {
    const now = new Date();
    const diff = internshipEndsAt - now;
    daysRemaining = diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
  }


  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10">

      {/* ================= HEADER ================= */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-10 text-white shadow-xl">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-bold">
            {student.username?.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{student.username}</h1>
            <p className="text-sm opacity-90">{student.email}</p>
            <p className="text-xs opacity-75 mt-1">
              {student.collegeName || 'DT Technical Institute'}
            </p>
          </div>
        </div>
      </div>

      {/* ================= TIMELINE ================= */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-slate-800 mb-6">
          Learning Timeline
        </h2>

        <TimelineItem label="Registered" active />
        <TimelineItem label="Course Completed" active={courseCompleted} />
        <TimelineItem label="Course Certificate Issued" active={courseCert} />
        <TimelineItem label="Offer Letter Issued" active={offerLetter} />
        <TimelineItem label="Internship Unlocked" active={internshipUnlocked} />
        <TimelineItem label="Internship Completed" active={internshipCompleted} />
        <TimelineItem label="Internship Certificate Issued" active={internshipCert} />
      </div>

      {/* ================= DOCUMENTS ================= */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Documents
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CertificateCard
            title="Course Certificate"
            icon={Award}
            active={courseCert}
            onPreview={() =>
              setPreviewUrl(
                `${import.meta.env.VITE_API_BASE_URL}/certificates/course/${student._id}`
              )
            }

            onDownload={() =>
              window.open(
                `${import.meta.env.VITE_API_BASE_URL}/certificates/course/${student._id}?download=true`,
                '_blank'
              )
            }
          />


          <CertificateCard
            title="Offer Letter"
            icon={FileText}
            active={offerLetter}
            onPreview={() =>
              setPreviewUrl(
                `${import.meta.env.VITE_API_BASE_URL}/certificates/offer-letter/${student._id}`
              )
            }

            onDownload={() =>
              window.open(
                `${import.meta.env.VITE_API_BASE_URL}/certificates/offer-letter/${student._id}?download=true`,
                '_blank'
              )
            }
          />


          <CertificateCard
            title="Internship Certificate"
            icon={Award}
            active={internshipCert}
            lockedInfo={
              internshipUnlocked && !internshipCert && internshipEndsAt ? (
                <div className="text-xs text-slate-500 space-y-1 mt-2">
                  <p>
                    <strong>Start:</strong>{' '}
                    {internshipStartedAt?.toLocaleDateString()}
                  </p>
                  <p>
                    <strong>End:</strong>{' '}
                    {internshipEndsAt?.toLocaleDateString()}
                  </p>
                  <p className="text-orange-600 font-bold">
                    ⏳ {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
                  </p>
                </div>
              ) : null
            }
            onPreview={() =>
              setPreviewUrl(
                `${import.meta.env.VITE_API_BASE_URL}/certificates/internship/${student._id}`
              )
            }

            onDownload={() =>
              window.open(
                `${import.meta.env.VITE_API_BASE_URL}/certificates/internship/${student._id}?download=true`,
                '_blank'
              )
            }
          />


        </div>
      </div>

      {/* ================= COURSE INFO ================= */}
      {course && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            Enrolled Course
          </h2>

          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-slate-900 text-lg">
                {course.title}
              </p>
              <p className="text-xs text-slate-400">
                Modules 1–10
              </p>
            </div>

            {courseCompleted ? (
              <span className="px-5 py-2 bg-green-100 text-green-700 rounded-full font-bold">
                Completed
              </span>
            ) : (
              <span className="px-5 py-2 bg-yellow-100 text-yellow-700 rounded-full font-bold">
                In Progress
              </span>
            )}
          </div>
        </div>
      )}

      {/* ================= PREVIEW MODAL ================= */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[90%] max-w-4xl h-[85%] relative shadow-xl">

            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute top-3 right-3 bg-black text-white px-3 py-1 rounded text-sm"
            >
              ✕ Close
            </button>

            <iframe
              src={previewUrl}
              title="Certificate Preview"
              className="w-full h-full rounded-2xl"
            />
          </div>
        </div>
      )}

    </div>
  );
}

/* ================= HELPERS ================= */

function TimelineItem({ label, active }) {
  return (
    <div className="flex items-center gap-4 mb-3">
      {active ? (
        <CheckCircle className="text-green-500" size={20} />
      ) : (
        <Lock className="text-slate-300" size={20} />
      )}
      <span className={`text-sm font-semibold ${active ? 'text-slate-800' : 'text-slate-400'}`}>
        {label}
      </span>
    </div>
  );
}
function CertificateCard({
  title,
  icon: Icon,
  active,
  onPreview,
  onDownload,
  lockedInfo
}) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${active
            ? 'bg-green-100 text-green-600'
            : 'bg-slate-100 text-slate-400'
            }`}
        >
          <Icon size={22} />
        </div>
        <h3 className="font-bold text-slate-800">{title}</h3>
      </div>

      {active ? (
        <div className="flex gap-3">
          <button
            onClick={onPreview}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white py-2 rounded-xl text-sm font-bold"
          >
            <Eye size={16} /> Preview
          </button>
          <button
            onClick={onDownload}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-xl text-sm font-bold"
          >
            <Download size={16} /> Download
          </button>
        </div>
      ) : (
        <div className="text-xs text-slate-400 bg-slate-100 py-3 text-center rounded-xl">
          <p className="font-semibold">Locked</p>
          {lockedInfo}
        </div>
      )}
    </div>
  );
}

function PreviewModal({ title, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl w-[90%] max-w-3xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X />
        </button>

        <h2 className="text-xl font-bold text-slate-800 mb-4">
          {title} – Preview
        </h2>

        <div className="h-[400px] border rounded-xl flex items-center justify-center text-slate-400">
          PDF Preview will appear here
        </div>
      </div>
    </div>
  );
}

function downloadMock(filename) {
  alert(`Downloading ${filename} (PDF generation comes next)`);
}
