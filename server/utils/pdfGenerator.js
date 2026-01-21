const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

async function generatePDF(data) {
  const {
    type, // 'course' | 'internship' | 'offer-letter'
    name,
    college,
    program,
    internshipStartedAt,
    internshipEndsAt,
    durationWeeks = 6
  } = data;

  const doc = new PDFDocument({ size: 'A4', margin: 60 });
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

  /* ================= BORDER ================= */
  doc
    .lineWidth(2)
    .rect(30, 30, pageWidth - 60, pageHeight - 60)
    .stroke('#1f2937');

  /* ================= LOGO ================= */
  const logoPath = path.join(__dirname, '../assets/dt-logo.png');
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, pageWidth / 2 - 60, 45, { width: 120 });
  }

  doc.moveDown(4);

  /* ================= HEADER ================= */
  doc
    .fontSize(22)
    .fillColor('#111827')
    .font('Times-Bold')
    .text('DONESWARI TECHNOLOGIES LLP', { align: 'center' });

  doc
    .moveDown(0.5)
    .fontSize(11)
    .font('Times-Roman')
    .fillColor('#374151')
    .text(
      'AICTE-Aligned Skill Development & Internship Organization',
      { align: 'center' }
    );

  doc.moveDown(2);

  /* ================= TITLE ================= */
  let title = '';
  if (type === 'course') title = 'COURSE COMPLETION CERTIFICATE';
  if (type === 'internship') title = 'INTERNSHIP COMPLETION CERTIFICATE';
  if (type === 'offer-letter') title = 'INTERNSHIP OFFER LETTER';

  doc
    .fontSize(20)
    .font('Times-Bold')
    .fillColor('#000')
    .text(title, { align: 'center', underline: true });

  doc.moveDown(3);

  /* ================= BODY ================= */
  doc
    .fontSize(13)
    .font('Times-Roman')
    .fillColor('#111827')
    .text('This is to certify that', { align: 'center' });

  doc.moveDown(1);

  doc
    .fontSize(20)
    .font('Times-Bold')
    .text(name, { align: 'center' });

  doc.moveDown(1);

  doc
    .fontSize(13)
    .font('Times-Roman')
    .text(`from ${college}`, { align: 'center' });

  doc.moveDown(2);

  /* ================= MAIN CONTENT ================= */
  if (type === 'course') {
    doc.text(
      `has successfully completed the professional course titled`,
      { align: 'center' }
    );

    doc.moveDown(0.8);

    doc
      .font('Times-Bold')
      .fontSize(15)
      .text(program, { align: 'center' });

    doc.moveDown(1.5);

    doc
      .fontSize(12)
      .font('Times-Roman')
      .text(
        'This certification program was designed to provide strong conceptual understanding, practical exposure, and industry-relevant skills aligned with current professional standards. The participant has demonstrated commitment, consistency, and competence throughout the course duration.',
        {
          align: 'center',
          lineGap: 6
        }
      );
  }

  if (type === 'internship') {
    doc.text(
      `has successfully completed a ${durationWeeks}-week internship program in`,
      { align: 'center' }
    );

    doc.moveDown(0.8);

    doc
      .font('Times-Bold')
      .fontSize(15)
      .text(program, { align: 'center' });

    doc.moveDown(1.5);

    doc
      .fontSize(12)
      .font('Times-Roman')
      .text(
        `Internship Duration: ${formatDate(
          internshipStartedAt
        )} to ${formatDate(internshipEndsAt)}`,
        { align: 'center' }
      );

    doc.moveDown(1.2);

    doc.text(
      'During the internship period, the candidate demonstrated professionalism, technical aptitude, and a strong willingness to learn. The intern actively participated in assigned responsibilities and adhered to organizational standards and expectations.',
      {
        align: 'center',
        lineGap: 6
      }
    );
  }

  if (type === 'offer-letter') {
    doc.text(
      'We are pleased to inform you that you have been selected for an internship opportunity at',
      { align: 'center' }
    );

    doc.moveDown(1);

    doc
      .font('Times-Bold')
      .fontSize(15)
      .text('Doneswari Technologies LLP', { align: 'center' });

    doc.moveDown(1.5);

    doc
      .fontSize(12)
      .font('Times-Roman')
      .text(
        `The internship will be in the domain of ${program} for a duration of ${durationWeeks} weeks, commencing from ${formatDate(
          internshipStartedAt
        )}.`,
        { align: 'center', lineGap: 6 }
      );

    doc.moveDown(1.5);

    doc.text(
      'This internship is offered in alignment with AICTE internship guidelines and is intended to provide practical exposure, industry insights, and professional skill development. Further details regarding reporting, responsibilities, and guidelines will be communicated separately.',
      {
        align: 'center',
        lineGap: 6
      }
    );
  }

  /* ================= FOOTER ================= */
  doc.moveDown(4);

  doc
    .fontSize(11)
    .text(
      'Issued by Doneswari Technologies LLP',
      { align: 'center' }
    );

  doc.moveDown(0.5);

  doc
    .fontSize(10)
    .text(
      'Founder & CEO – Doneswari Pathipati',
      { align: 'center' }
    );

  doc.moveDown(0.3);

  doc
    .fontSize(10)
    .text(
      'Issued on: 01 January 2026',
      { align: 'center' }
    );

  return doc;
}

module.exports = { generatePDF };
