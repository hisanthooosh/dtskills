import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { PlayCircle, Award } from 'lucide-react';

export default function MyLearning() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const studentLocal = JSON.parse(localStorage.getItem('student'));

  useEffect(() => {
    if (!studentLocal || !studentLocal._id) {
      navigate('/login');
      return;
    }

    const fetchStudentData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/student/${studentLocal._id}`);
        setEnrolledCourses(res.data.enrolledCourses || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching my learning:", err);
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [navigate, studentLocal?._id]);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading your classroom...</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">My Learning</h1>
        <p className="text-slate-500">Welcome back, {studentLocal?.name}</p>
      </div>

      {enrolledCourses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
          <h3 className="text-lg font-bold text-slate-700">No courses yet</h3>
          <Link to="/dashboard/catalog" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold mt-4 inline-block">
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {enrolledCourses.map((enrollment, index) => {
            if (!enrollment) return null;
            const course = enrollment.courseId;
            // Handle cases where course data might be missing or deleted
            if (!course || typeof course !== 'object') return null;

            // Calculate Progress
            const totalTopics = course.modules?.reduce((acc, mod) => acc + (mod.topics?.length || 0), 0) || 0;
            const completedCount = enrollment.completedTopics?.length || 0;
            const progress = totalTopics === 0 ? 0 : Math.round((completedCount / totalTopics) * 100);

            return (
              <div key={course._id || index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                      Active Internship
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-2">{course.title || "Untitled Course"}</h3>
                  </div>
                  <Award size={24} className="text-blue-500"/>
                </div>

                <div className="mt-auto">
                  <div className="flex justify-between text-xs text-slate-500 mb-2">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  
                  <div className="w-full bg-slate-100 h-2 rounded-full mb-4 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  
                  {/* FIX: Use backticks `` instead of single quotes '' */}
                  <Link 
                    to={`/classroom/${course._id}`}
                    className="block w-full text-center bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg font-bold transition flex items-center justify-center gap-2"
                  >
                    <PlayCircle size={18} /> Continue Learning
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}