# iComplain V2 - Predictive Complaint System

## What Changed

The complaint tool has been completely rebuilt based on deep research into FOS (Financial Ombudsman Service) decision patterns. The goal: **75%+ success rate** through structured, evidence-based complaints.

## Key Improvements

### 1. Predictive Success Rate Calculator

Every answer the user gives now updates a **real-time success estimate** shown in the sidebar:

- **Green (70%+)**: Strong case, likely to succeed
- **Amber (50-70%)**: Moderate chance, add evidence to improve
- **Red (<50%)**: Weak case, may need more factors

The calculator is based on actual FOS decision patterns:
- Specific answers add/subtract from success rate
- Evidence types have quantified impact (+10-20%)
- Vulnerability factors add credibility (+4-10%)

### 2. Structured Predictive Questions

Questions are now designed to:
- **Capture breach indicators** - Questions target specific regulatory breaches
- **Show impact** - Each option shows its effect on success rate
- **Reduce free text** - Most answers are structured choices
- **Guide toward strong cases** - Highlight "hot" options with badges

Example for car finance:
```
Were you told about any commission the dealer would receive?
- No - I wasn't told anything [+20%] 
- Vaguely - "lenders may pay us a fee" [+15%]
- Partially - told there was commission [+10%]
- Yes - fully explained [⚠️ -15%]
```

### 3. Evidence Scoring System

Evidence is quantified by impact:

| Evidence Type | Success Impact |
|--------------|----------------|
| Bank statements | +20% |
| Credit file from the time | +18% |
| Original credit agreement | +15% |
| Payment records | +15% |
| Income proof (payslips) | +14% |
| Letters/emails from lender | +12% |
| Action Fraud reference | +12% |
| Screenshots | +10% |

Users see what they can add to boost their chances.

### 4. Vulnerability Considerations

FCA requires firms to consider vulnerability. Now captured:

| Factor | Impact |
|--------|--------|
| Mental health condition | +10% |
| Physical health condition | +8% |
| Major life event | +8% |
| Limited financial literacy | +6% |
| Young (<25) at time | +5% |
| Elderly (>65) at time | +5% |
| English second language | +4% |

### 5. Complaint-Specific Regulations

Each complaint type now has specific regulations built in:

**Car Finance (DCA/PCP):**
- Primary: CONC 4.5.3R
- Secondary: Section 140A CCA 1974, FCA Principle 7
- Case law: Plevin v Paragon [2014], Johnson v FirstRand [2024]
- Base success rate: 45% → Max 85%

**Credit Card Affordability:**
- Primary: CONC 5.2A.4R
- Secondary: CONC 5.2A.12R, CONC 6.7.2R, FCA Principle 6
- Base success rate: 40% → Max 80%

**Bank Fraud/APP Scams:**
- Primary: PSR Specific Direction 20 (SD20)
- Secondary: CRM Code, PSR 2017
- Base success rate: 55% → Max 88%
- Key factor: Post Oct 2024 = mandatory reimbursement (+20%)

**Unaffordable Loans:**
- Primary: CONC 5.2A.4R
- Secondary: CONC 5.3.1G, CONC 6.7.2R
- Base success rate: 45% → Max 82%
- Key factor: Repeat borrowing 7+ loans = +20%

**Section 75:**
- Primary: Section 75 Consumer Credit Act 1974
- Base success rate: 55% → Max 85%
- Key factor: Credit card + £100-£30k = +25%

### 6. Optimized Letter Generation

The AI prompt now follows the exact structure from FOS research:

1. **Header** - FORMAL COMPLAINT marking
2. **Opening** - 2 sentences max
3. **Facts** - Chronological timeline
4. **Regulatory Breach** - Cite specific rules (brief)
5. **Harm** - Quantified financial loss
6. **Remedy** - Specific amounts + 8% interest
7. **Deadline** - 8 weeks + FOS escalation

Language rules enforced:
- "I believe" / "In my view" (not definitive claims)
- Professional but accessible
- No aggressive or emotional tone

## File Structure

```
/src/lib/complaint-engine.ts      # Core engine with all config
  - SUCCESS_FACTORS              # Evidence & vulnerability scoring
  - COMPLAINT_CONFIGS            # 5 complaint types with questions
  - calculateSuccessRate()       # Real-time calculator
  - buildLetterPrompt()          # AI prompt builder

/src/app/questionnaire/page.tsx   # Smart questionnaire UI
  - SuccessIndicator             # Live success meter
  - EvidenceSelector             # Evidence checkboxes with impact
  - VulnerabilitySelector        # Vulnerability checkboxes

/src/app/review/page.tsx          # Review & generate page
  - Success rate display
  - Answer summary
  - Letter generation

/src/app/api/generate-letter/route.ts  # Claude API endpoint
  - Enhanced system prompt
  - Uses letterPrompt from engine
```

## Success Rate Calculation Logic

```typescript
// Starting rate based on complaint type
let rate = config.baseSuccessRate  // 40-55% depending on type

// Add/subtract based on answers
if (answer === 'not_told') rate += 20  // No commission disclosure
if (answer === '2007-2021') rate += 15  // DCA period
if (answer === 'automatic') rate += 15  // Auto limit increases

// Add evidence impact
if (has_bank_statements) rate += 20
if (has_credit_file) rate += 18

// Add vulnerability impact  
if (mental_health) rate += 10

// Cap at maximum for complaint type
rate = Math.min(rate, config.maxSuccessRate)  // 80-88%
```

## FOS Research Insights Applied

From the deep research:

1. **Self-representation beats CMCs**: 37% success vs 27% for claims companies
2. **FOS overturns 75%+ of fraud rejections**: Don't give up if bank says no
3. **Specific regulations matter**: CONC citations dramatically improve outcomes
4. **Evidence quality > quantity**: Bank statements from the time are gold
5. **Vulnerability = FCA compliance**: Firms MUST consider it
6. **8-week deadline is key**: Creates real pressure to settle
7. **Johnson v FirstRand [2024]**: Changed everything for car finance

## Pricing Strategy

Recommended soft launch:
- **£15** for first 10-20 users (validation price)
- **£29** standard price
- Position against claims companies taking 25-40%

At £29: User keeps 100% of typical £700-1,500 refund instead of losing £200-600 to a CMC.

## Next Steps to Improve

1. **Add Stripe payment** before letter generation
2. **A/B test question wording** - which phrasing converts better
3. **Collect outcome data** - did they succeed? refine model
4. **Add firm-specific intelligence** - known settlement patterns
5. **FOS decision scraping** - build RAG for precedent matching
6. **Complaint email finder** - auto-populate company addresses

## Technical Notes

- Next.js 14 (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- Claude API (claude-sonnet-4-20250514)
- Session storage for flow (no database yet)
- Build: 112KB questionnaire, 108KB review page
