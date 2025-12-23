import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  BookOpen, 
  Youtube, 
  HelpCircle, 
  CheckCircle, 
  ChevronRight, 
  ArrowLeft,
  Lock,
  PlayCircle,
  FileText
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

  // Auth State
  const studentLocal = JSON.parse(localStorage.getItem('student'));
  const userId = studentLocal ? studentLocal._id : null;

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
    fetchCourseData();
  }, [id, userId]);

  const fetchCourseData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/courses/${id}`);
      setCourse(res.data);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  if (!course) return <div className="min-h-screen flex items-center justify-center text-slate-500 font-medium">Loading Class...</div>;
  if (!course.modules?.length) return <div className="p-10 text-center text-red-500">Course content is empty.</div>;

  const currentModule = course.modules[activeModuleIndex];
  const currentTopic = currentModule?.topics[activeTopicIndex];

  // --- HELPERS ---

  const getEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const handleTopicClick = (mIdx, tIdx) => {
    setActiveModuleIndex(mIdx);
    setActiveTopicIndex(tIdx);
    setCurrentStep('reading'); // Reset flow when switching topics manually
  };

  // --- FLOW HANDLERS (UPDATED: NO SKIPPING) ---

  // 1. Finish Reading -> Always go to Watching
  const handleFinishReading = () => {
    setCurrentStep('watching');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 2. Finish Watching -> Always go to Quiz
  const handleFinishWatching = () => {
    setCurrentStep('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 3. Mark Complete API Call & Navigation
  const completeTopic = async () => {
    try {
      // 1. Optimistic UI Update
      if (!completedTopics.includes(currentTopic._id)) {
        setCompletedTopics([...completedTopics, currentTopic._id]);
      }

      // 2. Backend Call
      await axios.post('http://localhost:5000/api/courses/complete-topic', {
        userId,
        courseId: id,
        topicId: currentTopic._id
      });

      // 3. Move to next
      goToNextTopic();
    } catch (err) {
      alert("Error saving progress. Please check internet.");
    }
  };

  const goToNextTopic = () => {
    setCurrentStep('reading'); // Reset flow for next topic

    if (activeTopicIndex < currentModule.topics.length - 1) {
      setActiveTopicIndex(activeTopicIndex + 1);
    } else if (activeModuleIndex < course.modules.length - 1) {
      setActiveModuleIndex(activeModuleIndex + 1);
      setActiveTopicIndex(0);
    } else {
      alert("🎉 Course Completed! You are amazing!");
      navigate('/dashboard/profile'); 
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col h-full z-20 shadow-lg">
        <div className="p-5 border-b border-slate-100">
          <button onClick={() => navigate('/dashboard/my-learning')} className="flex items-center text-slate-500 hover:text-blue-600 text-sm font-medium mb-3 transition">
            <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
          </button>
          <h2 className="font-bold text-lg text-slate-800 leading-tight">{course.title}</h2>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {course.modules.map((mod, mIdx) => (
            <div key={mIdx} className="border-b border-slate-50">
              <div className="bg-slate-50/50 px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider sticky top-0 backdrop-blur-sm">
                {mod.title}
              </div>
              <div>
                {mod.topics.map((topic, tIdx) => {
                  const isActive = activeModuleIndex === mIdx && activeTopicIndex === tIdx;
                  const isCompleted = completedTopics.includes(topic._id);

                  return (
                    <button
                      key={tIdx}
                      onClick={() => handleTopicClick(mIdx, tIdx)}
                      className={`w-full text-left px-5 py-4 flex items-start gap-3 transition-all duration-200 border-l-4 ${
                        isActive 
                          ? 'bg-blue-50 border-blue-600' 
                          : 'border-transparent hover:bg-slate-50'
                      }`}
                    >
                      <div className={`mt-0.5 ${isCompleted ? 'text-green-500' : (isActive ? 'text-blue-600' : 'text-slate-400')}`}>
                        {isCompleted ? <CheckCircle size={18} /> : (isActive ? <div className="w-4 h-4 rounded-full border-4 border-blue-600" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-300" />)}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${isActive ? 'text-blue-700' : 'text-slate-700'}`}>{topic.title}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-10 relative">
        <div className="max-w-4xl mx-auto pb-20">
          
          {/* Progress Stepper */}
          <div className="mb-8 flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
             <StepIndicator step="reading" current={currentStep} label="Read Notes" icon={FileText} />
             <div className={`h-1 flex-1 mx-4 rounded-full ${['watching', 'quiz'].includes(currentStep) ? 'bg-blue-600' : 'bg-slate-100'}`} />
             
             <StepIndicator step="watching" current={currentStep} label="Watch Video" icon={Youtube} />
             <div className={`h-1 flex-1 mx-4 rounded-full ${['quiz'].includes(currentStep) ? 'bg-blue-600' : 'bg-slate-100'}`} />
             
             <StepIndicator step="quiz" current={currentStep} label="Take Quiz" icon={HelpCircle} />
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden min-h-[500px]">
            
            {/* Header */}
            <div className="bg-slate-900 text-white p-8">
              <h1 className="text-3xl font-bold">{currentTopic.title}</h1>
            </div>

            <div className="p-8 md:p-12">
              
              {/* STEP 1: READING */}
              {currentStep === 'reading' && (
                <div className="animate-in fade-in duration-500">
                  <div className="prose lg:prose-lg text-slate-600 max-w-none mb-10 leading-relaxed">
                    {currentTopic.textContent ? (
                      <p className="whitespace-pre-line">{currentTopic.textContent}</p>
                    ) : (
                      <p className="italic text-slate-400 bg-slate-100 p-4 rounded-lg">No written content available for this topic.</p>
                    )}
                  </div>
                  <div className="flex justify-end pt-6 border-t border-slate-100">
                    <button onClick={handleFinishReading} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition shadow-lg shadow-blue-200">
                      I've Read This <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: WATCHING */}
              {currentStep === 'watching' && (
                <div className="animate-in slide-in-from-right duration-500">
                  <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Youtube className="text-red-600" /> Recommended Videos
                  </h3>
                  
                  {currentTopic.youtubeLinks && currentTopic.youtubeLinks.length > 0 ? (
                    <div className="space-y-8">
                      {currentTopic.youtubeLinks.map((link, idx) => {
                        const embedUrl = getEmbedUrl(link.url);
                        return (
                          <div key={idx} className="space-y-2">
                            <p className="font-semibold text-slate-700">{idx + 1}. {link.title}</p>
                            {embedUrl ? (
                              <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
                                <iframe src={embedUrl} className="w-full h-full" allowFullScreen title={link.title} />
                              </div>
                            ) : (
                              <a href={link.url} target="_blank" rel="noreferrer" className="block p-4 bg-slate-50 border border-slate-200 rounded-lg text-blue-600 hover:underline">
                                {link.url} (Opens in new tab)
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-10 text-center">
                      <div className="mx-auto w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4 text-slate-400">
                         <Youtube size={32} />
                      </div>
                      <h4 className="text-lg font-bold text-slate-700">No Videos Available</h4>
                      <p className="text-slate-500 mt-2">There are no video resources attached to this topic yet.</p>
                    </div>
                  )}

                  <div className="flex justify-between mt-10 pt-6 border-t border-slate-100">
                    <button onClick={() => setCurrentStep('reading')} className="text-slate-400 hover:text-slate-600 font-semibold">
                      ← Back to Reading
                    </button>
                    <button onClick={handleFinishWatching} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition shadow-lg shadow-blue-200">
                      Proceed to Quiz <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: QUIZ */}
              {currentStep === 'quiz' && (
                <div className="animate-in slide-in-from-right duration-500">
                  {currentTopic.quiz && currentTopic.quiz.length > 0 ? (
                    <QuizInterface 
                      questions={currentTopic.quiz} 
                      onPass={completeTopic} 
                      onBack={() => setCurrentStep('watching')}
                    />
                  ) : (
                    <div className="text-center py-10">
                      <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                         <HelpCircle size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800">No Quiz Available</h3>
                      <p className="text-slate-500 mb-8">You can mark this topic as complete immediately.</p>
                      <button onClick={completeTopic} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg">
                        Mark Topic as Complete <CheckCircle className="inline ml-2" size={20}/>
                      </button>
                      <div className="mt-4">
                        <button onClick={() => setCurrentStep('watching')} className="text-sm text-slate-400 hover:text-slate-600">Go Back</button>
                      </div>
                    </div>
                  )}
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
  // Logic: Completed if current step is AFTER this step
  const steps = ['reading', 'watching', 'quiz'];
  const currentIndex = steps.indexOf(current);
  const stepIndex = steps.indexOf(step);
  const isCompleted = currentIndex > stepIndex;
  const isActive = current === step;

  return (
    <div className="flex items-center gap-2">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
        isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-300 scale-110' : 
        isCompleted ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'
      }`}>
        {isCompleted ? <CheckCircle size={20} /> : <Icon size={20} />}
      </div>
      <span className={`text-sm font-bold hidden md:block ${isActive ? 'text-blue-800' : 'text-slate-500'}`}>{label}</span>
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
        <p className="text-slate-500 mb-8 text-lg">You scored {score} out of {questions.length} ({Math.round((score/questions.length)*100)}%)</p>
        
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
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-center gap-3 ${
                answers[currentQIndex] === i 
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