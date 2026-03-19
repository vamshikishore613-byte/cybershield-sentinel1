// Action Plans
const express = require('express');
const router = express.Router();
const { findById } = require('../models/store');
const { authenticate } = require('../middleware/auth');

router.get('/:caseId', authenticate, (req, res) => {
  const c = findById('cases', req.params.caseId);
  if (!c) return res.status(404).json({ error: 'Case not found' });
  if (c.userId !== req.user.id) return res.status(403).json({ error: 'Access denied' });

  const riskLevel = c.aiAnalysis?.verdict?.risk_level || 'HIGH';
  const scamType = c.scamType || 'phishing';

  const immediateActions = {
    phishing: ['Do NOT click any links', 'Report URL to Google Safe Browsing', 'Change passwords if credentials were shared', 'Enable 2FA on affected accounts'],
    deepfake: ['Do NOT share the content further', 'Report to platform where it was found', 'Document screenshot with timestamp', 'Contact cybercrime cell'],
    voice_clone: ['Record and preserve the call audio', 'Do NOT transfer any money', 'Warn family/contacts about the caller', 'Report number to TRAI'],
    fake_investment: ['Do NOT transfer funds', 'Screenshot all communications', 'Check SEBI registered broker list', 'Report to SEBI Investor Helpline: 1800-266-7575'],
    fake_deal: ['Contact bank to dispute transaction', 'File complaint on Consumer Forum', 'Report to National Consumer Helpline: 1800-11-4000', 'Preserve all order confirmations'],
  };

  const steps = immediateActions[scamType] || immediateActions.phishing;

  res.json({
    caseId: req.params.caseId,
    action_plan: {
      priority: riskLevel === 'CRITICAL' ? 'URGENT' : 'HIGH',
      immediate_steps: steps,
      legal_steps: ['Download FIR document', 'File complaint at cybercrime.gov.in', 'Contact bank within 24 hours', 'Report to local police cyber cell'],
      prevention_steps: ['Enable real-time transaction guard', 'Add family members to Family Shield', 'Set up call screening', 'Install browser scam extension'],
      helpline_numbers: {
        cyber_crime: '1930',
        sebi_investor: '1800-266-7575',
        rbi_helpline: '14440',
        consumer_forum: '1800-11-4000',
        national_emergency: '112'
      }
    }
  });
});

module.exports = router;
