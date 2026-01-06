const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateCertificate } = require('../utils/pdfGenerator');

// ================= COURSE CERTIFICATE =================
router.get('/course/:userId', async (req, res) => {
  const user = await User.findById(req.params.userId).populate('enrolledCourses.courseId');
  const enrollment = user?.enrolledCourses?.[0];

  if (!enrollment?.courseCertificateIssued) {
    return res.status(403).send('Certificate not available');
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename=course-certificate.pdf');

  const doc = generateCertificate({
    name: user.username,
    title: 'Course Completion Certificate',
    subtitle: `has successfully completed ${enrollment.courseId.title}`,
    issueText: 'This certificate is awarded upon successful completion of course modules.'
  });

  doc.pipe(res);
  doc.end();
});

// ================= OFFER LETTER =================
router.get('/offer-letter/:userId', async (req, res) => {
  const user = await User.findById(req.params.userId);
  const enrollment = user?.enrolledCourses?.[0];

  if (!enrollment?.offerLetterIssued) {
    return res.status(403).send('Offer letter not available');
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename=offer-letter.pdf');

  const doc = generateCertificate({
    name: user.username,
    title: 'Internship Offer Letter',
    subtitle: 'is selected for the Internship Program at DT Skills',
    issueText: 'We are pleased to offer you this internship opportunity.'
  });

  doc.pipe(res);
  doc.end();
});

// ================= INTERNSHIP CERTIFICATE =================
router.get('/internship/:userId', async (req, res) => {
  const user = await User.findById(req.params.userId);
  const enrollment = user?.enrolledCourses?.[0];

  if (!enrollment?.internshipCertificateIssued) {
    return res.status(403).send('Internship certificate not available');
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename=internship-certificate.pdf');

  const doc = generateCertificate({
    name: user.username,
    title: 'Internship Completion Certificate',
    subtitle: 'has successfully completed the Internship Program',
    issueText: 'Awarded after successful project submission and review.'
  });

  doc.pipe(res);
  doc.end();
});

module.exports = router;
