import { createClient, SupabaseClient } from '@supabase/supabase-js'

// For client-side usage
export const supabase: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
)

// For server-side usage (with elevated permissions)
export const supabaseAdmin: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

// Database types (for TypeScript)
export interface FOSDecision {
  id: number
  reference: string
  date: string
  category: string
  product_type: string
  outcome: string
  outcome_score: number
  summary: string
  key_arguments: string[]
  evidence_cited: string[]
  legal_references: string[]
  chunk_text: string
  chunk_id: string
  url: string
  created_at: string
}

export interface GeneratedComplaint {
  id: number
  session_id: string
  complaint_type: string
  answers: Record<string, any>
  generated_letter: string
  evidence_checklist: string[]
  created_at: string
  email: string
  payment_status: string
}

export interface Payment {
  id: number
  stripe_session_id: string
  stripe_payment_intent: string
  complaint_id: number
  amount: number
  currency: string
  status: string
  created_at: string
  completed_at: string | null
}
