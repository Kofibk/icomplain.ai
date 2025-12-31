'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Download, FileText, CheckCircle, Loader2, AlertCircle, Copy, Check, ArrowRight, Mail } from 'lucide-react'
import Link from 'next/link'

interface ComplaintData {
  letter: string
  evidenceChecklist: string[]
}

function DownloadContent() {
  const searchParams = useSearchParams()
  const isTest = searchParams.get('test') === 'true'
  const sessionId = searchParams.get('session_id')
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [complaintData, setComplaintData] = useState<ComplaintData | null>(null)
  const [copied, setCopied] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [userEmail, setUserEmail] = useState<string>('')
  
  useEffect(() => {
    const generateComplaint = async () => {
      // Get stored data
      const storedAnswers = sessionStorage.getItem('complaintAnswers')
      const storedType = sessionStorage.getItem('complaintType')
      
      if (!storedAnswers || !storedType) {
        setError('No complaint data found. Please start again.')
        setLoading(false)
        return
      }
      
      const answers = JSON.parse(storedAnswers)
      const complaintType = storedType
      
      // Store email for later
      if (answers.email) {
        setUserEmail(answers.email)
      }
      
      try {
        const response = await fetch('/api/generate-complaint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            complaintType,
            answers,
            sessionId: sessionId || 'test-session',
          }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to generate complaint')
        }
        
        const data = await response.json()
        setComplaintData(data)
        
        // Auto-send email if we have the address
        if (answers.email) {
          // In production, this would call an email API
          setEmailSent(true)
        }
      } catch (err) {
        console.error('Generation error:', err)
        setError('Failed to generate your complaint letter. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    
    generateComplaint()
  }, [sessionId])

  const handleCopy = async () => {
    if (complaintData?.letter) {
      await navigator.clipboard.writeText(complaintData.letter)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownload = () => {
    if (!complaintData?.letter) return
    
    // Create blob and download
    const blob = new Blob([complaintData.letter], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'complaint-letter.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-8 h-8 text-gray-900 animate-spin" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">
            Writing your complaint letter
          </h1>
          <p className="text-gray-500">
            Our AI is crafting a professional complaint letter based on your situation...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">
            Something went wrong
          </h1>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link 
            href="/smart-upload"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors"
          >
            Start again
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold text-gray-900">
            iComplain
          </Link>
          {isTest && (
            <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-medium">
              Test Mode
            </span>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Success Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 mb-1">
                Your complaint letter is ready
              </h1>
              <p className="text-gray-600">
                {emailSent && userEmail 
                  ? `We've also sent a copy to ${userEmail}`
                  : 'Copy or download your letter below'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Email confirmation */}
        {emailSent && userEmail && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex items-center gap-3">
            <Mail className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-blue-800">
              A copy has been sent to <strong>{userEmail}</strong>
            </p>
          </div>
        )}

        {/* Letter */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-900">Your Complaint Letter</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <pre className="whitespace-pre-wrap font-sans text-gray-800 text-sm leading-relaxed">
              {complaintData?.letter}
            </pre>
          </div>
        </div>

        {/* Evidence Checklist */}
        {complaintData?.evidenceChecklist && complaintData.evidenceChecklist.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Evidence to include
            </h2>
            <p className="text-gray-500 text-sm mb-4">
              Attach these documents to strengthen your complaint:
            </p>
            <ul className="space-y-3">
              {complaintData.evidenceChecklist.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 border-2 border-gray-300 rounded flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            What happens next
          </h2>
          <ol className="space-y-4">
            {[
              'Send your letter to the lender (email is fine)',
              'Keep a copy for your records',
              'The lender has 8 weeks to respond',
              'If they reject or ignore you, escalate to the Financial Ombudsman for free',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-gray-700">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Share */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-4">
            Know someone who could claim too?
          </p>
          <button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'iComplain - Get your money back',
                  text: 'I just used this tool to create a complaint letter. You might be owed money too!',
                  url: 'https://icomplain.ai',
                })
              } else {
                navigator.clipboard.writeText('https://icomplain.ai')
                alert('Link copied!')
              }
            }}
            className="text-sm text-gray-900 underline hover:no-underline"
          >
            Share iComplain
          </button>
        </div>
      </main>
    </div>
  )
}

export default function DownloadPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    }>
      <DownloadContent />
    </Suspense>
  )
}
