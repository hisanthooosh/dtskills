const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // --- Auth Fields ---
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'student', enum: ['student', 'admin'] },

  // --- Face Auth Data (Important) ---
  faceDescriptor: { type: Array, default: [] },

  // --- Student Details ---
  name: { type: String },
  rollNumber: { type: String },
  collegeName: { type: String },

  // --- References ---
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },

  // --- Enrolled Courses ---
  enrolledCourses: [{
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    // 👇 THIS WAS MISSING AND CAUSING THE CRASH 👇
    completedTopics: [{ type: String }],
    // ---------------------------------------------
    enrolledCourses: [{
      courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      },

      completedTopics: {
        type: [String],
        default: []
      },

      isPaid: {
        type: Boolean,
        default: false
      },

      // ✅ PHASE-1 FLAG
      courseCompleted: {
        type: Boolean,
        default: false
      },

      // future phases (keep now)
      aicteVerified: {
        type: Boolean,
        default: false
      },
      internshipUnlocked: {
        type: Boolean,
        default: false
      },

      enrolledAt: {
        type: Date,
        default: Date.now
      }
    }],

    isPaid: { type: Boolean, default: false },
    enrolledAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);