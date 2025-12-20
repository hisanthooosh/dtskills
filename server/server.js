require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- IMPORT MODELS ---
const User = require('./models/User');     // Replaces inline Student model
const Course = require('./models/Course'); // Replaces inline Course model

// --- IMPORT ROUTES ---
const authRoutes = require('./routes/auth');       // Handles /register and /login
const collegeRoutes = require('./routes/college'); // Handles college data

const app = express();

// --- MIDDLEWARE ---
app.use(express.json());
app.use(cors());

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Error:", err));

// --- MOUNT MODULAR ROUTES ---
// This single line replaces the 40 lines of register/login code you had before
app.use('/api/auth', authRoutes);       
app.use('/api/college', collegeRoutes); 

// --- PUBLIC DATA ROUTES ---

// Get All Courses (Catalog)
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Seed Dummy Courses (For testing)
app.get('/api/seed', async (req, res) => {
  await Course.deleteMany({}); 
  await Course.create([
    { 
      title: "MERN Stack Internship", 
      description: "Full Stack Web Development with React & Node.",
      chapters: [{ title: "Intro", topics: [{ title: "Welcome" }] }] 
    },
    { 
      title: "Python AI/ML Internship", 
      description: "Learn Machine Learning basics.",
      chapters: [{ title: "Intro to AI", topics: [{ title: "What is AI?" }] }] 
    }
  ]);
  res.json({ message: "2 Dummy Courses Created" });
});

// --- STUDENT ROUTES ---

// Get My Profile (With Enrolled Courses)
app.get('/api/student/:id', async (req, res) => {
  try {
    // We use 'User' now instead of 'Student'
    const student = await User.findById(req.params.id).populate('enrolledCourses.courseId');
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Enroll in a Course
app.post('/api/student/enroll', async (req, res) => {
  const { studentId, courseId } = req.body;
  
  const student = await User.findById(studentId);
  
  // Check if already enrolled
  const isEnrolled = student.enrolledCourses.find(c => c.courseId.toString() === courseId);
  if (isEnrolled) return res.json({ message: "Already enrolled" });

  student.enrolledCourses.push({ courseId });
  await student.save();
  
  res.json(student);
});

// --- ADMIN ROUTES (Restored from your old file) ---

// 1. Create a New Course
app.post('/api/admin/course', async (req, res) => {
  const { title, description, price, chapters, adminSecret } = req.body;
  
  // Simple Security Check
  if (adminSecret !== "doneswari_admin_2025") {
    return res.status(403).json({ message: "Unauthorized: Wrong Secret Key" });
  }

  const newCourse = await Course.create({
    title,
    description,
    price,
    chapters
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

  const students = await User.find({ role: 'student' }).select('-password');
  res.json(students);
});

// --- SERVER START ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on Port ${PORT}`));