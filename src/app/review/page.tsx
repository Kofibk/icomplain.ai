'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Edit2, Loader2, FileText, Download, Mail, Check, AlertCircle } from 'lucide-react'

interface ComplaintData {
  type: string
  title: string
  answers: Record<string, any>
  fileNames: string[]
  timestamp: string
}

export default function ReviewPage() {
  const router = useRouter()
  const [complaintData, setComplaintData] = useState<ComplaintData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('complaintData')
    if (stored) {
      setComplaintData(JSON.parse(stored))
    } else {
      router.push('/')
    }
  }, [router])

  const generateLetter = async () => {
    if (!complaintData) return
    
    setIsGenerating(true)
    setError(null)
    
    try {
      const response = await fetch('/api/generate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(complaintData),
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate letter')
      }
      
      const data = await response.json()
      setGeneratedLetter(data.letter)
      
      // Store letter in session for download page
      sessionStorage.setItem('generatedLetter', data.letter)
      
    } catch (err) {
      setError('Failed to generate letter. Please try again.')
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  const formatAnswerDisplay = (key: string, value: any): string => {
    if (Array.isArray(value)) {
      return value.join(', ')
    }
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return new Date(value).toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })
    }
    return String(value)
  }

  const formatLabel = (key: string): string => {
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
  }

  if (!complaintData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <Link href="/" className="text-xl font-bold text-gray-900">
            i<span className="text-green-600">Complain</span>
          </Link>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {!generatedLetter ? (
          <>
            {/* Review section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
              <div className="p-6 border-b border-gray-100">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Review your complaint</h1>
                <p className="text-gray-600">Check your details before we generate your letter</p>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">
                    {complaintData.type === 'pcp' ? '🚗' : 
                     complaintData.type === 'credit-card-affordability' ? '💳' :
                     complaintData.type === 'bank-fraud' ? '🚨' :
                     complaintData.type === 'unaffordable' ? '💷' :
                     complaintData.type === 'section75' ? '🛡️' : '📝'}
                  </span>
                  <div>
                    <h2 className="font-semibold text-gray-900">{complaintData.title}</h2>
                    <p className="text-sm text-gray-500">
                      Submitted {new Date(complaintData.timestamp).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {Object.entries(complaintData.answers).map(([key, value]) => {
                    if (!value || (Array.isArray(value) && value.length === 0)) return null
                    return (
                      <div key={key} className="flex flex-col sm:flex-row sm:items-start gap-2 py-3 border-b border-gray-100 last:border-0">
                        <dt className="text-sm font-medium text-gray-500 sm:w-1/3">
                          {formatLabel(key)}
                        </dt>
                        <dd className="text-gray-900 sm:w-2/3">
                          {formatAnswerDisplay(key, value)}
                        </dd>
                      </div>
                    )
                  })}
                </div>

                {complaintData.fileNames.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Uploaded documents</h3>
                    <div className="flex flex-wrap gap-2">
                      {complaintData.fileNames.map((name, i) => (
                        <span key={i} className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700">
                          <FileText className="w-4 h-4" />
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Your complaint letter</h3>
                <span className="text-2xl font-bold text-gray-900">£29</span>
              </div>
              <ul className="space-y-2 mb-6">
                {[
                  'Professional complaint letter tailored to your case',
                  'Uses arguments proven to succeed',
                  'Includes all relevant regulations and references',
                  'Ready to send to the company',
                  'FOS escalation letter if needed (included)',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-600">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-xl mb-4">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}

              <button
                onClick={generateLetter}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-4 rounded-xl font-medium transition-colors"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating your letter...
                  </>
                ) : (
                  <>
                    Generate Letter - £29
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                Secure payment powered by Stripe. No success fee, no hidden charges.
              </p>
            </div>

            {/* Edit link */}
            <div className="text-center">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <Edit2 className="w-4 h-4" />
                Edit my answers
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Letter generated */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
              <div className="p-6 border-b border-gray-100 bg-green-50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Your letter is ready!</h1>
                    <p className="text-gray-600">Download it and send it to the company</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="bg-gray-50 rounded-xl p-6 font-mono text-sm whitespace-pre-wrap max-h-[500px] overflow-y-auto border border-gray-200">
                  {generatedLetter}
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 space-y-3">
                <button
                  onClick={() => {
                    const blob = new Blob([generatedLetter], { type: 'text/plain' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `complaint-letter-${complaintData.type}-${Date.now()}.txt`
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-medium transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Download Letter
                </button>

                <button
                  onClick={() => {
                    const subject = encodeURIComponent(`Formal Complaint - ${complaintData.answers.lender || complaintData.answers.provider || complaintData.answers.bank || 'Financial Services'}`)
                    const body = encodeURIComponent(generatedLetter)
                    window.location.href = `mailto:?subject=${subject}&body=${body}`
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-900 py-4 rounded-xl font-medium border border-gray-300 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  Open in Email
                </button>
              </div>
            </div>

            {/* What's next */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">What happens next?</h3>
              <ol className="space-y-4">
                {[
                  { step: '1', title: 'Send your letter', desc: 'Email or post the letter to the company. Keep a copy for your records.' },
                  { step: '2', title: 'Wait for response', desc: 'The company has 8 weeks to respond to your complaint.' },
                  { step: '3', title: 'Not satisfied?', desc: 'If they reject your complaint or you\'re unhappy with their offer, you can escalate to the Financial Ombudsman Service (FOS).' },
                ].map((item) => (
                  <li key={item.step} className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-semibold text-sm">
                      {item.step}
                    </span>
                    <div>
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </>
        )}
      </main>

      {/* Footer disclaimer */}
      <footer className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-xs text-gray-400 text-center">
          iComplain is a document preparation service. We are not a law firm, claims management company, or financial adviser. 
          We do not provide legal or financial advice. Use of this service does not guarantee any particular outcome.
        </p>
      </footer>
    </div>
  )
}
