const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

async function generatePDF(data) {
  const {
    type,
    name,
    college,
    program,
    internshipStartedAt,
    internshipEndsAt
  } = data;

  const COMPANY_NAME = 'Doneswari Technologies LLP';
  const FOUNDER_NAME = 'Doneswari Pathipati';
  const DESIGNATION = 'Founder & CEO';

  const doc = new PDFDocument({ size: 'A4', margin: 60 });
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

  const today = formatDate(new Date());

  /* ================= BORDER ================= */
  doc.lineWidth(2)
    .rect(25, 25, pageWidth - 50, pageHeight - 50)
    .stroke('#0f172a');

  doc.lineWidth(1)
    .rect(35, 35, pageWidth - 70, pageHeight - 70)
    .stroke('#cbd5f5');

  /* ================= LOGO ================= */
  const logoPath = path.join(__dirname, '../assets/dt-logo.png');
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, pageWidth / 2 - 55, 45, { width: 110 });
  }

  doc.moveDown(4);

  /* ================= HEADER ================= */
  doc.font('Times-Bold')
    .fontSize(24)
    .fillColor('#020617')
    .text(COMPANY_NAME.toUpperCase(), { align: 'center' });

  doc.moveDown(0.4);

  doc.font('Times-Roman')
    .fontSize(11)
    .fillColor('#475569')
    .text(
      'AICTE-Aligned Skill Development & Internship Organization',
      { align: 'center' }
    );

  doc.moveDown(2);

  /* ======================================================
     COURSE CERTIFICATE
     ====================================================== */
  if (type === 'course') {
    doc.font('Times-Bold').fontSize(20)
      .text('COURSE COMPLETION CERTIFICATE', { align: 'center' });

    doc.moveDown(2);

    doc.font('Times-Roman').fontSize(13)
      .text('This is to certify that', { align: 'center' });

    doc.moveDown(0.8);

    doc.font('Times-Bold').fontSize(22)
      .text(name, { align: 'center' });

    if (college) {
      doc.moveDown(0.4);
      doc.font('Times-Roman').fontSize(13)
        .text(`of ${college}`, { align: 'center' });
    }

    doc.moveDown(1.4);

    doc.text(
      'has successfully completed the professional certification program titled',
      { align: 'center' }
    );

    doc.moveDown(0.8);

    doc.font('Times-Bold').fontSize(16)
      .text(program, { align: 'center' });

    doc.moveDown(1.1);

    doc.font('Times-Roman').fontSize(12)
      .text(
        'This course was designed to provide strong conceptual foundations, practical exposure, and industry-relevant skill development. The participant has demonstrated dedication, consistency, and proficiency throughout the program.',
        { align: 'center', lineGap: 5 }
      );
  }

  /* ======================================================
     OFFER LETTER (PROFESSIONAL LETTER FORMAT)
     ====================================================== */
  if (type === 'offer-letter') {
    doc.font('Times-Bold').fontSize(18)
      .text('INTERNSHIP OFFER LETTER');

    doc.moveDown(1.2);

    doc.font('Times-Roman').fontSize(11)
      .text(`Date: ${today}`, { align: 'right' });

    doc.moveDown(1.6);

    doc.font('Times-Roman').fontSize(12)
      .text('To,')
      .text(name);

    if (college) doc.text(college);

    doc.moveDown(1.4);

    doc.font('Times-Bold').fontSize(12)
      .text('Subject: Offer of Internship');

    doc.moveDown(1.1);

    doc.font('Times-Roman').fontSize(12)
      .text(
        `Dear ${name},\n\n` +
        `We are pleased to offer you an internship opportunity with ${COMPANY_NAME} in the role of ${program}. ` +
        `The internship will commence from ${formatDate(internshipStartedAt)} and will conclude on ${formatDate(internshipEndsAt)}.\n\n` +
        `This internship is offered in accordance with AICTE internship guidelines and is intended to provide practical industry exposure and professional skill development.\n\n` +
        `We wish you a successful learning journey with us.\n\n` +
        `Sincerely,`,
        { lineGap: 5 }
      );
  }

  /* ======================================================
     INTERNSHIP COMPLETION CERTIFICATE
     ====================================================== */
  if (type === 'internship') {
    doc.font('Times-Bold').fontSize(20)
      .text('INTERNSHIP COMPLETION CERTIFICATE', { align: 'center' });

    doc.moveDown(1.9);

    doc.font('Times-Roman').fontSize(13)
      .text('This is to certify that', { align: 'center' });

    doc.moveDown(0.8);

    doc.font('Times-Bold').fontSize(22)
      .text(name, { align: 'center' });

    doc.moveDown(1.1);

    doc.font('Times-Roman').fontSize(13)
      .text('has successfully completed an internship at', { align: 'center' });

    doc.moveDown(0.5);

    doc.font('Times-Bold').fontSize(15)
      .text(COMPANY_NAME, { align: 'center' });

    doc.moveDown(0.9);

    doc.font('Times-Roman').fontSize(12)
      .text(`Internship Role: ${program}`, { align: 'center' });

    doc.moveDown(0.5);

    doc.text(
      `Duration: ${formatDate(internshipStartedAt)} to ${formatDate(internshipEndsAt)}`,
      { align: 'center' }
    );

    doc.moveDown(1.1);

    doc.text(
      'During the internship period, the candidate demonstrated professionalism, technical competence, and a strong willingness to learn. All assigned responsibilities were completed satisfactorily.',
      { align: 'center', lineGap: 5 }
    );
  }

  /* ================= SIGNATURE (NEAT & PROFESSIONAL) ================= */
  let signX = pageWidth / 2 - 60;
  let signY = doc.y + 25;

  if (type === 'offer-letter') {
    signX = 60;
    signY = doc.y + 10;
  }

  const signPath = path.join(__dirname, '../assets/sign.png');
  if (fs.existsSync(signPath)) {
    doc.image(signPath, signX, signY, {
      width: 120
    });
  }

  doc.y = signY + 85;

  doc.font('Times-Bold').fontSize(12)
    .text(FOUNDER_NAME, { align: 'center' });

  doc.font('Times-Roman').fontSize(10)
    .text(DESIGNATION, { align: 'center' });

  doc.font('Times-Roman').fontSize(10)
    .text(COMPANY_NAME, { align: 'center' });

  return doc;
}

module.exports = { generatePDF };
