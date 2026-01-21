import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function VerifyCertificate() {
  const { certificateId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/verify/${certificateId}`)
      .then(res => res.json())
      .then(setData)
      .catch(() => setData({ valid: false }))
      .finally(() => setLoading(false));
  }, [certificateId]);

  if (loading) {
    return <div className="p-10 text-center">Verifying certificate…</div>;
  }

  if (!data?.valid) {
    return (
      <div className="p-10 text-center text-red-600 font-bold">
        ❌ Certificate Not Found / Invalid
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-10 bg-white shadow rounded-xl mt-10">
      <h1 className="text-2xl font-bold mb-4 text-green-600">
        ✅ Certificate Verified
      </h1>

      <p><b>Name:</b> {data.studentName}</p>
      <p><b>Email:</b> {data.email}</p>
      <p><b>College:</b> {data.college}</p>
      <p><b>Course:</b> {data.course}</p>
      <p><b>Type:</b> {data.type}</p>
      <p><b>Certificate ID:</b> {data.certificateId}</p>
    </div>
  );
}
