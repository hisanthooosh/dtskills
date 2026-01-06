const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/submit', async (req, res) => {
  const { userId, courseId, githubRepo } = req.body;

  if (!userId || !courseId || !githubRepo) {
    return res.status(400).json({ msg: 'Missing data' });
  }

  try {
    const user = await User.findById(userId).populate('enrolledCourses.courseId');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const enrollment = user.enrolledCourses.find(
      e => e.courseId && e.courseId._id.toString() === courseId
    );

    if (!enrollment) {
      return res.status(404).json({ msg: 'Enrollment not found' });
    }

    if (!enrollment.internshipUnlocked) {
      return res.status(403).json({ msg: 'Internship not unlocked' });
    }

    // ✅ SAVE GITHUB
    enrollment.internshipGithubRepo = githubRepo;
    enrollment.internshipSubmittedAt = new Date();

    // ✅ AUTO COMPLETE
    enrollment.internshipCompleted = true;
    enrollment.internshipCertificateIssued = true;

    // ✅ OFFER LETTER (AFTER COURSE)
    if (enrollment.courseCompleted) {
      enrollment.offerLetterIssued = true;
    }

    await user.save();

    res.json({
      success: true,
      internshipCompleted: true,
      internshipCertificateIssued: true,
      offerLetterIssued: enrollment.offerLetterIssued
    });

  } catch (err) {
    console.error('Internship Submit Error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
