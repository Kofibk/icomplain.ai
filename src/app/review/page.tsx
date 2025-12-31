'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Edit2, Loader2, Download, Mail, Check, AlertCircle, Shield } from 'lucide-react'
import { COMPLAINT_CONFIGS, SUCCESS_FACTORS, buildLetterPrompt } from '@/lib/complaint-engine'

// Freeform config for review
const FREEFORM_CONFIG = {
  title: 'General Complaint',
  questions: [
    { id: 'firm_name', question: 'Company' },
    { id: 'what_happened', question: 'What happened' },
    { id: 'what_wrong', question: 'What went wrong' },
    { id: 'resolution', question: 'Desired outcome' },
    { id: 'amount_involved', question: 'Amount involved' },
    { id: 'complained_before', question: 'Previous complaint' },
  ],
  regulations: {
    primary: 'FCA Principle 6',
    secondary: ['DISP 1.4'],
  },
  letterTemplate: {
    breach: 'failure to treat me fairly',
    regulation: 'FCA Principles',
    harm: 'as described',
    remedy: 'as outlined',
  },
}

interface ComplaintData {
  type: string
  title: string
  answers: Record<string, any>
  evidence: string[]
  vulnerabilities: string[]
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
    if (stored) setComplaintData(JSON.parse(stored))
    else router.push('/')
  }, [router])

  const generateLetter = async () => {
    if (!complaintData) return
    setIsGenerating(true)
    setError(null)
    
    try {
      const response = await fetch('/api/generate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...complaintData,
          letterPrompt: buildLetterPrompt(complaintData.type, complaintData.answers, complaintData.evidence || [], complaintData.vulnerabilities || []),
        }),
      })
      
      if (!response.ok) throw new Error('Failed to generate letter')
      const data = await response.json()
      setGeneratedLetter(data.letter)
      sessionStorage.setItem('generatedLetter', data.letter)
    } catch (err) {
      setError('Failed to generate letter. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const config = complaintData 
    ? (complaintData.type === 'freeform' 
        ? FREEFORM_CONFIG 
        : COMPLAINT_CONFIGS[complaintData.type as keyof typeof COMPLAINT_CONFIGS])
    : null

  const formatAnswer = (questionId: string, value: any): string => {
    if (!config) return String(value)
    const question = config.questions.find(q => q.id === questionId)
    if (!question) return String(value)
    
    if (Array.isArray(value)) {
      return value.map(v => {
        const opt = (question as any).options?.find((o: any) => o.value === v)
        return opt?.label || v
      }).join(', ')
    }
    
    if ((question as any).options) {
      const opt = (question as any).options.find((o: any) => o.value === value)
      return opt?.label || value
    }
    
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    }
    
    // Truncate long text for display
    if (typeof value === 'string' && value.length > 200) {
      return value.substring(0, 200) + '...'
    }
    
    return String(value)
  }

  const getQuestionLabel = (questionId: string): string => {
    if (!config) return questionId
    const question = config.questions.find(q => q.id === questionId)
    return question?.question.replace('?', '') || questionId.replace(/_/g, ' ')
  }

  if (!complaintData) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white/40" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-white/60 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <Link href="/" className="text-lg font-semibold">iComplain</Link>
          <div className="w-16" />
        </div>
      </header>

      <main className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          {!generatedLetter ? (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Summary */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
                  <div className="p-6 border-b border-white/10">
                    <h1 className="text-xl font-semibold">Review your complaint</h1>
                    <p className="text-sm text-white/40 mt-1">Check the details before generating your letter</p>
                  </div>

                  <div className="p-6 space-y-4">
                    {Object.entries(complaintData.answers).map(([key, value]) => {
                      if (!value || (Array.isArray(value) && value.length === 0)) return null
                      return (
                        <div key={key} className="py-3 border-b border-white/5 last:border-0">
                          <dt className="text-sm text-white/40 mb-1">{getQuestionLabel(key)}</dt>
                          <dd className="text-white/80">{formatAnswer(key, value)}</dd>
                        </div>
                      )
                    })}
                  </div>

                  {complaintData.evidence?.length > 0 && (
                    <div className="px-6 pb-6">
                      <h3 className="text-sm text-white/40 mb-3">Supporting documents</h3>
                      <div className="flex flex-wrap gap-2">
                        {complaintData.evidence.map(id => {
                          const evidence = (SUCCESS_FACTORS.evidence as any)[id]
                          return (
                            <span key={id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-sm">
                              <Check className="w-3 h-3" />{evidence?.label || id}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {complaintData.vulnerabilities?.length > 0 && (
                    <div className="px-6 pb-6">
                      <h3 className="text-sm text-white/40 mb-3">Circumstances noted</h3>
                      <div className="flex flex-wrap gap-2">
                        {complaintData.vulnerabilities.map(id => {
                          const vuln = (SUCCESS_FACTORS.vulnerability as any)[id]
                          return (
                            <span key={id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/10 text-violet-400 rounded-full text-sm">
                              <Shield className="w-3 h-3" />{vuln?.label || id}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-white/40 hover:text-white">
                    <Edit2 className="w-4 h-4" />Edit details
                  </button>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-4">
                {/* Payment card */}
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Complaint letter</h3>
                    <span className="text-2xl font-semibold">£29</span>
                  </div>
                  
                  <ul className="space-y-3 mb-6">
                    {[
                      'Personalised complaint letter',
                      'Based on your answers',
                      'Download and send yourself',
                      'Guidance on next steps',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />{item}
                      </li>
                    ))}
                  </ul>

                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-rose-500/10 text-rose-400 rounded-xl mb-4 text-sm">
                      <AlertCircle className="w-4 h-4" />{error}
                    </div>
                  )}

                  <button
                    onClick={generateLetter}
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center gap-2 bg-white text-black py-4 rounded-full font-medium hover:bg-white/90 disabled:bg-white/20 disabled:text-white/40 transition-all"
                  >
                    {isGenerating ? (
                      <><Loader2 className="w-5 h-5 animate-spin" />Generating...</>
                    ) : (
                      <>Generate letter<ArrowRight className="w-5 h-5" /></>
                    )}
                  </button>
                </div>

                <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
                  <p className="text-xs text-white/40">
                    You will receive a document to download. You are responsible for sending the complaint 
                    and managing any correspondence with the firm.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Letter generated */
            <div className="max-w-3xl mx-auto">
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden mb-6">
                <div className="p-6 border-b border-white/10 bg-emerald-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Check className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h1 className="text-xl font-semibold">Your letter is ready</h1>
                      <p className="text-white/60 text-sm">Download and send it to the firm</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="bg-black/30 rounded-xl p-6 font-mono text-sm text-white/80 whitespace-pre-wrap max-h-[500px] overflow-y-auto border border-white/10">
                    {generatedLetter}
                  </div>
                </div>

                <div className="p-6 border-t border-white/10 space-y-3">
                  <button
                    onClick={() => {
                      const blob = new Blob([generatedLetter], { type: 'text/plain' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `complaint-${complaintData.type}-${Date.now()}.txt`
                      a.click()
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-white text-black py-4 rounded-full font-medium hover:bg-white/90"
                  >
                    <Download className="w-5 h-5" />Download letter
                  </button>

                  <button
                    onClick={() => {
                      const provider = complaintData.answers.lender || complaintData.answers.provider || complaintData.answers.bank || complaintData.answers.firm_name || 'Company'
                      window.location.href = `mailto:?subject=${encodeURIComponent(`Formal Complaint - ${provider}`)}&body=${encodeURIComponent(generatedLetter)}`
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-white/10 text-white py-4 rounded-full font-medium hover:bg-white/20 border border-white/10"
                  >
                    <Mail className="w-5 h-5" />Open in email
                  </button>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                <h3 className="font-semibold mb-4">Next steps</h3>
                <ol className="space-y-4 text-sm">
                  <li className="flex gap-4">
                    <span className="text-white/40">1.</span>
                    <div>
                      <p className="text-white/80">Send your letter to the firm's complaints department</p>
                      <p className="text-white/40 text-xs mt-1">By email or post</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-white/40">2.</span>
                    <div>
                      <p className="text-white/80">The firm has 8 weeks to provide a Final Response</p>
                      <p className="text-white/40 text-xs mt-1">They should acknowledge receipt within a few days</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-white/40">3.</span>
                    <div>
                      <p className="text-white/80">If unhappy with the outcome, you may refer to the Financial Ombudsman Service</p>
                      <p className="text-white/40 text-xs mt-1">financial-ombudsman.org.uk</p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="py-8 px-6 border-t border-white/10">
        <p className="text-xs text-white/30 text-center max-w-xl mx-auto">
          iComplain is a document preparation service. We do not provide legal or financial advice, 
          submit complaints on your behalf, or guarantee any outcome.
        </p>
      </footer>
    </div>
  )
}
