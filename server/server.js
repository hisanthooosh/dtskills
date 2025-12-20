require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // For password security
const collegeRoutes = require('./routes/college');

const app = express();
app.use(express.json());
app.use(cors());

// --- DATABASE ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Error:", err));

// --- MODELS ---

// 1. Student Model (Updated for Password & Multiple Courses)
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  collegeName: { type: String, required: true },
  role: { type: String, default: 'student' }, // <--- NEW: 'student' or 'admin'
  enrolledCourses: [{
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    completedChapters: { type: Number, default: 0 },
    isPaid: { type: Boolean, default: false },
    enrolledAt: { type: Date, default: Date.now }
  }]
});

// 2. Course Model
const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: { type: Number, default: 200 },
  chapters: [{
    title: String, // e.g., "Module 1: Introduction"
    topics: [{     // e.g., "1.1 Setting up Environment"
      title: String,
      video: String,   // YouTube Link
      content: String, // Lecture Notes
      quizzes: [{  // <--- Changed to Array (Plural)
        question: String,
        options: [String],
        correctAnswer: Number
      }]
    }]
  }]
});

const Student = mongoose.model('Student', studentSchema);
const Course = mongoose.model('Course', courseSchema);

// --- AUTH ROUTES ---

// 1. REGISTER
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, collegeName } = req.body;
  
  // Check if user exists
  const existingUser = await Student.findOne({ email });
  if (existingUser) return res.status(400).json({ message: "Email already exists" });

  // Hash Password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create User
  const student = await Student.create({
    name, email, password: hashedPassword, collegeName, enrolledCourses: []
  });

  res.json({ message: "Registration Successful", studentId: student._id });
});

// 2. LOGIN
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  // Find User
  const student = await Student.findOne({ email });
  if (!student) return res.status(400).json({ message: "User not found" });

  // Check Password
  const isMatch = await bcrypt.compare(password, student.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

  // Return User Data (excluding password)
  res.json({
    _id: student._id,
    name: student.name,
    email: student.email,
    collegeName: student.collegeName
  });
});

// --- DATA ROUTES ---

// Get All Courses (Catalog)
app.get('/api/courses', async (req, res) => {
  const courses = await Course.find();
  res.json(courses);
});

// Get My Profile (With Enrolled Courses)
app.get('/api/student/:id', async (req, res) => {
  const student = await Student.findById(req.params.id).populate('enrolledCourses.courseId');
  res.json(student);
});

// Enroll in a Course (Free registration, payment happens later)
app.post('/api/student/enroll', async (req, res) => {
  const { studentId, courseId } = req.body;
  
  const student = await Student.findById(studentId);
  
  // Check if already enrolled
  const isEnrolled = student.enrolledCourses.find(c => c.courseId.toString() === courseId);
  if (isEnrolled) return res.json({ message: "Already enrolled" });

  student.enrolledCourses.push({ courseId });
  await student.save();
  
  res.json(student);
});

// Seed Dummy Courses (For Admin)
app.get('/api/seed', async (req, res) => {
  await Course.deleteMany({}); // Clear old data
  await Course.create([
    { 
      title: "MERN Stack Internship", 
      description: "Full Stack Web Development with React & Node.",
      chapters: [{ title: "Intro", content: "Welcome..." }] 
    },
    { 
      title: "Python AI/ML Internship", 
      description: "Learn Machine Learning basics and build a model.",
      chapters: [{ title: "Intro to AI", content: "AI is..." }] 
    }
  ]);
  res.json({ message: "2 Dummy Courses Created" });
});
// --- ADMIN ROUTES ---

// 1. Create a New Course
app.post('/api/admin/course', async (req, res) => {
  const { title, description, price, chapters, adminSecret } = req.body;
  
  // Simple Security Check (In real app, use JWT)
  if (adminSecret !== "doneswari_admin_2025") {
    return res.status(403).json({ message: "Unauthorized: Wrong Secret Key" });
  }

  const newCourse = await Course.create({
    title,
    description,
    price,
    chapters // Expecting array of objects
  });

  res.json(newCourse);
});

// 2. Delete a Course
app.delete('/api/admin/course/:id', async (req, res) => {
  const { adminSecret } = req.body;
  if (adminSecret !== "doneswari_admin_2025") return res.status(403).json({ message: "Unauthorized" });
  
  await Course.findByIdAndDelete(req.params.id);
  res.json({ message: "Course Deleted" });
});

// 3. Get All Students (For HOD Report)
app.post('/api/admin/students', async (req, res) => {
  const { adminSecret } = req.body;
  if (adminSecret !== "doneswari_admin_2025") return res.status(403).json({ message: "Unauthorized" });

  const students = await Student.find().select('-password'); // Don't show passwords
  res.json(students);
});

app.use('/api/college', collegeRoutes);
app.listen(5000, () => console.log("🚀 Server running on Port 5000"));