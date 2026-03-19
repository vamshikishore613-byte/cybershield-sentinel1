const express = require('express');
const router = express.Router();
const path = require('path');
const { findById } = require('../models/store');
const { authenticate } = require('../middleware/auth');
const { generateFIR, generateBankDisputeLetter } = require('../services/pdfGenerator');

// GET /api/legal-documents/fir/:caseId
router.get('/fir/:caseId', authenticate, async (req, res) => {
  try {
    const c = findById('cases', req.params.caseId);
    if (!c) return res.status(404).json({ error: 'Case not found' });
    if (c.userId !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    const user = findById('users', req.user.id);
    const pdfPath = await generateFIR(c, user);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=FIR_${c.id}.pdf`);
    res.sendFile(path.resolve(pdfPath));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/legal-documents/bank-dispute/:caseId
router.get('/bank-dispute/:caseId', authenticate, async (req, res) => {
  try {
    const c = findById('cases', req.params.caseId);
    if (!c) return res.status(404).json({ error: 'Case not found' });
    if (c.userId !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    const user = findById('users', req.user.id);
    const pdfPath = await generateBankDisputeLetter(c, user);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=BankDispute_${c.id}.pdf`);
    res.sendFile(path.resolve(pdfPath));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
