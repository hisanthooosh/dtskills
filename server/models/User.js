const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // --- Auth Fields ---
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'student', enum: ['student', 'admin'] },

  // --- Student Details ---
  name: { type: String }, // Populated from username during register
  rollNumber: { type: String },
  collegeName: { type: String },
  
  // --- References ---
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
  
  // Supports both single course registration (from auth.js) and multiple (dashboard)
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }, 
  enrolledCourses: [{
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    completedChapters: { type: Number, default: 0 },
    isPaid: { type: Boolean, default: false },
    enrolledAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);