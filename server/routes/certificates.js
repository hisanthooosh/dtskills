const express = require('express');
const PDFDocument = require('pdfkit');
const User = require('../models/User');

const router = express.Router();

router.get('/:type/:userId', async (req, res) => {
  const { type, userId } = req.params;

  try {
    const user = await User.findById(userId).populate('enrolledCourses.courseId');
    if (!user) return res.status(404).send('User not found');

    const enrollment = user.enrolledCourses[0];
    if (!enrollment) return res.status(404).send('Enrollment not found');

    // 🔒 ACCESS CONTROL
    if (type === 'course' && !enrollment.courseCertificateIssued)
      return res.status(403).send('Locked');

    if (type === 'offer-letter' && !enrollment.offerLetterIssued)
      return res.status(403).send('Locked');

    if (type === 'internship' && !enrollment.internshipCertificateIssued)
      return res.status(403).send('Locked');

    // ===== PDF SETUP =====
    const doc = new PDFDocument({ size: 'A4', margin: 0 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');

    doc.pipe(res);

    // ===== BACKGROUND (DARK SaaS STYLE) =====
    doc.rect(0, 0, 595, 842).fill('#0F172A'); // slate-900

    // ===== HEADER =====
    doc
      .fillColor('#FFFFFF')
      .fontSize(28)
      .text('Doneswari Technologies', 0, 80, {
        align: 'center'
      });

    doc
      .fontSize(14)
      .fillColor('#94A3B8')
      .text('Innovating Education through SaaS Automation', {
        align: 'center'
      });

    // ===== TITLE =====
    const title =
      type === 'course'
        ? 'Course Completion Certificate'
        : type === 'offer-letter'
        ? 'Internship Offer Letter'
        : 'Internship Completion Certificate';

    doc
      .moveDown(3)
      .fillColor('#FFFFFF')
      .fontSize(22)
      .text(title, { align: 'center' });

    // ===== BODY =====
    doc
      .moveDown(3)
      .fontSize(14)
      .fillColor('#CBD5E1')
      .text('This is to certify that', { align: 'center' });

    doc
      .moveDown(1)
      .fontSize(20)
      .fillColor('#FFFFFF')
      .text(user.username.toUpperCase(), { align: 'center' });

    doc
      .moveDown(1)
      .fontSize(14)
      .fillColor('#CBD5E1')
      .text(
        type === 'offer-letter'
          ? 'has been selected for an internship at Doneswari Technologies.'
          : 'has successfully completed the program.',
        { align: 'center' }
      );

    if (enrollment.courseId) {
      doc
        .moveDown(1)
        .fontSize(14)
        .fillColor('#93C5FD')
        .text(enrollment.courseId.title, { align: 'center' });
    }

    // ===== FOOTER =====
    const certId = `DT-${Date.now().toString().slice(-6)}`;
    const issuedDate = new Date().toLocaleDateString();

    doc
      .moveDown(5)
      .fontSize(10)
      .fillColor('#94A3B8')
      .text(`Certificate ID: ${certId}`, { align: 'center' });

    doc
      .text(`Issued on: ${issuedDate}`, { align: 'center' });

    doc
      .moveDown(4)
      .fillColor('#FFFFFF')
      .text('Authorized Signature', 80, 720)
      .text('Doneswari Technologies', 80, 735);

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send('Certificate generation failed');
  }
});

module.exports = router;
