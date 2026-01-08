const express = require('express');
const User = require('../models/User');
const { generateCertificate } = require('../utils/pdfGenerator');

const router = express.Router();

router.get('/:type/:userId', async (req, res) => {
  const { type, userId } = req.params;
  const { download } = req.query;

  try {
    const user = await User.findById(userId).populate('enrolledCourses.courseId');
    if (!user) return res.status(404).send('User not found');

    const enrollment = user.enrolledCourses?.[0];
    if (!enrollment) return res.status(404).send('Enrollment not found');

    // 🔒 ACCESS CONTROL
    if (type === 'course' && !enrollment.courseCertificateIssued)
      return res.status(403).send('Locked');

    if (type === 'offer-letter' && !enrollment.offerLetterIssued)
      return res.status(403).send('Locked');

    if (type === 'internship' && !enrollment.internshipCertificateIssued)
      return res.status(403).send('Locked');

    // ================= CERT DATA =================
    const certData = {
      type: type === 'course' ? 'course' : 'internship',
      name: user.username,
      college: user.collegeName || 'DT Skills Partner Institution',
      program: enrollment.courseId?.title || 'Internship Program',
      durationWeeks: 8,
      verificationUrl: `https://dtskills.in/verify/${user._id}`
    };

    // ================= PDF STREAM =================
    const pdfDoc = await generateCertificate(certData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      download === 'true'
        ? `attachment; filename=${type}-certificate.pdf`
        : 'inline'
    );

    pdfDoc.pipe(res);
    pdfDoc.end();

  } catch (err) {
    console.error('Certificate Error:', err);
    res.status(500).send('Certificate generation failed');
  }
});

module.exports = router;
