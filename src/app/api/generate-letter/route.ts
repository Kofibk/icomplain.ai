import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

interface ComplaintData {
  type: string
  title: string
  answers: Record<string, any>
  fileNames: string[]
  timestamp: string
}

// System prompt for generating complaint letters
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
- Format the letter professionally with proper date, reference, and signature sections

For each complaint type, focus on the key issues:

PCP/HP CAR FINANCE:
- Discretionary commission arrangements (DCA) and undisclosed broker commission
- CONC 4.5.3R - requirement to disclose commission
- Fiduciary duty / duty to act in customer's best interests
- Court of Appeal ruling (Johnson v FirstRand, October 2024)

CREDIT CARD AFFORDABILITY:
- CONC 5.2 - creditworthiness assessment requirements
- Persistent debt indicators
- Credit limit increases without proper affordability checks
- Irresponsible lending under Consumer Credit Act

BANK FRAUD / SCAMS:
- Contingent Reimbursement Model Code for APP scams
- Banks' duty of care
- Failure to detect/prevent fraudulent transactions
- Recovery efforts made/not made

UNAFFORDABLE LENDING:
- CONC 5.2.1R - lender must assess creditworthiness
- CONC 5.3 - proportionate assessment
- Signs of financial difficulty that should have been identified
- Debt spiral / unsustainable borrowing

SECTION 75:
- Consumer Credit Act 1974 Section 75
- Equal liability with retailer for purchases £100-£30,000
- Breach of contract / misrepresentation by retailer
- Card company's joint liability

GENERIC FINANCIAL COMPLAINTS:
- Reference appropriate FCA rules for the product type
- Focus on fair treatment and TCF (Treating Customers Fairly) principles
- Highlight any regulatory breaches where applicable`

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function buildComplaintContext(data: ComplaintData): string {
  const { type, answers } = data
  let context = `Complaint Type: ${data.title}\n\n`
  context += `Details provided by the consumer:\n`

  // Format answers in a readable way
  for (const [key, value] of Object.entries(answers)) {
    if (!value || (Array.isArray(value) && value.length === 0)) continue

    const label = key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (s) => s.toUpperCase())

    let displayValue: string
    if (Array.isArray(value)) {
      displayValue = value.join(', ')
    } else if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      displayValue = formatDate(value)
    } else {
      displayValue = String(value)
    }

    context += `- ${label}: ${displayValue}\n`
  }

  // Add specific context based on complaint type
  context += `\n`

  switch (type) {
    case 'pcp':
      context += `This is a car finance complaint, likely relating to undisclosed commission arrangements. Focus on CONC 4.5.3R and the duty to disclose commission. Reference the Court of Appeal judgment in Johnson v FirstRand if the consumer was not told about commission.`
      break
    case 'credit-card-affordability':
      context += `This is a credit card affordability complaint. Focus on CONC 5.2 creditworthiness requirements and whether proper affordability checks were done before issuing credit or increasing limits.`
      break
    case 'bank-fraud':
      context += `This is a fraud/scam refund complaint. Reference the bank's duty of care and, for APP scams after October 2024, the mandatory reimbursement rules. Focus on what the bank should have done to prevent or detect the fraud.`
      break
    case 'unaffordable':
      context += `This is an unaffordable lending complaint. Focus on CONC 5.2.1R creditworthiness assessment requirements and evidence that the lender should have known the credit was unaffordable.`
      break
    case 'section75':
      context += `This is a Section 75 Consumer Credit Act claim. The credit card company has equal liability with the retailer for purchases between £100 and £30,000. Focus on the breach of contract or misrepresentation by the retailer.`
      break
    default:
      context += `This is a general financial services complaint. Reference appropriate FCA rules and Treating Customers Fairly principles.`
  }

  return context
}

export async function POST(request: NextRequest) {
  try {
    const data: ComplaintData = await request.json()

    if (!data.answers || Object.keys(data.answers).length === 0) {
      return NextResponse.json(
        { error: 'No complaint data provided' },
        { status: 400 }
      )
    }

    const complaintContext = buildComplaintContext(data)

    // Determine the company name for the letter
    const companyName =
      data.answers.lender ||
      data.answers.provider ||
      data.answers.bank ||
      data.answers.card_provider ||
      data.answers.company ||
      '[COMPANY NAME]'

    const userPrompt = `Generate a formal complaint letter based on the following information. The letter should be ready to send to the company.

${complaintContext}

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

Do not include any commentary or explanation - just output the letter text.`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    })

    // Extract the text content
    const letterContent = message.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as { type: 'text'; text: string }).text)
      .join('\n')

    return NextResponse.json({ letter: letterContent })
  } catch (error) {
    console.error('Letter generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate letter' },
      { status: 500 }
    )
  }
}
