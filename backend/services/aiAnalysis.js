// AI Analysis Service - Simulates multi-stage AI pipeline
// In production, replace with actual ML model APIs

const SCAM_TYPES = ['phishing', 'deepfake', 'voice_clone', 'fake_investment', 'fake_deal'];

const SAFE_ALTERNATIVES = {
  fake_investment: [
    { name: 'Zerodha', url: 'https://zerodha.com', reason: 'SEBI-registered, largest Indian stockbroker' },
    { name: 'Groww', url: 'https://groww.in', reason: 'RBI & SEBI regulated mutual fund platform' },
    { name: 'HDFC Securities', url: 'https://hdfcsec.com', reason: 'Bank-backed, fully SEBI-compliant' },
    { name: 'NSE India', url: 'https://nseindia.com', reason: 'Official National Stock Exchange portal' },
    { name: 'PPFAS Mutual Fund', url: 'https://amc.ppfas.com', reason: 'SEBI-registered, transparent fee structure' }
  ],
  phishing: [
    { name: 'Google Safe Browsing', url: 'https://safebrowsing.google.com', reason: 'Official threat checking service' },
    { name: 'VirusTotal', url: 'https://virustotal.com', reason: 'Multi-engine URL/file scanner' }
  ],
  fake_deal: [
    { name: 'Amazon India', url: 'https://amazon.in', reason: 'Official, buyer protection guaranteed' },
    { name: 'Flipkart', url: 'https://flipkart.com', reason: 'SEBI-backed, official return policy' },
    { name: 'Meesho', url: 'https://meesho.com', reason: 'Verified sellers, secure payments' }
  ]
};

const DEEPFAKE_HINTS = [
  'Likely edited with commercial AI deepfake tool',
  'Consistent with GAN-generated face-swap pattern',
  'High-likelihood of deepfake generator StyleGAN-style artifacts',
  'Facial boundary inconsistencies typical of neural rendering',
  'Compression artifacts consistent with video manipulation pipeline'
];

const VOICE_HINTS = [
  'High-likelihood of voice-cloning via ElevenLabs-style TTS',
  'Prosody patterns consistent with neural voice synthesis',
  'Spectral artifacts typical of real-time voice conversion',
  'Pitch modulation inconsistencies suggesting AI generation',
  'Consistent with RVC (Real-time Voice Cloning) pipeline'
];

function analyzeText(text) {
  const scamKeywords = ['guaranteed returns', 'risk-free investment', 'act now', 'limited time', 'click here', 'verify account', 'winner', 'prize', 'OTP', 'KYC expired', 'refund pending', 'lottery'];
  const found = scamKeywords.filter(kw => text?.toLowerCase().includes(kw.toLowerCase()));
  const score = Math.min(0.95, found.length * 0.18 + Math.random() * 0.1);
  return { score, keywords_found: found };
}

function analyzeImage(filename) {
  // Simulate deepfake detection
  const isDeepfake = Math.random() > 0.4;
  const confidence = 0.72 + Math.random() * 0.25;
  return {
    is_manipulated: isDeepfake,
    confidence,
    probable_origin_hint: isDeepfake ? DEEPFAKE_HINTS[Math.floor(Math.random() * DEEPFAKE_HINTS.length)] : 'No significant manipulation detected',
    face_swap_detected: isDeepfake && Math.random() > 0.5,
    metadata_anomalies: isDeepfake ? ['EXIF timestamp mismatch', 'Compression inconsistency'] : []
  };
}

function analyzeAudio(filename) {
  const isClone = Math.random() > 0.35;
  const confidence = 0.68 + Math.random() * 0.28;
  return {
    is_voice_clone: isClone,
    confidence,
    voice_clone_hint: isClone ? VOICE_HINTS[Math.floor(Math.random() * VOICE_HINTS.length)] : 'Natural voice patterns detected',
    spectral_anomalies: isClone,
    tts_pattern_match: isClone ? (Math.random() > 0.5 ? 'ElevenLabs-style' : 'Neural TTS') : null
  };
}

function analyzeURL(url) {
  const suspiciousPatterns = [/bit\.ly/, /tinyurl/, /[0-9]{1,3}\.[0-9]{1,3}/, /free.*money/, /login.*verify/, /secure.*bank.*update/i];
  const flagged = suspiciousPatterns.filter(p => p.test(url || ''));
  const score = Math.min(0.97, flagged.length * 0.25 + Math.random() * 0.15);
  return {
    is_phishing: score > 0.4,
    confidence: score,
    flags: flagged.map(p => p.toString()),
    domain_age_days: Math.floor(Math.random() * 30) + 1,
    ssl_valid: Math.random() > 0.3,
    similar_to_known_scam: score > 0.6
  };
}

function getOverallVerdict(textAnalysis, imageAnalysis, audioAnalysis, urlAnalysis) {
  const scores = [];
  if (textAnalysis) scores.push(textAnalysis.score);
  if (imageAnalysis) scores.push(imageAnalysis.confidence);
  if (audioAnalysis) scores.push(audioAnalysis.confidence);
  if (urlAnalysis) scores.push(urlAnalysis.confidence);

  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const riskLevel = avgScore > 0.75 ? 'CRITICAL' : avgScore > 0.5 ? 'HIGH' : avgScore > 0.3 ? 'MEDIUM' : 'LOW';

  return {
    overall_scam_score: avgScore,
    risk_level: riskLevel,
    is_scam: avgScore > 0.45,
    confidence_percentage: Math.round(avgScore * 100),
    analysis_stages: scores.length,
    recommendation: avgScore > 0.45
      ? 'BLOCK — High probability scam detected. Do not engage.'
      : 'CAUTION — Exercise care. Some suspicious signals detected.'
  };
}

function detectScamType(caseData) {
  const { description, url, hasAudio, hasVideo, hasImage } = caseData;
  if (hasAudio) return 'voice_clone';
  if (hasVideo || (hasImage && description?.toLowerCase().includes('face'))) return 'deepfake';
  if (description?.toLowerCase().includes('invest') || description?.toLowerCase().includes('return')) return 'fake_investment';
  if (description?.toLowerCase().includes('refund') || description?.toLowerCase().includes('deal')) return 'fake_deal';
  return 'phishing';
}

async function performFullAnalysis(caseData) {
  const scamType = detectScamType(caseData);
  const textAnalysis = caseData.description ? analyzeText(caseData.description) : null;
  const urlAnalysis = caseData.url ? analyzeURL(caseData.url) : null;
  const imageAnalysis = caseData.hasImage ? analyzeImage('uploaded_image') : null;
  const audioAnalysis = caseData.hasAudio ? analyzeAudio('uploaded_audio') : null;
  const verdict = getOverallVerdict(textAnalysis, imageAnalysis, audioAnalysis, urlAnalysis);
  const safeAlternatives = ['fake_investment', 'phishing', 'fake_deal'].includes(scamType)
    ? (SAFE_ALTERNATIVES[scamType] || [])
    : [];

  return {
    scam_type: scamType,
    verdict,
    text_analysis: textAnalysis,
    url_analysis: urlAnalysis,
    image_analysis: imageAnalysis,
    audio_analysis: audioAnalysis,
    safe_alternatives: safeAlternatives,
    analysis_timestamp: new Date().toISOString(),
    model_version: 'CyberShield-AI-v2.1'
  };
}

module.exports = { performFullAnalysis, analyzeText, analyzeImage, analyzeAudio, analyzeURL };
