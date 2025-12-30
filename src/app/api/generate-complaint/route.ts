import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

// Only initialize if we have the keys
const anthropic = process.env.ANTHROPIC_API_KEY 
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
)

// System prompts for each complaint type
const SYSTEM_PROMPTS: Record<string, string> = {
  pcp: `You are an expert at writing professional consumer complaint letters about motor finance and PCP (Personal Contract Purchase) agreements.

Your task is to generate a formal complaint letter that:
1. Is addressed to the finance provider
2. Clearly states the grounds for complaint (undisclosed commission arrangements)
3. References relevant regulations (CONC 4.5.3R, Consumer Credit Act 1974)
4. Cites the October 2024 Court of Appeal ruling on commission disclosure
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

IMPORTANT: Generate ONLY the complaint letter text. Do not include any meta-commentary or explanations.`,

  section75: `You are an expert at writing Section 75 Consumer Credit Act claim letters.

Your task is to generate a formal claim letter that:
1. Is addressed to the credit card provider
2. Clearly invokes Section 75 of the Consumer Credit Act 1974
3. Explains joint and several liability between card provider and merchant
4. Details the breach of contract or misrepresentation by the merchant
5. Provides specific evidence of the problem
6. States the exact amount being claimed
7. Sets a reasonable deadline for response (typically 14 days)
8. Mentions escalation to the Financial Ombudsman Service if not resolved

Key legal points to include:
- Under Section 75, the credit card company is equally liable with the merchant
- The purchase must be between £100 and £30,000 in value
- Even paying a deposit on credit card can trigger Section 75 protection
- The customer can claim from the card provider even if the merchant has gone bust
- Time limit is 6 years from the breach or date goods should have been delivered

IMPORTANT: Generate ONLY the complaint letter text. Do not include any meta-commentary or explanations.`,

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

IMPORTANT: Generate ONLY the complaint letter text. Do not include any meta-commentary or explanations.`,

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
- Depreciation misrepresented as "holding value" is actionable misrepresentation

IMPORTANT: Generate ONLY the complaint letter text. Do not include any meta-commentary or explanations.`,
}

// Function to retrieve relevant FOS decisions for RAG
async function getRelevantDecisions(complaintType: string, summary: string): Promise<string> {
  try {
    // Query Supabase for similar decisions using vector similarity
    // This requires the embeddings to be set up in Supabase
    const { data, error } = await supabase
      .from('fos_decisions')
      .select('summary, key_arguments, legal_references')
      .eq('category', complaintType)
      .eq('outcome', 'upheld')
      .limit(5)
    
    if (error || !data || data.length === 0) {
      // Return fallback guidance if no decisions found
      return ''
    }
    
    // Format relevant decisions for context
    const context = data.map((d, i) => 
      `Example ${i + 1}:
Summary: ${d.summary}
Successful arguments: ${d.key_arguments?.join('; ') || 'N/A'}
Legal references: ${d.legal_references?.join(', ') || 'N/A'}`
    ).join('\n\n')
    
    return `\n\nHere are examples of successful complaints similar to this case:\n\n${context}`
    
  } catch (error) {
    console.error('Error fetching FOS decisions:', error)
    return ''
  }
}

function formatAnswersForPrompt(complaintType: string, answers: Record<string, any>): string {
  const sections: string[] = []
  
  // Common personal details
  sections.push(`COMPLAINANT DETAILS:
Name: ${answers.full_name}
Address: ${answers.address}
Email: ${answers.email}
Phone: ${answers.phone || 'Not provided'}
Account/Reference: ${answers.account_reference || 'Not provided'}`)
  
  // Complaint-specific details
  switch (complaintType) {
    case 'pcp':
      sections.push(`
MOTOR FINANCE DETAILS:
Vehicle Type: ${answers.vehicle_type}
Finance Type: ${answers.finance_type}
Lender: ${answers.lender_name}
Dealer: ${answers.dealer_name}
Agreement Date: ${answers.agreement_date}
Finance Amount: £${answers.finance_amount}
Commission Disclosed: ${answers.commission_disclosed}
Interest Rate Explained: ${answers.interest_rate_explained}
Agreement Status: ${answers.agreement_status}
Additional Details: ${answers.additional_details || 'None'}`)
      break
      
    case 'section75':
      sections.push(`
SECTION 75 CLAIM DETAILS:
Card Provider: ${answers.card_provider}
Purchase: ${answers.purchase_description}
Merchant: ${answers.merchant_name}
Purchase Date: ${answers.purchase_date}
Total Cost: £${answers.total_cost}
Amount Paid on Card: £${answers.amount_on_card}
Problem Type: ${answers.problem_type}
Problem Description: ${answers.problem_description}
Contacted Merchant: ${answers.contacted_merchant}
Amount Claiming: £${answers.amount_claiming}`)
      break
      
    case 'unaffordable':
      sections.push(`
UNAFFORDABLE LENDING DETAILS:
Credit Type: ${answers.credit_type}
Lender: ${answers.lender_name}
Account Opened: ${answers.account_opened}
Credit Limit/Loan Amount: £${answers.credit_limit_or_amount}
Income at Time: £${answers.income_at_time}
Affordability Checks: ${answers.affordability_checks}
Financial Situation: ${Array.isArray(answers.financial_situation) ? answers.financial_situation.join(', ') : answers.financial_situation}
Limit Increases: ${answers.limit_increases}
Persistent Debt: ${answers.persistent_debt}
Harm Caused: ${answers.harm_caused}`)
      break
      
    case 'holiday-park':
      sections.push(`
HOLIDAY PARK COMPLAINT DETAILS:
Park Name: ${answers.park_name}
Purchase Type: ${answers.purchase_type}
Purchase Date: ${answers.purchase_date}
Purchase Price: £${answers.purchase_price}
Payment Method: ${answers.finance_used}
Promises Made: ${Array.isArray(answers.promises_made) ? answers.promises_made.join(', ') : answers.promises_made}
Actual Experience: ${Array.isArray(answers.actual_experience) ? answers.actual_experience.join(', ') : answers.actual_experience}
Financial Loss: £${answers.financial_loss}
Detailed Complaint: ${answers.detailed_complaint}`)
      break
  }
  
  return sections.join('\n')
}

export async function POST(request: NextRequest) {
  if (!anthropic) {
    return NextResponse.json(
      { error: 'AI service not configured' },
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
    
    // Get relevant FOS decisions for RAG context
    const ragContext = await getRelevantDecisions(complaintType, formattedAnswers)
    
    // Build the user prompt
    const userPrompt = `Please generate a professional complaint letter based on the following information:

${formattedAnswers}
${ragContext}

Generate a complete, formal complaint letter ready to send. Include:
1. Today's date
2. Proper letter formatting with addresses
3. Clear subject line with any reference numbers
4. All relevant legal references and regulations
5. Specific remedy being requested
6. A reasonable deadline for response (14 days)
7. Professional sign-off

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
    
    // Generate evidence checklist based on complaint type
    const evidenceChecklist = generateEvidenceChecklist(complaintType, answers)
    
    // Store the generated complaint in database
    if (sessionId) {
      await supabase.from('generated_complaints').insert({
        session_id: sessionId,
        complaint_type: complaintType,
        answers: answers,
        generated_letter: generatedLetter,
        evidence_checklist: evidenceChecklist,
        created_at: new Date().toISOString(),
      })
    }
    
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

function generateEvidenceChecklist(complaintType: string, answers: Record<string, any>): string[] {
  const common = [
    'Copy of this complaint letter (keep for your records)',
    'Proof of identity (if requested)',
  ]
  
  const specific: Record<string, string[]> = {
    pcp: [
      'Copy of your finance agreement',
      'Any documents received at point of sale',
      'Statements showing payments made',
      'Any correspondence with the lender or dealer',
      'The finance illustration/quote you were given',
    ],
    section75: [
      'Copy of credit card statement showing the transaction',
      'Receipt or invoice for the purchase',
      'Any correspondence with the merchant',
      'Evidence of the problem (photos if applicable)',
      'Proof of what was advertised/promised',
    ],
    unaffordable: [
      'Bank statements from around the time of application',
      'Credit report from around that time (if available)',
      'Evidence of financial difficulties (e.g., missed payments)',
      'Any correspondence about limit increases',
      'Evidence of debt management or payment plans',
    ],
    'holiday-park': [
      'Purchase agreement/contract',
      'Any sales brochures or materials',
      'Evidence of promises made (emails, notes)',
      'Invoices for fees and charges',
      'Evidence of rental income (or lack thereof)',
      'Any correspondence with the park',
    ],
  }
  
  return [...(specific[complaintType] || []), ...common]
}
