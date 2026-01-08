import { useState } from 'react';
import adminAxios from '../utils/adminAxios';
import {
  ShieldCheck,
  User,
  BookOpen,
  AlertTriangle,
  Loader2,
  CheckCircle
} from 'lucide-react';

export default function AdminVerifyInternship() {
  const [studentId, setStudentId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [aicteId, setAicteId] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const verify = async () => {
    if (!studentId || !courseId || !aicteId) {
      setError('All fields are required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await adminAxios.post('/admin/verify-aicte-id', {
        studentId,
        courseId,
        officialAicteId: aicteId
      });

      setSuccess('Internship verified successfully. Modules 6–10 unlocked.');
      setStudentId('');
      setCourseId('');
      setAicteId('');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Verification failed. Please check details.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-xl p-8">

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
            <ShieldCheck size={26} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">
              Verify AICTE Internship
            </h1>
            <p className="text-sm text-slate-500">
              Admin approval required to unlock internship modules
            </p>
          </div>
        </div>

        {/* INFO */}
        <div className="mb-6 bg-slate-100 border border-slate-200 rounded-xl p-4 text-sm text-slate-600">
          <ul className="list-disc pl-5 space-y-1">
            <li>Verify AICTE Internship ID from official portal</li>
            <li>Ensure student has completed Modules 1–5</li>
            <li>Unlocks Modules 6–10 immediately</li>
          </ul>
        </div>

        {/* FORM */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase mb-1 block">
              Student ID
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="MongoDB Student ID"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 uppercase mb-1 block">
              Course ID
            </label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input
                value={courseId}
                onChange={e => setCourseId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="MongoDB Course ID"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 uppercase mb-1 block">
              Official AICTE Internship ID
            </label>
            <input
              value={aicteId}
              onChange={e => setAicteId(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="AICTE-INT-2024-XXXX"
            />
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="mt-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm">
            <CheckCircle size={16} />
            {success}
          </div>
        )}

        {/* ACTION */}
        <button
          onClick={verify}
          disabled={loading}
          className="mt-6 w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Verifying...
            </>
          ) : (
            'Verify & Unlock Internship'
          )}
        </button>
      </div>
    </div>
  );
}
