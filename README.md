# ComplaintAI - Consumer Complaint Generator

An AI-powered tool that helps UK consumers write professional, ombudsman-quality complaint letters for:
- PCP/Motor Finance Commission claims
- Section 75 Credit Card claims  
- Unaffordable/Irresponsible Lending claims
- Holiday Park mis-selling claims

## 🎯 What This Tool Does

1. **Qualifies the complaint** - Asks targeted questions to determine if user has valid grounds
2. **Collects evidence requirements** - Tells user exactly what documents they need
3. **Generates professional complaint letter** - Using AI trained on 170,000+ FOS decisions
4. **Provides escalation path** - If rejected, generates FOS complaint form

## ⚖️ Legal Positioning

This is a **document preparation service**, NOT a Claims Management Company (CMC).

- We do NOT provide advice
- We do NOT act on behalf of users
- We do NOT submit complaints for users
- We do NOT take percentage of compensation
- Users submit complaints themselves

Similar to Which? complaint tools, LegalZoom, or Citizens Advice templates.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                   │
│  - Landing page                                         │
│  - Multi-step questionnaire                             │
│  - Payment (Stripe)                                     │
│  - Document preview/download                            │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              BACKEND (Next.js API Routes)               │
│  - /api/generate-complaint                              │
│  - /api/create-checkout                                 │
│  - /api/webhook (Stripe)                                │
│  - /api/download-pdf                                    │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   AI GENERATION LAYER                   │
│  - Claude API integration                               │
│  - RAG retrieval from FOS decisions                     │
│  - Complaint type-specific prompts                      │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                 DATABASE (Supabase)                     │
│  - FOS decisions (170k+ records)                        │
│  - Vector embeddings (pgvector)                         │
│  - User submissions                                     │
│  - Payment records                                      │
└─────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
complaint-ai/
├── scraper/                    # FOS decision scraper
│   ├── fos_scraper.py         # Main scraping logic
│   ├── data_processor.py      # Clean and categorise decisions
│   └── embeddings.py          # Generate vector embeddings
│
├── src/
│   ├── app/                   # Next.js app router
│   │   ├── page.tsx          # Landing page
│   │   ├── questionnaire/    # Multi-step form
│   │   ├── payment/          # Checkout flow
│   │   ├── download/         # Document delivery
│   │   └── api/              # API routes
│   │
│   ├── components/           # React components
│   │   ├── ui/              # Base UI components
│   │   ├── forms/           # Questionnaire forms
│   │   └── documents/       # PDF preview/generation
│   │
│   ├── lib/                  # Shared utilities
│   │   ├── ai/              # Claude API integration
│   │   ├── db/              # Supabase client
│   │   ├── stripe/          # Payment handling
│   │   └── pdf/             # PDF generation
│   │
│   └── prompts/             # AI prompt templates
│       ├── pcp-motor.ts
│       ├── section-75.ts
│       ├── unaffordable-lending.ts
│       └── holiday-park.ts
│
├── database/
│   └── schema.sql           # Database schema
│
└── docs/
    ├── legal-disclaimer.md  # Terms of service template
    └── complaint-types.md   # Supported complaint categories
```

## 💰 Pricing Tiers

| Tier | Claim Value | Price |
|------|-------------|-------|
| Standard | Up to £1,000 | £29 |
| Plus | £1,000 - £3,000 | £49 |
| Premium | £3,000 - £10,000 | £79 |
| Complex | £10,000+ | £129 |

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.9+ (for scraper)
- Supabase account
- Stripe account
- Anthropic API key

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run scraper (separate terminal)
cd scraper
pip install -r requirements.txt
python fos_scraper.py
```

## 📊 Complaint Types Supported

### 1. PCP/Motor Finance Commission
- Discretionary Commission Arrangements (DCA)
- Hidden commission payments
- Inflated interest rates
- Eligible: Agreements 6 April 2007 - 1 November 2024

### 2. Section 75 Credit Card Claims
- Goods not delivered
- Faulty/not as described goods
- Company gone bust
- Eligible: Purchases £100 - £30,000 paid partly/fully by credit card

### 3. Unaffordable/Irresponsible Lending
- Credit cards with excessive limits
- Loans without affordability checks
- Persistent debt not addressed
- Gambling-funded lending

### 4. Holiday Park Mis-selling
- False rental income promises
- Hidden fees and charges
- Depreciation misrepresentation
- Year-round living promises on holiday-only sites

## 🔒 Security & Compliance

- No storage of sensitive financial data
- Stripe handles all payment processing
- User data deleted after 30 days
- GDPR compliant
- Clear terms of service disclaiming advice

## 📈 Success Metrics

Track in admin dashboard:
- Questionnaire completion rate
- Payment conversion rate
- User-reported outcomes (optional feedback)
- Complaint type distribution
- Revenue by tier

---

Built for UK consumers. Not a CMC. Not legal advice.
