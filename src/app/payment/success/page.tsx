'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function PaymentSuccessPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to download page after brief delay
    // The session_id will be in the URL from Stripe redirect
    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get('session_id')
    
    if (sessionId) {
      router.push(`/download?session_id=${sessionId}`)
    } else {
      router.push('/')
    }
  }, [router])
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-brand-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Payment Successful!
        </h2>
        <p className="text-gray-600">
          Redirecting to your complaint letter...
        </p>
      </div>
    </div>
  )
}
