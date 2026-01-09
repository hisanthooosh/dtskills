const express = require('express');
const router = express.Router();
const User = require('../models/User');
const adminAuth = require('../middleware/adminAuth');
const requireRole = require('../middleware/adminRole');

/**
 * =====================================================
 * SUBMIT INTERNSHIP GITHUB REPOSITORY (AUTO APPROVAL)
 * =====================================================
 */
router.post('/submit', async (req, res) => {
  const { userId, courseId, githubRepo } = req.body;

  // 🔒 Basic validation
  if (!userId || !courseId || !githubRepo) {
    return res.status(400).json({ message: 'Missing required data' });
  }

  // 🔒 GitHub URL validation
  if (!githubRepo.startsWith('https://github.com/')) {
    return res.status(400).json({ message: 'Invalid GitHub repository URL' });
  }

  try {
    const user = await User.findById(userId)
      .populate('enrolledCourses.courseId');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const enrollment = user.enrolledCourses.find(
      e => e.courseId && e.courseId._id.toString() === courseId.toString()
    );

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // 🔒 Internship must be unlocked
    if (!enrollment.internshipUnlocked) {
      return res.status(403).json({
        message: 'Internship not unlocked yet'
      });
    }

    // 🔒 Prevent duplicate submission
    if (enrollment.internshipGithubRepo) {
      return res.status(409).json({
        message: 'GitHub repository already submitted'
      });
    }

    // =====================================================
    // ✅ INTERNSHIP SUBMISSION LOGIC (45-DAY SAFE)
    // =====================================================

    enrollment.internshipGithubRepo = githubRepo;
    enrollment.internshipSubmittedAt = new Date();

    // Mark internship work as completed
    enrollment.internshipCompleted = true;

    // ⏳ Certificate will be issued ONLY after 45 days
    const now = new Date();

    if (
      enrollment.internshipEndsAt &&
      now >= enrollment.internshipEndsAt
    ) {
      enrollment.internshipCertificateIssued = true;
    }

    // Ensure offer letter (course phase)
    if (enrollment.courseCompleted && !enrollment.offerLetterIssued) {
      enrollment.offerLetterIssued = true;
    }
    await user.save();


    res.json({
      success: true,
      message: 'Internship project submitted & approved automatically',
      internshipCompleted: true,
      internshipCertificateIssued: enrollment.internshipCertificateIssued,

      offerLetterIssued: enrollment.offerLetterIssued
    });

  } catch (error) {
    console.error('Internship Submission Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
