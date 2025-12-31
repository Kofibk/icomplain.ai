// Test script to generate sample complaint letters
// Run with: ANTHROPIC_API_KEY=sk-ant-xxx node test-letters.mjs

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert UK consumer complaints letter writer. You help consumers write formal complaint letters to UK financial services companies.

Your letters should:
1. Be professional, clear and factual
2. Reference relevant UK regulations where appropriate (Consumer Credit Act 1974, CONC rules, FCA handbook, Section 75 CCA, etc.)
3. Use arguments and language that have been proven effective in successful complaints
4. Be structured properly with clear sections
5. Include a specific remedy/outcome being requested
6. Set clear timescales for response (typically 8 weeks before FOS referral)

IMPORTANT RULES:
- You are generating a document, not giving advice
- Do not claim the consumer will definitely win - use phrases like "I believe", "In my view", "I consider"
- Include the standard 8-week deadline and FOS escalation language
- Be factual and stick to what the consumer has told you
- Do not invent facts or make assumptions not supported by the provided information
- Format the letter professionally with proper date, reference, and signature sections`;

// Test cases
const testCases = [
  {
    name: 'PCP Car Finance - Hidden Commission',
    type: 'pcp',
    answers: {
      lender: 'Black Horse',
      dealer: 'Arnold Clark Birmingham',
      car_make: 'BMW',
      car_model: '3 Series',
      finance_type: 'PCP (Personal Contract Purchase)',
      agreement_date: '2019-06-15',
      finance_amount: '18000',
      commission_disclosed: 'No - I was not told about any commission',
      interest_rate_explained: 'No - I was only offered one rate',
      agreement_status: 'Fully paid off',
      additional_details: 'I was told by the salesman that this was the best rate available and there were no other options. I now understand that dealers could set higher interest rates to earn more commission without telling customers.',
    },
  },
  {
    name: 'Credit Card Affordability',
    type: 'credit-card-affordability',
    answers: {
      provider: 'Barclaycard',
      account_opened: '2018-03-01',
      initial_limit: '2000',
      highest_limit: '12000',
      limit_increases: 'The provider increased it without asking me',
      affordability_issue: [
        'I couldn\'t afford the minimum payments',
        'I was regularly using the card for essentials like food/bills',
        'I was only making minimum payments for months/years',
      ],
      monthly_income_then: '1600',
      other_debts: 'Yes - I had multiple other debts',
      financial_impact: 'The credit card became impossible to manage. I was only ever making minimum payments and the balance kept growing due to interest. I had to use it for food shopping because I had no money left after paying other debts. This went on for over 2 years and caused me significant stress and anxiety.',
      current_status: 'Closed - in default',
    },
  },
  {
    name: 'Bank Fraud - APP Scam',
    type: 'bank-fraud',
    answers: {
      bank: 'HSBC',
      fraud_type: 'I was tricked into making a payment (APP scam)',
      fraud_date: '2024-08-15',
      amount_lost: '4500',
      how_it_happened: 'I received a call from someone claiming to be from HSBC\'s fraud team. They said my account had been compromised and I needed to move my money to a "safe account" immediately. They knew my name, address, and the last 4 digits of my card. I was panicked and transferred £4,500 to the account they gave me. I later realised it was a scam when I called HSBC directly.',
      reported_when: '2024-08-15',
      bank_response: 'Refused to refund - said I was at fault',
      bank_reason: 'HSBC said I authorised the payment and should have been more careful. They said they warned me during the transfer but I proceeded anyway.',
      reported_police: 'Yes',
    },
  },
];

async function generateLetter(testCase) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`GENERATING: ${testCase.name}`);
  console.log('='.repeat(60));

  const context = `Complaint Type: ${testCase.name}

Details provided by the consumer:
${Object.entries(testCase.answers)
  .map(([key, value]) => {
    const label = key.replace(/_/g, ' ').replace(/^./, (s) => s.toUpperCase());
    const displayValue = Array.isArray(value) ? value.join(', ') : value;
    return `- ${label}: ${displayValue}`;
  })
  .join('\n')}`;

  const companyName = testCase.answers.lender || testCase.answers.provider || testCase.answers.bank;

  const userPrompt = `Generate a formal complaint letter based on the following information. The letter should be ready to send to the company.

${context}

The letter should:
1. Be addressed to the complaints department of: ${companyName}
2. Include today's date: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
3. Have a clear subject line
4. Set out the facts of the complaint clearly
5. Reference relevant regulations
6. State what outcome/remedy is being sought
7. Give the standard 8-week response deadline
8. Mention the right to refer to the Financial Ombudsman Service

Format it as a proper letter with:
- Sender placeholder [YOUR NAME AND ADDRESS]
- Company address placeholder
- Date
- Subject line
- Professional greeting
- Body paragraphs
- Clear statement of remedy sought
- Professional sign-off
- Signature line

Do not include any commentary or explanation - just output the letter text.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const letter = message.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    console.log('\n' + letter);
    return letter;
  } catch (error) {
    console.error('Error generating letter:', error.message);
    return null;
  }
}

async function main() {
  console.log('iComplain Letter Generation Test');
  console.log('================================\n');

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ERROR: ANTHROPIC_API_KEY environment variable not set');
    console.error('Run with: ANTHROPIC_API_KEY=sk-ant-xxx node test-letters.mjs');
    process.exit(1);
  }

  for (const testCase of testCases) {
    await generateLetter(testCase);
    console.log('\n');
  }
}

main();
