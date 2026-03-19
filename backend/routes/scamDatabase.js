const express = require('express');
const router = express.Router();
const { insert, db } = require('../models/store');
const { authenticate } = require('../middleware/auth');

// POST /api/scam-database/report-number
router.post('/report-number', authenticate, (req, res) => {
  const { number, scam_type, description } = req.body;
  if (!number) return res.status(400).json({ error: 'Phone number required' });

  const existing = db.scamNumbers.find(s => s.number === number);
  if (existing) {
    existing.reportCount = (existing.reportCount || 1) + 1;
    existing.updatedAt = new Date().toISOString();
    return res.json({ message: 'Report added to existing entry', entry: existing });
  }

  const entry = insert('scamNumbers', {
    number,
    scam_type: scam_type || 'unknown',
    description,
    reportedBy: req.user.id,
    reportCount: 1,
    verified: false
  });

  res.status(201).json({ message: 'Scam number reported successfully', entry });
});

// GET /api/scam-database/stats
router.get('/stats', authenticate, (req, res) => {
  res.json({
    total_numbers: db.scamNumbers.length,
    by_type: db.scamNumbers.reduce((acc, n) => {
      acc[n.scam_type] = (acc[n.scam_type] || 0) + 1;
      return acc;
    }, {}),
    total_reports: db.scamNumbers.reduce((sum, n) => sum + (n.reportCount || 1), 0)
  });
});

module.exports = router;
