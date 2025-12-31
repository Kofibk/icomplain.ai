import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Only initialize Stripe if we have the key
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null

// Flat £29 pricing
const PRICE_AMOUNT = 2900 // £29 in pence

const COMPLAINT_TYPE_NAMES: Record<string, string> = {
  pcp: 'Car Finance (PCP)',
  section75: 'Credit Card (Section 75)',
  unaffordable: 'Unaffordable Lending',
  'holiday-park': 'Holiday Park',
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
    
    const typeName = COMPLAINT_TYPE_NAMES[complaintType] || 'Financial Complaint'
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `iComplain - ${typeName} Letter`,
              description: 'AI-generated professional complaint letter',
            },
            unit_amount: PRICE_AMOUNT,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/download?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/smart-upload?type=${complaintType}`,
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
