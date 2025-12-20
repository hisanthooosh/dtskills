import { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    PlusCircle,
    LogOut,

    Search,
    FolderPlus,
    FileVideo,
    Save,
    ChevronDown,
    FileText, HelpCircle, Trash2, Edit3,
    ChevronRight,
    Eye, X
} from 'lucide-react';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'students', 'courses', 'create'

    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Admin Secret (Hardcoded for dev)
    const ADMIN_SECRET = "doneswari_admin_2025";

    // --- BUILDER STATE ---
    const [courseData, setCourseData] = useState({ title: '', description: '', price: 200, chapters: [] });
    const [newChapterTitle, setNewChapterTitle] = useState('');
    const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);
    // Updated to hold MULTIPLE quizzes
    const [currentTopic, setCurrentTopic] = useState({
        title: '', video: '', content: '',
        quizzes: [] // <--- Now an array
    });

    // NEW: Temporary state for the question you are currently typing
    const [tempQuiz, setTempQuiz] = useState({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0
    });
    // --- NEW: PREVIEW MODAL STATE ---
    const [previewTopic, setPreviewTopic] = useState(null); // If not null, modal is open

    const openPreview = (moduleIndex, topicIndex) => {
        const topic = courseData.chapters[moduleIndex].topics[topicIndex];
        setPreviewTopic(topic);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // 1. Get Courses
            const courseRes = await axios.get('http://localhost:5000/api/courses');
            setCourses(courseRes.data);

            // 2. Get Students (Secure Route)
            const studentRes = await axios.post('http://localhost:5000/api/admin/students', {
                adminSecret: ADMIN_SECRET
            });
            setStudents(studentRes.data);
            setLoading(false);
        } catch (err) {
            console.error("Error loading admin data");
        }
    };

    // --- ACTIONS ---
    const handleDeleteCourse = async (id) => {
        if (!confirm("Delete this course permanently?")) return;
        await axios.delete(`http://localhost:5000/api/admin/course/${id}`, { data: { adminSecret: ADMIN_SECRET } });
        fetchData();
    };

    // --- BUILDER LOGIC ---
    const addChapter = () => {
        if (!newChapterTitle) return alert("Enter Chapter Title");
        setCourseData({
            ...courseData,
            chapters: [...courseData.chapters, { title: newChapterTitle, topics: [] }]
        });
        setNewChapterTitle('');
        setSelectedChapterIndex(courseData.chapters.length);
    };

    const addTopic = () => {
        if (courseData.chapters.length === 0) return alert("Add a Chapter first");

        const updatedChapters = [...courseData.chapters];
        updatedChapters[selectedChapterIndex].topics.push(currentTopic);

        setCourseData({ ...courseData, chapters: updatedChapters });

        // --- FIX IS HERE: Reset to 'quizzes: []', NOT the old 'quiz: {}' ---
        setCurrentTopic({
            title: '',
            video: '',
            content: '',
            quizzes: [] // <--- This must be an empty array
        });
    };

    const publishCourse = async () => {
        try {
            await axios.post('http://localhost:5000/api/admin/course', { ...courseData, adminSecret: ADMIN_SECRET });
            alert("Course Published!");
            setCourseData({ title: '', description: '', price: 200, chapters: [] });
            fetchData();
            setActiveTab('courses'); // Switch to list view
        } catch (err) { alert("Error publishing"); }
    };


    // --- SUB-COMPONENTS ---

    const StatsCard = ({ title, value, color, icon: Icon }) => (
        <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${color} flex items-center justify-between`}>
            <div>
                <p className="text-slate-500 text-sm font-bold uppercase">{title}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
            </div>
            <div className={`p-3 rounded-full ${color.replace('border-', 'bg-').replace('500', '100')} ${color.replace('border-', 'text-').replace('500', '600')}`}>
                <Icon size={24} />
            </div>
        </div>
    );
    const addQuizToTopic = () => {
        if (!tempQuiz.question) return alert("Please type a question");

        // Add the temp quiz to the current topic's list
        setCurrentTopic({
            ...currentTopic,
            quizzes: [...currentTopic.quizzes, tempQuiz]
        });

        // Reset the form
        setTempQuiz({ question: '', options: ['', '', '', ''], correctAnswer: 0 });
    };
    // --- NEW: EDIT & DELETE LOGIC ---

    // 1. Delete a Module (Chapter)
    const deleteModule = (index) => {
        const updatedChapters = [...courseData.chapters];
        updatedChapters.splice(index, 1);
        setCourseData({ ...courseData, chapters: updatedChapters });
    };

    // 2. Delete a Topic inside a Module
    const deleteTopic = (moduleIndex, topicIndex) => {
        const updatedChapters = [...courseData.chapters];
        updatedChapters[moduleIndex].topics.splice(topicIndex, 1);
        setCourseData({ ...courseData, chapters: updatedChapters });
    };

    // 3. Edit a Topic (Load it back to form & remove from list)
    const editTopic = (moduleIndex, topicIndex) => {
        const topicToEdit = courseData.chapters[moduleIndex].topics[topicIndex];

        // Load data into the form
        setCurrentTopic(topicToEdit);
        setSelectedChapterIndex(moduleIndex);

        // Remove it from the list (so we don't duplicate it when adding back)
        deleteTopic(moduleIndex, topicIndex);

        // Scroll to top of form (optional UX improvement)
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    return (
        <div className="flex h-screen bg-slate-100 font-sans">

            {/* --- SIDEBAR --- */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-2xl font-bold text-yellow-400">DT Admin</h1>
                    <p className="text-xs text-slate-400 mt-1">Super Admin Panel</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                        <LayoutDashboard size={20} /> Overview
                    </button>
                    <button onClick={() => setActiveTab('students')} className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${activeTab === 'students' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                        <Users size={20} /> Students List
                    </button>
                    <button onClick={() => setActiveTab('courses')} className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${activeTab === 'courses' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                        <BookOpen size={20} /> Manage Courses
                    </button>
                    <button onClick={() => setActiveTab('create')} className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${activeTab === 'create' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                        <PlusCircle size={20} /> Create New
                    </button>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 text-red-400 hover:text-red-300 w-full p-2">
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            <main className="flex-1 overflow-y-auto p-8">

                {/* VIEW 1: OVERVIEW */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatsCard title="Total Students" value={students.length} color="border-blue-500" icon={Users} />
                            <StatsCard title="Total Revenue" value={`₹${students.reduce((acc, s) => acc + (s.enrolledCourses?.filter(c => c.isPaid).length * 200 || 0), 0)}`} color="border-green-500" icon={Users} />
                            <StatsCard title="Active Courses" value={courses.length} color="border-purple-500" icon={BookOpen} />
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h3 className="font-bold text-lg mb-4">Recent Registrations</h3>
                            {students.slice(0, 5).map(student => (
                                <div key={student._id} className="flex justify-between py-3 border-b last:border-0">
                                    <div>
                                        <p className="font-bold text-slate-800">{student.name}</p>
                                        <p className="text-xs text-slate-500">{student.collegeName}</p>
                                    </div>
                                    <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 h-fit">
                                        {new Date().toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* VIEW 2: STUDENTS LIST */}
                {activeTab === 'students' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-slate-800">Enrolled Students</h2>
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b">
                                    <tr>
                                        <th className="p-4 font-bold text-slate-600">Name</th>
                                        <th className="p-4 font-bold text-slate-600">College</th>
                                        <th className="p-4 font-bold text-slate-600">Email</th>
                                        <th className="p-4 font-bold text-slate-600">Courses</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map(student => (
                                        <tr key={student._id} className="border-b hover:bg-slate-50">
                                            <td className="p-4 font-bold text-slate-800">{student.name}</td>
                                            <td className="p-4 text-sm text-slate-600">{student.collegeName}</td>
                                            <td className="p-4 text-sm text-slate-500">{student.email}</td>
                                            <td className="p-4">
                                                {student.enrolledCourses?.map((enr, idx) => (
                                                    <span key={idx} className={`text-xs px-2 py-1 rounded mr-1 ${enr.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {enr.isPaid ? 'Paid' : 'Unpaid'}
                                                    </span>
                                                ))}
                                                {student.enrolledCourses?.length === 0 && <span className="text-xs text-slate-400">None</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* VIEW 3: MANAGE COURSES */}
                {activeTab === 'courses' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-slate-800">Manage Courses</h2>
                        <div className="grid gap-4">
                            {courses.map(course => (
                                <div key={course._id} className="bg-white p-6 rounded-xl shadow-sm flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800">{course.title}</h3>
                                        <p className="text-slate-500">{course.chapters.length} Modules • ₹{course.price}</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={() => handleDeleteCourse(course._id)} className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition border border-red-200">
                                            Delete Course
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* VIEW 4: CREATE COURSE (The Builder) */}
                {activeTab === 'create' && (
                    <div className="max-w-4xl">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">Course Builder</h2>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
                            <h3 className="font-bold text-lg mb-4">1. Course Basics</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <input className="p-3 border rounded-lg col-span-2" placeholder="Course Title" value={courseData.title} onChange={e => setCourseData({ ...courseData, title: e.target.value })} />
                                <textarea className="p-3 border rounded-lg col-span-2" placeholder="Description" value={courseData.description} onChange={e => setCourseData({ ...courseData, description: e.target.value })} />
                                <input className="p-3 border rounded-lg" type="number" placeholder="Price" value={courseData.price} onChange={e => setCourseData({ ...courseData, price: e.target.value })} />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
                            <h3 className="font-bold text-lg mb-4">2. Add Content</h3>

                            {/* Add Chapter */}
                            <div className="flex gap-2 mb-6">
                                <input className="flex-1 p-3 border rounded-lg" placeholder="New Module Title (e.g. Intro to React)" value={newChapterTitle} onChange={e => setNewChapterTitle(e.target.value)} />
                                <button onClick={addChapter} className="bg-slate-800 text-white px-6 rounded-lg font-bold">Add Module</button>
                            </div>

                            {/* Add Topic */}
                            {courseData.chapters.length > 0 && (
                                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                    <div className="mb-4">
                                        <label className="text-sm font-bold text-slate-500 uppercase">Add Topic Inside:</label>
                                        <select className="w-full p-2 border rounded mt-1 font-bold" value={selectedChapterIndex} onChange={e => setSelectedChapterIndex(parseInt(e.target.value))}>
                                            {courseData.chapters.map((c, i) => <option key={i} value={i}>{c.title}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-3">
                                        <input className="w-full p-3 border rounded-lg" placeholder="Topic Title" value={currentTopic.title} onChange={e => setCurrentTopic({ ...currentTopic, title: e.target.value })} />
                                        <input className="w-full p-3 border rounded-lg" placeholder="YouTube URL" value={currentTopic.video} onChange={e => setCurrentTopic({ ...currentTopic, video: e.target.value })} />
                                        <textarea className="w-full p-3 border rounded-lg h-24" placeholder="Lecture Notes..." value={currentTopic.content} onChange={e => setCurrentTopic({ ...currentTopic, content: e.target.value })} />

                                        {/* --- UPDATED MULTI-QUIZ BUILDER --- */}
                                        <div className="bg-white p-4 rounded-lg border border-blue-100">
                                            <div className="flex justify-between items-center mb-2">
                                                <p className="text-xs font-bold text-blue-600">
                                                    Quiz Questions ({currentTopic.quizzes.length} added)
                                                </p>
                                            </div>

                                            {/* Input for New Question */}
                                            <div className="bg-blue-50 p-3 rounded mb-3">
                                                <input
                                                    className="w-full p-2 border rounded mb-2 text-sm"
                                                    placeholder="Type Question here..."
                                                    value={tempQuiz.question}
                                                    onChange={e => setTempQuiz({ ...tempQuiz, question: e.target.value })}
                                                />

                                                <div className="grid grid-cols-2 gap-2 mb-2">
                                                    {[0, 1, 2, 3].map(i => (
                                                        <input key={i} className={`p-2 border rounded text-xs ${tempQuiz.correctAnswer === i ? 'border-green-500 bg-green-50' : ''}`}
                                                            placeholder={`Option ${i + 1}`}
                                                            value={tempQuiz.options[i]}
                                                            onChange={e => {
                                                                const n = [...tempQuiz.options]; n[i] = e.target.value;
                                                                setTempQuiz({ ...tempQuiz, options: n });
                                                            }}
                                                        />
                                                    ))}
                                                </div>

                                                <div className="flex gap-2">
                                                    <select
                                                        className="p-2 border rounded text-xs flex-1 font-bold text-slate-600"
                                                        value={tempQuiz.correctAnswer}
                                                        onChange={e => setTempQuiz({ ...tempQuiz, correctAnswer: parseInt(e.target.value) })}
                                                    >
                                                        <option value={0}>Correct Answer is: Option 1</option>
                                                        <option value={1}>Correct Answer is: Option 2</option>
                                                        <option value={2}>Correct Answer is: Option 3</option>
                                                        <option value={3}>Correct Answer is: Option 4</option>
                                                    </select>
                                                    <button onClick={addQuizToTopic} className="bg-slate-800 text-white px-4 rounded text-xs font-bold">
                                                        + Add Question
                                                    </button>
                                                </div>
                                            </div>

                                            {/* List of Added Questions */}
                                            {currentTopic.quizzes.length > 0 && (
                                                <div className="mt-2 space-y-1">
                                                    {currentTopic.quizzes.map((q, idx) => (
                                                        <div key={idx} className="text-xs bg-slate-100 p-2 rounded flex justify-between">
                                                            <span>Q{idx + 1}: {q.question}</span>
                                                            <span className="text-green-600 font-bold">Ans: Opt {q.correctAnswer + 1}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {/* --- END OF UPDATED SECTION --- */}

                                        <button onClick={addTopic} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700">Add Topic to Module</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Preview Section - WITH EDIT & DELETE */}
                        {/* --- NEW DETAILED PREVIEW SECTION --- */}
                        {courseData.chapters.length > 0 && (
                            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden mb-10">
                                {/* Header */}
                                <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-lg">Course Preview</h3>
                                        <p className="text-xs text-slate-400">{courseData.title || "Untitled Course"}</p>
                                    </div>
                                    <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                                        Draft Mode
                                    </span>
                                </div>

                                <div className="p-6 bg-slate-50 space-y-6 max-h-[600px] overflow-y-auto">
                                    {courseData.chapters.map((c, i) => (
                                        <div key={i} className="bg-white border border-slate-300 rounded-lg overflow-hidden shadow-sm">

                                            {/* MODULE HEADER */}
                                            <div className="bg-slate-100 p-3 border-b border-slate-200 flex justify-between items-center group">
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                        Module {i + 1}
                                                    </span>
                                                    <span className="font-bold text-slate-800">{c.title}</span>
                                                </div>
                                                <button
                                                    onClick={() => deleteModule(i)}
                                                    className="text-slate-400 hover:text-red-600 transition p-1 hover:bg-red-50 rounded"
                                                    title="Delete Entire Module"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            {/* TOPICS LIST */}
                                            <div className="divide-y divide-slate-100">
                                                {c.topics.length === 0 && (
                                                    <div className="p-4 text-center text-slate-400 text-sm italic">
                                                        No topics added yet. Use the form above.
                                                    </div>
                                                )}

                                                {c.topics.map((t, j) => (
                                                    <div key={j} className="p-3 pl-4 hover:bg-blue-50 transition flex justify-between items-start group">

                                                        {/* Topic Info */}
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-700 mb-1">{t.title}</p>

                                                            {/* Content Indicators (Icons) */}
                                                            <div className="flex gap-3 text-xs text-slate-500">
                                                                {t.video && (
                                                                    <span className="flex items-center gap-1 text-blue-600 bg-blue-100 px-1.5 rounded">
                                                                        <FileVideo size={12} /> Video
                                                                    </span>
                                                                )}
                                                                {t.content && (
                                                                    <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-1.5 rounded">
                                                                        <FileText size={12} /> Notes
                                                                    </span>
                                                                )}
                                                                {t.quizzes && t.quizzes.length > 0 && (
                                                                    <span className="flex items-center gap-1 text-green-700 bg-green-100 px-1.5 rounded font-medium">
                                                                        <HelpCircle size={12} /> {t.quizzes.length} Questions
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Actions (Preview / Edit / Delete) */}
                                                        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition items-center">
                                                            {/* PREVIEW BUTTON */}
                                                            <button
                                                                onClick={() => openPreview(i, j)}
                                                                className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded hover:bg-slate-800 hover:text-white transition flex items-center gap-1"
                                                                title="Student View"
                                                            >
                                                                <Eye size={12} /> View
                                                            </button>

                                                            <button
                                                                onClick={() => editTopic(i, j)}
                                                                className="text-xs bg-white border border-blue-200 text-blue-600 px-2 py-1 rounded hover:bg-blue-600 hover:text-white transition"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => deleteTopic(i, j)}
                                                                className="text-slate-400 hover:text-red-500 p-1 hover:bg-red-50 rounded"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Footer Publish Action */}
                                <div className="p-4 bg-white border-t border-slate-200">
                                    <div className="flex justify-between items-center text-sm text-slate-500 mb-4 px-2">
                                        <span>Total Modules: {courseData.chapters.length}</span>
                                        <span>Total Price: ₹{courseData.price}</span>
                                    </div>
                                    <button
                                        onClick={publishCourse}
                                        className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-lg shadow-md hover:bg-green-700 hover:shadow-lg transition flex items-center justify-center gap-2"
                                    >
                                        <Save size={20} /> Publish Course Live
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {/* --- STUDENT VIEW MODAL --- */}
                {previewTopic && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">

                            {/* Modal Header */}
                            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Eye size={18} className="text-blue-400" />
                                    <span className="font-bold">Student View Preview</span>
                                </div>
                                <button onClick={() => setPreviewTopic(null)} className="text-slate-400 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Modal Body (Scrollable) */}
                            <div className="p-6 overflow-y-auto">
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">{previewTopic.title}</h2>

                                {/* 1. Video Preview */}
                                {previewTopic.video ? (
                                    <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg mb-6">
                                        <iframe
                                            className="w-full h-full"
                                            src={`https://www.youtube.com/embed/${previewTopic.video.split('/').pop()}`}
                                            title="Preview"
                                        ></iframe>
                                    </div>
                                ) : (
                                    <div className="bg-slate-100 p-4 rounded-lg mb-6 text-slate-500 text-sm italic text-center">
                                        No Video Content
                                    </div>
                                )}

                                {/* 2. Notes Preview (Markdown Enabled) */}
                                <div className="mb-8 bg-slate-50 p-6 rounded-xl border border-slate-100">
                                    <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Lecture Notes</h3>
                                    <div className="prose text-sm max-w-none">
                                        <ReactMarkdown>{previewTopic.content || "No text content added."}</ReactMarkdown>
                                    </div>
                                </div>

                                {/* 3. Quiz Preview */}
                                {previewTopic.quizzes && previewTopic.quizzes.length > 0 && (
                                    <div className="border border-blue-100 rounded-xl p-4 bg-white shadow-sm">
                                        <h3 className="font-bold text-blue-800 mb-3">Quiz Preview ({previewTopic.quizzes.length} Questions)</h3>
                                        <div className="space-y-4">
                                            {previewTopic.quizzes.map((q, idx) => (
                                                <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm">
                                                    <p className="font-bold text-slate-800 mb-2">Q{idx + 1}: {q.question}</p>
                                                    <ul className="grid grid-cols-2 gap-2">
                                                        {q.options.map((opt, i) => (
                                                            <li key={i} className={`p-2 border rounded ${i === q.correctAnswer ? 'bg-green-100 border-green-400 text-green-800 font-bold' : 'bg-white text-slate-500'}`}>
                                                                {opt}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 border-t bg-slate-50 flex justify-end">
                                <button onClick={() => setPreviewTopic(null)} className="px-6 py-2 bg-slate-800 text-white rounded-lg font-bold">
                                    Close Preview
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}