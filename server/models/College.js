const mongoose = require('mongoose');

const CollegeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },

  courses: [{
    courseName: { type: String, required: true }, // e.g., "CSE", "MCA"
    hodEmail: { type: String, required: true },   // 👈 Moved inside Department
    hodPassword: { type: String, required: true }, // 👈 Moved inside Department
    startRoll: { type: String, required: true },  // e.g., "24102d020001"
    endRoll: { type: String, required: true },    // e.g., "24102d020131"
    // We store individual roll numbers to track who has registered
    rollNumbers: [{
      number: { type: String },
      isRegistered: { type: Boolean, default: false },
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
    }]
  }]
}, { timestamps: true });

module.exports = mongoose.model('College', CollegeSchema);