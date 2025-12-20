import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { CheckCircle, Lock, PlayCircle, FileText, ChevronDown, ChevronRight, HelpCircle } from 'lucide-react';

export default function Classroom() {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [student, setStudent] = useState(JSON.parse(localStorage.getItem('student')));

    // Navigation State
    const [activeModuleIdx, setActiveModuleIdx] = useState(0); // Which Chapter folder is open
    const [activeTopicIdx, setActiveTopicIdx] = useState(0);   // Which Topic is playing

    const [currentQuizIndex, setCurrentQuizIndex] = useState(0); // Which question are they on?
    const [quizAnswer, setQuizAnswer] = useState(null);
    const [quizPassed, setQuizPassed] = useState(false);

    useEffect(() => {
        // Fetch Course & Student Data
        axios.get('http://localhost:5000/api/courses').then(res => {
            const found = res.data.find(c => c._id === courseId);
            if (found) setCourse(found);
        });
    }, [courseId]);

    const handleQuizSubmit = () => {
        const currentTopic = course.chapters[activeModuleIdx].topics[activeTopicIdx];
        const currentQuestion = currentTopic.quizzes[currentQuizIndex];

        if (parseInt(quizAnswer) === parseInt(currentQuestion.correctAnswer)) {
            alert("Correct!");

            // Check if there are more questions
            if (currentQuizIndex < currentTopic.quizzes.length - 1) {
                // Move to next question
                setCurrentQuizIndex(currentQuizIndex + 1);
                setQuizAnswer(null); // Reset selection
            } else {
                // All questions passed!
                setQuizPassed(true);
            }
        } else {
            alert("Incorrect. Try again!");
        }
    };

    const handleNextTopic = () => {
        // Logic to move to next topic or next module
        const currentModule = course.chapters[activeModuleIdx];

        if (activeTopicIdx < currentModule.topics.length - 1) {
            // Move to next topic in same module
            setActiveTopicIdx(activeTopicIdx + 1);
        } else if (activeModuleIdx < course.chapters.length - 1) {
            // Move to next module
            setActiveModuleIdx(activeModuleIdx + 1);
            setActiveTopicIdx(0);
        } else {
            alert("Course Completed! Congrats!");
        }

        setQuizPassed(false);
        setQuizAnswer(null);
        setCurrentQuizIndex(0); // Reset to Question 1
    };

    if (!course) return <div className="p-10">Loading Course...</div>;

    const currentModule = course.chapters[activeModuleIdx];
    // Safety check in case a module has no topics
    const currentTopic = currentModule?.topics?.[activeTopicIdx];

    if (!currentTopic) return <div className="p-10">This module has no topics yet.</div>;

    return (
        <div className="flex h-screen bg-white overflow-hidden">

            {/* --- SIDEBAR (Accordion Style) --- */}
            <aside className="w-80 bg-slate-50 border-r border-slate-200 overflow-y-auto flex-shrink-0">
                <div className="p-4 border-b bg-white sticky top-0 z-10">
                    <button onClick={() => navigate('/dashboard')} className="text-xs text-slate-500 hover:text-blue-600 mb-2">← Back to Dashboard</button>
                    <h2 className="font-bold text-slate-800 leading-tight">{course.title}</h2>
                </div>

                <div className="p-2 space-y-2">
                    {course.chapters.map((chapter, modIdx) => (
                        <div key={modIdx} className="border border-slate-200 rounded-lg bg-white overflow-hidden">
                            {/* Chapter Header */}
                            <button
                                onClick={() => setActiveModuleIdx(modIdx)}
                                className={`w-full text-left p-3 font-bold text-sm flex justify-between items-center ${activeModuleIdx === modIdx ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                            >
                                <span>Module {modIdx + 1}: {chapter.title}</span>
                                {activeModuleIdx === modIdx ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>

                            {/* Topics List (Only show if module is active) */}
                            {activeModuleIdx === modIdx && (
                                <div className="bg-slate-50 border-t border-slate-100">
                                    {chapter.topics.map((topic, topIdx) => {
                                        const isActive = activeTopicIdx === topIdx;
                                        return (
                                            <div
                                                key={topIdx}
                                                onClick={() => setActiveTopicIdx(topIdx)}
                                                className={`p-3 pl-6 text-xs flex items-center gap-3 cursor-pointer transition ${isActive ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-600 hover:text-slate-900'}`}
                                            >
                                                {isActive ? <PlayCircle size={14} /> : <div className="w-3 h-3 rounded-full border border-slate-400"></div>}
                                                <span className="truncate">{topic.title}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </aside>

            {/* --- MAIN PLAYER --- */}
            <main className="flex-1 overflow-y-auto p-8 bg-white">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-6">
                        <h4 className="text-sm text-slate-500 uppercase tracking-wide font-bold mb-1">Module {activeModuleIdx + 1}: {currentModule.title}</h4>
                        <h1 className="text-2xl font-bold text-slate-900">{currentTopic.title}</h1>
                    </div>

                    {/* Video Player */}
                    {currentTopic.video && (
                        <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg mb-8">
                            <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${currentTopic.video.split('/').pop()}`} title="Video" allowFullScreen></iframe>
                        </div>
                    )}

                    {/* Notes (Markdown Enabled) */}
                    <div className="mb-8 bg-slate-50 p-8 rounded-xl border border-slate-100">
                        <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-6 border-b pb-2">
                            <FileText size={20} /> Lecture Notes
                        </h3>

                        <div className="prose max-w-none">
                            <ReactMarkdown>{currentTopic.content}</ReactMarkdown>
                        </div>
                    </div>

                    {/* MULTI-QUESTION QUIZ SECTION */}
                    {currentTopic.quizzes && currentTopic.quizzes.length > 0 && (
                        <div className="border border-blue-100 rounded-xl p-6 bg-white shadow-sm mb-10">
                            <h3 className="font-bold text-lg text-blue-800 flex items-center gap-2 mb-4">
                                <HelpCircle className="fill-blue-100" />
                                Question {currentQuizIndex + 1} of {currentTopic.quizzes.length}
                            </h3>

                            <p className="font-medium text-slate-800 mb-4">
                                {currentTopic.quizzes[currentQuizIndex].question}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                {currentTopic.quizzes[currentQuizIndex].options.map((opt, idx) => (
                                    <button key={idx} onClick={() => setQuizAnswer(idx)} className={`p-3 text-left rounded-lg border transition ${quizAnswer === idx ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200'}`}>
                                        {opt}
                                    </button>
                                ))}
                            </div>

                            {!quizPassed ? (
                                <button onClick={handleQuizSubmit} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700" disabled={quizAnswer === null}>
                                    Submit Answer
                                </button>
                            ) : (
                                <div className="flex items-center gap-4 animate-in fade-in">
                                    <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle /> All Questions Passed!</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-end pt-6 border-t">
                        {(!currentTopic.quiz?.question || quizPassed) ? (
                            <button onClick={handleNextTopic} className="bg-slate-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-800 shadow-lg flex items-center gap-2">
                                Next Topic <ChevronRight size={18} />
                            </button>
                        ) : (
                            <button disabled className="bg-slate-200 text-slate-400 px-6 py-3 rounded-lg font-bold cursor-not-allowed flex items-center gap-2">
                                Pass Quiz to Continue <Lock size={16} />
                            </button>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}