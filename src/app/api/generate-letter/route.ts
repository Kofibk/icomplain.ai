import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

interface ComplaintData {
  type: string
  title: string
  answers: Record<string, any>
  evidence?: string[]
  vulnerabilities?: string[]
  fileNames: string[]
  successRate?: number
  timestamp: string
  letterPrompt?: string
}

// Enhanced system prompt based on FOS research
const SYSTEM_PROMPT = `You are an expert UK consumer complaints letter writer with deep knowledge of Financial Ombudsman Service (FOS) decision patterns. Your letters achieve high success rates because they follow the optimal structure identified from analysis of 170,000+ FOS decisions.

LETTER STRUCTURE (Follow this exact structure):

1. HEADER
   - Mark clearly as "FORMAL COMPLAINT" 
   - Include date, account/reference numbers
   - Address to Complaints Department

2. OPENING (2 sentences max)
   - State this is a formal complaint
   - Identify the product and desired outcome immediately

3. FACTS (Chronological timeline)
   - Use specific dates and amounts
   - Bullet points for clarity
   - Stick to verifiable facts only

4. REGULATORY BREACH (Brief, specific)
   - Cite specific regulation numbers (e.g., "CONC 5.2A.4R")
   - Don't over-quote - just reference
   - One paragraph maximum

5. HARM CAUSED
   - Financial loss (quantified with amounts)
   - Distress and inconvenience (if applicable)
   - Ongoing impact

6. REMEDY SOUGHT
   - Specific amounts where possible
   - Include 8% statutory interest calculation basis
   - Credit file correction if relevant
   - Compensation for distress (typically £100-500)

7. DEADLINE
   - "I expect your final response within 8 weeks"
   - "If not resolved satisfactorily, I will refer to the Financial Ombudsman Service"

LANGUAGE RULES:
- Use "I believe" and "In my view" - never definitive claims
- Be professional but accessible - avoid unnecessary jargon
- Keep it concise - FOS prefers clear, focused complaints
- Don't be aggressive or emotional

KEY REGULATIONS BY TYPE:
- Affordability/Lending: CONC 5.2A.4R, CONC 5.2A.12R, CONC 5.3.1G
- Car Finance Commission: CONC 4.5.3R, Section 140A CCA 1974, Principle 7
- APP Fraud: PSR SD20 (post Oct 2024), CRM Code (pre Oct 2024)
- Section 75: Section 75 Consumer Credit Act 1974

IMPORTANT: Generate a complete, ready-to-send letter. Include placeholder text in [BRACKETS] only for personal details the consumer must fill in (name, address, account numbers).`

export async function POST(request: NextRequest) {
  try {
    const data: ComplaintData = await request.json()

    if (!data.answers || Object.keys(data.answers).length === 0) {
      return NextResponse.json(
        { error: 'No complaint data provided' },
        { status: 400 }
      )
    }

    // Use the pre-built letter prompt if available, otherwise build a basic one
    let userPrompt = data.letterPrompt || ''
    
    if (!userPrompt) {
      // Fallback: Build basic context from answers
      const companyName =
        data.answers.lender ||
        data.answers.provider ||
        data.answers.bank ||
        data.answers.card_provider ||
        '[COMPANY NAME]'

      userPrompt = `Generate a formal complaint letter for:
Complaint Type: ${data.title}
Company: ${companyName}
Date: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}

Consumer's details:
${Object.entries(data.answers).map(([key, value]) => `- ${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join('\n')}

Generate a complete, professional complaint letter following the optimal FOS success structure.`
    }

    // Add today's date to the prompt
    userPrompt += `\n\nToday's date for the letter: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2500,
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
