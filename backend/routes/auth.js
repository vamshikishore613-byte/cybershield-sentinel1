const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { insert, findByField } = require('../models/store');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, consents } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    const existing = findByField('users', 'email', email);
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = insert('users', {
      name,
      email,
      phone: phone || '',
      password: hashedPassword,
      consents: {
        financialGuard: consents?.financialGuard || false,
        familyShield: consents?.familyShield || false,
        evidenceAutoAttach: consents?.evidenceAutoAttach || false,
      },
      verified: false,
      plan: 'free'
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET || 'cybershield_secret_dev',
      { expiresIn: '7d' }
    );

    const { password: _, ...userSafe } = user;
    res.status(201).json({ message: 'User registered successfully', user: userSafe, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = findByField('users', 'email', email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET || 'cybershield_secret_dev',
      { expiresIn: '7d' }
    );

    const { password: _, ...userSafe } = user;
    res.json({ message: 'Login successful', user: userSafe, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth').authenticate, (req, res) => {
  const { findById } = require('../models/store');
  const user = findById('users', req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password: _, ...userSafe } = user;
  res.json({ user: userSafe });
});

module.exports = router;
