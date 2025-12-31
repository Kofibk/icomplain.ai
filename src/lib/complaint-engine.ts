// PREDICTIVE COMPLAINT ENGINE
// Built on FOS decision research to maximize success rates
// Goal: 75%+ uphold rate through structured, evidence-based complaints

// =============================================================================
// SUCCESS FACTORS DATABASE
// Based on FOS decision analysis - what actually gets complaints upheld
// =============================================================================

export const SUCCESS_FACTORS = {
  // Evidence types and their impact on success rates
  evidence: {
    'credit_agreement': { impact: 15, label: 'Original credit agreement', description: 'Shows exact terms you agreed to' },
    'bank_statements': { impact: 20, label: 'Bank statements from the time', description: 'Proves your financial situation' },
    'credit_file': { impact: 18, label: 'Credit report from the time', description: 'Shows existing debts lender should have seen' },
    'correspondence': { impact: 12, label: 'Letters/emails from the lender', description: 'Shows what they told you' },
    'payment_history': { impact: 15, label: 'Payment records', description: 'Shows struggle to repay' },
    'income_proof': { impact: 14, label: 'Payslips or benefits letters', description: 'Proves income at the time' },
    'screenshots': { impact: 10, label: 'Screenshots of conversations', description: 'For fraud/scam complaints' },
    'police_report': { impact: 12, label: 'Action Fraud reference', description: 'Required for fraud complaints' },
  },
  
  // Vulnerability indicators - FCA requires firms to consider these
  vulnerability: {
    'health_physical': { impact: 8, label: 'Physical health condition', fca_relevant: true },
    'health_mental': { impact: 10, label: 'Mental health condition (anxiety, depression, etc.)', fca_relevant: true },
    'life_event': { impact: 8, label: 'Major life event (bereavement, divorce, job loss)', fca_relevant: true },
    'low_financial_literacy': { impact: 6, label: 'Limited understanding of financial products', fca_relevant: true },
    'age_young': { impact: 5, label: 'Young (under 25) when agreement signed', fca_relevant: true },
    'age_elderly': { impact: 5, label: 'Elderly (over 65) when agreement signed', fca_relevant: true },
    'english_second_language': { impact: 4, label: 'English is not first language', fca_relevant: true },
  },
  
  // Timing factors
  timing: {
    'within_6_years': { impact: 0, label: 'Within 6 years of event', required: true },
    'aware_within_3_years': { impact: 0, label: 'Became aware within last 3 years', required: true },
  }
}

// =============================================================================
// COMPLAINT TYPE CONFIGURATIONS
// Each type has specific breach indicators, evidence requirements, and success predictors
// =============================================================================

export const COMPLAINT_CONFIGS = {
  
  // ---------------------------------------------------------------------------
  // CAR FINANCE / PCP COMMISSION
  // Current FOS uphold rate: 29% general, but 70%+ for properly evidenced DCA claims
  // ---------------------------------------------------------------------------
  'car-finance': {
    id: 'car-finance',
    title: 'Car Finance Complaint',
    subtitle: 'Hidden commission, mis-selling, or unfair charges',
    icon: '🚗',
    baseSuccessRate: 45, // Base rate before evidence/factors
    maxSuccessRate: 85,
    
    // Key regulations for this complaint type
    regulations: {
      primary: 'CONC 4.5.3R',
      secondary: ['Section 140A CCA 1974', 'FCA Principle 7', 'CONC 3.7.4G'],
      caselaw: ['Plevin v Paragon [2014] UKSC 61', 'Johnson v FirstRand [2024] EWCA Civ 1282'],
    },
    
    // Structured questions with predictive options
    questions: [
      {
        id: 'finance_type',
        question: 'What type of car finance did you have?',
        type: 'select',
        required: true,
        options: [
          { value: 'pcp', label: 'PCP (Personal Contract Purchase)', successModifier: 5 },
          { value: 'hp', label: 'HP (Hire Purchase)', successModifier: 5 },
          { value: 'conditional_sale', label: 'Conditional Sale', successModifier: 3 },
          { value: 'personal_loan', label: 'Personal Loan for car', successModifier: 0 },
          { value: 'unsure', label: 'Not sure', successModifier: 0 },
        ],
        helpText: 'PCP and HP are covered by the FCA investigation. Check your paperwork if unsure.',
      },
      {
        id: 'agreement_date',
        question: 'When did you take out the finance?',
        type: 'date_range',
        required: true,
        options: [
          { value: '2007-2021', label: 'April 2007 - January 2021', successModifier: 15, highlight: true, badge: '🔥 DCA Period' },
          { value: '2021-2024', label: 'February 2021 - October 2024', successModifier: 8, badge: 'Covered' },
          { value: 'before_2007', label: 'Before April 2007', successModifier: -20, warning: 'May be outside eligible period' },
          { value: 'after_2024', label: 'After October 2024', successModifier: -10, warning: 'New rules may apply' },
        ],
        helpText: 'DCAs (Discretionary Commission Arrangements) were banned in Jan 2021, but claims go back to 2007.',
      },
      {
        id: 'commission_disclosure',
        question: 'Were you told about any commission the dealer would receive?',
        type: 'select',
        required: true,
        successWeight: 'high',
        options: [
          { value: 'not_told', label: 'No - I wasn\'t told anything about commission', successModifier: 20 },
          { value: 'vague', label: 'Vaguely - something like "lenders may pay us a fee"', successModifier: 15 },
          { value: 'partial', label: 'Partially - told there was commission but not the amount', successModifier: 10 },
          { value: 'full', label: 'Yes - fully explained including the amount', successModifier: -15, warning: 'Full disclosure may weaken claim' },
          { value: 'unsure', label: 'Can\'t remember', successModifier: 5 },
        ],
        helpText: 'FOS ruled that "lenders may pay us a fee" is NOT adequate disclosure.',
      },
      {
        id: 'rate_options',
        question: 'Were you offered different interest rate options?',
        type: 'select',
        required: true,
        options: [
          { value: 'no_options', label: 'No - I was only shown one rate', successModifier: 12 },
          { value: 'take_or_leave', label: 'It was take it or leave it', successModifier: 10 },
          { value: 'some_options', label: 'I was shown a couple of options', successModifier: 3 },
          { value: 'many_options', label: 'Yes - multiple rates were discussed', successModifier: -5 },
          { value: 'unsure', label: 'Can\'t remember', successModifier: 0 },
        ],
        helpText: 'Dealers with DCAs often didn\'t offer options because higher rates = more commission.',
      },
      {
        id: 'dealer_claims',
        question: 'Did the dealer say anything about getting you the "best deal"?',
        type: 'multiselect',
        required: false,
        options: [
          { value: 'best_rate', label: '"This is the best rate you\'ll get"', successModifier: 8 },
          { value: 'searched_market', label: '"We\'ve searched the market for you"', successModifier: 10 },
          { value: 'only_option', label: '"This is your only option with your credit"', successModifier: 8 },
          { value: 'special_deal', label: '"I\'ve got you a special deal"', successModifier: 6 },
          { value: 'pressure', label: '"You need to decide today"', successModifier: 5 },
          { value: 'none', label: 'None of these / Can\'t remember', successModifier: 0 },
        ],
        helpText: 'These statements are significant if the dealer was actually tied to one lender.',
      },
      {
        id: 'lender',
        question: 'Who was the finance company?',
        type: 'autocomplete',
        autocompleteType: 'car',
        required: true,
        placeholder: 'Start typing the lender name...',
        helpText: 'This is on your finance agreement - usually not the dealer.',
      },
      {
        id: 'dealer',
        question: 'Which dealership arranged the finance?',
        type: 'text',
        required: true,
        placeholder: 'e.g. Arnold Clark, Evans Halshaw',
      },
      {
        id: 'finance_amount',
        question: 'Approximately how much was the total amount financed?',
        type: 'currency_range',
        required: true,
        options: [
          { value: 'under_10k', label: 'Under £10,000', avgCompensation: '£400-800' },
          { value: '10k_20k', label: '£10,000 - £20,000', avgCompensation: '£600-1,200' },
          { value: '20k_30k', label: '£20,000 - £30,000', avgCompensation: '£800-1,800' },
          { value: '30k_50k', label: '£30,000 - £50,000', avgCompensation: '£1,000-2,500' },
          { value: 'over_50k', label: 'Over £50,000', avgCompensation: '£1,500-4,000' },
        ],
        helpText: 'Compensation is typically based on excess interest paid due to commission.',
      },
      {
        id: 'agreement_status',
        question: 'What\'s the current status of the agreement?',
        type: 'select',
        required: true,
        options: [
          { value: 'paid_off', label: 'Fully paid off', successModifier: 0 },
          { value: 'still_paying', label: 'Still making payments', successModifier: 0 },
          { value: 'settled_early', label: 'Settled early', successModifier: 0 },
          { value: 'voluntary_termination', label: 'Voluntary termination', successModifier: 0 },
          { value: 'repossessed', label: 'Car was repossessed', successModifier: 3 },
          { value: 'defaulted', label: 'In default/arrears', successModifier: 2 },
        ],
      },
    ],
    
    // Evidence that strengthens this complaint type
    relevantEvidence: [
      'credit_agreement',
      'correspondence',
    ],
    
    // Letter template structure
    letterTemplate: {
      breach: 'failure to disclose commission arrangements',
      regulation: 'CONC 4.5.3R and FCA Principle 7',
      harm: 'paid a higher interest rate than necessary',
      remedy: 'refund of commission plus 8% statutory interest',
    },
  },

  // ---------------------------------------------------------------------------
  // CREDIT CARD / UNAFFORDABLE LENDING
  // FOS uphold rate: 51% for overdrafts, 27% for credit cards - but higher with evidence
  // ---------------------------------------------------------------------------
  'credit-card': {
    id: 'credit-card',
    title: 'Credit Card Complaint',
    subtitle: 'Unaffordable limits, irresponsible increases, or charges',
    icon: '💳',
    baseSuccessRate: 40,
    maxSuccessRate: 80,
    
    regulations: {
      primary: 'CONC 5.2A.4R',
      secondary: ['CONC 5.2A.12R', 'CONC 6.7.2R', 'FCA Principle 6', 'Section 140A CCA 1974'],
    },
    
    questions: [
      {
        id: 'complaint_reason',
        question: 'What\'s the main reason for your complaint?',
        type: 'select',
        required: true,
        options: [
          { value: 'unaffordable_limit', label: 'Given a credit limit I couldn\'t afford', successModifier: 10, category: 'affordability' },
          { value: 'limit_increase', label: 'Credit limit increased without proper checks', successModifier: 12, category: 'affordability' },
          { value: 'persistent_debt', label: 'Stuck in persistent debt - only making minimum payments', successModifier: 8, category: 'affordability' },
          { value: 'charges_fees', label: 'Unfair charges or fees', successModifier: 3, category: 'charges' },
          { value: 'section75', label: 'Paid for something I didn\'t receive', successModifier: 15, category: 'section75' },
          { value: 'fraud', label: 'Fraud on my account', successModifier: 10, category: 'fraud' },
        ],
      },
      {
        id: 'provider',
        question: 'Who is your credit card provider?',
        type: 'autocomplete',
        autocompleteType: 'credit',
        required: true,
        placeholder: 'Start typing...',
      },
      {
        id: 'account_opened',
        question: 'When did you open the account?',
        type: 'date',
        required: true,
        helpText: 'Approximate date is fine - check your first statement if unsure.',
      },
      {
        id: 'initial_limit',
        question: 'What was your initial credit limit?',
        type: 'currency',
        required: true,
        placeholder: 'e.g. 2000',
      },
      {
        id: 'highest_limit',
        question: 'What was the highest credit limit you had?',
        type: 'currency',
        required: true,
        placeholder: 'e.g. 8000',
        helpText: 'Large increases without checks are a strong indicator of irresponsible lending.',
      },
      {
        id: 'limit_increase_method',
        question: 'How were your credit limit increases applied?',
        type: 'select',
        required: true,
        successWeight: 'high',
        options: [
          { value: 'automatic', label: 'Automatically - I didn\'t ask for them', successModifier: 15 },
          { value: 'offered', label: 'Offered to me but I had to accept', successModifier: 8 },
          { value: 'requested', label: 'I requested them myself', successModifier: -5 },
          { value: 'unsure', label: 'Can\'t remember', successModifier: 0 },
        ],
        helpText: 'Automatic increases without affordability checks are a regulatory breach.',
      },
      {
        id: 'affordability_signs',
        question: 'Which of these applied to you when using the card?',
        type: 'multiselect',
        required: true,
        successWeight: 'critical',
        options: [
          { value: 'min_payments', label: 'I was only making minimum payments for months/years', successModifier: 12 },
          { value: 'essentials', label: 'I was using the card for essentials (food, bills)', successModifier: 10 },
          { value: 'balance_growing', label: 'The balance kept growing despite payments', successModifier: 8 },
          { value: 'other_debts', label: 'I had other debts I was struggling with', successModifier: 10 },
          { value: 'missed_payments', label: 'I missed payments or was in arrears', successModifier: 8 },
          { value: 'cash_advances', label: 'I was taking cash advances', successModifier: 6 },
          { value: 'gambling', label: 'I was using the card for gambling', successModifier: 8 },
          { value: 'payday_loans', label: 'I had payday loans at the same time', successModifier: 12 },
        ],
        helpText: 'Select ALL that apply. These are warning signs the lender should have spotted.',
      },
      {
        id: 'income_at_time',
        question: 'What was your approximate monthly income when you got the card?',
        type: 'currency_range',
        required: true,
        options: [
          { value: 'under_1000', label: 'Under £1,000/month', successModifier: 8 },
          { value: '1000_1500', label: '£1,000 - £1,500/month', successModifier: 5 },
          { value: '1500_2000', label: '£1,500 - £2,000/month', successModifier: 3 },
          { value: '2000_3000', label: '£2,000 - £3,000/month', successModifier: 0 },
          { value: 'over_3000', label: 'Over £3,000/month', successModifier: -3 },
        ],
        helpText: 'This helps show whether the credit limit was proportionate to your income.',
      },
      {
        id: 'current_status',
        question: 'What\'s the current status of the account?',
        type: 'select',
        required: true,
        options: [
          { value: 'open_using', label: 'Still open and using it', successModifier: 0 },
          { value: 'open_not_using', label: 'Open but not using it', successModifier: 0 },
          { value: 'paid_off_closed', label: 'Paid off and closed', successModifier: 0 },
          { value: 'in_arrears', label: 'In arrears / missed payments', successModifier: 5 },
          { value: 'defaulted', label: 'Defaulted', successModifier: 8 },
          { value: 'debt_management', label: 'In a debt management plan', successModifier: 6 },
          { value: 'written_off', label: 'Written off / sold to debt collector', successModifier: 5 },
        ],
      },
      {
        id: 'credit_file_impact',
        question: 'Has this affected your credit file?',
        type: 'select',
        required: true,
        options: [
          { value: 'default_marker', label: 'Yes - I have a default marker', successModifier: 5, remedyAdd: 'credit_file_correction' },
          { value: 'missed_payments_recorded', label: 'Yes - missed payments are recorded', successModifier: 3, remedyAdd: 'credit_file_correction' },
          { value: 'ccj', label: 'Yes - I have a CCJ from this debt', successModifier: 5, remedyAdd: 'credit_file_correction' },
          { value: 'not_sure', label: 'Not sure', successModifier: 0 },
          { value: 'no_impact', label: 'No impact', successModifier: 0 },
        ],
        helpText: 'If lending was irresponsible, adverse credit file entries should be removed.',
      },
    ],
    
    relevantEvidence: [
      'bank_statements',
      'credit_file',
      'income_proof',
      'payment_history',
    ],
    
    letterTemplate: {
      breach: 'failure to conduct adequate creditworthiness assessment',
      regulation: 'CONC 5.2A.4R and CONC 5.2A.12R',
      harm: 'given credit I could not sustainably afford',
      remedy: 'refund of interest and charges, plus credit file correction',
    },
  },

  // ---------------------------------------------------------------------------
  // BANK FRAUD / APP SCAMS
  // FOS overturns 75%+ of bank rejections
  // ---------------------------------------------------------------------------
  'bank-fraud': {
    id: 'bank-fraud',
    title: 'Fraud & Scam Complaint',
    subtitle: 'Lost money to fraud and bank won\'t refund',
    icon: '🚨',
    baseSuccessRate: 55, // High base because FOS overturns 75% of bank rejections
    maxSuccessRate: 88,
    
    regulations: {
      primary: 'PSR Specific Direction 20 (SD20)',
      secondary: ['Contingent Reimbursement Model Code', 'PSR 2017', 'FCA Principle 6'],
    },
    
    questions: [
      {
        id: 'fraud_type',
        question: 'What type of fraud/scam was it?',
        type: 'select',
        required: true,
        options: [
          { value: 'impersonation_bank', label: 'Someone pretending to be my bank', successModifier: 15, category: 'app' },
          { value: 'impersonation_police', label: 'Someone pretending to be police/authority', successModifier: 15, category: 'app' },
          { value: 'impersonation_company', label: 'Someone pretending to be a company (HMRC, Amazon, etc.)', successModifier: 12, category: 'app' },
          { value: 'purchase_scam', label: 'Paid for something that never arrived', successModifier: 10, category: 'app' },
          { value: 'investment_scam', label: 'Investment/crypto scam', successModifier: 8, category: 'app' },
          { value: 'romance_scam', label: 'Romance scam', successModifier: 8, category: 'app' },
          { value: 'card_stolen', label: 'Card stolen or cloned', successModifier: 12, category: 'unauthorized' },
          { value: 'account_takeover', label: 'Someone accessed my account', successModifier: 12, category: 'unauthorized' },
          { value: 'other', label: 'Other type of fraud', successModifier: 5 },
        ],
        helpText: 'APP (Authorised Push Payment) scams now have mandatory reimbursement rules.',
      },
      {
        id: 'bank',
        question: 'Which bank did you make the payment from?',
        type: 'autocomplete',
        autocompleteType: 'bank',
        required: true,
        placeholder: 'Start typing...',
      },
      {
        id: 'fraud_date',
        question: 'When did the fraud happen?',
        type: 'date',
        required: true,
        helpText: 'For multiple payments, use the date of the first one.',
      },
      {
        id: 'fraud_date_category',
        question: 'Was this before or after 7 October 2024?',
        type: 'select',
        required: true,
        options: [
          { value: 'after_oct_2024', label: 'After 7 October 2024', successModifier: 20, badge: '🔥 Mandatory refund rules apply', highlight: true },
          { value: 'before_oct_2024', label: 'Before 7 October 2024', successModifier: 5, helpText: 'CRM Code may apply if your bank signed up' },
        ],
        helpText: 'New mandatory reimbursement rules came in on 7 October 2024.',
      },
      {
        id: 'amount_lost',
        question: 'How much did you lose in total?',
        type: 'currency',
        required: true,
        placeholder: 'Total amount',
        helpText: 'Mandatory reimbursement covers up to £85,000.',
      },
      {
        id: 'how_contacted',
        question: 'How did the fraudster first contact you?',
        type: 'select',
        required: true,
        options: [
          { value: 'phone_call', label: 'Phone call', successModifier: 5 },
          { value: 'text_message', label: 'Text message', successModifier: 5 },
          { value: 'email', label: 'Email', successModifier: 3 },
          { value: 'social_media', label: 'Social media', successModifier: 3 },
          { value: 'website', label: 'Fake website', successModifier: 3 },
          { value: 'in_person', label: 'In person', successModifier: 2 },
          { value: 'app_advert', label: 'App or online advert', successModifier: 3 },
        ],
      },
      {
        id: 'convincing_factors',
        question: 'What made it seem genuine? (Select all that apply)',
        type: 'multiselect',
        required: true,
        successWeight: 'high',
        options: [
          { value: 'knew_details', label: 'They knew my personal details (name, address, etc.)', successModifier: 8 },
          { value: 'knew_bank_details', label: 'They knew details about my bank account', successModifier: 10 },
          { value: 'spoofed_number', label: 'The phone number looked like my bank\'s number', successModifier: 8 },
          { value: 'professional', label: 'They sounded very professional/official', successModifier: 4 },
          { value: 'urgency', label: 'They created a sense of urgency/panic', successModifier: 6 },
          { value: 'genuine_looking', label: 'Website/emails looked exactly like the real thing', successModifier: 5 },
          { value: 'security_codes', label: 'They talked me through "security" steps', successModifier: 6 },
        ],
        helpText: 'These factors show you were targeted by a sophisticated scam - not your fault.',
      },
      {
        id: 'bank_warnings',
        question: 'Did your bank show you any warnings when making the payment?',
        type: 'select',
        required: true,
        options: [
          { value: 'no_warnings', label: 'No - no warnings at all', successModifier: 10 },
          { value: 'generic_warning', label: 'Yes - a generic warning about fraud', successModifier: 3 },
          { value: 'specific_warning', label: 'Yes - a specific warning about this type of scam', successModifier: -5 },
          { value: 'phone_call_warning', label: 'Yes - the bank called me to check', successModifier: -8 },
          { value: 'cant_remember', label: 'Can\'t remember', successModifier: 0 },
        ],
        helpText: 'Banks have a duty to provide effective warnings - generic ones often aren\'t enough.',
      },
      {
        id: 'reported_when',
        question: 'How quickly did you report it to your bank?',
        type: 'select',
        required: true,
        options: [
          { value: 'same_day', label: 'Same day', successModifier: 5 },
          { value: 'next_day', label: 'Next day', successModifier: 3 },
          { value: 'within_week', label: 'Within a week', successModifier: 0 },
          { value: 'over_week', label: 'Over a week later', successModifier: -3 },
          { value: 'over_month', label: 'Over a month later', successModifier: -8 },
        ],
        helpText: 'Report to your bank as soon as possible - delays can affect claims.',
      },
      {
        id: 'bank_response',
        question: 'What did your bank say?',
        type: 'select',
        required: true,
        options: [
          { value: 'refused_your_fault', label: 'Refused - said it was my fault', successModifier: 10 },
          { value: 'refused_authorised', label: 'Refused - said I authorised the payment', successModifier: 8 },
          { value: 'refused_not_covered', label: 'Refused - said I\'m not covered', successModifier: 5 },
          { value: 'partial_refund', label: 'Offered a partial refund', successModifier: 3 },
          { value: 'still_investigating', label: 'Still investigating', successModifier: 0 },
          { value: 'not_reported', label: 'Haven\'t reported yet', successModifier: 0, warning: 'You must report to your bank first' },
        ],
        helpText: 'FOS overturns 75%+ of bank fraud refusal decisions.',
      },
      {
        id: 'action_fraud',
        question: 'Have you reported it to Action Fraud?',
        type: 'select',
        required: true,
        options: [
          { value: 'yes_have_ref', label: 'Yes - I have a crime reference number', successModifier: 5 },
          { value: 'yes_no_ref', label: 'Yes - but no reference yet', successModifier: 2 },
          { value: 'no', label: 'No - not yet', successModifier: 0, helpText: 'Report at actionfraud.police.uk' },
        ],
      },
    ],
    
    relevantEvidence: [
      'screenshots',
      'bank_statements',
      'correspondence',
      'police_report',
    ],
    
    letterTemplate: {
      breach: 'failure to protect me from a sophisticated scam and/or failure to reimburse',
      regulation: 'PSR Specific Direction 20 / CRM Code',
      harm: 'lost £X to fraud which you failed to prevent or reimburse',
      remedy: 'full reimbursement of £X lost to fraud',
    },
  },

  // ---------------------------------------------------------------------------
  // UNAFFORDABLE LOANS
  // FOS uphold rate: 51% for overdrafts, higher for payday loans
  // ---------------------------------------------------------------------------
  'unaffordable-loan': {
    id: 'unaffordable-loan',
    title: 'Unaffordable Loan Complaint',
    subtitle: 'Given a loan you couldn\'t afford to repay',
    icon: '💷',
    baseSuccessRate: 45,
    maxSuccessRate: 82,
    
    regulations: {
      primary: 'CONC 5.2A.4R',
      secondary: ['CONC 5.3.1G', 'CONC 6.7.2R', 'FCA Principle 6'],
    },
    
    questions: [
      {
        id: 'loan_type',
        question: 'What type of loan was it?',
        type: 'select',
        required: true,
        options: [
          { value: 'payday', label: 'Payday loan / short-term loan', successModifier: 12, category: 'hcstc' },
          { value: 'instalment', label: 'Instalment loan (multiple payments)', successModifier: 8, category: 'instalment' },
          { value: 'personal_loan', label: 'Personal loan from bank', successModifier: 5, category: 'bank' },
          { value: 'guarantor', label: 'Guarantor loan', successModifier: 6, category: 'guarantor' },
          { value: 'overdraft', label: 'Overdraft', successModifier: 8, category: 'overdraft' },
          { value: 'doorstep', label: 'Doorstep / home credit loan', successModifier: 10, category: 'doorstep' },
          { value: 'logbook', label: 'Logbook loan', successModifier: 8, category: 'logbook' },
        ],
        helpText: 'Payday and high-cost loans have stricter FCA rules.',
      },
      {
        id: 'lender',
        question: 'Who was the lender?',
        type: 'autocomplete',
        autocompleteType: 'loan',
        required: true,
        placeholder: 'Start typing...',
      },
      {
        id: 'loan_amount',
        question: 'How much did you borrow?',
        type: 'currency',
        required: true,
      },
      {
        id: 'loan_date',
        question: 'When did you take out the loan?',
        type: 'date',
        required: true,
      },
      {
        id: 'repeat_borrowing',
        question: 'Was this your first loan with this lender?',
        type: 'select',
        required: true,
        successWeight: 'critical',
        options: [
          { value: 'first', label: 'Yes - first loan', successModifier: 0 },
          { value: '2_3', label: 'No - 2nd or 3rd loan', successModifier: 8 },
          { value: '4_6', label: 'No - 4th to 6th loan', successModifier: 15 },
          { value: '7_10', label: 'No - 7th to 10th loan', successModifier: 20 },
          { value: 'over_10', label: 'No - more than 10 loans', successModifier: 25, highlight: true },
        ],
        helpText: 'Repeat lending is a major red flag - lenders should have spotted the pattern.',
      },
      {
        id: 'affordability_signs',
        question: 'Which of these were true at the time? (Select all)',
        type: 'multiselect',
        required: true,
        successWeight: 'critical',
        options: [
          { value: 'benefits_income', label: 'My main income was benefits', successModifier: 8 },
          { value: 'low_income', label: 'I earned less than £1,000/month', successModifier: 8 },
          { value: 'existing_debts', label: 'I already had other loans/debts', successModifier: 10 },
          { value: 'paying_debt_with_debt', label: 'I was using loans to pay other debts', successModifier: 15 },
          { value: 'gambling', label: 'I was using loans for gambling', successModifier: 10 },
          { value: 'essentials', label: 'I needed the loan for essentials (food, bills)', successModifier: 8 },
          { value: 'couldnt_repay', label: 'I couldn\'t repay without borrowing again', successModifier: 12 },
          { value: 'defaulted_before', label: 'I had defaulted on loans before', successModifier: 10 },
        ],
        helpText: 'These are warning signs the lender should have identified during their checks.',
      },
      {
        id: 'lender_checks',
        question: 'What checks did the lender do?',
        type: 'select',
        required: true,
        options: [
          { value: 'none', label: 'None that I\'m aware of', successModifier: 12 },
          { value: 'basic_questions', label: 'Just asked basic questions', successModifier: 8 },
          { value: 'credit_check', label: 'Did a credit check', successModifier: 3 },
          { value: 'income_proof', label: 'Asked for proof of income', successModifier: 0 },
          { value: 'detailed_check', label: 'Did detailed affordability checks', successModifier: -5 },
          { value: 'unsure', label: 'Not sure', successModifier: 0 },
        ],
        helpText: 'The more loans you had, the more thorough checks should have been.',
      },
    ],
    
    relevantEvidence: [
      'bank_statements',
      'credit_file',
      'income_proof',
      'payment_history',
    ],
    
    letterTemplate: {
      breach: 'failure to conduct proportionate affordability assessment',
      regulation: 'CONC 5.2A.4R and CONC 5.3.1G',
      harm: 'given credit that was clearly unaffordable and trapped in a cycle of debt',
      remedy: 'refund of all interest and charges, with credit file correction',
    },
  },

  // ---------------------------------------------------------------------------
  // SECTION 75 - CARD PROTECTION
  // High success rate when criteria are clearly met
  // ---------------------------------------------------------------------------
  'section-75': {
    id: 'section-75',
    title: 'Section 75 Claim',
    subtitle: 'Paid by credit card but didn\'t get what you paid for',
    icon: '🛡️',
    baseSuccessRate: 55,
    maxSuccessRate: 85,
    
    regulations: {
      primary: 'Section 75 Consumer Credit Act 1974',
      secondary: ['Section 75A CCA 1974', 'Chargeback scheme rules'],
    },
    
    questions: [
      {
        id: 'what_happened',
        question: 'What went wrong?',
        type: 'select',
        required: true,
        options: [
          { value: 'never_received', label: 'Never received what I paid for', successModifier: 12 },
          { value: 'company_bust', label: 'Company went bust before delivering', successModifier: 15 },
          { value: 'faulty_goods', label: 'Goods were faulty or not as described', successModifier: 10 },
          { value: 'service_not_provided', label: 'Service was not provided as agreed', successModifier: 10 },
          { value: 'cancelled_no_refund', label: 'I cancelled but didn\'t get a refund', successModifier: 8 },
          { value: 'misrepresentation', label: 'What I got was completely different to what was advertised', successModifier: 10 },
        ],
      },
      {
        id: 'payment_method',
        question: 'How did you pay?',
        type: 'select',
        required: true,
        options: [
          { value: 'credit_card_full', label: 'Credit card - paid in full', successModifier: 10, highlight: true },
          { value: 'credit_card_partial', label: 'Credit card - paid part/deposit', successModifier: 8 },
          { value: 'debit_card', label: 'Debit card', successModifier: 0, warning: 'Section 75 doesn\'t apply - but chargeback might' },
          { value: 'paypal_credit', label: 'PayPal Credit', successModifier: 5 },
          { value: 'buy_now_pay_later', label: 'Buy Now Pay Later (Klarna, etc.)', successModifier: 3 },
          { value: 'bank_transfer', label: 'Bank transfer', successModifier: -10, warning: 'Section 75 doesn\'t apply to bank transfers' },
        ],
        helpText: 'Section 75 only applies to credit card payments for items £100-£30,000.',
      },
      {
        id: 'amount_paid',
        question: 'How much did you pay?',
        type: 'currency',
        required: true,
      },
      {
        id: 'amount_category',
        question: 'Was the single item/transaction value between £100 and £30,000?',
        type: 'select',
        required: true,
        options: [
          { value: 'yes_in_range', label: 'Yes - between £100 and £30,000', successModifier: 15, highlight: true },
          { value: 'under_100', label: 'No - under £100', successModifier: -10, warning: 'Section 75 requires item value over £100' },
          { value: 'over_30k', label: 'No - over £30,000', successModifier: -5, warning: 'Section 75 cap is £30,000' },
          { value: 'multiple_items', label: 'Multiple items (some over £100, some under)', successModifier: 5 },
        ],
        helpText: 'The item value must be £100-£30,000 for Section 75 to apply.',
      },
      {
        id: 'card_provider',
        question: 'Which credit card did you use?',
        type: 'autocomplete',
        autocompleteType: 'credit',
        required: true,
        placeholder: 'Start typing...',
      },
      {
        id: 'contacted_retailer',
        question: 'Have you tried to resolve it with the retailer/company first?',
        type: 'select',
        required: true,
        options: [
          { value: 'yes_no_response', label: 'Yes - no response', successModifier: 5 },
          { value: 'yes_refused', label: 'Yes - they refused', successModifier: 5 },
          { value: 'company_bust', label: 'Can\'t - company no longer exists', successModifier: 8 },
          { value: 'no', label: 'No - not yet', successModifier: 0, warning: 'Try the retailer first if possible' },
        ],
      },
      {
        id: 'purchase_date',
        question: 'When did you make the purchase?',
        type: 'date',
        required: true,
      },
    ],
    
    relevantEvidence: [
      'correspondence',
      'payment_history',
    ],
    
    letterTemplate: {
      breach: 'breach of contract / misrepresentation by the retailer',
      regulation: 'Section 75 Consumer Credit Act 1974',
      harm: 'paid £X but did not receive the goods/services',
      remedy: 'refund of £X under your equal liability with the retailer',
    },
  },

  // ---------------------------------------------------------------------------
  // INSURANCE COMPLAINT
  // ---------------------------------------------------------------------------
  'insurance': {
    id: 'insurance',
    title: 'Insurance Complaint',
    subtitle: 'Claim rejected, unfair charges, or mis-sold policy',
    icon: '🛡️',
    baseSuccessRate: 45,
    maxSuccessRate: 80,
    
    regulations: {
      primary: 'ICOBS 8.1',
      secondary: ['Consumer Insurance (Disclosure and Representations) Act 2012', 'FCA Principle 6', 'ICOBS 6.1.5R'],
    },
    
    questions: [
      {
        id: 'insurance_type',
        question: 'What type of insurance is this about?',
        type: 'select',
        required: true,
        options: [
          { value: 'car', label: 'Car insurance', successModifier: 0 },
          { value: 'home', label: 'Home insurance', successModifier: 0 },
          { value: 'travel', label: 'Travel insurance', successModifier: 5 },
          { value: 'life', label: 'Life insurance', successModifier: 0 },
          { value: 'pet', label: 'Pet insurance', successModifier: 5 },
          { value: 'gadget', label: 'Gadget/phone insurance', successModifier: 8 },
          { value: 'ppi', label: 'Payment Protection Insurance (PPI)', successModifier: 10 },
          { value: 'other', label: 'Other insurance', successModifier: 0 },
        ],
      },
      {
        id: 'complaint_reason',
        question: 'What\'s your complaint about?',
        type: 'select',
        required: true,
        options: [
          { value: 'claim_rejected', label: 'My claim was rejected', successModifier: 10 },
          { value: 'claim_underpaid', label: 'Claim was paid but not enough', successModifier: 8 },
          { value: 'claim_delayed', label: 'Claim is taking too long', successModifier: 5 },
          { value: 'mis_sold', label: 'I was mis-sold the policy', successModifier: 12 },
          { value: 'cancelled', label: 'Policy cancelled unfairly', successModifier: 10 },
          { value: 'premium_increase', label: 'Unreasonable premium increase', successModifier: 5 },
          { value: 'auto_renewal', label: 'Auto-renewed without consent', successModifier: 8 },
          { value: 'other', label: 'Something else', successModifier: 0 },
        ],
      },
      {
        id: 'rejection_reason',
        question: 'Why did they give for rejecting/reducing your claim?',
        type: 'select',
        required: false,
        options: [
          { value: 'non_disclosure', label: 'Non-disclosure (didn\'t tell them something)', successModifier: 8, helpText: 'Consumer Act 2012 protects honest mistakes' },
          { value: 'exclusion', label: 'Policy exclusion', successModifier: 5 },
          { value: 'wear_tear', label: 'Wear and tear', successModifier: 3 },
          { value: 'pre_existing', label: 'Pre-existing condition', successModifier: 5 },
          { value: 'late_notification', label: 'Notified too late', successModifier: 3 },
          { value: 'fraud', label: 'Suspected fraud (wrongly)', successModifier: 12 },
          { value: 'not_covered', label: 'Said it wasn\'t covered', successModifier: 5 },
          { value: 'na', label: 'Not applicable / other', successModifier: 0 },
        ],
      },
      {
        id: 'insurer',
        question: 'Which insurance company is this?',
        type: 'autocomplete',
        autocompleteType: 'all',
        required: true,
        placeholder: 'e.g. Aviva, Direct Line, Admiral...',
      },
      {
        id: 'claim_amount',
        question: 'How much is your claim worth (approximately)?',
        type: 'currency',
        required: false,
        placeholder: 'e.g. 2500',
      },
      {
        id: 'policy_date',
        question: 'When did you take out the policy?',
        type: 'date',
        required: false,
      },
    ],
    
    relevantEvidence: [
      'correspondence',
      'credit_agreement',
    ],
    
    letterTemplate: {
      breach: 'unfair rejection of claim / failure to handle claim fairly',
      regulation: 'ICOBS 8.1 (fair claims handling)',
      harm: 'claim rejected/underpaid causing financial loss of £X',
      remedy: 'payment of claim in full plus compensation for distress',
    },
  },

  // ---------------------------------------------------------------------------
  // ENERGY COMPLAINT
  // ---------------------------------------------------------------------------
  'energy': {
    id: 'energy',
    title: 'Energy Complaint',
    subtitle: 'Gas, electricity, billing, or switching issues',
    icon: '⚡',
    baseSuccessRate: 50,
    maxSuccessRate: 82,
    
    regulations: {
      primary: 'Ofgem Licence Conditions',
      secondary: ['Consumer Rights Act 2015', 'Energy Switch Guarantee'],
    },
    
    questions: [
      {
        id: 'energy_type',
        question: 'Which energy service is this about?',
        type: 'select',
        required: true,
        options: [
          { value: 'gas', label: 'Gas', successModifier: 0 },
          { value: 'electricity', label: 'Electricity', successModifier: 0 },
          { value: 'both', label: 'Both gas and electricity', successModifier: 0 },
        ],
      },
      {
        id: 'complaint_reason',
        question: 'What\'s the problem?',
        type: 'select',
        required: true,
        options: [
          { value: 'wrong_bill', label: 'Bill is wrong / overcharged', successModifier: 10 },
          { value: 'estimated_bills', label: 'Estimated bills too high', successModifier: 8 },
          { value: 'back_billing', label: 'Sent a bill for years ago', successModifier: 12, helpText: 'Back-billing rules limit this to 12 months' },
          { value: 'switch_problem', label: 'Problems switching supplier', successModifier: 8 },
          { value: 'meter_problem', label: 'Meter issue / smart meter problems', successModifier: 5 },
          { value: 'debt_collection', label: 'Unfair debt collection', successModifier: 10 },
          { value: 'disconnection', label: 'Threatened with disconnection', successModifier: 12 },
          { value: 'poor_service', label: 'Poor customer service', successModifier: 3 },
          { value: 'direct_debit', label: 'Direct debit set too high', successModifier: 8 },
          { value: 'other', label: 'Something else', successModifier: 0 },
        ],
      },
      {
        id: 'supplier',
        question: 'Which energy supplier?',
        type: 'autocomplete',
        autocompleteType: 'all',
        required: true,
        placeholder: 'e.g. British Gas, EDF, Octopus...',
      },
      {
        id: 'amount_disputed',
        question: 'How much money is involved?',
        type: 'currency',
        required: false,
        placeholder: 'e.g. 500',
      },
      {
        id: 'contacted_supplier',
        question: 'Have you complained to the supplier already?',
        type: 'select',
        required: true,
        options: [
          { value: 'yes_8_weeks', label: 'Yes - over 8 weeks ago', successModifier: 10, highlight: true },
          { value: 'yes_deadlock', label: 'Yes - they sent a deadlock letter', successModifier: 12 },
          { value: 'yes_recent', label: 'Yes - less than 8 weeks ago', successModifier: 0, warning: 'May need to wait 8 weeks before Ombudsman' },
          { value: 'no', label: 'No - not yet', successModifier: -5, warning: 'You should complain to supplier first' },
        ],
      },
    ],
    
    relevantEvidence: [
      'correspondence',
      'bank_statements',
    ],
    
    letterTemplate: {
      breach: 'breach of supply licence conditions / billing error',
      regulation: 'Ofgem Supply Licence Conditions',
      harm: 'overcharged by £X / caused significant distress',
      remedy: 'correction of bill and compensation for distress',
    },
  },

  // ---------------------------------------------------------------------------
  // TELECOMS COMPLAINT
  // ---------------------------------------------------------------------------
  'telecoms': {
    id: 'telecoms',
    title: 'Phone, Broadband or TV Complaint',
    subtitle: 'Service problems, billing, or contract issues',
    icon: '📱',
    baseSuccessRate: 48,
    maxSuccessRate: 80,
    
    regulations: {
      primary: 'Ofcom General Conditions',
      secondary: ['Consumer Rights Act 2015', 'Communications Act 2003'],
    },
    
    questions: [
      {
        id: 'service_type',
        question: 'What service is this about?',
        type: 'select',
        required: true,
        options: [
          { value: 'mobile', label: 'Mobile phone', successModifier: 0 },
          { value: 'broadband', label: 'Broadband', successModifier: 5 },
          { value: 'landline', label: 'Landline', successModifier: 0 },
          { value: 'tv', label: 'TV package', successModifier: 0 },
          { value: 'bundle', label: 'Bundle (multiple services)', successModifier: 0 },
        ],
      },
      {
        id: 'complaint_reason',
        question: 'What\'s the problem?',
        type: 'select',
        required: true,
        options: [
          { value: 'service_not_working', label: 'Service not working properly', successModifier: 8 },
          { value: 'speed_slow', label: 'Broadband speed much slower than promised', successModifier: 10 },
          { value: 'wrong_bill', label: 'Wrong charges on bill', successModifier: 10 },
          { value: 'contract_dispute', label: 'Contract dispute / early exit fees', successModifier: 8 },
          { value: 'mis_sold', label: 'Mis-sold the contract', successModifier: 12 },
          { value: 'switch_problem', label: 'Problems switching provider', successModifier: 8 },
          { value: 'roaming', label: 'Unexpected roaming charges', successModifier: 8 },
          { value: 'poor_service', label: 'Poor customer service', successModifier: 3 },
          { value: 'other', label: 'Something else', successModifier: 0 },
        ],
      },
      {
        id: 'provider',
        question: 'Which provider?',
        type: 'autocomplete',
        autocompleteType: 'all',
        required: true,
        placeholder: 'e.g. BT, Vodafone, Sky, Virgin...',
      },
      {
        id: 'amount_disputed',
        question: 'How much money is involved?',
        type: 'currency',
        required: false,
        placeholder: 'e.g. 200',
      },
      {
        id: 'contacted_provider',
        question: 'Have you complained to the provider already?',
        type: 'select',
        required: true,
        options: [
          { value: 'yes_8_weeks', label: 'Yes - over 8 weeks ago', successModifier: 10 },
          { value: 'yes_deadlock', label: 'Yes - they sent a deadlock letter', successModifier: 12 },
          { value: 'yes_recent', label: 'Yes - less than 8 weeks ago', successModifier: 0 },
          { value: 'no', label: 'No - not yet', successModifier: -5 },
        ],
      },
    ],
    
    relevantEvidence: [
      'correspondence',
      'bank_statements',
    ],
    
    letterTemplate: {
      breach: 'failure to provide service as contracted / billing error',
      regulation: 'Ofcom General Conditions of Entitlement',
      harm: 'overcharged / service not as promised',
      remedy: 'refund of £X and compensation for poor service',
    },
  },

  // ---------------------------------------------------------------------------
  // FAULTY GOODS / RETAIL COMPLAINT
  // ---------------------------------------------------------------------------
  'faulty-goods': {
    id: 'faulty-goods',
    title: 'Faulty Product Complaint',
    subtitle: 'Broken goods, refunds, or repairs',
    icon: '📦',
    baseSuccessRate: 55,
    maxSuccessRate: 85,
    
    regulations: {
      primary: 'Consumer Rights Act 2015',
      secondary: ['Sale of Goods Act 1979', 'Consumer Contracts Regulations 2013'],
    },
    
    questions: [
      {
        id: 'product_type',
        question: 'What type of product?',
        type: 'select',
        required: true,
        options: [
          { value: 'electronics', label: 'Electronics (TV, phone, laptop, etc.)', successModifier: 5 },
          { value: 'appliance', label: 'Appliance (washing machine, fridge, etc.)', successModifier: 5 },
          { value: 'furniture', label: 'Furniture', successModifier: 3 },
          { value: 'car', label: 'Car / vehicle', successModifier: 8 },
          { value: 'clothing', label: 'Clothing / shoes', successModifier: 3 },
          { value: 'other', label: 'Other product', successModifier: 0 },
        ],
      },
      {
        id: 'problem_type',
        question: 'What\'s wrong with it?',
        type: 'select',
        required: true,
        options: [
          { value: 'doesnt_work', label: 'Doesn\'t work / broken', successModifier: 10 },
          { value: 'not_as_described', label: 'Not as described', successModifier: 12 },
          { value: 'poor_quality', label: 'Poor quality / fell apart quickly', successModifier: 8 },
          { value: 'missing_parts', label: 'Missing parts or incomplete', successModifier: 8 },
          { value: 'dangerous', label: 'Dangerous / safety issue', successModifier: 15 },
          { value: 'other', label: 'Other problem', successModifier: 0 },
        ],
      },
      {
        id: 'when_bought',
        question: 'When did you buy it?',
        type: 'select',
        required: true,
        options: [
          { value: 'under_30_days', label: 'Less than 30 days ago', successModifier: 15, highlight: true, badge: 'Full refund rights' },
          { value: '30_days_6_months', label: '30 days to 6 months ago', successModifier: 10, badge: 'Strong rights' },
          { value: '6_months_1_year', label: '6 months to 1 year ago', successModifier: 5 },
          { value: '1_2_years', label: '1-2 years ago', successModifier: 0 },
          { value: 'over_2_years', label: 'Over 2 years ago', successModifier: -5 },
          { value: 'over_6_years', label: 'Over 6 years ago', successModifier: -15, warning: 'May be out of time' },
        ],
        helpText: 'Under 30 days = automatic right to full refund. Under 6 months = retailer must prove it wasn\'t faulty.',
      },
      {
        id: 'retailer',
        question: 'Where did you buy it?',
        type: 'autocomplete',
        autocompleteType: 'all',
        required: true,
        placeholder: 'e.g. Argos, Currys, Amazon...',
      },
      {
        id: 'amount_paid',
        question: 'How much did you pay?',
        type: 'currency',
        required: true,
        placeholder: 'e.g. 500',
      },
      {
        id: 'what_happened',
        question: 'What did they say when you complained?',
        type: 'select',
        required: true,
        options: [
          { value: 'refused_refund', label: 'Refused refund', successModifier: 8 },
          { value: 'offered_repair', label: 'Offered repair only', successModifier: 5 },
          { value: 'offered_voucher', label: 'Offered voucher instead of refund', successModifier: 8 },
          { value: 'blamed_me', label: 'Blamed me for the damage', successModifier: 10 },
          { value: 'no_response', label: 'No response', successModifier: 5 },
          { value: 'other', label: 'Other', successModifier: 0 },
        ],
      },
    ],
    
    relevantEvidence: [
      'correspondence',
      'payment_history',
    ],
    
    letterTemplate: {
      breach: 'goods not of satisfactory quality / not as described',
      regulation: 'Consumer Rights Act 2015 Section 9/11',
      harm: 'paid £X for faulty/substandard product',
      remedy: 'full refund of £X',
    },
  },

  // ---------------------------------------------------------------------------
  // TRAVEL COMPLAINT
  // ---------------------------------------------------------------------------
  'travel': {
    id: 'travel',
    title: 'Travel Complaint',
    subtitle: 'Flights, holidays, hotels, or cancellations',
    icon: '✈️',
    baseSuccessRate: 50,
    maxSuccessRate: 85,
    
    regulations: {
      primary: 'Package Travel Regulations 2018',
      secondary: ['EU Regulation 261/2004', 'Consumer Rights Act 2015'],
    },
    
    questions: [
      {
        id: 'travel_type',
        question: 'What type of travel service?',
        type: 'select',
        required: true,
        options: [
          { value: 'flight', label: 'Flight', successModifier: 10 },
          { value: 'package_holiday', label: 'Package holiday', successModifier: 8 },
          { value: 'hotel', label: 'Hotel / accommodation', successModifier: 5 },
          { value: 'cruise', label: 'Cruise', successModifier: 5 },
          { value: 'car_hire', label: 'Car hire', successModifier: 5 },
          { value: 'other', label: 'Other travel service', successModifier: 0 },
        ],
      },
      {
        id: 'problem_type',
        question: 'What happened?',
        type: 'select',
        required: true,
        options: [
          { value: 'cancelled', label: 'Flight/trip cancelled', successModifier: 15, highlight: true },
          { value: 'delayed', label: 'Significant delay (3+ hours)', successModifier: 12 },
          { value: 'downgraded', label: 'Downgraded (flight/hotel)', successModifier: 10 },
          { value: 'lost_baggage', label: 'Lost or damaged baggage', successModifier: 8 },
          { value: 'not_as_described', label: 'Not as described/advertised', successModifier: 10 },
          { value: 'poor_quality', label: 'Poor quality / substandard', successModifier: 8 },
          { value: 'denied_boarding', label: 'Denied boarding', successModifier: 15 },
          { value: 'refund_refused', label: 'Refund refused', successModifier: 10 },
          { value: 'other', label: 'Something else', successModifier: 0 },
        ],
      },
      {
        id: 'company',
        question: 'Which company is this about?',
        type: 'autocomplete',
        autocompleteType: 'all',
        required: true,
        placeholder: 'e.g. British Airways, TUI, Booking.com...',
      },
      {
        id: 'amount_lost',
        question: 'How much are you out of pocket?',
        type: 'currency',
        required: false,
        placeholder: 'e.g. 800',
      },
      {
        id: 'when_happened',
        question: 'When did this happen?',
        type: 'date',
        required: true,
      },
    ],
    
    relevantEvidence: [
      'correspondence',
      'payment_history',
    ],
    
    letterTemplate: {
      breach: 'cancellation/delay/failure to provide service as booked',
      regulation: 'EU Regulation 261/2004 / Package Travel Regulations 2018',
      harm: 'financial loss of £X plus significant inconvenience',
      remedy: 'compensation under EU261 plus refund of expenses',
    },
  },

  // ---------------------------------------------------------------------------
  // OTHER / GENERAL COMPLAINT
  // ---------------------------------------------------------------------------
  'other': {
    id: 'other',
    title: 'Other Complaint',
    subtitle: 'Any other consumer issue',
    icon: '📝',
    baseSuccessRate: 40,
    maxSuccessRate: 75,
    
    regulations: {
      primary: 'Consumer Rights Act 2015',
      secondary: ['FCA Handbook (if financial)', 'Treating Customers Fairly'],
    },
    
    questions: [
      {
        id: 'sector',
        question: 'What sector is your complaint about?',
        type: 'select',
        required: true,
        options: [
          { value: 'financial', label: 'Financial services (bank, loan, investment)', successModifier: 5 },
          { value: 'retail', label: 'Retail / shopping', successModifier: 3 },
          { value: 'utilities', label: 'Utilities (water, council tax)', successModifier: 3 },
          { value: 'health', label: 'Healthcare / dental', successModifier: 0 },
          { value: 'legal', label: 'Legal services', successModifier: 0 },
          { value: 'property', label: 'Property / estate agents', successModifier: 5 },
          { value: 'motoring', label: 'Motoring (garage, repairs)', successModifier: 5 },
          { value: 'education', label: 'Education / training', successModifier: 0 },
          { value: 'other', label: 'Something else', successModifier: 0 },
        ],
      },
      {
        id: 'problem_summary',
        question: 'In one sentence, what went wrong?',
        type: 'text',
        required: true,
        placeholder: 'e.g. They charged me twice and won\'t refund...',
      },
      {
        id: 'company_name',
        question: 'Which company is this about?',
        type: 'text',
        required: true,
        placeholder: 'Company name',
      },
      {
        id: 'amount_involved',
        question: 'How much money is involved (if any)?',
        type: 'currency',
        required: false,
        placeholder: 'e.g. 500',
      },
      {
        id: 'what_happened',
        question: 'Tell us more about what happened',
        type: 'text',
        required: true,
        placeholder: 'Give us the key facts...',
      },
      {
        id: 'what_want',
        question: 'What outcome do you want?',
        type: 'select',
        required: true,
        options: [
          { value: 'refund', label: 'Full refund', successModifier: 5 },
          { value: 'partial_refund', label: 'Partial refund', successModifier: 3 },
          { value: 'compensation', label: 'Compensation for inconvenience', successModifier: 3 },
          { value: 'apology', label: 'Apology and explanation', successModifier: 0 },
          { value: 'fix_problem', label: 'Just fix the problem', successModifier: 3 },
          { value: 'other', label: 'Something else', successModifier: 0 },
        ],
      },
      {
        id: 'contacted_already',
        question: 'Have you already complained to them?',
        type: 'select',
        required: true,
        options: [
          { value: 'yes_no_response', label: 'Yes - no response', successModifier: 8 },
          { value: 'yes_rejected', label: 'Yes - they rejected my complaint', successModifier: 10 },
          { value: 'yes_partial', label: 'Yes - they offered something but not enough', successModifier: 5 },
          { value: 'no', label: 'No - not yet', successModifier: 0 },
        ],
      },
    ],
    
    relevantEvidence: [
      'correspondence',
      'bank_statements',
    ],
    
    letterTemplate: {
      breach: 'failure to provide satisfactory service / breach of contract',
      regulation: 'Consumer Rights Act 2015',
      harm: 'financial loss and/or significant inconvenience',
      remedy: 'appropriate resolution as described in complaint',
    },
  },
}

// =============================================================================
// SUCCESS RATE CALCULATOR
// =============================================================================

export function calculateSuccessRate(
  complaintType: string,
  answers: Record<string, any>,
  evidenceProvided: string[],
  vulnerabilities: string[]
): { 
  rate: number
  factors: { factor: string; impact: number; positive: boolean }[]
  recommendations: string[]
} {
  const config = COMPLAINT_CONFIGS[complaintType as keyof typeof COMPLAINT_CONFIGS]
  if (!config) return { rate: 0, factors: [], recommendations: [] }
  
  let rate = config.baseSuccessRate
  const factors: { factor: string; impact: number; positive: boolean }[] = []
  const recommendations: string[] = []
  
  // Process answers
  for (const question of config.questions) {
    const answer = answers[question.id]
    if (!answer) continue
    
    if (question.type === 'select' || question.type === 'date_range' || question.type === 'currency_range') {
      const selectedOption = question.options?.find(o => o.value === answer) as any
      if (selectedOption?.successModifier) {
        rate += selectedOption.successModifier
        factors.push({
          factor: selectedOption.label,
          impact: selectedOption.successModifier,
          positive: selectedOption.successModifier > 0
        })
      }
    } else if (question.type === 'multiselect' && Array.isArray(answer)) {
      for (const value of answer) {
        const selectedOption = question.options?.find(o => o.value === value) as any
        if (selectedOption?.successModifier) {
          rate += selectedOption.successModifier
          factors.push({
            factor: selectedOption.label,
            impact: selectedOption.successModifier,
            positive: selectedOption.successModifier > 0
          })
        }
      }
    }
  }
  
  // Process evidence
  for (const evidenceId of evidenceProvided) {
    const evidence = (SUCCESS_FACTORS.evidence as any)[evidenceId]
    if (evidence) {
      rate += evidence.impact
      factors.push({
        factor: `Evidence: ${evidence.label}`,
        impact: evidence.impact,
        positive: true
      })
    }
  }
  
  // Suggest missing evidence
  for (const recEvidence of config.relevantEvidence || []) {
    if (!evidenceProvided.includes(recEvidence)) {
      const evidence = (SUCCESS_FACTORS.evidence as any)[recEvidence]
      if (evidence) {
        recommendations.push(`Adding "${evidence.label}" could improve success by +${evidence.impact}%`)
      }
    }
  }
  
  // Process vulnerabilities
  for (const vulnId of vulnerabilities) {
    const vuln = (SUCCESS_FACTORS.vulnerability as any)[vulnId]
    if (vuln) {
      rate += vuln.impact
      factors.push({
        factor: `Vulnerability: ${vuln.label}`,
        impact: vuln.impact,
        positive: true
      })
    }
  }
  
  // Cap the rate
  rate = Math.min(rate, config.maxSuccessRate)
  rate = Math.max(rate, 10) // Minimum 10%
  
  return {
    rate: Math.round(rate),
    factors: factors.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact)),
    recommendations
  }
}

// =============================================================================
// LETTER GENERATOR PROMPT BUILDER
// Builds optimized prompts based on FOS research
// =============================================================================

export function buildLetterPrompt(
  complaintType: string,
  answers: Record<string, any>,
  evidenceProvided: string[],
  vulnerabilities: string[]
): string {
  const config = COMPLAINT_CONFIGS[complaintType as keyof typeof COMPLAINT_CONFIGS]
  if (!config) return ''
  
  // Build facts section from answers
  const facts: string[] = []
  for (const question of config.questions) {
    const answer = answers[question.id]
    if (!answer) continue
    
    if (question.type === 'multiselect' && Array.isArray(answer)) {
      const labels = answer.map(v => {
        const opt = question.options?.find(o => o.value === v)
        return opt?.label || v
      })
      facts.push(`${question.question} ${labels.join('; ')}`)
    } else if (question.type === 'select' || question.type === 'date_range' || question.type === 'currency_range') {
      const opt = question.options?.find(o => o.value === answer)
      facts.push(`${question.question} ${opt?.label || answer}`)
    } else {
      facts.push(`${question.question} ${answer}`)
    }
  }
  
  // Build evidence list
  const evidenceLabels = evidenceProvided.map(e => (SUCCESS_FACTORS.evidence as any)[e]?.label).filter(Boolean)
  
  // Build vulnerability statement
  const vulnLabels = vulnerabilities.map(v => (SUCCESS_FACTORS.vulnerability as any)[v]?.label).filter(Boolean)
  
  return `
COMPLAINT TYPE: ${config.title}
REGULATIONS TO CITE: ${config.regulations.primary} (primary), ${config.regulations.secondary.join(', ')} (secondary)
${(config.regulations as any).caselaw ? `RELEVANT CASE LAW: ${(config.regulations as any).caselaw.join(', ')}` : ''}

CONSUMER'S SITUATION:
${facts.map(f => `- ${f}`).join('\n')}

EVIDENCE PROVIDED: ${evidenceLabels.length > 0 ? evidenceLabels.join(', ') : 'None attached'}
VULNERABILITY FACTORS: ${vulnLabels.length > 0 ? vulnLabels.join(', ') : 'None declared'}

LETTER TEMPLATE FRAMEWORK:
- BREACH: ${config.letterTemplate.breach}
- REGULATION: ${config.letterTemplate.regulation}
- HARM: ${config.letterTemplate.harm}
- REMEDY SOUGHT: ${config.letterTemplate.remedy}

Generate a formal complaint letter following the optimal FOS success structure:
1. HEADER: Clear "FORMAL COMPLAINT" marking, date, reference numbers
2. OPENING: 2-sentence summary of complaint and desired outcome
3. FACTS: Chronological timeline with specific dates and amounts
4. BREACH: Reference specific regulations (cite by number) - keep brief, don't over-quote
5. HARM: Financial loss (quantified) and distress/inconvenience caused
6. REMEDY: Specific amounts sought, calculation basis, credit file correction if relevant
7. DEADLINE: 8 weeks to respond, FOS escalation warning

CRITICAL RULES:
- Use "I believe" and "In my view" - never definitive claims
- Reference regulations by number but don't quote lengthy passages
- Be factual and specific - use actual dates and amounts provided
- Keep it professional but accessible - avoid unnecessary legal jargon
- Include vulnerability statement if factors provided (FCA requires firms to consider this)
- Standard 8% statutory interest on refund amounts
- Distress & inconvenience claim if appropriate (typically £100-500)
`
}

export type { }
