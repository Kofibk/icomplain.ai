// Test script to generate sample complaint letters
// Run with: ANTHROPIC_API_KEY=your-key npx ts-node test-letters.ts

import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

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
- Format the letter professionally with proper date, reference, and signature sections`

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
      agreement_date: '2019-03-15',
      finance_amount: '22000',
      commission_disclosed: 'No - I was not told about any commission',
      interest_rate_explained: 'No - I was only offered one rate',
      agreement_status: 'Fully paid off',
      additional_details: 'The salesman rushed me through the paperwork and told me this was the best rate available. I later found out they earned over £1,500 in commission.',
    },
  },
  {
    name: 'Credit Card Affordability',
    type: 'credit-card-affordability',
    answers: {
      provider: 'Barclaycard',
      account_opened: '2018-06-01',
      initial_limit: '2000',
      highest_limit: '12000',
      limit_increases: 'The provider increased it without asking me',
      affordability_issue: ['I couldn\'t afford the minimum payments', 'I was regularly using the card for essentials like food/bills', 'I was only making minimum payments for months/years'],
      monthly_income_then: '1800',
      other_debts: 'Yes - I had multiple other debts',
      financial_impact: 'I got into a spiral of debt. I was using this card to pay other bills and then taking cash advances to make minimum payments. I missed several payments and got into serious arrears. It caused me significant stress and anxiety.',
      current_status: 'Closed - in default',
    },
  },
  {
    name: 'Bank Fraud - APP Scam',
    type: 'bank-fraud',
    answers: {
      bank: 'Lloyds Bank',
      fraud_type: 'I was tricked into making a payment (APP scam)',
      fraud_date: '2024-09-15',
      amount_lost: '8500',
      how_it_happened: 'I received a call from someone claiming to be from Lloyds fraud team. They said my account had been compromised and I needed to move my money to a safe account. They knew my name, address and the last 4 digits of my card. They kept me on the phone for 2 hours and had me transfer £8,500 to what I thought was a safe holding account. It turned out to be a scammer\'s account.',
      reported_when: '2024-09-15',
      bank_response: 'Refused to refund - said I was at fault',
      bank_reason: 'They said I authorised the payment and should have known it was a scam. They said I ignored their warnings.',
      reported_police: 'Yes',
    },
  },
  {
    name: 'Section 75 - Holiday Company Bust',
    type: 'section75',
    answers: {
      card_provider: 'HSBC Credit Card',
      purchase_description: 'All-inclusive family holiday to Turkey - 2 weeks for 4 people, flights and hotel included',
      merchant_name: 'Sunshine Holidays Ltd',
      purchase_date: '2024-01-20',
      total_cost: '4200',
      card_amount: '500',
      problem_type: 'Company went out of business',
      problem_description: 'I booked a family holiday for August 2024. In June, the company suddenly closed down. Their website disappeared and phone lines were dead. I never received the holiday, flights or hotel. I paid a £500 deposit on my credit card and the remaining £3,700 by bank transfer.',
      contacted_merchant: 'No - they\'ve gone out of business',
      amount_claiming: '4200',
    },
  },
]

async function generateLetter(testCase: typeof testCases[0]): Promise<string> {
  const context = `Complaint Type: ${testCase.name}

Details provided by the consumer:
${Object.entries(testCase.answers)
  .map(([key, value]) => {
    const label = key.replace(/_/g, ' ').replace(/^./, s => s.toUpperCase())
    const displayValue = Array.isArray(value) ? value.join(', ') : value
    return `- ${label}: ${displayValue}`
  })
  .join('\n')}`

  const companyName = testCase.answers.lender || testCase.answers.provider || testCase.answers.bank || testCase.answers.card_provider

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

Format it as a proper letter with sender placeholder, company address placeholder, date, subject line, professional greeting, body paragraphs, clear statement of remedy sought, professional sign-off, and signature line.

Do not include any commentary or explanation - just output the letter text.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  })

  return message.content
    .filter((block): block is { type: 'text'; text: string } => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
}

async function main() {
  console.log('='.repeat(80))
  console.log('ICOMPLAIN - TEST LETTER GENERATION')
  console.log('='.repeat(80))
  console.log('')

  for (const testCase of testCases) {
    console.log(`\n${'='.repeat(80)}`)
    console.log(`TEST CASE: ${testCase.name}`)
    console.log('='.repeat(80))
    
    try {
      const letter = await generateLetter(testCase)
      console.log('\nGENERATED LETTER:')
      console.log('-'.repeat(40))
      console.log(letter)
      console.log('-'.repeat(40))
    } catch (error) {
      console.error(`Error generating letter: ${error}`)
    }
    
    console.log('')
  }
}

main()
