const PDFDocument = require('pdfkit');

function generateCertificate({
  name,
  title,
  subtitle,
  issueText
}) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  doc
    .fontSize(26)
    .text('DT SKILLS', { align: 'center' })
    .moveDown(1);

  doc
    .fontSize(22)
    .text(title, { align: 'center' })
    .moveDown(2);

  doc
    .fontSize(16)
    .text('This is to certify that', { align: 'center' })
    .moveDown(1);

  doc
    .fontSize(20)
    .text(name, { align: 'center', underline: true })
    .moveDown(1);

  doc
    .fontSize(14)
    .text(subtitle, { align: 'center' })
    .moveDown(2);

  doc
    .fontSize(12)
    .text(issueText, { align: 'center' })
    .moveDown(4);

  doc
    .fontSize(10)
    .text(`Issued on: ${new Date().toDateString()}`, { align: 'center' });

  return doc;
}

module.exports = { generateCertificate };
