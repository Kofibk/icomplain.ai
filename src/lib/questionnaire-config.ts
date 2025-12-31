// Smart Questionnaire Configuration
// Properly structured questions with correct input types

export interface Question {
  id: string
  question: string
  type: 'text' | 'textarea' | 'select' | 'autocomplete' | 'date' | 'currency' | 'file' | 'multiselect'
  placeholder?: string
  options?: string[]
  autocompleteType?: 'bank' | 'credit' | 'car' | 'loan' | 'mortgage' | 'insurance' | 'pension' | 'all' | 'carMake'
  required?: boolean
  helpText?: string
  conditionalOn?: { questionId: string; value: string | string[] }
}

export interface QuestionnaireConfig {
  title: string
  description: string
  icon: string
  questions: Question[]
}

// ===========================================
// TOP 5 COMPLAINT TYPES (Hot/High Volume)
// ===========================================

export const PCP_QUESTIONS: QuestionnaireConfig = {
  title: 'Car Finance Complaint (PCP/HP)',
  description: 'Claim back unfair commission on your car finance',
  icon: '🚗',
  questions: [
    {
      id: 'lender',
      question: 'Who provided your car finance?',
      type: 'autocomplete',
      autocompleteType: 'car',
      placeholder: 'Start typing to search lenders...',
      required: true,
      helpText: 'This is the finance company, not the dealership',
    },
    {
      id: 'dealer',
      question: 'Which dealership arranged the finance?',
      type: 'text',
      placeholder: 'e.g. Arnold Clark, Evans Halshaw, local dealer name',
      required: true,
    },
    {
      id: 'car_make',
      question: 'What make of car was it?',
      type: 'autocomplete',
      autocompleteType: 'carMake',
      placeholder: 'Start typing car make...',
      required: true,
    },
    {
      id: 'car_model',
      question: 'What model?',
      type: 'text',
      placeholder: 'e.g. Focus, Golf, A3',
      required: true,
    },
    {
      id: 'finance_type',
      question: 'What type of finance was it?',
      type: 'select',
      options: ['PCP (Personal Contract Purchase)', 'HP (Hire Purchase)', 'Conditional Sale', 'Not sure'],
      required: true,
    },
    {
      id: 'agreement_date',
      question: 'When did you sign the finance agreement?',
      type: 'date',
      required: true,
      helpText: 'Approximate date is fine. Agreements from 2007-2024 may be eligible.',
    },
    {
      id: 'finance_amount',
      question: 'What was the total amount financed?',
      type: 'currency',
      placeholder: '15000',
      required: true,
      helpText: 'The amount you borrowed, not the car price',
    },
    {
      id: 'commission_disclosed',
      question: 'Were you told the dealer would receive commission from the lender?',
      type: 'select',
      options: [
        'No - I was not told about any commission',
        'Vaguely mentioned but no amount given',
        'Yes - the commission amount was disclosed',
        'I cannot remember',
      ],
      required: true,
    },
    {
      id: 'interest_rate_explained',
      question: 'Were you shown different interest rate options?',
      type: 'select',
      options: [
        'No - I was only offered one rate',
        'No - I wasn\'t told the rate could be different',
        'Yes - I was shown alternatives',
        'I cannot remember',
      ],
      required: true,
    },
    {
      id: 'agreement_status',
      question: 'What is the current status of this finance?',
      type: 'select',
      options: ['Fully paid off', 'Still paying', 'Settled early', 'Vehicle returned (voluntary termination)', 'Vehicle repossessed'],
      required: true,
    },
    {
      id: 'additional_details',
      question: 'Anything else you\'d like us to know about how the finance was sold?',
      type: 'textarea',
      placeholder: 'Optional - describe anything else relevant about how the finance was arranged',
      required: false,
    },
    {
      id: 'documents',
      question: 'Upload any documents you have',
      type: 'file',
      required: false,
      helpText: 'Finance agreement, statements, or any letters from the lender (optional but helpful)',
    },
  ],
}

export const CREDIT_CARD_AFFORDABILITY_QUESTIONS: QuestionnaireConfig = {
  title: 'Credit Card Affordability Complaint',
  description: 'Claim back charges if the credit was unaffordable',
  icon: '💳',
  questions: [
    {
      id: 'provider',
      question: 'Which credit card provider is this complaint about?',
      type: 'autocomplete',
      autocompleteType: 'credit',
      placeholder: 'Start typing to search providers...',
      required: true,
    },
    {
      id: 'account_opened',
      question: 'When did you open this credit card account?',
      type: 'date',
      required: true,
      helpText: 'Approximate date is fine',
    },
    {
      id: 'initial_limit',
      question: 'What was your initial credit limit?',
      type: 'currency',
      placeholder: '1000',
      required: true,
    },
    {
      id: 'highest_limit',
      question: 'What was the highest credit limit you had on this card?',
      type: 'currency',
      placeholder: '5000',
      required: true,
    },
    {
      id: 'limit_increases',
      question: 'How did your credit limit increase?',
      type: 'select',
      options: [
        'The provider increased it without asking me',
        'I was offered increases which I accepted',
        'I requested the increases myself',
        'The limit never changed',
        'A combination of the above',
      ],
      required: true,
    },
    {
      id: 'affordability_issue',
      question: 'What made this credit unaffordable for you?',
      type: 'multiselect',
      options: [
        'I was already in financial difficulty when I applied',
        'I couldn\'t afford the minimum payments',
        'I was regularly using the card for essentials like food/bills',
        'I was taking cash advances to pay other debts',
        'The credit limit was too high for my income',
        'I was only making minimum payments for months/years',
        'Other',
      ],
      required: true,
    },
    {
      id: 'monthly_income_then',
      question: 'What was your approximate monthly income when you opened the account?',
      type: 'currency',
      placeholder: '1500',
      required: true,
    },
    {
      id: 'other_debts',
      question: 'Did you have significant other debts at the time?',
      type: 'select',
      options: [
        'Yes - I had multiple other debts',
        'Yes - I had some other debts',
        'No - this was my only/main debt',
        'I cannot remember',
      ],
      required: true,
    },
    {
      id: 'financial_impact',
      question: 'How did this credit affect you financially?',
      type: 'textarea',
      placeholder: 'Describe the impact - e.g. missed payments, debt spiral, borrowing more to pay this, stress, couldn\'t afford essentials',
      required: true,
    },
    {
      id: 'current_status',
      question: 'What is the current status of this account?',
      type: 'select',
      options: ['Still open and in use', 'Closed - paid off', 'Closed - in default', 'In debt management plan', 'Written off/sold to collection agency'],
      required: true,
    },
    {
      id: 'documents',
      question: 'Upload any relevant documents',
      type: 'file',
      required: false,
      helpText: 'Statements, credit agreement, letters - optional but helpful',
    },
  ],
}

export const BANK_FRAUD_QUESTIONS: QuestionnaireConfig = {
  title: 'Bank Fraud Refund Complaint',
  description: 'Get your money back after fraud or a scam',
  icon: '🚨',
  questions: [
    {
      id: 'bank',
      question: 'Which bank is this complaint about?',
      type: 'autocomplete',
      autocompleteType: 'bank',
      placeholder: 'Start typing your bank name...',
      required: true,
    },
    {
      id: 'fraud_type',
      question: 'What type of fraud or scam was this?',
      type: 'select',
      options: [
        'I was tricked into making a payment (APP scam)',
        'Someone made payments without my knowledge (unauthorised)',
        'My card was cloned or stolen',
        'Someone took over my account',
        'Investment/cryptocurrency scam',
        'Romance scam',
        'Impersonation scam (pretended to be bank/police/HMRC)',
        'Invoice/payment redirection scam',
        'Purchase scam (paid for goods never received)',
        'Other',
      ],
      required: true,
    },
    {
      id: 'fraud_date',
      question: 'When did the fraud happen?',
      type: 'date',
      required: true,
    },
    {
      id: 'amount_lost',
      question: 'How much money was lost?',
      type: 'currency',
      placeholder: '5000',
      required: true,
    },
    {
      id: 'how_it_happened',
      question: 'Please describe what happened',
      type: 'textarea',
      placeholder: 'Explain how you were scammed or how the fraud occurred. Include as much detail as possible - how you were contacted, what you were told, what made it seem genuine.',
      required: true,
    },
    {
      id: 'reported_when',
      question: 'When did you report this to your bank?',
      type: 'date',
      required: true,
    },
    {
      id: 'bank_response',
      question: 'What was your bank\'s response?',
      type: 'select',
      options: [
        'Refused to refund - said I was at fault',
        'Refused to refund - said I authorised it',
        'Partial refund only',
        'Still waiting for a response',
        'Haven\'t heard back yet',
        'They refunded some but not all',
      ],
      required: true,
    },
    {
      id: 'bank_reason',
      question: 'What reason did the bank give for refusing (if applicable)?',
      type: 'textarea',
      placeholder: 'What did the bank say when they refused your claim?',
      required: false,
    },
    {
      id: 'reported_police',
      question: 'Have you reported this to Action Fraud or the police?',
      type: 'select',
      options: ['Yes', 'No', 'Not yet but planning to'],
      required: true,
    },
    {
      id: 'documents',
      question: 'Upload any evidence',
      type: 'file',
      required: false,
      helpText: 'Bank statements, scam messages/emails, police reference - anything that supports your case',
    },
  ],
}

export const UNAFFORDABLE_LENDING_QUESTIONS: QuestionnaireConfig = {
  title: 'Unaffordable Lending Complaint',
  description: 'Claim if you were given credit you couldn\'t afford',
  icon: '💷',
  questions: [
    {
      id: 'credit_type',
      question: 'What type of credit is this complaint about?',
      type: 'select',
      options: [
        'Personal loan',
        'Overdraft',
        'Store card/catalogue credit',
        'Payday loan',
        'Guarantor loan',
        'Buy now pay later',
        'Credit card (use Credit Card Affordability instead)',
        'Other',
      ],
      required: true,
    },
    {
      id: 'lender',
      question: 'Who is the lender?',
      type: 'autocomplete',
      autocompleteType: 'loan',
      placeholder: 'Start typing the lender name...',
      required: true,
    },
    {
      id: 'account_opened',
      question: 'When was the credit taken out?',
      type: 'date',
      required: true,
    },
    {
      id: 'amount_borrowed',
      question: 'How much did you borrow?',
      type: 'currency',
      placeholder: '3000',
      required: true,
    },
    {
      id: 'affordability_checks',
      question: 'What affordability checks did the lender do?',
      type: 'select',
      options: [
        'None that I\'m aware of',
        'Just a credit check',
        'Asked basic income questions only',
        'Requested bank statements/payslips',
        'Thorough checks including outgoings',
        'I cannot remember',
      ],
      required: true,
    },
    {
      id: 'why_unaffordable',
      question: 'Why was this credit unaffordable for you?',
      type: 'multiselect',
      options: [
        'My income was too low to afford the repayments',
        'I had too many other debts',
        'I was already in financial difficulty',
        'I missed payments from the start',
        'I had to borrow more to make the payments',
        'The interest/charges made it impossible to pay off',
        'Other',
      ],
      required: true,
    },
    {
      id: 'monthly_income',
      question: 'What was your monthly income at the time?',
      type: 'currency',
      placeholder: '1500',
      required: true,
    },
    {
      id: 'financial_impact',
      question: 'How did this credit affect you?',
      type: 'textarea',
      placeholder: 'Describe the impact - debt spiral, stress, couldn\'t pay other bills, had to use food banks, etc.',
      required: true,
    },
    {
      id: 'current_status',
      question: 'What is the current status?',
      type: 'select',
      options: ['Still paying', 'Paid off', 'Defaulted', 'In debt management plan', 'Written off', 'Sold to debt collector'],
      required: true,
    },
    {
      id: 'documents',
      question: 'Upload any documents',
      type: 'file',
      required: false,
      helpText: 'Credit agreement, statements, bank statements from the time - optional but helpful',
    },
  ],
}

export const SECTION_75_QUESTIONS: QuestionnaireConfig = {
  title: 'Section 75 Credit Card Claim',
  description: 'Claim from your credit card company for a purchase that went wrong',
  icon: '🛡️',
  questions: [
    {
      id: 'card_provider',
      question: 'Which credit card did you use?',
      type: 'autocomplete',
      autocompleteType: 'credit',
      placeholder: 'Start typing your card provider...',
      required: true,
    },
    {
      id: 'purchase_description',
      question: 'What did you buy?',
      type: 'textarea',
      placeholder: 'Describe what you purchased - e.g. holiday package, furniture, car deposit, building work',
      required: true,
    },
    {
      id: 'merchant_name',
      question: 'Who did you buy from?',
      type: 'text',
      placeholder: 'Company or seller name',
      required: true,
    },
    {
      id: 'purchase_date',
      question: 'When did you make the purchase?',
      type: 'date',
      required: true,
    },
    {
      id: 'total_cost',
      question: 'What was the total cost of the purchase?',
      type: 'currency',
      placeholder: '500',
      required: true,
      helpText: 'Must be between £100 and £30,000 for Section 75',
    },
    {
      id: 'card_amount',
      question: 'How much did you pay on the credit card?',
      type: 'currency',
      placeholder: '100',
      required: true,
      helpText: 'Even a small deposit on the card can give you protection',
    },
    {
      id: 'problem_type',
      question: 'What went wrong?',
      type: 'select',
      options: [
        'Goods never delivered/arrived',
        'Goods are faulty or damaged',
        'Goods not as described',
        'Service not provided',
        'Company went out of business',
        'Work not completed to standard',
        'Other breach of contract',
      ],
      required: true,
    },
    {
      id: 'problem_description',
      question: 'Please describe the problem in detail',
      type: 'textarea',
      placeholder: 'What exactly went wrong? When did you discover the problem? What have you done to try to resolve it?',
      required: true,
    },
    {
      id: 'contacted_merchant',
      question: 'Have you tried to resolve this with the seller?',
      type: 'select',
      options: [
        'Yes - they refused to help',
        'Yes - they didn\'t respond',
        'Yes - they offered inadequate resolution',
        'No - they\'ve gone out of business',
        'No - I haven\'t contacted them yet',
      ],
      required: true,
    },
    {
      id: 'amount_claiming',
      question: 'How much are you claiming?',
      type: 'currency',
      placeholder: '500',
      required: true,
    },
    {
      id: 'documents',
      question: 'Upload supporting documents',
      type: 'file',
      required: false,
      helpText: 'Receipt, photos of faulty goods, emails with seller, contract - anything that supports your claim',
    },
  ],
}

// ===========================================
// GENERIC QUESTIONS (for "Other" category)
// ===========================================

export const GENERIC_QUESTIONS: QuestionnaireConfig = {
  title: 'Financial Services Complaint',
  description: 'Tell us about your complaint',
  icon: '📝',
  questions: [
    {
      id: 'category',
      question: 'What category does your complaint fall into?',
      type: 'select',
      options: [
        'Banking & Current Accounts',
        'Credit Cards',
        'Car Finance (PCP/HP)',
        'Personal Loans',
        'Mortgages',
        'Insurance',
        'Pensions & Investments',
        'Fraud & Scams',
        'Debt & Collections',
      ],
      required: true,
    },
    {
      id: 'issue_type',
      question: 'What is the specific issue?',
      type: 'select',
      options: [], // Will be populated dynamically based on category
      required: true,
    },
    {
      id: 'provider',
      question: 'Which company or provider is this complaint about?',
      type: 'autocomplete',
      autocompleteType: 'all',
      placeholder: 'Start typing the company name...',
      required: true,
    },
    {
      id: 'when_issue_started',
      question: 'When did this issue start or occur?',
      type: 'date',
      required: true,
    },
    {
      id: 'amount_involved',
      question: 'What amount of money is involved (if applicable)?',
      type: 'currency',
      placeholder: '0',
      required: false,
      helpText: 'Leave blank if not applicable',
    },
    {
      id: 'what_happened',
      question: 'Please describe what happened',
      type: 'textarea',
      placeholder: 'Tell us the full story - what went wrong, when you noticed the problem, and how it has affected you. Include as much detail as possible.',
      required: true,
    },
    {
      id: 'already_complained',
      question: 'Have you already complained to the company?',
      type: 'select',
      options: [
        'Yes - they rejected my complaint',
        'Yes - they offered something inadequate',
        'Yes - waiting for their response',
        'No - I haven\'t complained yet',
      ],
      required: true,
    },
    {
      id: 'their_response',
      question: 'If you\'ve complained, what was their response?',
      type: 'textarea',
      placeholder: 'What did they say? Quote any reasons they gave for their decision.',
      required: false,
    },
    {
      id: 'what_you_want',
      question: 'What outcome are you looking for?',
      type: 'multiselect',
      options: [
        'Refund of money paid',
        'Compensation for losses',
        'Compensation for distress/inconvenience',
        'An apology',
        'Them to fix the problem',
        'Removal of default/negative credit record',
        'Other',
      ],
      required: true,
    },
    {
      id: 'documents',
      question: 'Upload any relevant documents',
      type: 'file',
      required: false,
      helpText: 'Any evidence that supports your complaint - statements, letters, emails, photos',
    },
  ],
}

// Export all questionnaire configs
export const QUESTIONNAIRE_CONFIGS: Record<string, QuestionnaireConfig> = {
  'pcp': PCP_QUESTIONS,
  'credit-card-affordability': CREDIT_CARD_AFFORDABILITY_QUESTIONS,
  'bank-fraud': BANK_FRAUD_QUESTIONS,
  'unaffordable': UNAFFORDABLE_LENDING_QUESTIONS,
  'section75': SECTION_75_QUESTIONS,
  'other': GENERIC_QUESTIONS,
}

export function getQuestionnaireConfig(type: string): QuestionnaireConfig {
  return QUESTIONNAIRE_CONFIGS[type] || GENERIC_QUESTIONS
}
