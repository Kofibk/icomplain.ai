'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Upload, 
  FileText, 
  Mic, 
  X, 
  ArrowRight, 
  Loader2, 
  CheckCircle,
  AlertCircle,
  Sparkles,
  MessageSquare,
  Camera
} from 'lucide-react'

interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  file: File
  status: 'uploading' | 'analyzing' | 'done' | 'error'
  analysis?: any
  error?: string
}

interface AnalysisResult {
  complaintType: string
  complaintTypeLabel: string
  confidence: number
  keyIssues: string[]
  suggestedQuestions: { question: string; why: string }[]
  extractedDetails: Record<string, string>
  missingInfo: string[]
}

const COMPLAINT_TYPE_LABELS: Record<string, string> = {
  pcp: 'Car Finance - Hidden Commission',
  section75: 'Credit Card - Section 75 Claim',
  unaffordable_lending: 'Unaffordable Lending',
  unaffordable: 'Unaffordable Lending',
  holiday_park: 'Holiday Park / Timeshare',
  other: 'General Financial Complaint',
}

export default function SmartUploadPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedType = searchParams.get('type')
  
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [textInput, setTextInput] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files)
    addFiles(droppedFiles)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files))
    }
  }

  const addFiles = async (newFiles: File[]) => {
    for (const file of newFiles) {
      const fileObj: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        file: file,
        status: 'uploading',
      }
      
      setFiles(prev => [...prev, fileObj])
      
      // Analyze the file
      try {
        setFiles(prev => prev.map(f => 
          f.id === fileObj.id ? { ...f, status: 'analyzing' } : f
        ))
        
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await fetch('/api/analyze-document', {
          method: 'POST',
          body: formData,
        })
        
        const result = await response.json()
        
        if (result.success) {
          setFiles(prev => prev.map(f => 
            f.id === fileObj.id ? { ...f, status: 'done', analysis: result.analysis } : f
          ))
        } else {
          setFiles(prev => prev.map(f => 
            f.id === fileObj.id ? { ...f, status: 'error', error: result.error } : f
          ))
        }
      } catch (err) {
        setFiles(prev => prev.map(f => 
          f.id === fileObj.id ? { ...f, status: 'error', error: 'Failed to analyze' } : f
        ))
      }
    }
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    setError(null)
    
    try {
      // Combine file analyses with text input
      const fileAnalyses = files
        .filter(f => f.status === 'done' && f.analysis)
        .map(f => f.analysis)
      
      // If we have text input, analyze it
      let textAnalysis = null
      if (textInput.trim()) {
        const formData = new FormData()
        formData.append('textContent', textInput)
        
        const response = await fetch('/api/analyze-document', {
          method: 'POST',
          body: formData,
        })
        
        const result = await response.json()
        if (result.success) {
          textAnalysis = result.analysis
        }
      }
      
      // Combine all analyses into a unified result
      const combinedAnalysis = combineAnalyses(fileAnalyses, textAnalysis, preselectedType)
      setAnalysis(combinedAnalysis)
      
    } catch (err) {
      console.error('Analysis error:', err)
      setError('Failed to analyze your information. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Combine multiple document analyses into one result
  const combineAnalyses = (
    fileAnalyses: any[], 
    textAnalysis: any | null,
    preselectedType: string | null
  ): AnalysisResult => {
    // Start with defaults
    let complaintType = preselectedType || 'other'
    let confidence = 50
    const keyIssues: string[] = []
    const extractedDetails: Record<string, string> = {}
    const missingInfo: string[] = []
    const suggestedQuestions: { question: string; why: string }[] = []
    
    // Process file analyses
    for (const analysis of fileAnalyses) {
      // Extract details from finance agreements
      if (analysis.document_type?.includes('agreement') || analysis.document_type?.includes('pcp')) {
        complaintType = 'pcp'
        confidence = Math.max(confidence, analysis.confidence_score || 70)
        
        if (analysis.lender_name) extractedDetails['Lender'] = analysis.lender_name
        if (analysis.broker_dealer_name) extractedDetails['Dealer'] = analysis.broker_dealer_name
        if (analysis.agreement_date) extractedDetails['Agreement Date'] = analysis.agreement_date
        if (analysis.finance_amount) extractedDetails['Finance Amount'] = `£${analysis.finance_amount.toLocaleString()}`
        if (analysis.apr_interest_rate) extractedDetails['APR'] = `${analysis.apr_interest_rate}%`
        if (analysis.vehicle_details?.make) {
          extractedDetails['Vehicle'] = `${analysis.vehicle_details.make} ${analysis.vehicle_details.model || ''}`
        }
        
        // Add potential issues
        if (analysis.commission_disclosed === 'no') {
          keyIssues.push('Commission was not disclosed in your agreement')
        }
        if (analysis.potential_issues) {
          keyIssues.push(...analysis.potential_issues)
        }
      }
      
      // Extract from bank statements
      if (analysis.document_type === 'bank_statement') {
        if (analysis.financial_stress_indicators?.length > 0) {
          keyIssues.push(...analysis.financial_stress_indicators.map((i: string) => `Financial stress indicator: ${i}`))
          if (complaintType === 'other') complaintType = 'unaffordable'
        }
      }
    }
    
    // Process text analysis
    if (textAnalysis) {
      if (textAnalysis.complaint_type && textAnalysis.complaint_type !== 'other') {
        complaintType = textAnalysis.complaint_type
        confidence = Math.max(confidence, textAnalysis.complaint_type_confidence || 60)
      }
      
      if (textAnalysis.key_issues_identified) {
        keyIssues.push(...textAnalysis.key_issues_identified)
      }
      
      if (textAnalysis.extracted_details) {
        const details = textAnalysis.extracted_details
        if (details.lender_name) extractedDetails['Lender'] = details.lender_name
        if (details.approximate_amount) extractedDetails['Amount'] = `£${details.approximate_amount.toLocaleString()}`
        if (details.approximate_date) extractedDetails['Date'] = details.approximate_date
      }
      
      if (textAnalysis.missing_information) {
        missingInfo.push(...textAnalysis.missing_information)
      }
      
      if (textAnalysis.suggested_questions) {
        suggestedQuestions.push(...textAnalysis.suggested_questions.map((q: string) => ({
          question: q,
          why: 'This helps strengthen your complaint'
        })))
      }
    }
    
    // Add default questions based on complaint type
    if (suggestedQuestions.length === 0) {
      if (complaintType === 'pcp') {
        suggestedQuestions.push(
          { question: 'Were you told the dealer would earn commission from your finance?', why: 'Commission disclosure is key to PCP complaints' },
          { question: 'Were you offered any alternative interest rates?', why: 'Lack of choice suggests commission influenced your rate' },
          { question: 'Did you feel you had to take the dealer\'s finance to get the car?', why: 'Pressure tactics are relevant to your complaint' },
          { question: 'Did anyone explain how the interest rate was calculated?', why: 'Helps establish what was disclosed' },
        )
      } else if (complaintType === 'unaffordable' || complaintType === 'unaffordable_lending') {
        suggestedQuestions.push(
          { question: 'Were you asked about your income and expenses?', why: 'Lenders must check affordability' },
          { question: 'Did you have other debts at the time?', why: 'Shows if lending was responsible' },
          { question: 'Did you struggle to make repayments?', why: 'Evidence the lending was unaffordable' },
          { question: 'Did the lender ever increase your credit limit?', why: 'Limit increases can worsen unaffordable debt' },
        )
      } else if (complaintType === 'section75') {
        suggestedQuestions.push(
          { question: 'Did you pay any amount on a credit card?', why: 'Section 75 requires credit card payment' },
          { question: 'Was the purchase between £100 and £30,000?', why: 'Required for Section 75 protection' },
          { question: 'Have you tried to resolve this with the seller?', why: 'Shows you\'ve attempted resolution' },
          { question: 'Has the company gone bust or stopped responding?', why: 'Affects your claim approach' },
        )
      }
    }
    
    // Add default key issues if none found
    if (keyIssues.length === 0) {
      if (complaintType === 'pcp') {
        keyIssues.push(
          'Potential undisclosed commission arrangement',
          'Interest rate may have been inflated by dealer',
        )
      }
    }
    
    return {
      complaintType,
      complaintTypeLabel: COMPLAINT_TYPE_LABELS[complaintType] || 'Financial Complaint',
      confidence: Math.min(confidence, 95), // Cap at 95%
      keyIssues: [...new Set(keyIssues)].slice(0, 5), // Dedupe and limit
      suggestedQuestions: suggestedQuestions.slice(0, 4),
      extractedDetails,
      missingInfo: missingInfo.slice(0, 5),
    }
  }

  const handleAnswer = (question: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [question]: answer }))
    if (currentQuestion < (analysis?.suggestedQuestions.length || 0) - 1) {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  const handleGenerateLetter = () => {
    // Store analysis and answers in session
    const complaintData = {
      ...analysis?.extractedDetails,
      ...answers,
      full_name: answers['full_name'] || '',
      email: answers['email'] || '',
      address: answers['address'] || '',
    }
    
    sessionStorage.setItem('complaintAnswers', JSON.stringify(complaintData))
    sessionStorage.setItem('complaintType', analysis?.complaintType || 'pcp')
    
    // For now, go to questionnaire to fill in remaining details
    // In future, could go straight to payment if we have everything
    router.push(`/questionnaire?type=${analysis?.complaintType || 'pcp'}&prefilled=true`)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const hasContent = files.length > 0 || textInput.trim().length > 0
  const analyzedFiles = files.filter(f => f.status === 'done')

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg z-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold text-gray-900">
            iComplain
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
            Exit
          </Link>
        </div>
      </nav>

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          
          {!analysis ? (
            <>
              {/* Header */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 text-sm font-medium px-4 py-2 rounded-full mb-4">
                  <Sparkles className="w-4 h-4" />
                  AI-powered analysis
                </div>
                <h1 className="text-3xl font-semibold text-gray-900 mb-3">
                  Tell us what happened
                </h1>
                <p className="text-gray-500">
                  Upload your documents or describe your situation. Our AI will identify the issues and build your case.
                </p>
              </div>

              {/* Upload Area */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-gray-300 transition-colors mb-6"
              >
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Drop files here or{' '}
                  <label className="text-gray-900 font-medium cursor-pointer hover:underline">
                    browse
                    <input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="image/*,.pdf"
                    />
                  </label>
                </p>
                <p className="text-sm text-gray-400 mb-4">
                  Finance agreements, bank statements, emails, screenshots
                </p>
                
                {/* Mobile camera button */}
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors sm:hidden">
                  <Camera className="w-4 h-4" />
                  Take photo
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Uploaded Files */}
              {files.length > 0 && (
                <div className="space-y-3 mb-6">
                  {files.map(file => (
                    <div 
                      key={file.id}
                      className={`flex items-center justify-between p-4 rounded-xl ${
                        file.status === 'error' ? 'bg-red-50' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className={`w-5 h-5 flex-shrink-0 ${
                          file.status === 'error' ? 'text-red-400' : 'text-gray-400'
                        }`} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {file.status === 'error' ? file.error : formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {file.status === 'uploading' && (
                          <span className="text-xs text-gray-500">Uploading...</span>
                        )}
                        {file.status === 'analyzing' && (
                          <span className="text-xs text-purple-600 flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Analyzing
                          </span>
                        )}
                        {file.status === 'done' && (
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                        )}
                        {file.status === 'error' && (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                        <button
                          onClick={() => removeFile(file.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Show extracted info from files */}
              {analyzedFiles.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
                  <p className="text-sm font-medium text-emerald-800 mb-2">
                    ✓ Found in your documents:
                  </p>
                  <ul className="text-sm text-emerald-700 space-y-1">
                    {analyzedFiles.map(f => {
                      const a = f.analysis
                      if (a?.lender_name) return <li key={f.id + 'lender'}>Lender: {a.lender_name}</li>
                      if (a?.document_type) return <li key={f.id + 'type'}>Document: {a.document_type}</li>
                      return null
                    }).filter(Boolean)}
                  </ul>
                </div>
              )}

              {/* Divider */}
              <div className="flex items-center gap-4 my-8">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-sm text-gray-400">or describe what happened</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Text Input */}
              <div className="mb-6">
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Tell us your story in your own words...&#10;&#10;For example: &quot;I bought a car on finance from Evans Halshaw in 2019. Nobody told me the dealer was getting commission. I've since heard I might be able to claim this back...&quot;"
                  className="w-full h-40 px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all resize-none text-gray-900 placeholder:text-gray-400"
                />
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={!hasContent || isAnalyzing}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-medium transition-all ${
                  hasContent && !isAnalyzing
                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing your case...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Analyze my complaint
                  </>
                )}
              </button>
              
              <p className="text-center text-xs text-gray-400 mt-4">
                Your documents are processed securely and deleted after 30 days
              </p>
            </>
          ) : (
            <>
              {/* Analysis Results */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Analysis complete</h2>
                    <p className="text-sm text-gray-500">We've identified potential issues with your case</p>
                  </div>
                </div>

                {/* Complaint Type */}
                <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">Complaint type identified</span>
                    <span className="text-sm font-medium text-emerald-600">{analysis.confidence}% match</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {analysis.complaintTypeLabel}
                  </h3>
                  
                  {analysis.keyIssues.length > 0 && (
                    <>
                      <p className="text-sm text-gray-500 mb-2">Potential issues identified:</p>
                      <ul className="space-y-2">
                        {analysis.keyIssues.map((issue, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>

                {/* Extracted Details */}
                {Object.keys(analysis.extractedDetails).length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
                    <h4 className="font-medium text-gray-900 mb-4">Details we extracted</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(analysis.extractedDetails).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-xs text-gray-500">{key}</p>
                          <p className="text-sm font-medium text-gray-900">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Follow-up Questions */}
                {analysis.suggestedQuestions.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
                    <h4 className="font-medium text-gray-900 mb-1">
                      <MessageSquare className="w-4 h-4 inline mr-2" />
                      Quick questions to strengthen your case
                    </h4>
                    <p className="text-xs text-gray-500 mb-4">Answer what you can - it's okay to skip</p>
                    
                    <div className="space-y-4">
                      {analysis.suggestedQuestions.map((q, i) => (
                        <div 
                          key={i}
                          className={`p-4 rounded-xl transition-all ${
                            i === currentQuestion ? 'bg-gray-50' : answers[q.question] ? 'bg-gray-50/50' : 'opacity-50'
                          }`}
                        >
                          <p className="text-sm text-gray-900 mb-1">{q.question}</p>
                          <p className="text-xs text-gray-500 mb-3">{q.why}</p>
                          
                          {(i === currentQuestion || answers[q.question]) && (
                            <div className="flex flex-wrap gap-2">
                              {['Yes', 'No', 'Not sure'].map(option => (
                                <button
                                  key={option}
                                  onClick={() => handleAnswer(q.question, option)}
                                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                                    answers[q.question] === option
                                      ? 'bg-gray-900 text-white'
                                      : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                                  }`}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Info Notice */}
                {analysis.missingInfo.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                    <p className="text-sm font-medium text-amber-800 mb-2">
                      We'll need a few more details:
                    </p>
                    <ul className="text-sm text-amber-700 space-y-1">
                      {analysis.missingInfo.map((info, i) => (
                        <li key={i}>• {info}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Generate Letter Button */}
                <button
                  onClick={handleGenerateLetter}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-medium bg-gray-900 text-white hover:bg-gray-800 transition-all"
                >
                  Continue to generate letter
                  <ArrowRight className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => setAnalysis(null)}
                  className="w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-4"
                >
                  ← Start over
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
