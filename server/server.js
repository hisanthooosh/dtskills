require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- IMPORT MODELS ---
const User = require('./models/User');
const Course = require('./models/Course');

// --- IMPORT ROUTES ---
const submissionRoutes = require('./routes/submissions.js');
const authRoutes = require('./routes/auth');
const collegeRoutes = require('./routes/college');
const courseRoutes = require('./routes/course');
const studentRoutes = require('./routes/student');
const adminAuthRoutes = require('./routes/adminAuth');

// ✅ AUTH MIDDLEWARE (DO NOT REMOVE)
const adminAuth = require('./middleware/adminAuth');
const requireRole = require('./middleware/adminRole');

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
app.use('/api/college', collegeRoutes);       // 🔒 PROTECTED INSIDE FILE
app.use('/api/courses', courseRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/submissions', submissionRoutes); // 🔒 PROTECTED INSIDE FILE
app.use('/api/internship', require('./routes/internship'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/admin-auth', adminAuthRoutes);
app.use('/api/admin-manage', require('./routes/adminManage'));

// --- PUBLIC DATA ROUTES ---

// Seed Dummy Courses
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
                textContent:
                  "The MERN stack consists of MongoDB, Express, React, and Node.js.",
                youtubeLinks: [
                  {
                    title: "MERN Stack in 100 Seconds",
                    url: "https://www.youtube.com/watch?v=98BzS5Oz5E4"
                  }
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
                textContent:
                  "Artificial Intelligence refers to the simulation of human intelligence in machines.",
                youtubeLinks: [],
                quiz: []
              }
            ]
          }
        ]
      }
    ]);

    res.json({ message: "✅ Database Seeded Successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- STUDENT ROUTES ---

app.get('/api/student/:id', async (req, res) => {
  try {
    const student = await User.findById(req.params.id)
      .populate('enrolledCourses.courseId');
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/student/enroll', async (req, res) => {
  const { studentId, courseId } = req.body;

  try {
    const student = await User.findById(studentId);
    if (!student)
      return res.status(404).json({ message: "Student not found" });

    const isEnrolled = student.enrolledCourses.find(
      c => c.courseId.toString() === courseId
    );
    if (isEnrolled)
      return res.json({ message: "Already enrolled" });

    student.enrolledCourses.push({ courseId });
    await student.save();

    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADMIN ROUTES ---

// 🔒 SUPER ADMIN ONLY
app.post(
  '/api/admin/students',
  adminAuth,
  requireRole(['super_admin']),
  async (req, res) => {
    const students = await User.find({ role: 'student' })
      .select('-password');
    res.json(students);
  }
);

// --- DB FIX ROUTE (SAFE) ---
app.get('/api/reset-colleges', async (req, res) => {
  try {
    await mongoose.connection.collection('colleges').drop();
    res.send("✅ Colleges collection reset successfully");
  } catch (err) {
    if (err.code === 26) {
      res.send("✅ No collection found. Nothing to reset.");
    } else {
      res.status(500).send("Error: " + err.message);
    }
  }
});

// --- SERVER START ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on Port ${PORT}`)
);
