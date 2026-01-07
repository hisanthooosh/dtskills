require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- IMPORT MODELS ---
const User = require('./models/User');
const Course = require('./models/Course');

// --- IMPORT ROUTES ---
const authRoutes = require('./routes/auth');
const collegeRoutes = require('./routes/college');
const courseRoutes = require('./routes/course');
const studentRoutes = require('./routes/student');
const submissionRoutes = require('./routes/submissions');
const adminAuthRoutes = require('./routes/adminAuth');
const adminManageRoutes = require('./routes/adminManage');
const internshipRoutes = require('./routes/internship');
const documentRoutes = require('./routes/documents');
const certificateRoutes = require('./routes/certificates');

// --- AUTH MIDDLEWARE ---
const adminAuth = require('./middleware/adminAuth');
const requireRole = require('./middleware/adminRole');

const app = express();

// --- GLOBAL MIDDLEWARE ---
app.use(express.json());
app.use(cors());

// --- DATABASE CONNECTION ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// --- ROUTE MOUNTS ---
app.use('/api/auth', authRoutes);
app.use('/api/admin-auth', adminAuthRoutes);
app.use('/api/admin-manage', adminManageRoutes);

app.use('/api/college', collegeRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/internship', internshipRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/certificates', certificateRoutes);

// --- SUPER ADMIN ROUTE: GET ALL STUDENTS ---
app.get(
  '/api/admin/students',
  adminAuth,
  requireRole(['super_admin']),
  async (req, res) => {
    try {
      const students = await User.find({ role: 'student' })
        .select('-password')
        .populate('enrolledCourses.courseId');

      res.json(students);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// --- SEED ROUTE (OPTIONAL / DEV ONLY) ---
app.get('/api/seed', async (req, res) => {
  try {
    await Course.deleteMany({});

    await Course.create([
      {
        title: 'MERN Stack Internship',
        description: 'Full Stack Web Development with React & Node.',
        thumbnail: 'https://via.placeholder.com/150',
        price: 200,
        modules: []
      },
      {
        title: 'Python AI/ML Internship',
        description: 'Learn Machine Learning basics.',
        thumbnail: 'https://via.placeholder.com/150',
        price: 200,
        modules: []
      }
    ]);

    res.json({ message: '✅ Database Seeded Successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SAFE DB RESET (OPTIONAL) ---
app.get('/api/reset-colleges', async (req, res) => {
  try {
    await mongoose.connection.collection('colleges').drop();
    res.send('✅ Colleges collection reset successfully');
  } catch (err) {
    if (err.code === 26) {
      res.send('✅ No colleges collection found');
    } else {
      res.status(500).send(err.message);
    }
  }
});

// --- SERVER START ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
