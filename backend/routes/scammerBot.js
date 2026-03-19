const express = require('express');
const router = express.Router();
const { findById, insert, update, findByField } = require('../models/store');
const { authenticate } = require('../middleware/auth');

const BOT_RESPONSES = {
  greeting: ["Hello! I'm interested in your offer. Can you tell me more?", "Hi there! I saw your message and I'm curious.", "Hello, I received your contact. What is this about?"],
  interest: ["That sounds interesting! How much can I earn per month?", "Really? My cousin also does this. What's the minimum investment?", "Wow, guaranteed returns! I have some savings. How to proceed?"],
  delay: ["I need to discuss with my family first. Can we talk tomorrow?", "I'm at work right now. Can you send me the details on WhatsApp?", "Let me check my bank balance first. What's the deadline?"],
  skeptical: ["Can you share SEBI registration proof?", "I'll need to verify this with my financial advisor first.", "Can you give me a physical office address?"],
  stall: ["My bank OTP is not coming. What should I do?", "I'm having trouble with the payment app. Can you guide me?", "The link you sent is not opening. Can you resend?"]
};

const getRandomResponse = (category) => {
  const arr = BOT_RESPONSES[category] || BOT_RESPONSES.greeting;
  return arr[Math.floor(Math.random() * arr.length)];
};

// POST /api/scammer-bot/start/:caseId
router.post('/start/:caseId', authenticate, (req, res) => {
  const c = findById('cases', req.params.caseId);
  if (!c) return res.status(404).json({ error: 'Case not found' });
  if (c.userId !== req.user.id) return res.status(403).json({ error: 'Access denied' });

  const session = insert('botSessions', {
    caseId: req.params.caseId,
    userId: req.user.id,
    status: 'active',
    persona: { name: 'Ramesh Kumar', age: 45, profession: 'Retired teacher', city: 'Bhopal' },
    messages: [],
    scammerMessages: [],
    intelligenceGathered: []
  });

  res.json({
    message: 'Scammer engagement bot activated',
    session_id: session.id,
    bot_persona: session.persona,
    initial_response: getRandomResponse('greeting'),
    warning: 'Bot is collecting scammer intelligence. All conversations are logged for law enforcement.'
  });
});

// POST /api/scammer-bot/respond/:caseId
router.post('/respond/:caseId', authenticate, (req, res) => {
  const { scammer_message, session_id } = req.body;
  const session = findById('botSessions', session_id);
  if (!session) return res.status(404).json({ error: 'Bot session not found' });

  // Simple keyword-based response selection
  const msg = (scammer_message || '').toLowerCase();
  let responseCategory = 'delay';
  if (msg.includes('invest') || msg.includes('return') || msg.includes('profit')) responseCategory = 'interest';
  else if (msg.includes('otp') || msg.includes('transfer') || msg.includes('send money')) responseCategory = 'stall';
  else if (msg.includes('sebi') || msg.includes('rbi') || msg.includes('register')) responseCategory = 'skeptical';
  else if (msg.includes('hello') || msg.includes('hi') || msg.includes('interested')) responseCategory = 'greeting';

  const botResponse = getRandomResponse(responseCategory);

  // Update session
  const updated = update('botSessions', session_id, {
    messages: [...(session.messages || []), { role: 'bot', text: botResponse, timestamp: new Date().toISOString() }],
    scammerMessages: [...(session.scammerMessages || []), { text: scammer_message, timestamp: new Date().toISOString() }],
    intelligenceGathered: [...(session.intelligenceGathered || []), scammer_message]
  });

  res.json({
    bot_response: botResponse,
    intelligence_note: `Scammer message logged. Total messages collected: ${updated.scammerMessages.length}`,
    session_status: 'active'
  });
});

module.exports = router;
