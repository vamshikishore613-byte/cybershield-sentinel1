const express = require('express');
const router = express.Router();
const { insert, findById, update, filterByField, db } = require('../models/store');
const { authenticate } = require('../middleware/auth');

// POST /api/family-shield/create
router.post('/create', authenticate, (req, res) => {
  const { networkName } = req.body;
  const existing = filterByField('familyNetworks', 'ownerId', req.user.id);
  if (existing.length > 0) return res.status(409).json({ error: 'Family network already exists', network: existing[0] });

  const network = insert('familyNetworks', {
    ownerId: req.user.id,
    networkName: networkName || `${req.user.name}'s Family Shield`,
    members: [],
    blockedNumbers: [],
    callsChecked: 0
  });

  res.status(201).json({ message: 'Family Shield network created', network });
});

// POST /api/family-shield/add-member
router.post('/add-member', authenticate, (req, res) => {
  const { name, phone, relationship } = req.body;
  const networks = filterByField('familyNetworks', 'ownerId', req.user.id);
  if (networks.length === 0) return res.status(404).json({ error: 'No family network found. Create one first.' });

  const network = networks[0];
  const member = { id: Date.now().toString(), name, phone, relationship, addedAt: new Date().toISOString() };
  const updated = update('familyNetworks', network.id, { members: [...(network.members || []), member] });

  res.json({ message: 'Member added to Family Shield', member, network: updated });
});

// POST /api/family-shield/check-call
router.post('/check-call', authenticate, (req, res) => {
  const { phone_number } = req.body;
  if (!phone_number) return res.status(400).json({ error: 'phone_number is required' });

  // Check against scam number database
  const isInScamDB = db.scamNumbers.some(s => s.number === phone_number);
  const riskScore = isInScamDB ? 0.95 : Math.random() * 0.4;
  const riskLevel = riskScore > 0.7 ? 'HIGH' : riskScore > 0.4 ? 'MEDIUM' : 'LOW';

  // Update call count
  const networks = filterByField('familyNetworks', 'ownerId', req.user.id);
  if (networks.length > 0) {
    update('familyNetworks', networks[0].id, { callsChecked: (networks[0].callsChecked || 0) + 1 });
  }

  res.json({
    phone_number,
    risk_level: riskLevel,
    risk_score: riskScore,
    in_scam_database: isInScamDB,
    recommendation: riskLevel === 'HIGH' ? 'BLOCK — Known scam number' : riskLevel === 'MEDIUM' ? 'CAUTION — Exercise care before answering' : 'SAFE — No threats detected',
    checked_at: new Date().toISOString()
  });
});

// GET /api/family-shield/network
router.get('/network', authenticate, (req, res) => {
  const networks = filterByField('familyNetworks', 'ownerId', req.user.id);
  if (networks.length === 0) return res.json({ network: null, message: 'No family network found' });
  res.json({ network: networks[0] });
});

module.exports = router;
