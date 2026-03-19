# 🛡️ CyberShield Sentinel — AI-Powered Scam Intelligence Platform

A full-stack web application for detecting, analyzing, and fighting online scams using multi-stage AI models.

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and set your JWT_SECRET and other keys
node server.js
# Backend runs on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
# Frontend runs on http://localhost:3000
```

---

## 📁 Project Structure

```
cybershield/
├── backend/
│   ├── server.js              # Express server entry point
│   ├── models/
│   │   └── store.js           # In-memory database (replace with MongoDB/PostgreSQL)
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js            # POST /auth/register, POST /auth/login
│   │   ├── cases.js           # CRUD for scam cases
│   │   ├── evidence.js        # File upload route
│   │   ├── actionPlans.js     # Action plans per case
│   │   ├── legalDocuments.js  # FIR + Bank Dispute PDF generator
│   │   ├── recoveryPlan.js    # Financial recovery checklist
│   │   ├── scammerBot.js      # AI scammer engagement bot
│   │   ├── familyShield.js    # Family protection network
│   │   ├── scamDatabase.js    # Community scam number database
│   │   └── transactionGuard.js # Payment risk checker
│   └── services/
│       ├── aiAnalysis.js      # Multi-stage AI analysis engine
│       └── pdfGenerator.js    # PDF generation (FIR, Bank Dispute)
│
└── frontend/
    └── src/
        ├── App.js             # Router setup
        ├── context/
        │   └── AuthContext.js # Auth state management
        ├── utils/
        │   └── api.js         # Axios API client
        ├── components/
        │   └── Layout.js      # Sidebar + topbar layout
        └── pages/
            ├── LoginPage.js
            ├── RegisterPage.js
            ├── DashboardPage.js
            ├── ReportScamPage.js  # Multi-step scam reporting form
            ├── CasesPage.js
            ├── CaseDetailPage.js  # Full AI analysis + tabs
            ├── FamilyShieldPage.js
            ├── TransactionGuardPage.js
            ├── ScammerBotPage.js
            └── LegalDocsPage.js
```

---

## 🔑 Key Features

| Feature | Description |
|---|---|
| **AI Scam Analysis** | Multi-stage pipeline: text, URL, image (deepfake), audio (voice clone) |
| **Legal Document Generator** | Auto-generate FIR PDF and Bank Dispute Letter |
| **Financial Recovery Assistant** | Step-by-step recovery plan with helpline numbers |
| **AI Scammer Engagement Bot** | Decoy persona that engages scammers and gathers intelligence |
| **Family Shield Network** | Protect family members, check incoming calls against scam DB |
| **Real-Time Transaction Guard** | AI risk assessment for UPI/bank transactions |
| **Complaint Filing** | Auto-file complaint to National Cyber Crime Portal |
| **Safe Alternatives Engine** | Recommends SEBI/RBI-regulated platforms when fake investment detected |
| **Deepfake Provenance** | Shows probable AI tool origin hints for manipulated media |
| **Community Scam DB** | Crowdsourced scam number database from user reports |

---

## 🌐 API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user with consent flow |
| POST | `/api/auth/login` | Login and get JWT |
| POST | `/api/cases` | Create case with AI analysis |
| GET | `/api/cases` | Get all user cases |
| GET | `/api/cases/:id` | Get case details |
| POST | `/api/cases/:id/file-complaint` | File with cyber crime portal |
| POST | `/api/evidence` | Upload evidence files |
| GET | `/api/action-plans/:caseId` | Get action plan |
| GET | `/api/legal-documents/fir/:caseId` | Download FIR PDF |
| GET | `/api/legal-documents/bank-dispute/:caseId` | Download Bank Dispute Letter |
| GET | `/api/recovery-plan/:caseId` | Get recovery checklist |
| POST | `/api/scammer-bot/start/:caseId` | Start bot session |
| POST | `/api/scammer-bot/respond/:caseId` | Bot respond to scammer |
| POST | `/api/family-shield/create` | Create family network |
| POST | `/api/family-shield/add-member` | Add protected member |
| POST | `/api/family-shield/check-call` | Check incoming call |
| POST | `/api/scam-database/report-number` | Report scam number |
| POST | `/api/transaction-guard/check` | Check transaction safety |
| POST | `/api/transaction-guard/freeze` | Freeze suspicious transaction |

---

## 🛠️ Production Upgrade Path

1. **Database**: Replace in-memory `store.js` with MongoDB Atlas or PostgreSQL (Prisma)
2. **AI Services**: Integrate real ML APIs:
   - Text: OpenAI GPT-4 / fine-tuned classifier
   - Deepfake: Sensity.ai or Hive Moderation API
   - Voice Clone: Resemble.ai Detection or ElevenLabs
   - URL: Google Safe Browsing API + PhishTank
3. **File Storage**: Replace local `uploads/` with AWS S3 or Cloudflare R2
4. **Email/SMS**: Add OTP verification via Twilio or MSG91
5. **Payments**: Real UPI integration via Setu or Razorpay APIs
6. **Cyber Crime Portal**: Replace mock `complaintId` with real NCRP API integration
7. **Authentication**: Add OAuth (Google), OTP-based 2FA
8. **Deployment**: Docker + Railway/Render for backend, Vercel for frontend

---

## 🔐 Security Notes

- All routes are JWT-protected
- Rate limiting: 200 requests / 15 minutes per IP
- Helmet.js security headers enabled
- File upload type & size validation
- CORS restricted to frontend origin
- Passwords hashed with bcrypt (12 rounds)

---

## 📞 Emergency Helplines (India)

| Service | Number |
|---|---|
| Cyber Crime Helpline | **1930** |
| RBI Helpline | **14440** |
| SEBI Investor | **1800-266-7575** |
| Consumer Forum | **1800-11-4000** |
| National Emergency | **112** |
