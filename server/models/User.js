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

  // ===== COURSE PHASE (Modules 1–5) =====
  courseCompleted: {
    type: Boolean,
    default: false
  },

  courseCertificateIssued: {
    type: Boolean,
    default: false
  },

  offerLetterIssued: {
    type: Boolean,
    default: false
  },

  // ===== AICTE INTERNSHIP VERIFICATION =====
  aicteInternshipId: {
    type: String,
    default: null
  },

  aicteVerified: {
    type: Boolean,
    default: false
  },

  internshipVerifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },

  internshipVerifiedAt: {
    type: Date,
    default: null
  },

  // ===== INTERNSHIP PHASE (Modules 6–10) =====
  internshipUnlocked: {
    type: Boolean,
    default: false
  },
  // Internship duration tracking (45 days)
  internshipStartedAt: {
    type: Date,
    default: null
  },

  internshipEndsAt: {
    type: Date,
    default: null
  },


  internshipGithubRepo: {
    type: String,
    default: null
  },

  internshipSubmittedAt: {
    type: Date,
    default: null
  },

  internshipCompleted: {
    type: Boolean,
    default: false
  },

  internshipCertificateIssued: {
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
    username: {
      type: String,
      required: true
    },

    email: {
      type: String,
      unique: true,
      required: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      default: 'student'
    },

    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College'
    },

    enrolledCourses: [EnrolledCourseSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
