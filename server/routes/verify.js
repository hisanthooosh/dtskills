const express = require('express');
const User = require('../models/User');

const router = express.Router();

/**
 * PUBLIC CERTIFICATE VERIFICATION
 * GET /verify/:certificateId
 */
router.get('/:certificateId', async (req, res) => {
  const { certificateId } = req.params;

  try {
    const user = await User.findOne({
      'enrolledCourses.certificateId': certificateId
    }).populate('enrolledCourses.courseId');

    if (!user) {
      return res.status(404).json({
        valid: false,
        message: 'Certificate not found'
      });
    }

    const enrollment = user.enrolledCourses.find(
      e => e.certificateId === certificateId
    );

    if (!enrollment) {
      return res.status(404).json({
        valid: false,
        message: 'Certificate not found'
      });
    }

    res.json({
      valid: true,
      studentName: user.username,
      email: user.email,
      college: user.collegeName || 'DT Skills Partner Institution',
      course: enrollment.courseId?.title || '—',
      type: enrollment.internshipCertificateIssued
        ? 'Internship Certificate'
        : 'Course Certificate',
      issuedAt: enrollment.certificateIssuedAt || null,
      certificateId
    });

  } catch (err) {
    console.error('Verify Error:', err);
    res.status(500).json({
      valid: false,
      message: 'Verification failed'
    });
  }
});

module.exports = router;
