const mongoose = require('mongoose');

const AicteInternshipSchema = new mongoose.Schema(
  {
    // Student email as per AICTE portal
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    // Course for which internship is issued
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },

    // Official AICTE Internship ID
    aicteInternshipId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    // Has this ID been used by a student?
    isUsed: {
      type: Boolean,
      default: false
    },

    // Which student used this ID
    usedByStudentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    // Which admin entered this AICTE ID
    createdByAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true
    }
  },
  {
    timestamps: true // adds createdAt & updatedAt
  }
);

module.exports = mongoose.model('AicteInternship', AicteInternshipSchema);
