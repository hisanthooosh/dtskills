import { useState } from 'react';
import axios from 'axios';
import { ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

export default function SubmitAicteId({ courseId }) {
  const student = JSON.parse(localStorage.getItem('student'));
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
        'http://localhost:5000/api/student/submit-aicte-id',
        {
          studentId: student._id,
          courseId,
          aicteInternshipId: aicteId
        }
      );

      setSubmitted(true);
      setTimeout(() => {
        window.location.href = `/classroom/${courseId}`;
      }, 1500);

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
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
          <ul className="list-disc pl-5 space-y-1">
            <li>Complete Modules 1–5 before submitting</li>
            <li>Enter the Internship ID received from AICTE portal</li>
            <li>Internship unlocks instantly if AICTE ID is valid</li>

          </ul>
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
