const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { insert, findById, update } = require('../models/store');
const { authenticate } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|pdf|mp3|mp4|wav|ogg|webm|mov/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  if (ext) cb(null, true);
  else cb(new Error('Invalid file type'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } });

// POST /api/evidence
router.post('/', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const { caseId, evidenceType, description } = req.body;

    const evidence = insert('evidence', {
      userId: req.user.id,
      caseId,
      evidenceType: evidenceType || 'unknown',
      description,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: `/uploads/${req.file.filename}`
    });

    // Link to case
    if (caseId) {
      const c = findById('cases', caseId);
      if (c && c.userId === req.user.id) {
        const updatedIds = [...(c.evidenceIds || []), evidence.id];
        update('cases', caseId, { evidenceIds: updatedIds });
      }
    }

    res.status(201).json({ message: 'Evidence uploaded', evidence });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
