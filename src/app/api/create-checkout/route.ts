import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Only initialize Stripe if we have the key
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null

// Pricing tiers based on claim value
const PRICING_TIERS = [
  { maxValue: 1000, price: 2900, name: 'Standard' },      // £29
  { maxValue: 3000, price: 4900, name: 'Plus' },          // £49
  { maxValue: 10000, price: 7900, name: 'Premium' },      // £79
  { maxValue: Infinity, price: 12900, name: 'Complex' },  // £129
]

function calculatePrice(complaintType: string, answers: Record<string, any>): { price: number; tierName: string } {
  // Get claim value based on complaint type
  let claimValue = 0
  
  switch (complaintType) {
    case 'pcp':
      claimValue = parseFloat(answers.finance_amount) || 0
      // PCP claims typically result in 3-5% of finance amount
      claimValue = claimValue * 0.05
      break
    case 'section75':
      claimValue = parseFloat(answers.amount_claiming) || parseFloat(answers.total_cost) || 0
      break
    case 'unaffordable':
      claimValue = parseFloat(answers.credit_limit_or_amount) || 0
      break
    case 'holiday-park':
      claimValue = parseFloat(answers.financial_loss) || parseFloat(answers.purchase_price) || 0
      break
    default:
      claimValue = 1000
  }
  
  // Find appropriate tier
  for (const tier of PRICING_TIERS) {
    if (claimValue <= tier.maxValue) {
      return { price: tier.price, tierName: tier.name }
    }
  }
  
  return { price: PRICING_TIERS[PRICING_TIERS.length - 1].price, tierName: 'Complex' }
}

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Payment system not configured' },
      { status: 500 }
    )
  }
  
  try {
    const body = await request.json()
    const { complaintType, answers } = body
    
    if (!complaintType || !answers) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Calculate price based on claim value
    const { price, tierName } = calculatePrice(complaintType, answers)
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `Complaint Letter - ${tierName}`,
              description: `Professional ${complaintType.toUpperCase()} complaint letter generation`,
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/questionnaire?type=${complaintType}`,
      metadata: {
        complaintType,
        answersJson: JSON.stringify(answers),
      },
      customer_email: answers.email,
    })
    
    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    })
    
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
