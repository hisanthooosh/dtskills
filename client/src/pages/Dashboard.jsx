import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  CheckCircle, 
  Lock, 
  PlayCircle, 
  FileText, 
  LogOut, 
  Menu 
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [course, setCourse] = useState(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true); // For mobile responsiveness

  // 1. Load Student & Course Data
  useEffect(() => {
    const fetchData = async () => {
      const storedStudent = localStorage.getItem('student');
      if (!storedStudent) {
        navigate('/');
        return;
      }
      
      const studentData = JSON.parse(storedStudent);
      setStudent(studentData);

      try {
        // Fetch all courses (For MVP, we just pick the first one)
        const res = await axios.get('http://localhost:5000/api/courses');
        if (res.data.length > 0) {
          setCourse(res.data[0]); // Just taking the first course for now
          // Set active chapter to where the student left off
          setActiveChapterIndex(studentData.completedChapters || 0);
        }
      } catch (err) {
        console.error("Error fetching course:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // 2. Handle "Complete & Next"
  const handleNextChapter = async () => {
    if (!student || !course) return;

    // Optimistic UI Update (Update screen immediately before waiting for server)
    const nextIndex = activeChapterIndex + 1;
    const newStudentData = { ...student, completedChapters: nextIndex };
    setStudent(newStudentData);
    localStorage.setItem('student', JSON.stringify(newStudentData));
    
    if (nextIndex < course.chapters.length) {
      setActiveChapterIndex(nextIndex);
    }

    // Send update to Backend
    try {
      await axios.post('http://localhost:5000/api/student/progress', {
        email: student.email,
        courseId: course._id
      });
    } catch (err) {
      console.error("Sync failed", err);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading your classroom...</div>;
  if (!course) return <div className="p-10 text-center">No courses found. Please run the seed command!</div>;

  const currentChapter = course.chapters[activeChapterIndex];
  const isLastChapter = activeChapterIndex === course.chapters.length - 1;

  return (
    <div className="flex h-screen bg-white font-sans overflow-hidden">
      
      {/* --- SIDEBAR (Chapter List) --- */}
      <aside className={`bg-slate-50 border-r border-slate-200 w-80 flex-shrink-0 flex flex-col transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full absolute z-10 h-full'}`}>
        <div className="p-6 border-b border-slate-200">
          <h2 className="font-bold text-lg text-slate-800 truncate">{course.title}</h2>
          <p className="text-xs text-slate-500 mt-1">
            {Math.round((student.completedChapters / course.chapters.length) * 100)}% Completed
          </p>
          {/* Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-2 mt-3">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${(student.completedChapters / course.chapters.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {course.chapters.map((chapter, index) => {
            const isCompleted = index < student.completedChapters;
            const isLocked = index > student.completedChapters;
            const isActive = index === activeChapterIndex;

            return (
              <button
                key={index}
                onClick={() => !isLocked && setActiveChapterIndex(index)}
                disabled={isLocked}
                className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${
                  isActive ? 'bg-blue-100 text-blue-700 border border-blue-200' : 
                  isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle size={18} className="text-green-500" />
                ) : isLocked ? (
                  <Lock size={18} className="text-slate-400" />
                ) : (
                  <PlayCircle size={18} className="text-blue-500" />
                )}
                
                <div className="flex-1">
                  <p className="text-sm font-medium">{index + 1}. {chapter.title}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={() => {
              localStorage.removeItem('student');
              navigate('/');
            }}
            className="flex items-center gap-2 text-red-500 text-sm font-medium hover:text-red-600 transition"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Toggle */}
        <div className="md:hidden p-4 border-b flex items-center">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}><Menu/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-slate-900">{currentChapter?.title}</h1>
                </div>

                {/* Video Container (YouTube Embed) */}
                {currentChapter?.video && (
                    <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg mb-8">
                        <iframe 
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${currentChapter.video.split('/').pop()}`} 
                            title="Course Video"
                            allowFullScreen
                        ></iframe>
                    </div>
                )}

                {/* Text Content */}
                <div className="prose prose-lg max-w-none text-slate-600">
                    <div className="flex items-center gap-2 text-slate-800 font-bold mb-2">
                        <FileText size={20} />
                        <h3>Lecture Notes</h3>
                    </div>
                    <p className="whitespace-pre-line">{currentChapter?.content || "No content available."}</p>
                </div>
            </div>
        </div>

        {/* Bottom Navigation Bar */}
        <div className="p-6 border-t border-slate-200 bg-white">
            <div className="max-w-4xl mx-auto flex justify-end">
                <button
                    onClick={handleNextChapter}
                    disabled={activeChapterIndex > student.completedChapters}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold shadow-md transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLastChapter ? "Finish Course & Get Certificate" : "Mark as Complete & Next →"}
                </button>
            </div>
        </div>
      </main>
    </div>
  );
}