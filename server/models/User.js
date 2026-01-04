const mongoose = require('mongoose');

const EnrolledCourseSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },

  completedTopics: {
    type: [String],
    default: []
  },

  courseCompleted: {
    type: Boolean,
    default: false
  },

  courseCertificateIssued: {
    type: Boolean,
    default: false
  },

  internshipUnlocked: {
    type: Boolean,
    default: false
  },

  isPaid: {
    type: Boolean,
    default: false
  },

  enrolledAt: {
    type: Date,
    default: Date.now
  }
});

const UserSchema = new mongoose.Schema(
  {
    // --- Auth ---
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student'
    },

    // --- Face Auth ---
    faceDescriptor: { type: Array, default: [] },

    // --- Student Info ---
    name: String,
    rollNumber: String,
    collegeName: String,

    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College'
    },

    // ✅ CORRECT STRUCTURE
    enrolledCourses: {
      type: [EnrolledCourseSchema],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
