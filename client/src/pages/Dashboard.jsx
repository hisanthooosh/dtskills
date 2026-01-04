import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const student = localStorage.getItem('student');

    if (!student) {
      navigate('/login');
      return;
    }

    // Always redirect to My Learning
    navigate('/dashboard/my-learning');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center text-slate-500 font-medium">
      Loading your dashboard...
    </div>
  );
}
