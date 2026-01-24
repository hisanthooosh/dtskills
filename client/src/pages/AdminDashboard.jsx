import { useState, useEffect } from 'react';
import axios from 'axios';          // ✅ KEEP (for public routes)
import adminAxios from '../utils/adminAxios'; // ✅ KEEP (for admin routes)


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


    
} from 'lucide-react';

export default function AdminDashboard() {
    const navigate = useNavigate();
    // const [activeTab, setActiveTab] = useState('overview');

    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    // 🔶 AICTE Internship IDs
    const [aicteList, setAicteList] = useState([]);
    const [aicteForm, setAicteForm] = useState({
        email: '',
        courseId: '',
        aicteInternshipId: ''
    });

    // ---------------- REVENUE CALCULATIONS ----------------
    const [adminRole, setAdminRole] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');


    const [editingTopic, setEditingTopic] = useState(null);

    // Total paid enrollments
    const paidEnrollments = students.flatMap(s =>
        s.enrolledCourses?.filter(c => c.isPaid) || []
    );

    // 1️⃣ TOTAL REVENUE
    const TOTAL_REVENUE = paidEnrollments.length * 200;

    // Count UNIQUE paid students
    const PAID_STUDENTS = students.filter(student =>
        student.enrolledCourses?.some(course => course.isPaid)
    ).length;

    const UNPAID_COUNT = students.length - PAID_STUDENTS;


    // 3️⃣ REVENUE PER COURSE
    const revenuePerCourse = {};
    students.forEach(student => {
        student.enrolledCourses?.forEach(c => {
            if (c.isPaid && c.courseId?.title) {
                revenuePerCourse[c.courseId.title] =
                    (revenuePerCourse[c.courseId.title] || 0) + 200;
            }
        });
    });

    // 4️⃣ REVENUE PER COLLEGE
    const revenuePerCollege = {};
    students.forEach(student => {
        if (!student.collegeName) return;
        const paid = student.enrolledCourses?.some(c => c.isPaid);
        if (paid) {
            revenuePerCollege[student.collegeName] =
                (revenuePerCollege[student.collegeName] || 0) + 200;
        }
    });


    // ================= REVENUE ANALYTICS =================

    // Revenue by Month (YYYY-MM)
    const revenueByMonth = {};
    paidEnrollments.forEach(enroll => {
        const date = new Date(enroll.createdAt || Date.now());
        const key = `${date.getFullYear()}-${date.getMonth() + 1}`;

        revenueByMonth[key] = (revenueByMonth[key] || 0) + 200;
    });

    // Revenue by Course
    const revenueByCourse = {};
    paidEnrollments.forEach(enroll => {
        const title = enroll.courseId?.title || 'Unknown Course';
        revenueByCourse[title] = (revenueByCourse[title] || 0) + 200;
    });

    // Revenue by College
    const revenueByCollege = {};
    students.forEach(student => {
        if (!student.collegeName) return;
        const paid = student.enrolledCourses?.some(c => c.isPaid);
        if (paid) {
            revenueByCollege[student.collegeName] =
                (revenueByCollege[student.collegeName] || 0) + 200;
        }
    });

    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null); // Track if editing a draft

    // Admin Secret
    const fetchColleges = async () => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/college/all`
            );
            setCollegesList(res.data);
        } catch (err) {
            console.error("Failed to fetch colleges", err);
        }
    };

    // ================= ADVANCED REVENUE INSIGHTS =================

    // Average revenue per paid student
    const avgRevenuePerStudent =
        PAID_STUDENTS > 0 ? Math.round(TOTAL_REVENUE / PAID_STUDENTS) : 0;

    // Best performing course
    const bestCourse = Object.entries(revenueByCourse)
        .sort((a, b) => b[1] - a[1])[0];

    // Best performing college
    const bestCollege = Object.entries(revenueByCollege)
        .sort((a, b) => b[1] - a[1])[0];

    // Sort months chronologically
    const sortedMonths = Object.entries(revenueByMonth).sort(
        (a, b) => new Date(a[0]) - new Date(b[0])
    );

    // Month-over-month growth
    let revenueGrowth = null;
    if (sortedMonths.length >= 2) {
        const last = sortedMonths[sortedMonths.length - 1][1];
        const prev = sortedMonths[sortedMonths.length - 2][1];
        revenueGrowth = prev > 0 ? Math.round(((last - prev) / prev) * 100) : 0;
    }

    // --- BUILDER STATE ---
    // FIX: Changed 'chapters' to 'modules' to match backend
    const [courseData, setCourseData] = useState({ title: '', description: '', price: 200, modules: [] });
    // 🔹 COURSE / INTERNSHIP SPLIT


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
        const module = courseData.modules[moduleIndex];

        // 🛡 Safety check (prevents crashes)
        if (!module || !module.topics || !module.topics[topicIndex]) {
            console.warn('Preview failed: topic not found');
            return;
        }

        const t = module.topics[topicIndex];

        setPreviewTopic({
            title: t.title,
            content: t.content || t.textContent || '',
            quiz: Array.isArray(t.quiz)
                ? t.quiz
                : Array.isArray(t.quizzes)
                    ? t.quizzes
                    : []
        });


        // 🔄 Always start from reading
        setPreviewStep('reading');
    };


    useEffect(() => {
        const adminData = JSON.parse(localStorage.getItem('admin'));

        if (!adminData || !adminData.role) {
            localStorage.clear();
            window.location.href = '/admin-login';
            return;
        }


        setAdminRole(adminData.role);
    }, []);

    useEffect(() => {
        if (adminRole === 'course_admin') {
            setActiveTab('courses');
        }
    }, [adminRole]);


    useEffect(() => {
        if (adminRole) {
            fetchData();
        } else {
            setLoading(false); // 🔑 SAFETY
        }
    }, [adminRole]);


    const fetchData = async () => {
        try {
            const courseRes = await adminAxios.get('/courses/admin/all');
            setCourses(courseRes.data);


            if (adminRole === 'super_admin' || adminRole === 'course_admin') {
                const aicteRes = await adminAxios.get('/admin-manage/aicte');
                setAicteList(aicteRes.data);
            }

            if (adminRole === 'super_admin') {
                const studentRes = await adminAxios.get('/admin/students');
                setStudents(studentRes.data);
            }

            setLoading(false);
        } catch (err) {
            console.error("Error loading admin data", err);
        }
    };



    const handleDeleteCourse = async (id) => {
        if (!confirm("Delete this course permanently?")) return;

        try {
            await adminAxios.delete(`/courses/${id}`);


            // 🔥 REMOVE FROM STATE IMMEDIATELY
            setCourses(prev => prev.filter(course => course._id !== id));

            alert("Course deleted successfully");
        } catch (err) {
            console.error(err);
            alert("Delete failed");
        }
    };

    const handleContinueEditing = (course) => {
        setEditingId(course._id);

        // This 'sanitizedModules' block is the "Translator"
        const sanitizedModules = (course.modules || []).map(m => ({
            ...m,
            topics: (m.topics || []).map(t => ({
                ...t, // 🔥 PRESERVE EVERYTHING
                textContent: t.textContent || '',
                quiz: Array.isArray(t.quiz)
                    ? t.quiz
                    : Array.isArray(t.quizzes)
                        ? t.quizzes
                        : []
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
        if (!currentTopic.title) return alert("Topic title required");

        const updatedModules = [...courseData.modules];

        const topicToSave = {
            title: currentTopic.title,
            textContent: currentTopic.content,
            quiz: currentTopic.quizzes   // 🔥 map correctly
        };


        if (editingTopic) {
            updatedModules[editingTopic.moduleIndex].topics[editingTopic.topicIndex] = topicToSave;
            setEditingTopic(null);
        } else {
            updatedModules[selectedModuleIndex].topics.push(topicToSave);
        }

        setCourseData({ ...courseData, modules: updatedModules });
        setCurrentTopic({ title: '', content: '', quizzes: [] });
    };

    const handleSaveDraft = async () => {
        try {
            // CREATE draft (first time)
            if (!editingId) {
                const res = await adminAxios.post('/courses/draft', courseData);
                setEditingId(res.data._id);
                alert('Draft saved successfully');
            }
            // UPDATE draft
            else {
                await adminAxios.put(`/courses/${editingId}/draft`, courseData);
                alert('Draft updated successfully');
            }

            fetchData(); // refresh course list
            setActiveTab('courses');
        } catch (err) {
            console.error(err);
            alert('Failed to save draft');
        }
        console.log(
            "SAVING COURSE PAYLOAD:",
            JSON.stringify(courseData.modules[0].topics[0].quiz, null, 2)
        );

    };

    const handlePublishCourse = async () => {
        if (!editingId) {
            alert('Please save draft before publishing');
            return;
        }

        try {
            await adminAxios.put(`/courses/${editingId}/publish`);
            alert('Course published successfully');

            // reset builder
            setCourseData({ title: '', description: '', price: 200, modules: [] });
            setEditingId(null);

            fetchData();
            setActiveTab('courses');
        } catch (err) {
            console.error(err);
            alert('Failed to publish course');
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
        setEditingTopic(null); // safety
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
        const t = courseData.modules[moduleIndex].topics[topicIndex];

        setCurrentTopic({
            title: t.title,
            content: t.content || t.textContent || '',
            quizzes: t.quiz || t.quizzes || []

        });

        setSelectedModuleIndex(moduleIndex);

        // ❌ DO NOT DELETE HERE
        // deleteTopic(moduleIndex, topicIndex);

        // Track editing
        setEditingTopic({ moduleIndex, topicIndex });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // REPLACE: const [newCollegeName, setNewCollegeName] = useState('');
    // WITH THIS 👇
    const [newCollege, setNewCollege] = useState({ name: '', hodEmail: '', hodPassword: '' });

    const handleCreateCollege = async () => {
        if (!newCollege.name) {
            alert("Please fill in the College Name");
            return;
        }

        try {
            await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/college/add`,
                { name: newCollege.name }
            );

            alert('College Created Successfully!');
            setNewCollege({ name: '', hodEmail: '', hodPassword: '' });

            // ✅ REFRESH UI
            fetchColleges();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Error creating college');
        }
    };

    const [collegesList, setCollegesList] = useState([]);
    const [targetCollegeId, setTargetCollegeId] = useState('');
    const [newCourse, setNewCourse] = useState({ name: '', start: '', end: '' });



    const handleEditCollege = async (collegeId, currentName) => {
        const newName = prompt("Enter new College Name:", currentName);
        if (!newName || newName === currentName) return;

        try {
            await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/college/update/${collegeId}`,
                { name: newName }
            );
            alert("College Name Updated!");
            const res = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/college/all`
            );

            setCollegesList(res.data);
        } catch (err) {
            alert("Error updating college");
        }
    };

    const handleEditCourse = async (collegeId, courseId, currentName) => {
        const newName = prompt("Enter new Department Name:", currentName);
        if (!newName || newName === currentName) return;

        try {
            await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/college/update-course`,
                {

                    collegeId,
                    courseId,
                    newName
                });
            alert("Department Updated!");
            const res = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/college/all`
            );

            setCollegesList(res.data);
        } catch (err) {
            alert("Error updating department");
        }
    };

    // const handleCreateCollege = async () => {
    //     try {
    //         
    //         setCollegesList(res.data);
    //         setNewCollegeName('');
    //     } catch (err) { console.error(err); }
    // };
    const handleGenerateRolls = async () => {
        if (!targetCollegeId || !newCourse.name || !newCourse.start || !newCourse.end || !newCourse.hodEmail || !newCourse.hodPassword) {
            alert("Please fill all fields including HOD details");
            return;
        }

        try {
            await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/college/add-course`,
                {
                    collegeId: targetCollegeId,
                    courseName: newCourse.name,
                    startRoll: newCourse.start,
                    endRoll: newCourse.end,
                    hodEmail: newCourse.hodEmail,
                    hodPassword: newCourse.hodPassword
                }
            );

            alert("Department Added Successfully!");

            // ✅ REFRESH UI
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
    // const [activeTab, setActiveTab] = useState('overview');
    // If you already have activeTab, just ensure 'submissions' is handled
    // --- SUBMISSIONS LOGIC END ---
    if (loading) {
        return <div className="p-10 text-center">Loading admin dashboard...</div>;
    }

    return (

        <div className="flex h-screen bg-slate-100 font-sans">

            {/* --- SIDEBAR --- */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-2xl font-bold text-yellow-400">DT Admin</h1>
                    <p className="text-xs text-slate-400 mt-1">Super Admin Panel</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {/* SUPER ADMIN SIDEBAR */}
                    {adminRole === 'super_admin' && (
                        <>
                            <button onClick={() => setActiveTab('overview')}
                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800">
                                <LayoutDashboard size={20} /> Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('revenue')}
                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800"
                            >
                                💰 Revenue Analytics
                            </button>


                            <button onClick={() => setActiveTab('students')}
                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800">
                                <Users size={20} /> Students List
                            </button>
                            <button
                                onClick={() => setActiveTab('aicte')}
                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800"
                            >
                                AICTE Internship IDs
                            </button>


                            <button onClick={() => setActiveTab('colleges')}
                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800">
                                <FolderPlus size={20} /> Manage Colleges
                            </button>

                            
                            <button
                                onClick={() => navigate('/admin/manage-admins')}
                                className="w-full flex items-center gap-3 p-3 rounded-lg text-slate-400 hover:bg-slate-800"
                            >
                                Manage Course Admins
                            </button>

                        </>
                    )}

                    {/* COURSE ADMIN SIDEBAR */}
                    {adminRole === 'course_admin' && (
                        <>
                            <button onClick={() => setActiveTab('courses')}
                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800">
                                <BookOpen size={20} /> Manage Courses
                            </button>

                            <button onClick={() => setActiveTab('create')}
                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800">
                                <PlusCircle size={20} /> Create Course
                            </button>
                            <button
                                onClick={() => setActiveTab('aicte')}
                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800"
                            >
                                AICTE Internship IDs
                            </button>

                        </>
                    )}

                </nav>

                <div className="p-4 border-t border-slate-800">

                    <button
                        onClick={() => {
                            localStorage.clear();

                            window.location.href = '/admin-login';
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded"
                    >
                        Logout
                    </button>

                </div>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            <main className="flex-1 overflow-y-auto p-8">

                {/* VIEW 1: OVERVIEW */}
                {adminRole === 'super_admin' && activeTab === 'overview' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <StatsCard
                                title="Total Students"
                                value={students.length}
                                color="border-blue-500"
                                icon={Users}
                            />

                            <StatsCard
                                title="Total Revenue"
                                value={`₹${TOTAL_REVENUE}`}
                                color="border-green-500"
                                icon={Users}
                            />

                            <StatsCard
                                title="Paid Students"
                                value={PAID_STUDENTS}
                                color="border-emerald-500"
                                icon={CheckCircle}
                            />

                            <StatsCard
                                title="Unpaid Students"
                                value={UNPAID_COUNT}
                                color="border-yellow-500"
                                icon={Lock}
                            />
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h3 className="font-bold text-lg mb-4">Revenue per Course</h3>

                            {Object.keys(revenuePerCourse).length === 0 ? (
                                <p className="text-slate-500 italic">No revenue yet.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {Object.entries(revenuePerCourse).map(([course, amount]) => (
                                        <li
                                            key={course}
                                            className="flex justify-between items-center border-b pb-2"
                                        >
                                            <span className="font-medium text-slate-700">{course}</span>
                                            <span className="font-bold text-green-600">₹{amount}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Revenue per College */}
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h3 className="font-bold text-lg mb-4">Revenue per College</h3>

                            {Object.keys(revenuePerCollege).length === 0 ? (
                                <p className="text-slate-500 italic">No revenue yet.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {Object.entries(revenuePerCollege).map(([college, amount]) => (
                                        <li
                                            key={college}
                                            className="flex justify-between items-center border-b pb-2"
                                        >
                                            <span className="font-medium text-slate-700">{college}</span>
                                            <span className="font-bold text-green-600">₹{amount}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>



                    </div>
                )}
                {/* VIEW: REVENUE ANALYTICS */}
                {adminRole === 'super_admin' && activeTab === 'revenue' && (
                    <div className="space-y-10">

                        {/* HEADER */}
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Revenue Analytics</h2>
                            <p className="text-slate-500 text-sm">
                                Business-level revenue insights (auto calculated)
                            </p>
                        </div>

                        {/* KPI CARDS */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <p className="text-xs font-bold text-slate-500 uppercase">Total Revenue</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">₹{TOTAL_REVENUE}</p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <p className="text-xs font-bold text-slate-500 uppercase">Paid Students</p>
                                <p className="text-3xl font-bold text-slate-800 mt-2">{PAID_STUDENTS}</p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <p className="text-xs font-bold text-slate-500 uppercase">
                                    Avg / Student
                                </p>
                                <p className="text-3xl font-bold text-blue-600 mt-2">
                                    ₹{avgRevenuePerStudent}
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <p className="text-xs font-bold text-slate-500 uppercase">
                                    Monthly Growth
                                </p>
                                <p className={`text-3xl font-bold mt-2 ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {revenueGrowth !== null ? `${revenueGrowth}%` : '—'}
                                </p>
                            </div>
                        </div>

                        {/* BEST PERFORMERS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h3 className="font-bold text-lg mb-2">🏆 Top Course</h3>
                                {bestCourse ? (
                                    <p className="text-slate-700">
                                        <b>{bestCourse[0]}</b> — ₹{bestCourse[1]}
                                    </p>
                                ) : (
                                    <p className="text-slate-400 italic">No data yet</p>
                                )}
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h3 className="font-bold text-lg mb-2">🏫 Top College</h3>
                                {bestCollege ? (
                                    <p className="text-slate-700">
                                        <b>{bestCollege[0]}</b> — ₹{bestCollege[1]}
                                    </p>
                                ) : (
                                    <p className="text-slate-400 italic">No data yet</p>
                                )}
                            </div>
                        </div>

                        {/* REVENUE BY MONTH */}
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h3 className="font-bold text-lg mb-4">Revenue by Month</h3>

                            {sortedMonths.length === 0 ? (
                                <p className="text-slate-500 italic">No revenue yet.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {sortedMonths.map(([month, amount]) => (
                                        <li key={month} className="flex justify-between border-b pb-2">
                                            <span className="text-slate-600">{month}</span>
                                            <span className="font-bold text-green-600">₹{amount}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* REVENUE SPLIT */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h3 className="font-bold text-lg mb-4">Revenue by Course</h3>
                                <ul className="space-y-2">
                                    {Object.entries(revenueByCourse).map(([course, amount]) => (
                                        <li key={course} className="flex justify-between border-b pb-2">
                                            <span className="text-slate-600">{course}</span>
                                            <span className="font-bold text-green-600">₹{amount}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h3 className="font-bold text-lg mb-4">Revenue by College</h3>
                                <ul className="space-y-2">
                                    {Object.entries(revenueByCollege).map(([college, amount]) => (
                                        <li key={college} className="flex justify-between border-b pb-2">
                                            <span className="text-slate-600">{college}</span>
                                            <span className="font-bold text-green-600">₹{amount}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                        </div>
                    </div>
                )}


                {/* VIEW 2: STUDENTS LIST */}
                {adminRole === 'super_admin' && activeTab === 'students' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-slate-800">Enrolled Students</h2>
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b">
                                    <tr>
                                        <th className="p-4 font-bold text-slate-600">Name</th>
                                        <th className="p-4 font-bold text-slate-600">College</th>
                                        <th className="p-4 font-bold text-slate-600">Email</th>
                                        <th className="p-4 font-bold text-slate-600">Payment</th>
                                        <th className="p-4 font-bold text-slate-600">Course</th>
                                        <th className="p-4 font-bold text-slate-600">AICTE / Verify</th>

                                        <th className="p-4 font-bold text-slate-600">Internship</th>
                                        <th className="p-4 font-bold text-slate-600">Certificate</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {students.map(student => {
                                        const enrollment = student.enrolledCourses?.[0]; // single course assumption

                                        const courseCompleted = enrollment?.courseCompleted;
                                        const aicteVerified = enrollment?.aicteVerified;
                                        const internshipUnlocked = enrollment?.internshipUnlocked;
                                        const internshipCompleted = enrollment?.internshipCompleted;
                                        const certificateIssued = internshipCompleted; // simple rule

                                        return (
                                            <tr key={student._id} className="border-b hover:bg-slate-50">
                                                {/* NAME */}
                                                <td className="p-4 font-bold text-slate-800">{student.name}</td>

                                                {/* COLLEGE */}
                                                <td className="p-4 text-sm text-slate-600">{student.collegeName}</td>

                                                {/* EMAIL */}
                                                <td className="p-4 text-sm text-slate-500">{student.email}</td>

                                                {/* PAYMENT */}
                                                <td className="p-4">
                                                    {enrollment?.isPaid ? (
                                                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-bold">
                                                            Paid
                                                        </span>
                                                    ) : (
                                                        <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded font-bold">
                                                            Unpaid
                                                        </span>
                                                    )}
                                                </td>

                                                {/* COURSE COMPLETED */}
                                                <td className="p-4">
                                                    {courseCompleted ? '✅' : '❌'}
                                                </td>

                                                {/* AICTE VERIFIED */}
                                                <td className="p-4 space-y-1">
                                                    <div>
                                                        {aicteVerified ? '✅ Verified' : '❌ Not Verified'}
                                                    </div>
                                                    {aicteVerified ? (
                                                        <span className="text-green-600 font-bold text-xs">
                                                            Verified (Auto)
                                                        </span>
                                                    ) : enrollment?.aicteInternshipId ? (
                                                        <span className="text-yellow-600 text-xs">
                                                            Submitted (Pending Match)
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 text-xs italic">
                                                            Not Submitted
                                                        </span>
                                                    )}

                                                    {!enrollment?.aicteInternshipId && (
                                                        <span className="text-xs text-slate-400 italic">
                                                            ID not submitted
                                                        </span>
                                                    )}
                                                </td>


                                                {/* INTERNSHIP STATUS */}
                                                <td className="p-4">
                                                    {!internshipUnlocked && '🔒 Locked'}
                                                    {internshipUnlocked && !internshipCompleted && '🟡 Ongoing'}
                                                    {internshipCompleted && '🟢 Completed'}
                                                </td>

                                                {/* CERTIFICATE */}
                                                <td className="p-4">
                                                    {certificateIssued ? '🎓 Issued' : '—'}
                                                </td>
                                            </tr>
                                        );
                                    })}

                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* VIEW 3: MANAGE COURSES */}
                {adminRole === 'course_admin' && activeTab === 'courses' && (
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
                {adminRole === 'course_admin' && activeTab === 'create' && (
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
                                        <div className="flex gap-3 mt-2 text-xs font-bold">
                                            <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200">
                                                🟦 COURSE → Learning Phase
                                            </span>
                                            <span className="flex items-center gap-1 bg-yellow-50 text-yellow-800 px-2 py-1 rounded border border-yellow-300">
                                                🟨 INTERNSHIP → Practical Phase
                                            </span>
                                        </div>

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
                                                {/* LEFT SIDE: Module info */}
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {/* Module number */}
                                                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                        Module {i + 1}
                                                    </span>

                                                    {/* Module title */}
                                                    <span className="font-bold text-slate-800">{c.title}</span>

                                                    {/* COURSE / INTERNSHIP BADGE */}
                                                    {i < 5 ? (
                                                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full border border-blue-200">
                                                            🟦 COURSE
                                                        </span>
                                                    ) : (
                                                        <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full border border-yellow-300">
                                                            🟨 INTERNSHIP
                                                        </span>
                                                    )}
                                                </div>

                                                {/* RIGHT SIDE: Delete button */}
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

                                                                {(t.content || t.textContent) && (
                                                                    <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-1.5 rounded">
                                                                        <FileText size={12} /> Notes
                                                                    </span>
                                                                )}

                                                                {(t.quiz || t.quizzes)?.length > 0 && (
                                                                    <span className="flex items-center gap-1 text-green-700 bg-green-100 px-1.5 rounded font-medium">
                                                                        <HelpCircle size={12} /> {(t.quiz || t.quizzes).length} Questions
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
                                        {/* SAVE DRAFT BUTTON */}
                                        <button
                                            onClick={handleSaveDraft}
                                            className="flex-1 bg-slate-200 text-slate-800 py-3 rounded-xl font-bold text-lg hover:bg-slate-300 transition flex items-center justify-center gap-2"
                                        >
                                            <Save size={20} /> Save Draft
                                        </button>

                                        {/* PUBLISH BUTTON */}
                                        <button
                                            onClick={handlePublishCourse}
                                            className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold text-lg shadow-md hover:bg-green-700 hover:shadow-lg transition flex items-center justify-center gap-2"
                                        >
                                            <School size={20} /> Publish Course
                                        </button>

                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {(adminRole === 'super_admin' || adminRole === 'course_admin') && activeTab === 'aicte' && (

                    <div className="space-y-8">
                        <h2 className="text-2xl font-bold text-slate-800">
                            AICTE Internship IDs
                        </h2>

                        {/* ADD AICTE ID FORM */}
                        <div className="bg-white p-6 rounded-xl shadow border">
                            <h3 className="font-bold mb-4">Add AICTE Internship ID</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input
                                    type="email"
                                    placeholder="Student Email"
                                    value={aicteForm.email}
                                    onChange={(e) =>
                                        setAicteForm({ ...aicteForm, email: e.target.value })
                                    }
                                    className="border p-3 rounded-lg"
                                />

                                <select
                                    value={aicteForm.courseId}
                                    onChange={(e) =>
                                        setAicteForm({ ...aicteForm, courseId: e.target.value })
                                    }
                                    className="border p-3 rounded-lg"
                                >
                                    <option value="">Select Course</option>
                                    {courses.map((c) => (
                                        <option key={c._id} value={c._id}>
                                            {c.title}
                                        </option>
                                    ))}
                                </select>

                                <input
                                    type="text"
                                    placeholder="AICTE Internship ID"
                                    value={aicteForm.aicteInternshipId}
                                    onChange={(e) =>
                                        setAicteForm({
                                            ...aicteForm,
                                            aicteInternshipId: e.target.value
                                        })
                                    }
                                    className="border p-3 rounded-lg"
                                />
                            </div>

                            <button
                                onClick={async () => {
                                    try {
                                        await adminAxios.post('/admin-manage/aicte/add', aicteForm);

                                        alert('AICTE ID added');
                                        setAicteForm({ email: '', courseId: '', aicteInternshipId: '' });
                                        const res = await adminAxios.get('/admin-manage/aicte');
                                        setAicteList(res.data);

                                    } catch (err) {
                                        alert(err.response?.data?.message || 'Failed to add AICTE ID');
                                    }
                                }}
                                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold"
                            >
                                Add AICTE ID
                            </button>
                        </div>

                        {/* AICTE IDS TABLE */}
                        <div className="bg-white rounded-xl shadow overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b">
                                    <tr>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Course</th>
                                        <th className="p-4">AICTE ID</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Used By</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {aicteList
                                        .filter(row =>
                                            adminRole === 'super_admin'
                                                ? true
                                                : courses.some(c => c._id === row.courseId)
                                        )
                                        .map((row) => (

                                            <tr key={row._id} className="border-b">
                                                <td className="p-4">{row.email}</td>
                                                <td className="p-4">{row.course}</td>
                                                <td className="p-4 font-mono text-sm">
                                                    {row.aicteInternshipId}
                                                </td>
                                                <td className="p-4">
                                                    {row.status === 'Unused' ? (
                                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                                                            Unused
                                                        </span>
                                                    ) : (
                                                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                                                            Used
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-sm">
                                                    {row.usedBy || '—'}
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* VIEW 5: COLLEGE MANAGEMENT */}
                {adminRole === 'super_admin' && activeTab === 'colleges' && (
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
                                <button
                                    onClick={() => {
                                        setPreviewTopic(null);
                                        setPreviewStep('reading');
                                    }}
                                    className="hover:bg-slate-700 p-2 rounded-full transition"
                                >
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
                                                    {/* ✅ SMALL UX HINT (SAFE ADDITION) */}
                                                    {previewTopic.quiz && previewTopic.quiz.length > 0 && (
                                                        <p className="text-sm text-slate-500 mb-6">
                                                            📘 This topic has <b>{previewTopic.quiz.length}</b> quiz questions after reading.
                                                        </p>
                                                    )}

                                                    <div className="flex justify-end pt-6 border-t border-slate-100">
                                                        {previewTopic.quiz && previewTopic.quiz.length > 0 ? (
                                                            // ✅ CASE 1: Quiz exists
                                                            <button
                                                                onClick={() => setPreviewStep('quiz')}
                                                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition shadow-lg shadow-blue-200"
                                                            >
                                                                Proceed to Quiz <ChevronRight size={20} />
                                                            </button>
                                                        ) : (
                                                            // ✅ CASE 2: NO quiz (preview-only completion)
                                                            <button
                                                                onClick={() => {
                                                                    // Preview only → simulate completion
                                                                    setPreviewStep('reading');
                                                                    alert('✅ Topic completed (Preview)');
                                                                }}
                                                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold transition shadow-lg shadow-green-200"
                                                            >
                                                                Mark Topic as Complete <CheckCircle size={20} />
                                                            </button>
                                                        )}
                                                    </div>

                                                </div>
                                            )}



                                            {/* STEP 3: QUIZ */}
                                            {previewStep === 'quiz' && (
                                                <div className="animate-in slide-in-from-right duration-300">
                                                    {previewTopic.quiz && previewTopic.quiz.length > 0 ? (
                                                        <PreviewQuizInterface
                                                            questions={previewTopic.quiz}
                                                            onBack={() => setPreviewStep('reading')}
                                                        />
                                                    ) : (

                                                        <div className="text-center py-10">
                                                            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                                                <Lock size={32} />
                                                            </div>
                                                            <h3 className="text-xl font-bold text-slate-800">No Quiz Available</h3>
                                                            <p className="text-slate-500 mt-2 mb-6">You haven't added any questions to this topic yet.</p>
                                                            <button onClick={() => setPreviewStep('reading')}>
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
    const steps = ['reading', 'quiz'];

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