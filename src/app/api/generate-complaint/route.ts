import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// Only initialize if we have the key
const anthropic = process.env.ANTHROPIC_API_KEY 
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null

// System prompts for each complaint type
const SYSTEM_PROMPTS: Record<string, string> = {
  pcp: `You are an expert at writing professional consumer complaint letters about motor finance and PCP (Personal Contract Purchase) agreements.

Your task is to generate a formal complaint letter that:
1. Is addressed to the finance provider
2. Clearly states the grounds for complaint (undisclosed commission arrangements)
3. References relevant regulations (CONC 4.5.3R, Consumer Credit Act 1974)
4. Cites the October 2024 Court of Appeal ruling on commission disclosure (Johnson v FirstRand Bank)
5. Requests specific remedies (refund of commission, interest recalculation)
6. Is professional, factual, and free from emotional language
7. Includes all relevant dates, amounts, and reference numbers
8. Follows the structure that Financial Ombudsman decisions show leads to successful outcomes

Key legal points to include:
- The broker (dealer) had a duty to disclose any commission received from the lender
- Discretionary Commission Arrangements (DCAs) allowed dealers to increase customer interest rates to earn higher commission
- The FCA banned DCAs in January 2021, indicating regulatory concern about this practice
- If commission was not disclosed, this may constitute a breach of fiduciary duty
- The customer may be entitled to have the agreement reassessed as if properly disclosed
- The customer may also be entitled to 8% simple interest on any refund

Generate a complete, ready-to-send complaint letter. Include today's date, proper formatting, and a 14-day response deadline.`,

  section75: `You are an expert at writing Section 75 Consumer Credit Act claim letters.

Your task is to generate a formal claim letter that:
1. Is addressed to the credit card provider
2. Clearly invokes Section 75 of the Consumer Credit Act 1974
3. Explains joint and several liability between card provider and merchant
4. Details the breach of contract or misrepresentation by the merchant
5. Provides specific evidence of the problem
6. States the exact amount being claimed
7. Sets a reasonable deadline for response (14 days)
8. Mentions escalation to the Financial Ombudsman Service if not resolved

Key legal points to include:
- Under Section 75, the credit card company is equally liable with the merchant
- The purchase must be between £100 and £30,000 in value
- Even paying a deposit on credit card can trigger Section 75 protection
- The customer can claim from the card provider even if the merchant has gone bust
- Time limit is 6 years from the breach or date goods should have been delivered

Generate a complete, ready-to-send complaint letter.`,

  unaffordable: `You are an expert at writing complaints about irresponsible and unaffordable lending.

Your task is to generate a formal complaint letter that:
1. Is addressed to the lender
2. Argues that adequate affordability checks were not conducted
3. References CONC 5 (FCA's Consumer Credit sourcebook on responsible lending)
4. Details the customer's financial circumstances at time of application
5. Explains how a proper assessment would have shown the lending was unaffordable
6. Requests appropriate remedies (refund of interest, removal of adverse credit data)
7. Mentions any credit limit increases that worsened the situation

Key legal points to include:
- Lenders must conduct a reasonable assessment of creditworthiness (CONC 5.2.1R)
- The assessment must consider the customer's ability to repay sustainably
- "Sustainably" means without undue difficulty or adverse consequences
- Relying solely on credit reference data may not be sufficient
- If a customer was in persistent debt (18+ months paying mostly interest), lender should have intervened
- Remedies can include refund of all interest and charges paid

Generate a complete, ready-to-send complaint letter.`,

  'holiday-park': `You are an expert at writing complaints about holiday park and static caravan mis-selling.

Your task is to generate a formal complaint letter that:
1. Is addressed to the holiday park operator
2. Details the specific promises made during the sales process
3. Contrasts those promises with the actual experience
4. References the Consumer Rights Act 2015 (unfair contract terms)
5. References the Consumer Protection from Unfair Trading Regulations 2008
6. Details financial losses suffered
7. Requests specific remedies (rescission of contract, compensation)

Key legal points to include:
- Verbal promises made during sales can form part of the contract
- Misleading sales practices breach the Consumer Protection Regulations
- Unfair contract terms (e.g., forced use of park services) may be unenforceable
- Significant hidden fees not disclosed at point of sale may be challengeable
- High-pressure sales tactics in lengthy presentations may constitute unfair practices
- Depreciation misrepresented as "holding value" is actionable misrepresentation

Generate a complete, ready-to-send complaint letter.`,
}

// Evidence checklist for each complaint type
const EVIDENCE_CHECKLISTS: Record<string, string[]> = {
  pcp: [
    'Copy of your finance agreement',
    'Any paperwork from the dealership',
    'Proof of payments made (bank statements)',
    'Any correspondence about the finance',
    'The vehicle order form if you have it',
  ],
  section75: [
    'Copy of your credit card statement showing the purchase',
    'Receipt or invoice for the purchase',
    'Any correspondence with the merchant',
    'Evidence of the problem (photos, reports, etc.)',
    'Proof you have tried to resolve with the merchant',
  ],
  unaffordable: [
    'Bank statements from when you applied',
    'Payslips from the time of application',
    'Evidence of other debts at the time',
    'Any correspondence about missed payments',
    'Credit report if available',
  ],
  'holiday-park': [
    'Your contract or membership agreement',
    'Any sales brochures or promotional materials',
    'Notes of what was promised verbally (if you made any)',
    'Evidence of fees charged vs what was quoted',
    'Any correspondence with the company',
  ],
}

function formatAnswersForPrompt(complaintType: string, answers: Record<string, any>): string {
  const sections: string[] = []
  
  // Common personal details
  sections.push(`COMPLAINANT DETAILS:
Name: ${answers.full_name || 'Not provided'}
Address: ${answers.address || 'Not provided'}
Email: ${answers.email || 'Not provided'}
Phone: ${answers.phone || 'Not provided'}`)
  
  // Complaint-specific details
  switch (complaintType) {
    case 'pcp':
      sections.push(`
MOTOR FINANCE DETAILS:
Car: ${answers.car_make || ''} ${answers.car_model || ''}
Finance Provider: ${answers.lender || 'Not provided'}
Dealership: ${answers.dealer_name || 'Not provided'}
Agreement Date: ${answers.purchase_date || 'Not provided'}
Finance Amount: £${answers.finance_amount || 'Not provided'}
Interest Rate (APR): ${answers.interest_rate || 'Not provided'}
Was Commission Disclosed: ${answers.commission_disclosed || 'Not provided'}
Agreement Status: ${answers.still_paying || 'Not provided'}
Additional Information: ${answers.additional_info || 'None'}`)
      break
      
    case 'section75':
      sections.push(`
SECTION 75 CLAIM DETAILS:
Credit Card Provider: ${answers.card_provider || 'Not provided'}
What Was Purchased: ${answers.purchase_description || 'Not provided'}
Merchant/Seller: ${answers.merchant_name || 'Not provided'}
Purchase Date: ${answers.purchase_date || 'Not provided'}
Total Amount Paid: £${answers.amount_paid || 'Not provided'}
Amount Paid on Credit Card: £${answers.card_amount || 'Not provided'}
Type of Problem: ${answers.problem_type || 'Not provided'}
Problem Description: ${answers.problem_description || 'Not provided'}
Attempted Resolution with Merchant: ${answers.contacted_merchant || 'Not provided'}
Amount Being Claimed: £${answers.amount_claiming || 'Not provided'}`)
      break
      
    case 'unaffordable':
      sections.push(`
UNAFFORDABLE LENDING DETAILS:
Type of Credit: ${answers.product_type || 'Not provided'}
Lender: ${answers.lender || 'Not provided'}
Date Credit Was Taken Out: ${answers.start_date || 'Not provided'}
Credit Amount/Limit: £${answers.credit_amount || 'Not provided'}
Monthly Income at the Time: £${answers.income_at_time || 'Not provided'}
Other Debts at the Time: ${answers.existing_debt || 'Not provided'}
What Checks Were Done: ${answers.affordability_checks || 'Not provided'}
Financial Difficulty Caused: ${answers.financial_difficulty || 'Not provided'}
How It Affected Me: ${answers.difficulty_description || 'Not provided'}
Current Status of the Account: ${answers.current_status || 'Not provided'}`)
      break
      
    case 'holiday-park':
      sections.push(`
HOLIDAY PARK COMPLAINT DETAILS:
Company: ${answers.company || 'Not provided'}
Type of Product: ${answers.product_type || 'Not provided'}
Purchase Date: ${answers.purchase_date || 'Not provided'}
Purchase Price: £${answers.purchase_price || 'Not provided'}
Payment Method: ${answers.payment_method || 'Not provided'}
Sales Presentation: ${answers.sales_presentation || 'Not provided'}
Pressure Felt: ${answers.pressure_tactics || 'Not provided'}
What Was Promised: ${answers.promises_made || 'Not provided'}
Problems Experienced: ${answers.problems_experienced || 'Not provided'}`)
      break
  }
  
  return sections.join('\n')
}

export async function POST(request: NextRequest) {
  if (!anthropic) {
    return NextResponse.json(
      { error: 'AI service not configured. Please check ANTHROPIC_API_KEY.' },
      { status: 500 }
    )
  }
  
  try {
    const body = await request.json()
    const { complaintType, answers, sessionId } = body
    
    if (!complaintType || !answers) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Get system prompt for complaint type
    const systemPrompt = SYSTEM_PROMPTS[complaintType]
    if (!systemPrompt) {
      return NextResponse.json(
        { error: 'Invalid complaint type' },
        { status: 400 }
      )
    }
    
    // Format answers for the prompt
    const formattedAnswers = formatAnswersForPrompt(complaintType, answers)
    
    // Build the user prompt
    const userPrompt = `Please generate a professional complaint letter based on the following information:

${formattedAnswers}

Generate a complete, formal complaint letter ready to send. Include:
1. Today's date (${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })})
2. Proper letter formatting with addresses
3. Clear subject line with any reference numbers
4. All relevant legal references and regulations
5. Specific remedy being requested
6. A 14-day deadline for response
7. Mention of escalation to Financial Ombudsman if not resolved
8. Professional sign-off

The letter should be ready to print and send with no further editing needed.`

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    })
    
    // Extract the generated letter
    const generatedLetter = message.content[0].type === 'text' 
      ? message.content[0].text 
      : ''
    
    // Get evidence checklist
    const evidenceChecklist = EVIDENCE_CHECKLISTS[complaintType] || []
    
    return NextResponse.json({
      letter: generatedLetter,
      evidenceChecklist,
    })
    
  } catch (error) {
    console.error('Error generating complaint:', error)
    return NextResponse.json(
      { error: 'Failed to generate complaint letter' },
      { status: 500 }
    )
  }
}
