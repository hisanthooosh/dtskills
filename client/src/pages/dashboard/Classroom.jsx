import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import {
  BookOpen, Youtube, HelpCircle, CheckCircle,
  ChevronRight, ArrowLeft, Lock, PlayCircle,
  FileText, AlertCircle
} from 'lucide-react';

const Classroom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);

  // Navigation State
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeTopicIndex, setActiveTopicIndex] = useState(0);


  // FLOW STATE: 'reading' -> 'watching' -> 'quiz'
  const [currentStep, setCurrentStep] = useState('reading');
  const [completedTopics, setCompletedTopics] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [githubRepo, setGithubRepo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);




  // Auth State
  const studentLocal = JSON.parse(localStorage.getItem('student'));
  const userId = studentLocal ? studentLocal._id : null;

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
    fetchClassroomData();
  }, [id, userId]);

  const fetchClassroomData = async () => {
    try {
      // 1. Parallel fetch for speed
      const [courseRes, studentRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/courses/${id}`),
        axios.get(`http://localhost:5000/api/student/${userId}`)
      ]);

      const courseData = courseRes.data;
      const studentData = studentRes.data;
      setCourse(courseData);

      // 2. Extract Progress (Safer)
      const enrollment = studentData.enrolledCourses?.find(
        (c) => c.courseId && (c.courseId._id == id || c.courseId == id)
      );

      // FIX: Default to empty array to prevent "undefined" errors
      const progressIds = enrollment?.completedTopics || [];
      // --- THE MISSING FIX: Sync fetched progress to local state ---
      setCompletedTopics(progressIds);

      const internshipUnlocked = enrollment?.internshipUnlocked === true;


      // 3. RESUME LOGIC: Find first uncompleted topic
      if (courseData.modules && courseData.modules.length > 0) {
        // Only auto-jump if at start
        if (activeModuleIndex === 0 && activeTopicIndex === 0) {
          let foundResumePoint = false;
          for (let m = 0; m < courseData.modules.length; m++) {
            const module = courseData.modules[m];
            if (!module.topics) continue;

            for (let t = 0; t < module.topics.length; t++) {
              const topic = module.topics[t];
              // Robust check: Compare IDs as strings

              const isFinished = progressIds.some(pid => pid && topic._id && pid.toString() === topic._id.toString());

              if (!isFinished) {
                setActiveModuleIndex(m);
                setActiveTopicIndex(t);
                foundResumePoint = true;
                break;
              }
            }
            if (foundResumePoint) break;
          }
        }
      }
      setIsDataLoaded(true);
    } catch (err) {
      console.error("Error loading classroom:", err);
      setIsDataLoaded(true);
    }
  };

  // --- CRITICAL FIX: Loading State to prevent White Screen ---
  if (!course || !isDataLoaded) return <div className="min-h-screen flex items-center justify-center text-slate-500 font-medium">Resuming your class...</div>;
  if (!course.modules || course.modules.length === 0) return <div className="p-10 text-center text-red-500">Course content is empty.</div>;

  const currentModule = course.modules[activeModuleIndex];
  // 🚫 Prevent access to internship modules if not unlocked
  if (activeModuleIndex >= 5 && !internshipUnlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-2xl shadow border text-center max-w-md">
          <h2 className="text-xl font-bold mb-2">Internship Locked</h2>
          <p className="text-slate-600 mb-4">
            Submit your AICTE Internship ID and wait for admin approval
            to unlock Modules 6–10.
          </p>
        </div>
      </div>
    );
  }

  const isFinalInternshipModule = activeModuleIndex === 9;

  // --- CRITICAL FIX: Optional Chaining to prevent crash if index is bad ---
  const currentTopic = currentModule?.topics ? currentModule.topics[activeTopicIndex] : null;

  // If topic is somehow invalid, show a fallback instead of crashing
  if (!currentTopic) return <div className="p-10">Topic not found. Please select from sidebar.</div>;

  // --- HELPER TO HANDLE DATA ---
  const getTopicData = (topic) => {
    if (!topic) return {};

    let videos = [];
    if (topic.youtubeLinks && topic.youtubeLinks.length > 0) {
      videos = topic.youtubeLinks;
    } else if (topic.video) {
      videos = [{ title: "Video Lesson", url: topic.video }];
    }
    const quizzes = topic.quiz && topic.quiz.length > 0 ? topic.quiz : (topic.quizzes || []);
    const text = topic.textContent || topic.content || "";

    return { ...topic, videos, quizzes, text };
  };

  const activeData = getTopicData(currentTopic);

  const getEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const handleTopicClick = (mIdx, tIdx) => {
    setActiveModuleIndex(mIdx);
    setActiveTopicIndex(tIdx);
    setCurrentStep('reading');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };





  const completeTopic = async () => {
    try {
      // Optimistic UI Update
      if (currentTopic && !completedTopics.includes(currentTopic._id)) {
        setCompletedTopics([...completedTopics, currentTopic._id]);
      }

      await axios.post('http://localhost:5000/api/courses/complete-topic', {
        userId,
        courseId: id,
        topicId: currentTopic._id
      });

      goToNextTopic();
    } catch (err) {
      console.error(err);
      alert("Note: Progress saved locally but failed on server.");
      goToNextTopic();
    }
  };

  const goToNextTopic = () => {
    setCurrentStep('reading');

    if (activeTopicIndex < currentModule.topics.length - 1) {
      setActiveTopicIndex(activeTopicIndex + 1);
    } else if (activeModuleIndex < course.modules.length - 1) {
      setActiveModuleIndex(activeModuleIndex + 1);
      setActiveTopicIndex(0);
    } else {
      alert("🎉 Course Completed! Congratulations!");
      navigate('/dashboard/profile');
    }
  };
  const showGithubSubmission =
    activeModuleIndex === 9 &&
    activeTopicIndex === currentModule.topics.length - 1;

  const submitGithubRepo = async () => {
    if (!githubRepo) {
      alert('Please enter GitHub repository link');
      return;
    }

    try {
      setSubmitting(true);

      await axios.post('http://localhost:5000/api/internship/submit', {
        userId,
        courseId: id,
        githubRepo
      });

      setSubmitted(true);
      alert('✅ GitHub repository submitted');
      navigate('/dashboard/profile');
    } catch (err) {
      alert(err.response?.data?.msg || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">

      {/* --- SIDEBAR --- */}
      {/* ===== PREMIUM DESKTOP SIDEBAR ===== */}
      <aside className="w-80 bg-gradient-to-b from-white to-slate-50 border-r border-slate-200 flex flex-col h-full shadow-xl">

        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <button
            onClick={() => navigate('/dashboard/my-learning')}
            className="text-xs font-semibold text-slate-500 hover:text-blue-600 mb-3 flex items-center gap-1"
          >
            <ArrowLeft size={14} /> Back
          </button>

          <h2 className="text-lg font-extrabold text-slate-900 leading-tight">
            {course.title}
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            Course Progress
          </p>

          {/* Progress Bar */}
          <div className="mt-3 w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{
                width: `${course.modules
                  .slice(0, 5)
                  .flatMap(m => m.topics)
                  .filter(t =>
                    completedTopics.some(
                      id => id?.toString() === t._id?.toString()
                    )
                  ).length /
                  course.modules
                    .slice(0, 5)
                    .flatMap(m => m.topics).length * 100
                  }%`
              }}
            />
          </div>
        </div>

        {/* Modules */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">

          {course.modules.map((module, mIdx) => {
            const isInternship = mIdx >= 5;

            return (
              <div
                key={mIdx}
                className={`rounded-xl border ${isInternship
                  ? 'border-dashed border-yellow-300 bg-yellow-50/40'
                  : 'border-slate-200 bg-white'
                  } p-4`}
              >
                {/* Module Header */}
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-slate-800">
                    Module {mIdx + 1}
                  </h3>

                  {isInternship ? (
                    <span className="text-[10px] px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-bold">
                      🔒 Internship
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-bold">
                      Course
                    </span>
                  )}
                </div>

                {/* COURSE MODULES (1–5) */}
                {!isInternship && (
                  <div className="space-y-1">
                    {module.topics.map((topic, tIdx) => {
                      const isCompleted = completedTopics.some(
                        id => id?.toString() === topic._id?.toString()
                      );

                      const isActive =
                        mIdx === activeModuleIndex &&
                        tIdx === activeTopicIndex;

                      return (
                        <button
                          key={topic._id}
                          onClick={() => handleTopicClick(mIdx, tIdx)}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all
            ${isActive
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'hover:bg-slate-100 text-slate-700'
                            }`}
                        >
                          {isCompleted ? '✅' : '▶️'}
                          <span className="truncate">{topic.title}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* INTERNSHIP MODULES (6–10) */}
                {isInternship && (
                  <div className="space-y-1">
                    {internshipUnlocked ? (
                      module.topics.map((topic, tIdx) => {
                        const isActive =
                          mIdx === activeModuleIndex &&
                          tIdx === activeTopicIndex;

                        return (
                          <button
                            key={topic._id}
                            onClick={() => handleTopicClick(mIdx, tIdx)}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all
              ${isActive
                                ? 'bg-green-600 text-white shadow-md'
                                : 'hover:bg-green-50 text-slate-700'
                              }`}
                          >
                            🧑‍💻
                            <span className="truncate">{topic.title}</span>
                          </button>
                        );
                      })
                    ) : (
                      <div className="text-xs text-slate-400 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        🔒 Internship locked
                        <br />
                        Submit AICTE Internship ID to unlock
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </aside>


      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-10 relative">
        <div className="max-w-4xl mx-auto pb-20">

          {/* Progress Stepper */}
          <div className="mb-8 flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
            <StepIndicator step="reading" current={currentStep} label="Read Notes" icon={FileText} />
            <div className={`h-1 flex-1 min-w-[20px] mx-4 rounded-full ${currentStep === 'quiz' ? 'bg-blue-600' : 'bg-slate-100'}`} />
            <StepIndicator step="quiz" current={currentStep} label="Take Quiz" icon={HelpCircle} />
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden min-h-[500px]">

            {/* Header */}
            <div className="bg-slate-900 text-white p-6 md:p-8">
              {/* Added safe check ?.title to prevent crash */}
              <h1 className="text-2xl md:text-3xl font-bold">{currentTopic?.title || "Loading Topic..."}</h1>
            </div>

            <div className="p-6 md:p-12">

              {/* STEP 1: READING */}
              {currentStep === 'reading' && (
                <div className="animate-in fade-in duration-500">
                  <div className="prose lg:prose-lg text-slate-600 max-w-none mb-10 leading-relaxed">
                    {activeData.text ? (
                      <ReactMarkdown>{activeData.text}</ReactMarkdown>
                    ) : (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex gap-4">
                        <AlertCircle className="text-blue-500 shrink-0" />
                        <div>
                          <p className="font-bold text-blue-700">No written notes</p>
                          <p className="text-blue-600 text-sm">This topic doesn't have any text content. You can proceed to the video.</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end pt-6 border-t border-slate-100">
                    <button onClick={() => setCurrentStep('quiz')} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition shadow-lg shadow-blue-200">
                      Take Quiz <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              )}



              {/* STEP 3: QUIZ */}
              {currentStep === 'quiz' && (
                <div className="animate-in slide-in-from-right duration-500">
                  {activeData.quizzes.length > 0 ? (
                    <QuizInterface
                      questions={activeData.quizzes}
                      onPass={completeTopic}
                      onBack={() => setCurrentStep('reading')}
                    />
                  ) : (
                    <div className="text-center py-10">
                      <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                        <HelpCircle size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800">No Quiz Available</h3>
                      <p className="text-slate-500 mb-8">You can mark this topic as complete immediately.</p>
                      <button onClick={completeTopic} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg">
                        Mark Topic as Complete <CheckCircle className="inline ml-2" size={20} />
                      </button>
                      <div className="mt-4">
                        <button onClick={() => setCurrentStep('watching')} className="text-sm text-slate-400 hover:text-slate-600">Go Back</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {isFinalInternshipModule && (
                <div className="mt-12 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-900 mb-2">
                    🎯 Final Internship Project Submission
                  </h2>

                  <p className="text-sm text-slate-500 mb-4">
                    Submit your GitHub repository containing the completed project.
                  </p>

                  <input
                    type="url"
                    value={githubRepo}
                    onChange={(e) => setGithubRepo(e.target.value)}
                    placeholder="https://github.com/username/project"
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <button
                    onClick={async () => {
                      try {
                        await axios.post('http://localhost:5000/api/internship/submit', {
                          userId,
                          courseId: id,
                          githubRepo
                        });

                        alert('✅ Internship submitted & approved!');
                        navigate('/dashboard/profile');
                      } catch (err) {
                        alert(err.response?.data?.msg || 'Submission failed');
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold"
                  >
                    Submit GitHub Repository
                  </button>
                </div>
              )}


            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const StepIndicator = ({ step, current, label, icon: Icon }) => {
  const steps = ['reading', 'watching', 'quiz'];
  const currentIndex = steps.indexOf(current);
  const stepIndex = steps.indexOf(step);
  const isCompleted = currentIndex > stepIndex;
  const isActive = current === step;

  return (
    <div className="flex items-center gap-2 shrink-0">
      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-300 scale-110' :
        isCompleted ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'
        }`}>
        {isCompleted ? <CheckCircle size={18} /> : <Icon size={18} />}
      </div>
      <span className={`text-xs md:text-sm font-bold hidden sm:block ${isActive ? 'text-blue-800' : 'text-slate-500'}`}>{label}</span>
    </div>
  );
};

const QuizInterface = ({ questions, onPass, onBack }) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [passed, setPassed] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = (optIndex) => {
    setAnswers({ ...answers, [currentQIndex]: optIndex });
  };

  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correctCount++;
    });

    const percentage = (correctCount / questions.length) * 100;
    setScore(correctCount);
    setShowResult(true);
    setPassed(percentage >= 70);
  };

  if (showResult) {
    return (
      <div className="text-center py-10">
        <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {passed ? <CheckCircle size={48} /> : <Lock size={48} />}
        </div>
        <h2 className="text-3xl font-bold mb-2">{passed ? "Quiz Passed!" : "Quiz Failed"}</h2>
        <p className="text-slate-500 mb-8 text-lg">You scored {score} out of {questions.length} ({Math.round((score / questions.length) * 100)}%)</p>

        {passed ? (
          <button onClick={onPass} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg">
            Complete Topic & Continue →
          </button>
        ) : (
          <button onClick={() => { setShowResult(false); setCurrentQIndex(0); setAnswers({}); }} className="bg-slate-800 text-white px-6 py-2 rounded-lg font-bold">
            Try Again
          </button>
        )}
      </div>
    );
  }

  const q = questions[currentQIndex];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex justify-between items-end">
        <h3 className="text-xl font-bold text-slate-800">Question {currentQIndex + 1} of {questions.length}</h3>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Single Choice</span>
      </div>

      <div className="mb-8">
        <p className="text-lg text-slate-700 font-medium mb-6">{q.question}</p>
        <div className="space-y-3">
          {q.options.map((opt, i) => (
            <div
              key={i}
              onClick={() => handleSelect(i)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-center gap-3 ${answers[currentQIndex] === i
                ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-md'
                : 'border-slate-100 bg-white hover:border-slate-300 text-slate-600'
                }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${answers[currentQIndex] === i ? 'border-blue-600' : 'border-slate-300'}`}>
                {answers[currentQIndex] === i && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
              </div>
              <span className="font-medium">{opt}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-slate-100">
        <button
          onClick={currentQIndex === 0 ? onBack : () => setCurrentQIndex(currentQIndex - 1)}
          className="text-slate-400 hover:text-slate-600 font-bold"
        >
          Back
        </button>

        {currentQIndex < questions.length - 1 ? (
          <button
            onClick={() => setCurrentQIndex(currentQIndex + 1)}
            disabled={answers[currentQIndex] === undefined}
            className="bg-slate-800 text-white px-6 py-2 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-900"
          >
            Next Question
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={answers[currentQIndex] === undefined}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Quiz
          </button>
        )}
      </div>
    </div>
  );
};

export default Classroom;