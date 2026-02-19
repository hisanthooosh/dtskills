import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';


import axios from 'axios';
import { ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

export default function SubmitAicteId() {
  const { courseId } = useParams();

  const student = JSON.parse(localStorage.getItem('student'));
  const navigate = useNavigate();


  if (!student) {
    window.location.href = '/login';
    return null;
  }

  const [aicteId, setAicteId] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const submitId = async () => {
    if (!aicteId.trim()) {
      setError('Please enter a valid AICTE Internship ID');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/student/submit-aicte-id`,
        {
          studentId: student._id,
          courseId,
          aicteInternshipId: aicteId
        }
      );

      setSubmitted(true);

      setTimeout(() => {
        navigate(`/classroom/${courseId}`, { replace: true });
      }, 1000);


    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to submit AICTE Internship ID'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-xl p-8">

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
            <ShieldCheck size={26} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">
              AICTE Internship Verification
            </h1>
            <p className="text-sm text-slate-500">
              Enter your official AICTE Internship ID
            </p>
          </div>
        </div>

        {/* INFO BOX */}
        {/* INFO BOX */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-blue-800 space-y-4">

          <h2 className="text-base font-bold text-blue-900">
            🚀 Internship Application Instructions
          </h2>

          <div>
            <p className="font-semibold text-green-700">✅ STEP 1: Visit AICTE Internship Portal</p>
            <a
              href="https://internship.aicte-india.org/internshipbygoogle.php"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline font-medium"
            >
              👉 Open AICTE Portal
            </a>
          </div>

          <div>
            <p className="font-semibold text-green-700">✅ STEP 2: Create Student Account</p>
            <ul className="list-disc pl-5">
              <li>Use the SAME email as DT Skills</li>
              <li>Use your active WhatsApp number</li>
            </ul>
            <p className="text-red-600 font-semibold mt-1">
              ⚠ Email must match your DT Skills account
            </p>
          </div>

          <div>
            <p className="font-semibold text-green-700">✅ STEP 3: Search for Company</p>
            <ul className="list-disc pl-5">
              <li>Go to Internship Search</li>
              <li>Search for <strong>Doneswari Technologies</strong></li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-green-700">✅ STEP 4: Apply for Internship</p>
            <ul className="list-disc pl-5">
              <li>Select the internship matching your DT Skills course</li>
              <li>Use SAME email & WhatsApp number</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-green-700">✅ STEP 5: Receive Verification Code</p>
            <ul className="list-disc pl-5">
              <li>📩 Code sent to Email</li>
              <li>📱 Code sent to WhatsApp</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-green-700">✅ STEP 6: Paste Code Below</p>
            <p>Enter the received AICTE Internship ID in the field below.</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="font-semibold text-yellow-700 mb-1">🔒 Important Rules</p>
            <ul className="list-disc pl-5 text-yellow-700">
              <li>Email must match DT Skills email</li>
              <li>WhatsApp number must be active</li>
              <li>Apply only to Doneswari Technologies</li>
              <li>Wrong email = Internship will not unlock</li>
            </ul>
          </div>

        </div>


        {/* SUCCESS STATE */}
        {submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-green-700 text-sm">
            <p className="font-bold mb-1">✅ AICTE ID Submitted Successfully</p>
            <p>
              🎉 <strong>Internship unlocked instantly!</strong><br />
              Your AICTE Internship ID was verified successfully.
              You can now access <strong>Modules 6–10</strong>.
            </p>

          </div>
        ) : (
          <>
            {/* INPUT */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                AICTE Internship ID
              </label>
              <input
                type="text"
                value={aicteId}
                onChange={e => setAicteId(e.target.value)}
                placeholder="Ex: AICTE-INT-2024-123456"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-red-700 font-bold mb-1">
                  <AlertCircle size={18} />
                  Verification Failed
                </div>
                <p className="text-sm text-red-600">
                  {error}
                </p>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              onClick={submitId}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Submitting...
                </>
              ) : (
                'Submit AICTE ID'
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
