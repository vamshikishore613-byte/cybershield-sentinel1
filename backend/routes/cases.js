const express = require('express');
const router = express.Router();
const { insert, findById, filterByField, update } = require('../models/store');
const { authenticate } = require('../middleware/auth');
const { performFullAnalysis } = require('../services/aiAnalysis');

// POST /api/cases
router.post('/', authenticate, async (req, res) => {
  try {
    const { description, url, contact, scamType, estimatedLoss, incidentDate, hasImage, hasAudio, hasVideo } = req.body;

    const aiAnalysis = await performFullAnalysis({ description, url, hasImage, hasAudio, hasVideo });

    const newCase = insert('cases', {
      userId: req.user.id,
      description,
      url,
      contact,
      scamType: aiAnalysis.scam_type,
      estimatedLoss,
      incidentDate,
      status: 'open',
      aiAnalysis,
      complaintId: null,
      evidenceIds: [],
      hasImage: hasImage || false,
      hasAudio: hasAudio || false,
      hasVideo: hasVideo || false,
    });

    res.status(201).json({ message: 'Case created successfully', case: newCase });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cases
router.get('/', authenticate, (req, res) => {
  const cases = filterByField('cases', 'userId', req.user.id);
  res.json({ cases: cases.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) });
});

// GET /api/cases/:id
router.get('/:id', authenticate, (req, res) => {
  const c = findById('cases', req.params.id);
  if (!c) return res.status(404).json({ error: 'Case not found' });
  if (c.userId !== req.user.id) return res.status(403).json({ error: 'Access denied' });
  res.json({ case: c });
});

// PATCH /api/cases/:id/feedback
router.patch('/:id/feedback', authenticate, (req, res) => {
  const { feedback } = req.body; // 'false_positive' | 'false_negative' | 'confirmed'
  const c = findById('cases', req.params.id);
  if (!c) return res.status(404).json({ error: 'Case not found' });
  if (c.userId !== req.user.id) return res.status(403).json({ error: 'Access denied' });
  const updated = update('cases', req.params.id, { feedback, status: feedback === 'false_positive' ? 'dismissed' : 'confirmed' });
  res.json({ message: 'Feedback recorded', case: updated });
});

// POST /api/cases/:id/file-complaint
router.post('/:id/file-complaint', authenticate, async (req, res) => {
  try {
    const c = findById('cases', req.params.id);
    if (!c) return res.status(404).json({ error: 'Case not found' });
    if (c.userId !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    // Simulate filing with cyber crime portal
    const complaintId = `NCRP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const updated = update('cases', req.params.id, { complaintId, status: 'complaint_filed', complaintFiledAt: new Date().toISOString() });

    res.json({
      message: 'Complaint filed successfully with National Cyber Crime Reporting Portal',
      complaintId,
      case: updated
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
