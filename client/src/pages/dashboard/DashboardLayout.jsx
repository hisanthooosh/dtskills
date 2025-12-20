import { Outlet, Link, useNavigate } from 'react-router-dom';
import { BookOpen, Layout, LogOut } from 'lucide-react';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const student = JSON.parse(localStorage.getItem('student'));

  const handleLogout = () => {
    localStorage.removeItem('student');
    navigate('/login');
  };

  if (!student) {
    navigate('/login');
    return null;
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-blue-600">DT Skills</h1>
          <p className="text-xs text-slate-500 mt-1">Student Portal</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/dashboard" className="flex items-center gap-3 p-3 text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition">
            <Layout size={20} /> My Learning
          </Link>
          <Link to="/dashboard/courses" className="flex items-center gap-3 p-3 text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition">
            <BookOpen size={20} /> All Courses
          </Link>
        </nav>

        <div className="p-4 border-t">
          <div className="mb-4 px-2">
            <p className="font-bold text-sm">{student.name}</p>
            <p className="text-xs text-slate-500 truncate">{student.collegeName}</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 p-2 hover:bg-red-50 w-full rounded-lg">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet /> {/* This is where the page changes (MyLearning / Courses) */}
      </main>
    </div>
  );
}