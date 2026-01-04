const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: true
  },
  projectLink: {
    type: String,
    required: true
  },
  githubLink: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  feedback: {
    type: String, // To store rejection reason
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Submission', SubmissionSchema);