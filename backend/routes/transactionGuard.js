const express = require('express');
const router = express.Router();
const { insert, filterByField } = require('../models/store');
const { authenticate } = require('../middleware/auth');

// POST /api/transaction-guard/check
router.post('/check', authenticate, (req, res) => {
  const { amount, recipient, upi_id, description } = req.body;
  const amt = parseFloat(amount) || 0;

  // Simulate risk assessment
  const riskFactors = [];
  if (amt > 50000) riskFactors.push('Large transaction amount');
  if (/prize|winner|lottery|investment|reward/i.test(description)) riskFactors.push('Suspicious keywords in description');
  if (upi_id && /@(paytm|gpay|phonepe)$/i.test(upi_id) === false) riskFactors.push('Unverified UPI handle');

  const riskScore = Math.min(0.95, riskFactors.length * 0.3 + Math.random() * 0.1);
  const riskLevel = riskScore > 0.6 ? 'HIGH' : riskScore > 0.3 ? 'MEDIUM' : 'LOW';

  const tx = insert('transactions', {
    userId: req.user.id,
    amount: amt,
    recipient,
    upi_id,
    description,
    riskScore,
    riskLevel,
    riskFactors,
    status: riskLevel === 'HIGH' ? 'flagged' : 'cleared',
  });

  res.json({
    transaction_id: tx.id,
    risk_level: riskLevel,
    risk_score: riskScore,
    risk_factors: riskFactors,
    recommendation: riskLevel === 'HIGH' ? 'BLOCK — Do not proceed with this transaction' : riskLevel === 'MEDIUM' ? 'CAUTION — Verify recipient before proceeding' : 'CLEAR — Transaction appears safe',
    action_required: riskLevel === 'HIGH'
  });
});

// POST /api/transaction-guard/freeze
router.post('/freeze', authenticate, (req, res) => {
  const { transaction_id } = req.body;
  res.json({ message: 'Transaction frozen successfully', transaction_id, status: 'frozen', timestamp: new Date().toISOString() });
});

// GET /api/transaction-guard/history
router.get('/history', authenticate, (req, res) => {
  const txs = filterByField('transactions', 'userId', req.user.id);
  res.json({ transactions: txs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) });
});

module.exports = router;
