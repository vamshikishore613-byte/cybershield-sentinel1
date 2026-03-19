const express = require('express');
const router = express.Router();
const { findById } = require('../models/store');
const { authenticate } = require('../middleware/auth');

router.get('/:caseId', authenticate, (req, res) => {
  const c = findById('cases', req.params.caseId);
  if (!c) return res.status(404).json({ error: 'Case not found' });
  if (c.userId !== req.user.id) return res.status(403).json({ error: 'Access denied' });

  const loss = parseFloat(c.estimatedLoss) || 0;

  res.json({
    caseId: req.params.caseId,
    recovery_plan: {
      estimated_loss: loss,
      recovery_probability: loss < 10000 ? 'HIGH (70-80%)' : loss < 100000 ? 'MEDIUM (40-60%)' : 'LOW (20-35%)',
      checklist: [
        { step: 1, action: 'Call bank helpline immediately to freeze suspicious transactions', completed: false, urgency: 'IMMEDIATE' },
        { step: 2, action: 'File FIR at cybercrime.gov.in (Case ID required)', completed: false, urgency: 'WITHIN 24 HOURS' },
        { step: 3, action: 'Dispute transaction with bank — provide FIR & AI report', completed: false, urgency: 'WITHIN 3 DAYS' },
        { step: 4, action: 'Contact RBI Banking Ombudsman if bank refuses refund', completed: false, urgency: 'WITHIN 7 DAYS' },
        { step: 5, action: 'File complaint with SEBI (if investment scam)', completed: false, urgency: 'WITHIN 7 DAYS' },
        { step: 6, action: 'Approach Consumer Disputes Redressal Commission', completed: false, urgency: 'WITHIN 30 DAYS' },
        { step: 7, action: 'Engage a cyber law attorney for civil/criminal proceedings', completed: false, urgency: 'OPTIONAL' },
      ],
      bank_freeze_guidance: {
        steps: ['Call 1930 (Cyber Crime Helpline)', 'Contact your bank toll-free immediately', 'Request "Transaction Freeze" citing case ID', 'Visit nearest branch with FIR copy'],
        time_limit: 'Act within 24 hours for highest recovery chance',
        important: 'RBI Circular RBI/2021-22/108 mandates banks to act within 48 hours on cyber fraud complaints'
      },
      complaint_channels: [
        { name: 'National Cyber Crime Portal', url: 'https://cybercrime.gov.in', phone: '1930' },
        { name: 'RBI Banking Ombudsman', url: 'https://rbisb.rbi.org.in', phone: '14440' },
        { name: 'SEBI SCORES (Investment Fraud)', url: 'https://scores.gov.in', phone: '1800-266-7575' },
        { name: 'Consumer Forum', url: 'https://consumerhelpline.gov.in', phone: '1800-11-4000' },
      ]
    }
  });
});

module.exports = router;
