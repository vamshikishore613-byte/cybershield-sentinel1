require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs-extra');

const app = express();

// Ensure upload directory exists
fs.ensureDirSync(process.env.UPLOAD_DIR || './uploads');

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cases', require('./routes/cases'));
app.use('/api/evidence', require('./routes/evidence'));
app.use('/api/action-plans', require('./routes/actionPlans'));
app.use('/api/legal-documents', require('./routes/legalDocuments'));
app.use('/api/recovery-plan', require('./routes/recoveryPlan'));
app.use('/api/scammer-bot', require('./routes/scammerBot'));
app.use('/api/family-shield', require('./routes/familyShield'));
app.use('/api/scam-database', require('./routes/scamDatabase'));
app.use('/api/transaction-guard', require('./routes/transactionGuard'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'CyberShield Sentinel API', version: '1.0.0', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🛡️  CyberShield Sentinel API running on port ${PORT}`);
  console.log(`📡  Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
