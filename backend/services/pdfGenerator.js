const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs-extra');

async function generateFIR(caseData, userData) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const outputPath = path.join(__dirname, '../uploads', `FIR_${caseData.id}.pdf`);
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Header
    doc.fontSize(18).font('Helvetica-Bold').text('FIRST INFORMATION REPORT (FIR)', { align: 'center' });
    doc.fontSize(12).font('Helvetica').text('National Cyber Crime Reporting Portal', { align: 'center' });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Case Info
    doc.fontSize(11).font('Helvetica-Bold').text('COMPLAINT DETAILS');
    doc.moveDown(0.5);
    const fields = [
      ['Case ID', caseData.id],
      ['Date of Report', new Date().toLocaleDateString('en-IN')],
      ['Complainant Name', userData.name],
      ['Complainant Email', userData.email],
      ['Scam Type', (caseData.scamType || 'Unknown').toUpperCase().replace('_', ' ')],
      ['Risk Level', caseData.aiAnalysis?.verdict?.risk_level || 'HIGH'],
      ['Description', caseData.description],
      ['Suspected URL/Contact', caseData.url || caseData.contact || 'N/A'],
      ['Estimated Loss (INR)', caseData.estimatedLoss || 'Not specified'],
      ['Date of Incident', caseData.incidentDate || 'Unknown'],
    ];

    fields.forEach(([label, value]) => {
      doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
      doc.font('Helvetica').text(value || 'N/A');
    });

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // AI Analysis Summary
    doc.font('Helvetica-Bold').fontSize(11).text('AI ANALYSIS SUMMARY');
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(10);
    if (caseData.aiAnalysis) {
      doc.text(`Overall Scam Score: ${caseData.aiAnalysis.verdict?.confidence_percentage || 0}%`);
      doc.text(`Model Recommendation: ${caseData.aiAnalysis.verdict?.recommendation || 'N/A'}`);
      doc.text(`Analysis Model: ${caseData.aiAnalysis.model_version || 'CyberShield-AI'}`);
    }

    doc.moveDown();
    doc.font('Helvetica-Bold').text('DECLARATION');
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(9).text(
      'I hereby declare that the information provided above is true and correct to the best of my knowledge. I understand that providing false information is a punishable offense under the IT Act 2000 and IPC.'
    );

    doc.moveDown(2);
    doc.text(`Signature: ___________________          Date: ${new Date().toLocaleDateString('en-IN')}`);
    doc.moveDown();
    doc.text('CyberShield Sentinel — AI-Powered Evidence Package', { align: 'center', color: 'grey' });

    doc.end();
    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
}

async function generateBankDisputeLetter(caseData, userData) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const outputPath = path.join(__dirname, '../uploads', `BankDispute_${caseData.id}.pdf`);
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    doc.fontSize(16).font('Helvetica-Bold').text('BANK DISPUTE LETTER', { align: 'center' });
    doc.moveDown();

    const today = new Date().toLocaleDateString('en-IN');
    doc.fontSize(11).font('Helvetica');
    doc.text(`Date: ${today}`);
    doc.moveDown();
    doc.text('To,');
    doc.text('The Branch Manager / Grievance Officer');
    doc.text('[Your Bank Name]');
    doc.text('[Branch Address]');
    doc.moveDown();
    doc.font('Helvetica-Bold').text(`Subject: Dispute for Fraudulent Transaction — Case ${caseData.id}`);
    doc.moveDown();
    doc.font('Helvetica').text(`Dear Sir/Madam,`);
    doc.moveDown();
    doc.text(
      `I, ${userData.name}, account holder (email: ${userData.email}), wish to formally dispute a fraudulent transaction detected and analyzed by CyberShield Sentinel AI Platform.`
    );
    doc.moveDown();
    doc.text(`Case Reference: ${caseData.id}`);
    doc.text(`Scam Type: ${(caseData.scamType || '').toUpperCase().replace('_', ' ')}`);
    doc.text(`AI Confidence Score: ${caseData.aiAnalysis?.verdict?.confidence_percentage || 'N/A'}%`);
    doc.text(`Estimated Amount at Risk: INR ${caseData.estimatedLoss || 'Unknown'}`);
    doc.moveDown();
    doc.text(
      'I request you to: (1) Immediately freeze any pending outgoing transactions related to this case, (2) Initiate a chargeback/reversal if funds have been transferred, (3) File this dispute with the relevant cyber cell, and (4) Provide a written acknowledgment within 7 working days.'
    );
    doc.moveDown();
    doc.text('Enclosed: AI Analysis Report, Evidence Package, FIR Copy');
    doc.moveDown(2);
    doc.text(`Yours sincerely,`);
    doc.text(userData.name);
    doc.text(userData.email);

    doc.end();
    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
}

module.exports = { generateFIR, generateBankDisputeLetter };
