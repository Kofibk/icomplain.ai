import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = process.env.ANTHROPIC_API_KEY 
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null

// Extraction prompts for different document types
const EXTRACTION_PROMPTS: Record<string, string> = {
  finance_agreement: `Analyze this finance agreement document and extract the following information in JSON format:

{
  "document_type": "pcp_agreement" | "hp_agreement" | "loan_agreement" | "credit_card_agreement" | "other",
  "lender_name": "string or null",
  "broker_dealer_name": "string or null", 
  "customer_name": "string or null",
  "agreement_date": "string (DD/MM/YYYY) or null",
  "finance_amount": "number or null",
  "total_amount_payable": "number or null",
  "apr_interest_rate": "number (percentage) or null",
  "monthly_payment": "number or null",
  "term_months": "number or null",
  "balloon_payment": "number or null",
  "vehicle_details": {
    "make": "string or null",
    "model": "string or null",
    "year": "number or null",
    "registration": "string or null"
  },
  "commission_disclosed": "yes" | "no" | "unclear",
  "commission_amount": "number or null",
  "key_terms_noted": ["array of important terms or conditions found"],
  "potential_issues": ["array of potential complaint grounds identified"],
  "confidence_score": "number 0-100"
}

Only extract what you can clearly see in the document. Use null for anything not visible or unclear.
Look specifically for any mention of commission, broker fees, or dealer arrangements.
Identify any terms that seem unusual or potentially unfair.`,

  bank_statement: `Analyze this bank statement and extract the following information in JSON format:

{
  "document_type": "bank_statement",
  "bank_name": "string or null",
  "account_holder": "string or null",
  "statement_period": {
    "from": "string (DD/MM/YYYY) or null",
    "to": "string (DD/MM/YYYY) or null"
  },
  "finance_payments_found": [
    {
      "payee": "string",
      "amount": "number",
      "date": "string",
      "frequency": "monthly" | "one-off" | "unclear"
    }
  ],
  "income_detected": {
    "salary": "number or null",
    "other_income": "number or null"
  },
  "financial_stress_indicators": [
    "array of indicators like: overdraft usage, failed payments, gambling transactions, payday loans, etc."
  ],
  "other_credit_commitments": ["array of other lenders/credit payments found"],
  "confidence_score": "number 0-100"
}

Look for signs of financial difficulty: bounced payments, overdraft fees, multiple credit payments, payday lenders.`,

  correspondence: `Analyze this letter/email and extract the following information in JSON format:

{
  "document_type": "lender_letter" | "complaint_response" | "fos_letter" | "other_correspondence",
  "from": "string or null",
  "to": "string or null", 
  "date": "string (DD/MM/YYYY) or null",
  "reference_numbers": ["array of any reference numbers found"],
  "subject_summary": "brief summary of what this is about",
  "key_points": ["array of main points made in the document"],
  "any_admissions": ["array of any admissions or acknowledgments by lender"],
  "any_rejections": ["array of any rejections or denials"],
  "deadlines_mentioned": ["array of any deadlines or timeframes mentioned"],
  "next_steps_suggested": ["array of any suggested next steps"],
  "confidence_score": "number 0-100"
}`,

  general: `Analyze this document related to a financial complaint and extract any relevant information in JSON format:

{
  "document_type": "string describing what this document appears to be",
  "relevant_parties": {
    "customer": "string or null",
    "lender_or_company": "string or null",
    "other_parties": ["array"]
  },
  "dates_found": ["array of significant dates found"],
  "amounts_found": ["array of monetary amounts found with context"],
  "key_information": ["array of key facts extracted"],
  "potential_complaint_relevance": "high" | "medium" | "low",
  "summary": "brief 2-3 sentence summary of the document",
  "confidence_score": "number 0-100"
}

Extract anything that might be relevant to a financial complaint.`
}

// Detect document type from content
function detectDocumentType(filename: string, textHint?: string): string {
  const lower = filename.toLowerCase()
  
  if (lower.includes('agreement') || lower.includes('contract') || lower.includes('finance')) {
    return 'finance_agreement'
  }
  if (lower.includes('statement') || lower.includes('bank')) {
    return 'bank_statement'
  }
  if (lower.includes('letter') || lower.includes('email') || lower.includes('response')) {
    return 'correspondence'
  }
  
  return 'general'
}

export async function POST(request: NextRequest) {
  if (!anthropic) {
    return NextResponse.json(
      { error: 'AI service not configured' },
      { status: 500 }
    )
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const documentType = formData.get('documentType') as string | null
    const textContent = formData.get('textContent') as string | null

    // Handle text-only analysis
    if (textContent && !file) {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: `Analyze this text from a user describing their financial complaint situation. Extract key details and identify the type of complaint:

"${textContent}"

Respond in JSON format:
{
  "complaint_type": "pcp" | "section75" | "unaffordable_lending" | "holiday_park" | "other",
  "complaint_type_confidence": "number 0-100",
  "extracted_details": {
    "lender_name": "string or null",
    "product_type": "string or null",
    "approximate_date": "string or null",
    "approximate_amount": "number or null",
    "what_went_wrong": "string summary"
  },
  "key_issues_identified": ["array of potential complaint grounds"],
  "missing_information": ["array of important details we still need"],
  "suggested_questions": ["array of follow-up questions to ask"],
  "summary": "2-3 sentence summary of the complaint"
}`
          }
        ]
      })

      const content = response.content[0]
      if (content.type === 'text') {
        // Parse JSON from response
        const jsonMatch = content.text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          return NextResponse.json({
            success: true,
            analysis: JSON.parse(jsonMatch[0]),
            source: 'text'
          })
        }
      }

      return NextResponse.json({
        success: false,
        error: 'Failed to parse analysis'
      }, { status: 500 })
    }

    // Handle file analysis
    if (!file) {
      return NextResponse.json(
        { error: 'No file or text content provided' },
        { status: 400 }
      )
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not supported. Please upload an image or PDF.' },
        { status: 400 }
      )
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')

    // Detect document type
    const docType = documentType || detectDocumentType(file.name)
    const extractionPrompt = EXTRACTION_PROMPTS[docType] || EXTRACTION_PROMPTS.general

    // Determine media type for Claude
    let mediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' = 'image/jpeg'
    if (file.type === 'image/png') mediaType = 'image/png'
    else if (file.type === 'image/webp') mediaType = 'image/webp'
    else if (file.type === 'image/gif') mediaType = 'image/gif'
    else if (file.type === 'application/pdf') {
      // For PDFs, we'll need to handle differently
      // Claude can process PDFs directly in some contexts
      // For now, return an error asking for image
      return NextResponse.json(
        { error: 'Please upload images of your documents (take photos or screenshots). PDF support coming soon.' },
        { status: 400 }
      )
    }

    // Call Claude Vision API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64,
              },
            },
            {
              type: 'text',
              text: extractionPrompt,
            },
          ],
        },
      ],
    })

    // Extract JSON from response
    const content = response.content[0]
    if (content.type === 'text') {
      // Try to parse JSON from the response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const extracted = JSON.parse(jsonMatch[0])
        
        return NextResponse.json({
          success: true,
          analysis: extracted,
          source: 'document',
          documentType: docType,
          filename: file.name
        })
      }
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to extract information from document'
    }, { status: 500 })

  } catch (error) {
    console.error('Document analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze document' },
      { status: 500 }
    )
  }
}
