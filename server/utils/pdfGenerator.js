const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

async function generateCertificate(data) {
  const {
    type,               // 'course' | 'internship'
    name,
    college,
    program,
    durationWeeks,
    issueText,
    verificationUrl
  } = data;

  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  /* ================= BORDER ================= */
  doc
    .lineWidth(3)
    .rect(25, 25, pageWidth - 50, pageHeight - 50)
    .stroke('#0f172a');

  /* ================= LOGOS (SAFE LOAD) ================= */
  const dtLogo = path.join(__dirname, '../assets/dt-logo.png');
  const aicteLogo = path.join(__dirname, '../assets/aicte-logo.png');
  const signPath = path.join(__dirname, '../assets/signature.png');

  if (fs.existsSync(dtLogo)) {
    try {
      doc.image(dtLogo, 60, 45, { width: 100 });
    } catch (e) {
      console.warn('DT logo skipped:', e.message);
    }
  }

  if (fs.existsSync(aicteLogo)) {
    try {
      doc.image(aicteLogo, pageWidth - 160, 45, { width: 100 });
    } catch (e) {
      console.warn('AICTE logo skipped:', e.message);
    }
  }

  doc.moveDown(4);

  /* ================= HEADER ================= */
  doc
    .fontSize(26)
    .fillColor('#0f172a')
    .text('DT SKILLS', { align: 'center' });

  doc
    .fontSize(14)
    .fillColor('#374151')
    .text('AICTE Approved Internship & Skill Development Platform', {
      align: 'center'
    });

  doc.moveDown(1.5);

  /* ================= CERT TITLE ================= */
  doc
    .fontSize(24)
    .fillColor('#000')
    .text(
      type === 'internship'
        ? 'INTERNSHIP COMPLETION CERTIFICATE'
        : 'COURSE COMPLETION CERTIFICATE',
      { align: 'center', underline: true }
    );

  doc.moveDown(2);

  /* ================= BODY ================= */
  doc
    .fontSize(14)
    .text('This is to certify that', { align: 'center' });

  doc.moveDown(0.8);

  doc
    .fontSize(22)
    .fillColor('#000')
    .text(name || 'Student Name', { align: 'center' });

  doc.moveDown(0.8);

  doc
    .fontSize(14)
    .fillColor('#374151')
    .text(`from ${college || 'Partner Institution'}`, { align: 'center' });

  doc.moveDown(1.2);

  doc
    .fontSize(14)
    .fillColor('#111827')
    .text(
      type === 'internship'
        ? `has successfully completed the ${durationWeeks || 8}-week internship program in`
        : 'has successfully completed the certified course in',
      { align: 'center' }
    );

  doc.moveDown(0.6);

  doc
    .fontSize(18)
    .fillColor('#000')
    .text(program || 'Skill Development Program', { align: 'center' });

  doc.moveDown(1.5);

  /* ================= AICTE WORDING ================= */
  doc
    .fontSize(12)
    .fillColor('#374151')
    .text(
      issueText ||
        'This program is conducted in alignment with AICTE Internship Guidelines and focuses on industry-oriented skill development.',
      {
        align: 'center',
        lineGap: 6
      }
    );

  doc.moveDown(3);

  /* ================= FOOTER ================= */
  const issueDate = new Date().toDateString();
  const certId = `DT-AICTE-${Date.now()}`;

  doc
    .fontSize(11)
    .text(`Issued On: ${issueDate}`, 70, pageHeight - 170);

  doc
    .fontSize(11)
    .text(`Certificate ID: ${certId}`, 70, pageHeight - 150);

  /* ================= SIGNATURE (SAFE) ================= */
  if (fs.existsSync(signPath)) {
    try {
      doc.image(signPath, pageWidth - 230, pageHeight - 200, { width: 120 });
    } catch (e) {
      console.warn('Signature skipped:', e.message);
    }
  }

  doc
    .fontSize(11)
    .text('Authorized Signatory', pageWidth - 240, pageHeight - 130);

  doc
    .fontSize(10)
    .text('DT Skills', pageWidth - 240, pageHeight - 115);

  /* ================= QR CODE (SAFE) ================= */
  if (verificationUrl) {
    try {
      const qrData = await QRCode.toDataURL(verificationUrl);
      doc.image(qrData, pageWidth - 160, pageHeight - 160, { width: 80 });

      doc
        .fontSize(9)
        .fillColor('#374151')
        .text('Verify Certificate', pageWidth - 165, pageHeight - 75);
    } catch (e) {
      console.warn('QR skipped:', e.message);
    }
  }

  return doc;
}

module.exports = { generateCertificate };
