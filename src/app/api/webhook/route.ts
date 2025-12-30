import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/db/supabase'

// Only initialize Stripe if we have the key
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(request: NextRequest) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
  }
  
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')
  
  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }
  
  let event: Stripe.Event
  
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }
  
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      
      // Update payment status in database
      await supabaseAdmin
        .from('payments')
        .insert({
          stripe_session_id: session.id,
          stripe_payment_intent: session.payment_intent as string,
          amount: session.amount_total,
          currency: session.currency,
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
      
      // Update complaint payment status
      const metadata = session.metadata
      if (metadata?.answersJson) {
        await supabaseAdmin
          .from('generated_complaints')
          .update({ payment_status: 'completed' })
          .eq('session_id', session.id)
      }
      
      break
    }
    
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log('Payment failed:', paymentIntent.id)
      break
    }
  }
  
  return NextResponse.json({ received: true })
}
