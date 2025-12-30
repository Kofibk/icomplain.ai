'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Download, FileText, CheckCircle, Loader2, AlertCircle, Mail, Printer } from 'lucide-react'
import Link from 'next/link'

interface ComplaintData {
  letter: string
  evidenceChecklist: string[]
}

export default function DownloadPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [complaintData, setComplaintData] = useState<ComplaintData | null>(null)
  const [generating, setGenerating] = useState(false)
  
  useEffect(() => {
    const generateComplaint = async () => {
      if (!sessionId) {
        setError('No session found. Please start again.')
        setLoading(false)
        return
      }
      
      // Get stored complaint data from session storage
      const storedData = sessionStorage.getItem('complaintData')
      if (!storedData) {
        setError('Complaint data not found. Please start again.')
        setLoading(false)
        return
      }
      
      const { complaintType, answers } = JSON.parse(storedData)
      
      setGenerating(true)
      
      try {
        const response = await fetch('/api/generate-complaint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            complaintType,
            answers,
            sessionId,
          }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to generate complaint')
        }
        
        const data = await response.json()
        setComplaintData(data)
        
        // Clear session storage
        sessionStorage.removeItem('complaintData')
        
      } catch (err) {
        console.error('Error generating complaint:', err)
        setError('Failed to generate your complaint letter. Please contact support.')
      } finally {
        setLoading(false)
        setGenerating(false)
      }
    }
    
    generateComplaint()
  }, [sessionId])
  
  const handleDownloadPDF = async () => {
    if (!complaintData?.letter) return
    
    // Create a simple PDF using browser print
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Complaint Letter</title>
          <style>
            body {
              font-family: 'Times New Roman', serif;
              font-size: 12pt;
              line-height: 1.6;
              max-width: 800px;
              margin: 40px auto;
              padding: 20px;
            }
            pre {
              white-space: pre-wrap;
              font-family: inherit;
            }
          </style>
        </head>
        <body>
          <pre>${complaintData.letter}</pre>
        </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }
  
  const handleCopyText = () => {
    if (complaintData?.letter) {
      navigator.clipboard.writeText(complaintData.letter)
      alert('Letter copied to clipboard!')
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-brand-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {generating ? 'Generating Your Complaint Letter...' : 'Loading...'}
          </h2>
          <p className="text-gray-600">
            Our AI is crafting a professional complaint letter based on your answers.
            <br />This usually takes 10-20 seconds.
          </p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something Went Wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/" className="btn-primary">
            Start Again
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-brand-600">
            ComplaintAI
          </Link>
        </div>
      </header>
      
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Success message */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
            <div>
              <h1 className="text-xl font-semibold text-green-800 mb-2">
                Your Complaint Letter is Ready!
              </h1>
              <p className="text-green-700">
                Download your letter below and send it to the business. Remember to keep a copy for your records.
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main letter section */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Your Complaint Letter
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyText}
                    className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                  >
                    Copy Text
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="btn-primary flex items-center gap-2 text-sm py-2 px-4"
                  >
                    <Download className="w-4 h-4" />
                    Download / Print
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 font-mono text-sm whitespace-pre-wrap border max-h-[600px] overflow-y-auto">
                {complaintData?.letter}
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Evidence checklist */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">
                📋 Evidence Checklist
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Attach these documents to strengthen your complaint:
              </p>
              <ul className="space-y-3">
                {complaintData?.evidenceChecklist.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <input type="checkbox" className="mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Next steps */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">
                📬 Next Steps
              </h3>
              <ol className="space-y-4 text-sm">
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center flex-shrink-0 font-semibold">1</span>
                  <div>
                    <p className="font-medium text-gray-900">Print or save your letter</p>
                    <p className="text-gray-600">Keep a copy for your records</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center flex-shrink-0 font-semibold">2</span>
                  <div>
                    <p className="font-medium text-gray-900">Gather your evidence</p>
                    <p className="text-gray-600">Use the checklist above</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center flex-shrink-0 font-semibold">3</span>
                  <div>
                    <p className="font-medium text-gray-900">Send your complaint</p>
                    <p className="text-gray-600">Email or post to the business</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center flex-shrink-0 font-semibold">4</span>
                  <div>
                    <p className="font-medium text-gray-900">Wait for response</p>
                    <p className="text-gray-600">They have 8 weeks to respond</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center flex-shrink-0 font-semibold">5</span>
                  <div>
                    <p className="font-medium text-gray-900">Escalate if needed</p>
                    <p className="text-gray-600">
                      <a 
                        href="https://www.financial-ombudsman.org.uk" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-brand-600 hover:underline"
                      >
                        Financial Ombudsman Service
                      </a>
                      {' '}is free to use
                    </p>
                  </div>
                </li>
              </ol>
            </div>
            
            {/* Important notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h4 className="font-semibold text-amber-800 mb-2">⚠️ Important</h4>
              <p className="text-sm text-amber-700">
                This letter is a template based on your answers. Review it carefully before sending 
                and make any personal adjustments needed. This is not legal advice.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-5xl mx-auto px-4 py-8 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Need help? Contact us at support@complaintai.co.uk
          </p>
          <p className="text-xs text-gray-500">
            ComplaintAI is a document preparation service. We do not provide legal advice 
            or act on your behalf. You submit the complaint yourself and keep 100% of any compensation.
          </p>
        </div>
      </footer>
    </div>
  )
}
