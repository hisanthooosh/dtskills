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
    Edit2,
    Search,
    FolderPlus,
    FileVideo,
    Save,
    ChevronDown,
    FileText, HelpCircle, Trash2, Edit3,
    ChevronRight,
    Eye, X, School, Youtube, CheckCircle, Lock,


    XCircle,       // <--- ADD THIS
    ExternalLink   // <--- ADD THIS
} from 'lucide-react';

export default function AdminDashboard() {
    const navigate = useNavigate();
    // const [activeTab, setActiveTab] = useState('overview');

    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null); // Track if editing a draft

    // Admin Secret
    const ADMIN_SECRET = "doneswari_admin_2025";

    // --- BUILDER STATE ---
    // FIX: Changed 'chapters' to 'modules' to match backend
    const [courseData, setCourseData] = useState({ title: '', description: '', price: 200, modules: [] });
    const [newModuleTitle, setNewModuleTitle] = useState('');
    const [selectedModuleIndex, setSelectedModuleIndex] = useState(0);

    const [currentTopic, setCurrentTopic] = useState({
        title: '', content: '', quizzes: [] // Video removed
    });

    // Temp Quiz State
    const [tempQuiz, setTempQuiz] = useState({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0
    });

    // Preview Modal State
    const [previewTopic, setPreviewTopic] = useState(null);
    const [previewStep, setPreviewStep] = useState('reading');

    const openPreview = (moduleIndex, topicIndex) => {
        // FIX: Access 'modules' instead of 'chapters'
        const topic = courseData.modules[moduleIndex].topics[topicIndex];
        setPreviewTopic(topic);
        setPreviewStep('reading');
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
    const handleContinueEditing = (course) => {
        setEditingId(course._id);

        // This 'sanitizedModules' block is the "Translator"
        const sanitizedModules = (course.modules || []).map(m => ({
            ...m,
            topics: (m.topics || []).map(t => ({
                ...t,
                // THE FIX: Look for 'content' (frontend) OR 'textContent' (backend)
                content: t.content || t.textContent || '',
                quizzes: t.quizzes || []
            }))
        }));

        setCourseData({
            title: course.title || '',
            description: course.description || '',
            price: course.price || 0,
            modules: sanitizedModules
        });

        setActiveTab('create');
    };
    // --- BUILDER LOGIC ---
    const addModule = () => {
        if (!newModuleTitle) return alert("Enter Module Title");
        setCourseData({
            ...courseData,
            // FIX: Using 'modules'
            modules: [...courseData.modules, { title: newModuleTitle, topics: [] }]
        });
        setNewModuleTitle('');
        setSelectedModuleIndex(courseData.modules.length);
    };

    const addTopic = () => {
        if (courseData.modules.length === 0) return alert("Add a Module first");

        const updatedModules = [...courseData.modules];

        // FIX: Create a topic object that works for both Frontend (content) and Backend (textContent)
        const topicToSave = {
            ...currentTopic,
            textContent: currentTopic.content, // <--- CRITICAL FIX: Maps text for the Database
            content: currentTopic.content,     // Keeps text for the Editor
            video: currentTopic.video || ''
        };

        updatedModules[selectedModuleIndex].topics.push(topicToSave);

        setCourseData({ ...courseData, modules: updatedModules });

        setCurrentTopic({ title: '', content: '', quizzes: [] });
    };

    const handleSaveCourse = async (isPublished) => {
        try {
            await axios.post('http://localhost:5000/api/courses/publish', {
                ...courseData,
                _id: editingId, // Send ID if we are editing
                isPublished: isPublished, // True = Live, False = Draft
                adminSecret: ADMIN_SECRET
            });

            if (isPublished) {
                alert("Course Published Live to Students!");
                // Reset form completely
                setCourseData({ title: '', description: '', price: 200, modules: [] });
                setEditingId(null);
                setActiveTab('courses');
            } else {
                alert("Draft Saved! You can continue editing later.");
            }
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Error saving: " + (err.response?.data?.error || err.message));
        }
    };

    const addQuizToTopic = () => {
        if (!tempQuiz.question) return alert("Please type a question");

        setCurrentTopic({
            ...currentTopic,
            quizzes: [...currentTopic.quizzes, tempQuiz]
        });

        setTempQuiz({ question: '', options: ['', '', '', ''], correctAnswer: 0 });
    };

    // --- EDIT & DELETE LOGIC ---

    const deleteModule = (index) => {
        const updatedModules = [...courseData.modules];
        updatedModules.splice(index, 1);
        setCourseData({ ...courseData, modules: updatedModules });
    };

    const deleteTopic = (moduleIndex, topicIndex) => {
        const updatedModules = [...courseData.modules];
        updatedModules[moduleIndex].topics.splice(topicIndex, 1);
        setCourseData({ ...courseData, modules: updatedModules });
    };

    const editTopic = (moduleIndex, topicIndex) => {
        const topicToEdit = courseData.modules[moduleIndex].topics[topicIndex];
        setCurrentTopic(topicToEdit);
        setSelectedModuleIndex(moduleIndex);
        deleteTopic(moduleIndex, topicIndex);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // REPLACE: const [newCollegeName, setNewCollegeName] = useState('');
    // WITH THIS 👇
    const [newCollege, setNewCollege] = useState({ name: '', hodEmail: '', hodPassword: '' });

    const handleCreateCollege = async () => {
        // Corrected: Only check for the College Name now
        if (!newCollege.name) {
            alert("Please fill in the College Name");
            return;
        }

        try {
            // Send only the name to the backend
            await axios.post('http://localhost:5000/api/college/add', {
                name: newCollege.name
            });

            alert('College Created Successfully!');
            setNewCollege({ name: '', hodEmail: '', hodPassword: '' }); // Reset form
            fetchColleges(); // Refresh the list
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Error creating college');
        }
    };
    const [collegesList, setCollegesList] = useState([]);
    const [targetCollegeId, setTargetCollegeId] = useState('');
    const [newCourse, setNewCourse] = useState({ name: '', start: '', end: '' });

    useEffect(() => {
        axios.get('http://localhost:5000/api/college/all')
            .then(res => setCollegesList(res.data))
            .catch(err => console.error(err));
    }, []);

    const handleEditCollege = async (collegeId, currentName) => {
        const newName = prompt("Enter new College Name:", currentName);
        if (!newName || newName === currentName) return;

        try {
            await axios.put(`http://localhost:5000/api/college/update/${collegeId}`, { name: newName });
            alert("College Name Updated!");
            const res = await axios.get('http://localhost:5000/api/college/all');
            setCollegesList(res.data);
        } catch (err) {
            alert("Error updating college");
        }
    };

    const handleEditCourse = async (collegeId, courseId, currentName) => {
        const newName = prompt("Enter new Department Name:", currentName);
        if (!newName || newName === currentName) return;

        try {
            await axios.put(`http://localhost:5000/api/college/update-course`, {
                collegeId,
                courseId,
                newName
            });
            alert("Department Updated!");
            const res = await axios.get('http://localhost:5000/api/college/all');
            setCollegesList(res.data);
        } catch (err) {
            alert("Error updating department");
        }
    };

    // const handleCreateCollege = async () => {
    //     try {
    //         await axios.post('http://localhost:5000/api/college/add', { name: newCollegeName });
    //         alert('College Added');
    //         const res = await axios.get('http://localhost:5000/api/college/all');
    //         setCollegesList(res.data);
    //         setNewCollegeName('');
    //     } catch (err) { console.error(err); }
    // };

    const handleGenerateRolls = async () => {
        // Basic validation
        if (!targetCollegeId || !newCourse.name || !newCourse.start || !newCourse.end || !newCourse.hodEmail || !newCourse.hodPassword) {
            alert("Please fill all fields including HOD details");
            return;
        }

        try {
            await axios.post('http://localhost:5000/api/college/add-course', {
                collegeId: targetCollegeId,
                courseName: newCourse.name,
                startRoll: newCourse.start,
                endRoll: newCourse.end,
                hodEmail: newCourse.hodEmail,       // 👈 Send this
                hodPassword: newCourse.hodPassword  // 👈 Send this
            });
            alert("Department Added Successfully!");
            fetchColleges();
        } catch (error) {
            alert("Error adding course");
        }
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
    // --- SUBMISSIONS LOGIC START ---
    const [activeTab, setActiveTab] = useState('dashboard'); // If you already have activeTab, just ensure 'submissions' is handled
    const [submissions, setSubmissions] = useState([]);
    const [rejectModal, setRejectModal] = useState({ isOpen: false, id: null });
    const [feedback, setFeedback] = useState('');

    // Fetch Submissions when tab changes
    useEffect(() => {
        if (activeTab === 'submissions') {
            axios.get('http://localhost:5000/api/submissions')
                .then(res => setSubmissions(res.data))
                .catch(err => console.error(err));
        }
    }, [activeTab]);

    const handleApprove = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/submissions/${id}/approve`);
            alert("Approved!");
            // Refresh list
            const res = await axios.get('http://localhost:5000/api/submissions');
            setSubmissions(res.data);
        } catch (error) { alert("Error approving"); }
    };

    const submitRejection = async () => {
        try {
            await axios.put(`http://localhost:5000/api/submissions/${rejectModal.id}/reject`, { feedback });
            setRejectModal({ isOpen: false, id: null });
            setFeedback('');
            alert("Rejected.");
            // Refresh list
            const res = await axios.get('http://localhost:5000/api/submissions');
            setSubmissions(res.data);
        } catch (error) { alert("Error rejecting"); }
    };
    // --- SUBMISSIONS LOGIC END ---

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
                    <button onClick={() => setActiveTab('colleges')} className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${activeTab === 'colleges' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                        <FolderPlus size={20} /> Manage Colleges
                    </button>
                    {/* In your Sidebar */}
                    <button
                        onClick={() => setActiveTab('submissions')}
                        className={`flex items-center space-x-3 w-full p-2 rounded ${activeTab === 'submissions' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
                            }`}
                    >
                        <FileText size={20} />
                        <span>Submissions</span>
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
                                <div key={course._id} className={`bg-white p-6 rounded-xl shadow-sm flex justify-between items-center border-l-4 ${course.isPublished ? 'border-green-500' : 'border-yellow-500'}`}>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-xl font-bold text-slate-800">{course.title}</h3>
                                            {!course.isPublished && (
                                                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-bold">DRAFT</span>
                                            )}
                                        </div>
                                        <p className="text-slate-500">{course.modules?.length || 0} Modules • ₹{course.price}</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleContinueEditing(course)}
                                            className="text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition border border-blue-200"
                                        >
                                            {course.isPublished ? "Edit Content" : "Continue Making"}
                                        </button>
                                        <button onClick={() => handleDeleteCourse(course._id)} className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition border border-red-200">
                                            <Trash2 size={20} />
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

                            {/* Add Module (Renamed from Chapter) */}
                            <div className="flex gap-2 mb-6">
                                <input className="flex-1 p-3 border rounded-lg" placeholder="New Module Title (e.g. Intro to React)" value={newModuleTitle} onChange={e => setNewModuleTitle(e.target.value)} />
                                <button onClick={addModule} className="bg-slate-800 text-white px-6 rounded-lg font-bold">Add Module</button>
                            </div>

                            {/* Add Topic */}
                            {courseData.modules.length > 0 && (
                                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                    <div className="mb-4">
                                        <label className="text-sm font-bold text-slate-500 uppercase">Add Topic Inside:</label>
                                        <select className="w-full p-2 border rounded mt-1 font-bold" value={selectedModuleIndex} onChange={e => setSelectedModuleIndex(parseInt(e.target.value))}>
                                            {courseData.modules.map((c, i) => <option key={i} value={i}>{c.title}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-3">
                                        <input className="w-full p-3 border rounded-lg" placeholder="Topic Title" value={currentTopic.title} onChange={e => setCurrentTopic({ ...currentTopic, title: e.target.value })} />
                                        <textarea className="w-full p-3 border rounded-lg h-24" placeholder="Lecture Notes (Paste YouTube links here if needed)..." value={currentTopic.content} onChange={e => setCurrentTopic({ ...currentTopic, content: e.target.value })} />

                                        {/* Quiz Builder */}
                                        <div className="bg-white p-4 rounded-lg border border-blue-100">
                                            <div className="flex justify-between items-center mb-2">
                                                <p className="text-xs font-bold text-blue-600">
                                                    Quiz Questions ({currentTopic.quizzes.length} added)
                                                </p>
                                            </div>

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

                                        <button onClick={addTopic} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700">Add Topic to Module</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Preview Section */}
                        {courseData.modules.length > 0 && (
                            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden mb-10">
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
                                    {courseData.modules.map((c, i) => (
                                        <div key={i} className="bg-white border border-slate-300 rounded-lg overflow-hidden shadow-sm">
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

                                            <div className="divide-y divide-slate-100">
                                                {c.topics.length === 0 && (
                                                    <div className="p-4 text-center text-slate-400 text-sm italic">
                                                        No topics added yet. Use the form above.
                                                    </div>
                                                )}

                                                {c.topics?.map((t, j) => (
                                                    <div key={j} className="p-3 pl-4 hover:bg-blue-50 transition flex justify-between items-start group">
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-700 mb-1">{t.title}</p>
                                                            <div className="flex gap-3 text-xs text-slate-500">

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

                                                        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition items-center">
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

                                <div className="p-4 bg-white border-t border-slate-200">
                                    <div className="flex justify-between items-center text-sm text-slate-500 mb-4 px-2">
                                        <span>Total Modules: {courseData.modules.length}</span>
                                        <span>Total Price: ₹{courseData.price}</span>
                                    </div>

                                    <div className="flex gap-3">
                                        {/* SAVE DRAFT BUTTON */}
                                        <button
                                            onClick={() => handleSaveCourse(false)} // false = isPublished
                                            className="flex-1 bg-slate-200 text-slate-800 py-3 rounded-xl font-bold text-lg hover:bg-slate-300 transition flex items-center justify-center gap-2"
                                        >
                                            <Save size={20} /> Save Draft
                                        </button>

                                        {/* PUBLISH BUTTON */}
                                        <button
                                            onClick={() => handleSaveCourse(true)} // true = isPublished
                                            className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold text-lg shadow-md hover:bg-green-700 hover:shadow-lg transition flex items-center justify-center gap-2"
                                        >
                                            <School size={20} /> {editingId ? "Update Live Course" : "Publish Course Live"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* VIEW 5: COLLEGE MANAGEMENT */}
                {activeTab === 'colleges' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-slate-800">College & Batch Management</h2>

                        {/* 1. Create College (Simple) */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <h3 className="font-bold text-lg mb-4 text-slate-700">1. Add Partner College</h3>
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    placeholder="Enter College Name"
                                    className="border p-3 rounded-lg flex-1 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={newCollege.name}
                                    onChange={(e) => setNewCollege({ ...newCollege, name: e.target.value })}
                                />
                                <button
                                    onClick={handleCreateCollege}
                                    className="bg-slate-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-800 transition flex items-center gap-2"
                                >
                                    <PlusCircle size={20} />
                                    Add College
                                </button>
                            </div>
                        </div>

                        {/* 2. Create Course/Department & Assign HOD */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <h3 className="font-bold text-lg mb-4 text-slate-700">2. Add Department & Assign HOD</h3>

                            {/* Top Row: Select College & Department Name */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <select
                                    className="border p-3 rounded-lg bg-slate-50 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                    onChange={(e) => setTargetCollegeId(e.target.value)}
                                >
                                    <option value="">Select Target College</option>
                                    {collegesList.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                                <input
                                    type="text"
                                    placeholder="Department Name (e.g. MCA, CSE)"
                                    className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                                />
                            </div>

                            {/* Middle Row: Roll Numbers */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <input
                                    type="text"
                                    placeholder="Start Roll No (e.g. 24102d020001)"
                                    className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    onChange={(e) => setNewCourse({ ...newCourse, start: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="End Roll No (e.g. 24102d020131)"
                                    className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    onChange={(e) => setNewCourse({ ...newCourse, end: e.target.value })}
                                />
                            </div>

                            {/* Bottom Row: HOD Credentials (Highlighted) */}
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg mb-4">
                                <h4 className="text-sm font-bold text-blue-800 mb-3 uppercase tracking-wide">HOD Credentials for this Dept</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="email"
                                        placeholder="HOD Official Email"
                                        className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        onChange={(e) => setNewCourse({ ...newCourse, hodEmail: e.target.value })}
                                    />
                                    <input
                                        type="password"
                                        placeholder="Assign Password"
                                        className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        onChange={(e) => setNewCourse({ ...newCourse, hodPassword: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleGenerateRolls}
                                className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition flex justify-center items-center gap-2"
                            >
                                <PlusCircle size={20} />
                                Create Department & Generate Rolls
                            </button>
                        </div>

                        {/* 3. PREVIEW SECTION: Existing Colleges & Batches */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mt-8">
                            <h3 className="font-bold text-lg mb-6 text-slate-800 flex items-center gap-2">
                                <School size={20} className="text-blue-500" />
                                Registered Colleges & Batches
                            </h3>

                            {collegesList.length === 0 ? (
                                <p className="text-slate-500 italic">No colleges added yet.</p>
                            ) : (
                                <div className="grid gap-6">
                                    {collegesList.map((college, colIndex) => (
                                        <div key={college._id || colIndex} className="border border-slate-200 rounded-lg overflow-hidden">
                                            {/* College Header */}
                                            <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <h4 className="font-bold text-slate-800 text-lg">{college.name}</h4>
                                                    <button
                                                        onClick={() => handleEditCollege(college._id, college.name)}
                                                        className="text-slate-400 hover:text-blue-600 transition"
                                                        title="Edit College Name"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                </div>
                                                <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                                    {college.courses.length} Depts
                                                </span>
                                            </div>

                                            {/* Batches List */}
                                            <div className="p-4 space-y-4 bg-white">
                                                {college.courses.length === 0 && <p className="text-sm text-slate-400">No departments added.</p>}

                                                {college.courses.map((course, courseIndex) => {
                                                    const totalSeats = course.rollNumbers?.length || 0;
                                                    const registeredStudents = course.rollNumbers?.filter(r => r.isRegistered) || [];
                                                    const registeredCount = registeredStudents.length;
                                                    const startRoll = course.rollNumbers?.[0]?.number || 'N/A';
                                                    const endRoll = course.rollNumbers?.[totalSeats - 1]?.number || 'N/A';

                                                    return (
                                                        <div key={course._id || courseIndex} className="border rounded-lg p-4 hover:shadow-md transition">
                                                            <div className="flex justify-between items-start mb-3">
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <h5 className="font-bold text-blue-600 text-md">{course.courseName}</h5>
                                                                        <button
                                                                            onClick={() => handleEditCourse(college._id, course._id, course.courseName)}
                                                                            className="text-slate-300 hover:text-blue-600 transition"
                                                                            title="Edit Department"
                                                                        >
                                                                            <Edit2 size={14} />
                                                                        </button>
                                                                    </div>

                                                                    {/* Display HOD Email for this Department */}
                                                                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                                                        <span className="font-semibold text-slate-700">HOD:</span>
                                                                        {course.hodEmail ? (
                                                                            <span className="bg-yellow-50 text-yellow-700 px-1 rounded border border-yellow-100">
                                                                                {course.hodEmail}
                                                                            </span>
                                                                        ) : (
                                                                            <span className="text-red-400 italic">Not Assigned</span>
                                                                        )}
                                                                    </div>

                                                                    <p className="text-xs text-slate-400 mt-1">
                                                                        Rolls: <span className="font-mono text-slate-600">{startRoll}</span> - <span className="font-mono text-slate-600">{endRoll}</span>
                                                                    </p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <span className={`text-xs font-bold px-2 py-1 rounded ${registeredCount > 0 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                                                        {registeredCount} / {totalSeats} Filled
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Progress Bar */}
                                                            <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
                                                                <div
                                                                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                                                    style={{ width: `${totalSeats > 0 ? (registeredCount / totalSeats) * 100 : 0}%` }}
                                                                ></div>
                                                            </div>

                                                            {/* Student List Preview */}
                                                            {registeredCount > 0 ? (
                                                                <div className="bg-slate-50 p-3 rounded border border-slate-100">
                                                                    <p className="text-xs font-bold text-slate-500 mb-2 uppercase">Registered Students:</p>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {registeredStudents.map((student, stdIndex) => (
                                                                            <span key={student.number || stdIndex} className="text-xs bg-white border border-slate-200 px-2 py-1 rounded text-slate-700 font-mono shadow-sm">
                                                                                {student.number}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <p className="text-xs text-slate-400 italic">No students registered yet.</p>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- MODERN PREVIEW MODAL --- */}
                {previewTopic && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <div className="bg-white w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-200">

                            {/* Modal Header */}
                            <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md z-10">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Eye className="text-blue-400" /> Student Preview: {previewTopic.title}
                                </h3>
                                <button onClick={() => setPreviewTopic(null)} className="hover:bg-slate-700 p-2 rounded-full transition">
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Modern Content Area */}
                            <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-10">
                                <div className="max-w-3xl mx-auto">

                                    {/* Progress Stepper */}
                                    <div className="mb-8 flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                                        <StepIndicator step="reading" current={previewStep} label="Read Notes" icon={FileText} />
                                        {/* Line connector */}
                                        <div className={`h-1 flex-1 mx-4 rounded-full ${previewStep === 'quiz' ? 'bg-blue-600' : 'bg-slate-100'}`} />
                                        <StepIndicator step="quiz" current={previewStep} label="Take Quiz" icon={HelpCircle} />
                                    </div>

                                    <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden min-h-[400px]">
                                        <div className="p-8 md:p-12">

                                            {/* STEP 1: READING */}
                                            {previewStep === 'reading' && (
                                                <div className="animate-in fade-in duration-300">
                                                    <h2 className="text-2xl font-bold text-slate-800 mb-6">{previewTopic.title}</h2>

                                                    <div className="prose lg:prose-lg text-slate-600 max-w-none mb-10 leading-relaxed">
                                                        <ReactMarkdown>{previewTopic.content || "_No text content added yet._"}</ReactMarkdown>
                                                    </div>

                                                    <div className="flex justify-end pt-6 border-t border-slate-100">
                                                        <button
                                                            onClick={() => setPreviewStep('quiz')}
                                                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-blue-200"
                                                        >
                                                            Proceed to Quiz <ChevronRight size={20} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* STEP 2: WATCHING */}
                                            {previewStep === 'watching' && (
                                                <div className="animate-in slide-in-from-right duration-300">
                                                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                                        <Youtube className="text-red-600" /> Video Lesson
                                                    </h3>

                                                    {previewTopic.video ? (
                                                        <div className="space-y-4">
                                                            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
                                                                <iframe
                                                                    src={getEmbedUrl(previewTopic.video)}
                                                                    className="w-full h-full"
                                                                    title={previewTopic.title}
                                                                    allowFullScreen
                                                                />
                                                            </div>
                                                            <p className="text-xs text-slate-400 text-center">Previewing: {previewTopic.video}</p>
                                                        </div>
                                                    ) : (
                                                        <div className="bg-slate-50 p-10 text-center rounded-xl border border-dashed border-slate-300">
                                                            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                                                <Youtube size={32} />
                                                            </div>
                                                            <h4 className="text-lg font-bold text-slate-700">No Video Added</h4>
                                                            <p className="text-slate-500 mt-2">Add a YouTube link in the topic editor to see it here.</p>
                                                        </div>
                                                    )}

                                                    <div className="flex justify-between mt-10 pt-6 border-t border-slate-100">
                                                        <button onClick={() => setPreviewStep('reading')} className="text-slate-400 hover:text-slate-600 font-bold transition">
                                                            ← Back
                                                        </button>
                                                        <button
                                                            onClick={() => setPreviewStep('quiz')}
                                                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-blue-200"
                                                        >
                                                            Proceed to Quiz <ChevronRight size={20} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* STEP 3: QUIZ */}
                                            {previewStep === 'quiz' && (
                                                <div className="animate-in slide-in-from-right duration-300">
                                                    {previewTopic.quizzes && previewTopic.quizzes.length > 0 ? (
                                                        <PreviewQuizInterface
                                                            questions={previewTopic.quizzes}
                                                            onBack={() => setPreviewStep('reading')}
                                                        />
                                                    ) : (
                                                        <div className="text-center py-10">
                                                            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                                                <Lock size={32} />
                                                            </div>
                                                            <h3 className="text-xl font-bold text-slate-800">No Quiz Available</h3>
                                                            <p className="text-slate-500 mt-2 mb-6">You haven't added any questions to this topic yet.</p>
                                                            <button onClick={() => setPreviewStep('watching')} className="text-slate-400 font-bold hover:text-slate-600">
                                                                Go Back
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* Main Content Area */}

                {activeTab === 'submissions' && (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6">
                        <h2 className="text-xl font-bold mb-4">Student Submissions</h2>
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="p-3">Student</th>
                                    <th className="p-3">Links</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map((sub) => (
                                    <tr key={sub._id} className="border-b hover:bg-gray-50">
                                        <td className="p-3">{sub.studentName}</td>
                                        <td className="p-3 text-sm">
                                            <a href={sub.projectLink} target="_blank" className="text-blue-500 hover:underline mr-2">Project</a>
                                            <a href={sub.githubLink} target="_blank" className="text-gray-700 hover:text-black">GitHub</a>
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs ${sub.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                sub.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {sub.status}
                                            </span>
                                        </td>
                                        <td className="p-3 flex space-x-2">
                                            {sub.status === 'Pending' && (
                                                <>
                                                    <button onClick={() => handleApprove(sub._id)} className="text-green-600"><CheckCircle size={18} /></button>
                                                    <button onClick={() => setRejectModal({ isOpen: true, id: sub._id })} className="text-red-600"><XCircle size={18} /></button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* PASTE THIS AT THE VERY BOTTOM OF THE JSX (Before the closing </div> of the main container) */}
                {rejectModal.isOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-lg w-96">
                            <h3 className="font-bold mb-2">Reason for Rejection</h3>
                            <textarea
                                className="w-full border p-2 mb-4"
                                value={feedback}
                                onChange={e => setFeedback(e.target.value)}
                                placeholder="Feedback..."
                            />
                            <div className="flex justify-end space-x-2">
                                <button onClick={() => setRejectModal({ isOpen: false, id: null })} className="text-gray-500">Cancel</button>
                                <button onClick={submitRejection} className="bg-red-600 text-white px-3 py-1 rounded">Reject</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

// --- HELPER COMPONENTS & FUNCTIONS FOR PREVIEW ---

const getEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
};

const StepIndicator = ({ step, current, label, icon: Icon }) => {
    const steps = ['reading', 'watching', 'quiz'];
    const currentIndex = steps.indexOf(current);
    const stepIndex = steps.indexOf(step);
    const isCompleted = currentIndex > stepIndex;
    const isActive = current === step;

    return (
        <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-blue-600 text-white shadow-lg scale-110' :
                isCompleted ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                {isCompleted ? <CheckCircle size={16} /> : <Icon size={16} />}
            </div>
            <span className={`text-xs font-bold hidden sm:block ${isActive ? 'text-blue-800' : 'text-slate-500'}`}>{label}</span>
        </div>
    );
};

const PreviewQuizInterface = ({ questions, onBack }) => {
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);

    const handleSelect = (optIndex) => {
        setAnswers({ ...answers, [currentQIndex]: optIndex });
    };

    const handleSubmit = () => {
        let correctCount = 0;
        questions.forEach((q, i) => {
            if (answers[i] === q.correctAnswer) correctCount++;
        });
        setScore(correctCount);
        setShowResult(true);
    };

    if (showResult) {
        return (
            <div className="text-center py-10">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={40} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Quiz Completed</h2>
                <p className="text-slate-500 mb-6">Score: {score} / {questions.length}</p>
                <button
                    onClick={() => { setShowResult(false); setCurrentQIndex(0); setAnswers({}); }}
                    className="bg-slate-800 text-white px-6 py-2 rounded-lg font-bold"
                >
                    Restart Preview
                </button>
            </div>
        );
    }

    const q = questions[currentQIndex];

    return (
        <div>
            <div className="mb-4 flex justify-between items-end">
                <h3 className="text-lg font-bold text-slate-800">Question {currentQIndex + 1} of {questions.length}</h3>
            </div>

            <div className="mb-6">
                <p className="text-md text-slate-700 font-medium mb-4">{q.question}</p>
                <div className="space-y-2">
                    {q.options.map((opt, i) => (
                        <div
                            key={i}
                            onClick={() => handleSelect(i)}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 flex items-center gap-3 ${answers[currentQIndex] === i
                                ? 'border-blue-600 bg-blue-50 text-blue-800'
                                : 'border-slate-100 bg-white hover:border-slate-300'
                                }`}
                        >
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${answers[currentQIndex] === i ? 'border-blue-600' : 'border-slate-300'}`}>
                                {answers[currentQIndex] === i && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                            </div>
                            <span className="text-sm font-medium">{opt}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
                <button onClick={currentQIndex === 0 ? onBack : () => setCurrentQIndex(currentQIndex - 1)} className="text-slate-400 font-bold hover:text-slate-600">Back</button>
                {currentQIndex < questions.length - 1 ? (
                    <button onClick={() => setCurrentQIndex(currentQIndex + 1)} disabled={answers[currentQIndex] === undefined} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50">Next</button>
                ) : (
                    <button onClick={handleSubmit} disabled={answers[currentQIndex] === undefined} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg disabled:opacity-50">Finish Quiz</button>
                )}
            </div>
        </div>
    );
};