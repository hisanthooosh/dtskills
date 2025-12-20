import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { PlayCircle, Award } from 'lucide-react';

export default function MyLearning() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const studentLocal = JSON.parse(localStorage.getItem('student'));

  useEffect(() => {
    if (studentLocal?._id) {
      // Fetch fresh student data to get enrolled courses
      axios.get(`http://localhost:5000/api/student/${studentLocal._id}`)
        .then(res => {
          setEnrolledCourses(res.data.enrolledCourses || []);
          setLoading(false);
        })
        .catch(err => setLoading(false));
    }
  }, []);

  if (loading) return <div className="p-10">Loading your classroom...</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">My Learning</h1>
        <p className="text-slate-500">Welcome back, {studentLocal.name}</p>
      </div>

      {enrolledCourses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
          <h3 className="text-lg font-bold text-slate-700">No courses yet</h3>
          <p className="text-slate-500 mb-4">Browse our catalog to start your internship.</p>
          <Link to="/dashboard/courses" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {enrolledCourses.map((enrollment) => {
            // Check if courseId exists (it might be null if admin deleted the course)
            const course = enrollment.courseId;
            if (!course) return null;

            return (
              <div key={course._id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                      {enrollment.isPaid ? "Active Internship" : "Payment Pending"}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-2">{course.title}</h3>
                  </div>
                  <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center">
                    <Award className="text-slate-400" size={20}/>
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="flex justify-between text-xs text-slate-500 mb-2">
                    <span>Progress</span>
                    <span>{enrollment.completedChapters} Chapters</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full mb-4">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '10%' }}></div>
                  </div>
                  
                  <Link 
                    to={`/dashboard/classroom/${course._id}`}
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