require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- IMPORT MODELS ---
const User = require('./models/User');
const Course = require('./models/Course');

const submissionRoutes = require('./routes/submissions.js'); // ✅ USE THIS

// --- IMPORT ROUTES ---
const authRoutes = require('./routes/auth');
const collegeRoutes = require('./routes/college');
const courseRoutes = require('./routes/course'); // Fixed typo here
const studentRoutes = require('./routes/student'); // <--- 1. ADD THIS IMPORT

const app = express();

// --- MIDDLEWARE ---
app.use(express.json());
app.use(cors());

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Error:", err));

// --- MOUNT MODULAR ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/college', collegeRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/internship', require('./routes/internship'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/certificates', require('./routes/certificates'));





// --- PUBLIC DATA ROUTES ---



// Seed Dummy Courses (UPDATED: Uses correct 'modules' structure)
app.get('/api/seed', async (req, res) => {
  try {
    await Course.deleteMany({});
    
    await Course.create([
      { 
        title: "MERN Stack Internship", 
        description: "Full Stack Web Development with React & Node.",
        thumbnail: "https://via.placeholder.com/150",
        price: 0,
        modules: [
          { 
            title: "Introduction", 
            topics: [
              { 
                title: "Welcome to MERN", 
                textContent: "The MERN stack consists of MongoDB, Express, React, and Node.js. It is one of the most popular stacks for building full-stack web applications.",
                youtubeLinks: [
                  { title: "MERN Stack in 100 Seconds", url: "https://www.youtube.com/watch?v=98BzS5Oz5E4" }
                ],
                quiz: [
                  {
                    question: "What does the 'R' stand for in MERN?",
                    options: ["Ruby", "React", "Rust", "Redis"],
                    correctAnswer: 1
                  }
                ]
              }
            ] 
          }
        ] 
      },
      { 
        title: "Python AI/ML Internship", 
        description: "Learn Machine Learning basics.",
        thumbnail: "https://via.placeholder.com/150",
        price: 0,
        modules: [
          { 
            title: "Intro to AI", 
            topics: [
              { 
                title: "What is AI?", 
                textContent: "Artificial Intelligence (AI) refers to the simulation of human intelligence in machines.",
                youtubeLinks: [],
                quiz: []
              }
            ] 
          }
        ] 
      }
    ]);
    res.json({ message: "✅ Database Seeded Successfully with Correct Data!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- STUDENT ROUTES ---

// Get My Profile (With Enrolled Courses)
app.get('/api/student/:id', async (req, res) => {
  try {
    const student = await User.findById(req.params.id).populate('enrolledCourses.courseId');
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Enroll in a Course
app.post('/api/student/enroll', async (req, res) => {
  const { studentId, courseId } = req.body;
  
  try {
    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Check if already enrolled
    const isEnrolled = student.enrolledCourses.find(c => c.courseId.toString() === courseId);
    if (isEnrolled) return res.json({ message: "Already enrolled" });

    student.enrolledCourses.push({ courseId });
    await student.save();
    
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADMIN ROUTES ---

// 1. Create a New Course
app.post('/api/admin/course', async (req, res) => {
  const { title, description, price, modules, adminSecret } = req.body;
  
  if (adminSecret !== "doneswari_admin_2025") {
    return res.status(403).json({ message: "Unauthorized: Wrong Secret Key" });
  }

  const newCourse = await Course.create({
    title,
    description,
    price,
    modules
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

// 3. Get All Students
app.post('/api/admin/students', async (req, res) => {
  const { adminSecret } = req.body;
  if (adminSecret !== "doneswari_admin_2025") return res.status(403).json({ message: "Unauthorized" });

  const students = await User.find({ role: 'student' }).select('-password');
  res.json(students);
});
// =============================================================
// 👇 PASTE THIS BLOCK AT THE BOTTOM OF SERVER.JS (Before app.listen)
// =============================================================

app.get('/api/reset-colleges', async (req, res) => {
  try {
    // This forcibly drops the collection to clear the bad "hodEmail" index
    await mongoose.connection.collection('colleges').drop();
    res.send("✅ SUCCESS: Database Cleaned! Go back to Admin Dashboard and create the College again.");
  } catch (err) {
    if (err.code === 26) {
      res.send("✅ Collection was already empty (Nothing to delete). You are good to go!");
    } else {
      res.status(500).send("Error: " + err.message);
    }
  }
});

// =============================================================
// 👆 END OF PASTE
// =============================================================

// const PORT = ... (Your existing code starts here)
// app.listen(...)
// --- SERVER START ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on Port ${PORT}`));