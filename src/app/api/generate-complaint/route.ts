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

  'credit-card-affordability': `You are an expert at writing complaints about irresponsible credit card lending and unaffordable credit limits.

Your task is to generate a formal complaint letter that:
1. Is addressed to the credit card provider
2. Argues that adequate affordability checks were not conducted before issuing the card or increasing limits
3. References CONC 5 (FCA's Consumer Credit sourcebook on responsible lending)
4. Details any unsolicited credit limit increases that worsened the situation
5. Explains how a proper assessment would have shown the credit was unaffordable
6. Requests appropriate remedies (refund of interest and charges, removal of adverse credit data)
7. Mentions persistent debt rules if applicable (paying mostly interest for 18+ months)

Key legal points to include:
- Lenders must conduct a reasonable assessment of creditworthiness (CONC 5.2.1R)
- The assessment must consider the customer's ability to repay sustainably
- Credit limit increases require fresh affordability assessments
- If a customer was in persistent debt, lender should have intervened
- Unsolicited limit increases without proper checks are problematic
- Remedies can include refund of all interest and charges paid
- The FCA's persistent debt rules require lenders to help struggling customers

Generate a complete, ready-to-send complaint letter.`,

  'bank-fraud': `You are an expert at writing complaints about bank fraud refunds and unauthorised transactions.

Your task is to generate a formal complaint letter that:
1. Is addressed to the bank
2. Details the fraud or scam that occurred
3. Explains what steps the customer took (reporting, etc.)
4. References the Contingent Reimbursement Model Code (for APP fraud) if applicable
5. References PSR requirements for mandatory reimbursement (from Oct 2024) if applicable
6. Argues why the bank should refund under their duty of care
7. Sets a clear deadline for response

Key legal points to include:
- Banks have a duty to protect customers from fraud
- Payment Services Regulations require refunds for unauthorised transactions
- For Authorised Push Payment (APP) scams, the CRM Code and new PSR rules apply
- Banks must reimburse APP fraud victims up to £85,000 (from Oct 2024)
- Gross negligence must be proven by the bank to deny a claim
- The bank should have had systems to detect unusual transactions
- Delays in reporting do not automatically disqualify claims

Generate a complete, ready-to-send complaint letter.`,

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
  'credit-card-affordability': [
    'Credit card statements showing spending patterns',
    'Bank statements from when you applied',
    'Evidence of credit limit increases',
    'Any correspondence about missed payments',
    'Proof of income at time of application',
    'Evidence of other debts at the time',
  ],
  'bank-fraud': [
    'Bank statements showing the fraudulent transaction(s)',
    'Screenshots of any scam messages or emails',
    'Crime reference number from police report',
    'Timeline of when you reported the fraud',
    'Any correspondence with the bank about the fraud',
    'Evidence of how the fraud occurred',
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
    
    case 'credit-card-affordability':
      sections.push(`
CREDIT CARD AFFORDABILITY DETAILS:
Credit Card Provider: ${answers.card_provider || 'Not provided'}
Date Card Was Opened: ${answers.start_date || 'Not provided'}
Initial Credit Limit: £${answers.initial_limit || 'Not provided'}
Current/Final Credit Limit: £${answers.final_limit || 'Not provided'}
Were Limit Increases Requested: ${answers.limit_increases_requested || 'Not provided'}
Monthly Income at the Time: £${answers.income_at_time || 'Not provided'}
Other Debts at the Time: ${answers.existing_debt || 'Not provided'}
What Checks Were Done: ${answers.affordability_checks || 'Not provided'}
Financial Difficulty Caused: ${answers.financial_difficulty || 'Not provided'}
How It Affected Me: ${answers.difficulty_description || 'Not provided'}
Current Status of the Account: ${answers.current_status || 'Not provided'}`)
      break
    
    case 'bank-fraud':
      sections.push(`
BANK FRAUD DETAILS:
Bank Name: ${answers.bank_name || 'Not provided'}
Account Type: ${answers.account_type || 'Not provided'}
Date of Fraud: ${answers.fraud_date || 'Not provided'}
Amount Lost: £${answers.amount_lost || 'Not provided'}
Type of Fraud: ${answers.fraud_type || 'Not provided'}
How the Fraud Occurred: ${answers.fraud_description || 'Not provided'}
When Reported to Bank: ${answers.report_date || 'Not provided'}
Bank's Response: ${answers.bank_response || 'Not provided'}
Police Report Reference: ${answers.police_reference || 'Not provided'}
Was Money Recovered: ${answers.money_recovered || 'Not provided'}
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
