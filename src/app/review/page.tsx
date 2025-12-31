'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Edit2, Loader2, Download, Mail, Check, AlertCircle, TrendingUp, Shield } from 'lucide-react'
import { COMPLAINT_CONFIGS, SUCCESS_FACTORS, buildLetterPrompt } from '@/lib/complaint-engine'

interface ComplaintData {
  type: string
  title: string
  answers: Record<string, any>
  evidence: string[]
  vulnerabilities: string[]
  fileNames: string[]
  successRate: number
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

  const config = complaintData ? COMPLAINT_CONFIGS[complaintData.type as keyof typeof COMPLAINT_CONFIGS] : null

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
    
    return String(value)
  }

  const getQuestionLabel = (questionId: string): string => {
    if (!config) return questionId
    const question = config.questions.find(q => q.id === questionId)
    return question?.question.replace('?', '') || questionId.replace(/_/g, ' ')
  }

  const getSuccessColor = (rate: number) => rate >= 70 ? 'text-emerald-400' : rate >= 50 ? 'text-amber-400' : 'text-rose-400'
  const getBarColor = (rate: number) => rate >= 70 ? 'bg-emerald-500' : rate >= 50 ? 'bg-amber-500' : 'bg-rose-500'

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
                    <h1 className="text-xl font-semibold">{complaintData.title}</h1>
                    <p className="text-sm text-white/40 mt-1">Review your details</p>
                  </div>

                  <div className="p-6 space-y-4">
                    {Object.entries(complaintData.answers).map(([key, value]) => {
                      if (!value || (Array.isArray(value) && value.length === 0)) return null
                      return (
                        <div key={key} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2 border-b border-white/5 last:border-0">
                          <dt className="text-sm text-white/40 sm:w-1/3">{getQuestionLabel(key)}</dt>
                          <dd className="text-white/80 sm:w-2/3">{formatAnswer(key, value)}</dd>
                        </div>
                      )
                    })}
                  </div>

                  {complaintData.evidence?.length > 0 && (
                    <div className="px-6 pb-6">
                      <h3 className="text-sm text-white/40 mb-3">Evidence</h3>
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
                      <h3 className="text-sm text-white/40 mb-3">Circumstances</h3>
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
                    <Edit2 className="w-4 h-4" />Edit answers
                  </button>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-4">
                {/* Success rate */}
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className={`w-4 h-4 ${getSuccessColor(complaintData.successRate || 50)}`} />
                    <span className="text-sm text-white/60">Success estimate</span>
                  </div>
                  <div className={`text-4xl font-semibold ${getSuccessColor(complaintData.successRate || 50)} mb-3`}>
                    {complaintData.successRate || 50}%
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${getBarColor(complaintData.successRate || 50)} transition-all`} style={{ width: `${complaintData.successRate || 50}%` }} />
                  </div>
                </div>

                {/* Payment */}
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Your letter</h3>
                    <span className="text-2xl font-semibold">£29</span>
                  </div>
                  
                  <ul className="space-y-3 mb-6">
                    {['Professional complaint letter', 'Cites correct regulations', 'Tailored to your case', 'FOS escalation included'].map((item, i) => (
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
                    {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" />Generating...</> : <>Generate Letter<ArrowRight className="w-5 h-5" /></>}
                  </button>
                </div>

                <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-5">
                  <p className="text-sm font-medium mb-1">Keep 100%</p>
                  <p className="text-xs text-white/50">Claims companies take 30%+. You keep every penny.</p>
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
                      <p className="text-white/60 text-sm">Download and send it</p>
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
                    <Download className="w-5 h-5" />Download Letter
                  </button>

                  <button
                    onClick={() => {
                      const provider = complaintData.answers.lender || complaintData.answers.provider || complaintData.answers.bank || 'Company'
                      window.location.href = `mailto:?subject=${encodeURIComponent(`Formal Complaint - ${provider}`)}&body=${encodeURIComponent(generatedLetter)}`
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-white/10 text-white py-4 rounded-full font-medium hover:bg-white/20 border border-white/10"
                  >
                    <Mail className="w-5 h-5" />Open in Email
                  </button>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                <h3 className="font-semibold mb-4">What happens next?</h3>
                <ol className="space-y-4">
                  {[
                    { icon: '📤', title: 'Send your letter', desc: 'Email or post to their complaints department' },
                    { icon: '⏳', title: 'Wait 8 weeks', desc: 'They must send a Final Response' },
                    { icon: '⚖️', title: 'Escalate if needed', desc: 'Refer to Financial Ombudsman for free' },
                  ].map((item, i) => (
                    <li key={i} className="flex gap-4">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-white/50">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="py-8 px-6 border-t border-white/10">
        <p className="text-xs text-white/30 text-center max-w-xl mx-auto">
          iComplain is a document preparation service. Not a law firm or claims management company.
        </p>
      </footer>
    </div>
  )
}
