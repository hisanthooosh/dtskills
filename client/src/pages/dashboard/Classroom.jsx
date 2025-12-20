import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown'; // <--- Imported the formatter
import { BookOpen, CheckCircle, ExternalLink, ChevronRight, HelpCircle } from 'lucide-react';

const Classroom = () => {
  const { id } = useParams(); // Course ID
  const [course, setCourse] = useState(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [viewMode, setViewMode] = useState('reading'); // 'reading' or 'exam'
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);

  // --- 1. Fetch Course Data ---
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/courses`);
        // Note: In a real app, you'd fetch specific course by ID. 
        // For now, we grab the first one matching or just the first one.
        const foundCourse = res.data.find(c => c._id === id) || res.data[0];
        setCourse(foundCourse);
      } catch (err) {
        console.error("Failed to load course", err);
      }
    };
    fetchCourse();
  }, [id]);

  if (!course) return <div className="p-10 text-center">Loading Classroom...</div>;

  const currentChapter = course.chapters[currentChapterIndex];
  const currentTopic = currentChapter.topics[currentTopicIndex];

  // --- 2. Handlers ---

  const handleMarkAsRead = () => {
    // Switch to Exam Mode
    window.scrollTo(0, 0);
    setViewMode('exam');
    setQuizScore(null); // Reset score
    setQuizAnswers({}); // Reset answers
  };

  const handleQuizSubmit = async () => {
    // Calculate Score
    let score = 0;
    currentTopic.quizzes.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctAnswer) score++;
    });
    setQuizScore(score);

    // If score is good (e.g., > 50%), mark topic as complete in Backend
    // For now, we just assume completion:
    alert(`You scored ${score} / ${currentTopic.quizzes.length}. Topic Completed!`);
  };

  const handleQuizOptionSelect = (qIdx, optionIdx) => {
    setQuizAnswers(prev => ({ ...prev, [qIdx]: optionIdx }));
  };

  return (
    <div className="flex h-screen bg-gray-50">
      
      {/* LEFT SIDEBAR: Navigation */}
      <div className="w-1/4 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-5 border-b">
          <h2 className="font-bold text-lg text-blue-700">{course.title}</h2>
        </div>
        <div>
          {course.chapters.map((chap, cIdx) => (
            <div key={cIdx} className="mb-2">
              <div className="bg-gray-100 p-3 font-semibold text-gray-700 text-sm">
                {chap.title}
              </div>
              {chap.topics.map((topic, tIdx) => (
                <div 
                  key={tIdx}
                  onClick={() => {
                    setCurrentChapterIndex(cIdx);
                    setCurrentTopicIndex(tIdx);
                    setViewMode('reading'); // Reset to reading when switching topics
                  }}
                  className={`p-3 pl-6 cursor-pointer text-sm flex items-center gap-2 hover:bg-blue-50
                    ${(cIdx === currentChapterIndex && tIdx === currentTopicIndex) ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-600' : 'text-gray-600'}
                  `}
                >
                  {viewMode === 'exam' && cIdx === currentChapterIndex && tIdx === currentTopicIndex ? 
                    <HelpCircle size={16} /> : <BookOpen size={16} />
                  }
                  {topic.title}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT CONTENT AREA */}
      <div className="w-3/4 p-10 overflow-y-auto">
        
        {/* --- VIEW MODE: READING --- */}
        {viewMode === 'reading' && (
          <div className="max-w-3xl mx-auto animate-fadeIn">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">{currentTopic.title}</h1>
            
            {/* 1. TEXT CONTENT (Formatted with ReactMarkdown) */}
            {/* 'prose' class automatically styles h1, p, lists, bold, etc. */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-8 prose prose-blue max-w-none">
              <ReactMarkdown>
                {currentTopic.content || "No text content available for this topic yet."}
              </ReactMarkdown>
            </div>

            {/* 2. SUGGESTED LINKS */}
            {currentTopic.suggestedLinks && currentTopic.suggestedLinks.length > 0 && (
              <div className="mb-8">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <ExternalLink size={20} /> Suggested Resources
                </h3>
                <ul className="space-y-2">
                  {currentTopic.suggestedLinks.map((link, i) => (
                    <li key={i} className="bg-blue-50 p-3 rounded-lg border border-blue-100 hover:bg-blue-100 transition">
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium flex items-center gap-2">
                        {link.title} <span className="text-xs text-gray-400">↗</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 3. MARK AS READ BUTTON */}
            <div className="flex justify-end mt-10">
              <button 
                onClick={handleMarkAsRead}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 transition transform hover:scale-105"
              >
                Mark as Read & Take Quiz <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* --- VIEW MODE: EXAM (QUIZ) --- */}
        {viewMode === 'exam' && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6 flex items-center gap-2 text-orange-600 font-bold text-xl">
              <HelpCircle /> Quiz: {currentTopic.title}
            </div>

            {currentTopic.quizzes && currentTopic.quizzes.length > 0 ? (
              <div className="space-y-6">
                {currentTopic.quizzes.map((quiz, qIdx) => (
                  <div key={qIdx} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <p className="font-semibold text-gray-800 mb-4">{qIdx + 1}. {quiz.question}</p>
                    <div className="space-y-2">
                      {quiz.options.map((option, oIdx) => (
                        <div 
                          key={oIdx} 
                          onClick={() => !quizScore && handleQuizOptionSelect(qIdx, oIdx)}
                          className={`p-3 rounded-md border cursor-pointer transition
                            ${quizAnswers[qIdx] === oIdx ? 'bg-blue-100 border-blue-500' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}
                            ${quizScore !== null && quiz.correctAnswer === oIdx ? '!bg-green-100 !border-green-500' : ''}
                            ${quizScore !== null && quizAnswers[qIdx] === oIdx && quiz.correctAnswer !== oIdx ? '!bg-red-100 !border-red-500' : ''}
                          `}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {!quizScore ? (
                  <button 
                    onClick={handleQuizSubmit}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 mt-4"
                  >
                    Submit Answers
                  </button>
                ) : (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <h3 className="text-xl font-bold text-green-800">Topic Completed!</h3>
                    <p>Your Score: {quizScore} / {currentTopic.quizzes.length}</p>
                    <button 
                      onClick={() => setViewMode('reading')} 
                      className="mt-2 text-blue-600 underline"
                    >
                      Review Material
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-10">
                No quiz available for this topic. You have completed it!
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Classroom;