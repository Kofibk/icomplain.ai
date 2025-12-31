'use client'

import { useState, Suspense, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Loader2, Check, AlertCircle, Info, Shield, Upload } from 'lucide-react'
import AutocompleteInput from '@/components/AutocompleteInput'
import FileUpload from '@/components/FileUpload'
import { 
  COMPLAINT_CONFIGS,
  SUCCESS_FACTORS,
} from '@/lib/complaint-engine'
import { searchProviders } from '@/lib/data/providers'

// Freeform complaint config for "tell us what happened"
const FREEFORM_CONFIG = {
  id: 'freeform',
  title: 'Tell us what happened',
  subtitle: 'Describe your complaint in your own words',
  questions: [
    {
      id: 'firm_name',
      question: 'Which company is your complaint about?',
      type: 'autocomplete',
      autocompleteType: 'all',
      required: true,
      placeholder: 'Start typing the company name...',
      helpText: 'The bank, lender, or financial firm',
    },
    {
      id: 'what_happened',
      question: 'What happened?',
      type: 'textarea',
      required: true,
      placeholder: 'Describe what happened in your own words. Include dates, amounts, and any other relevant details...',
      helpText: 'Take your time. The more detail you provide, the more comprehensive your complaint letter will be.',
    },
    {
      id: 'what_wrong',
      question: 'What do you believe went wrong?',
      type: 'textarea',
      required: true,
      placeholder: 'Explain why you think the company acted unfairly or incorrectly...',
    },
    {
      id: 'resolution',
      question: 'What outcome are you looking for?',
      type: 'textarea',
      required: true,
      placeholder: 'What would you like the company to do to resolve this?',
    },
    {
      id: 'amount_involved',
      question: 'Is there a specific amount of money involved?',
      type: 'currency',
      required: false,
      placeholder: 'e.g. 2000',
      helpText: 'If applicable',
    },
    {
      id: 'complained_before',
      question: 'Have you already complained to the company?',
      type: 'select',
      required: true,
      options: [
        { value: 'no', label: 'No, this is my first complaint' },
        { value: 'yes_no_response', label: 'Yes, but no response' },
        { value: 'yes_rejected', label: 'Yes, they rejected my complaint' },
        { value: 'yes_partial', label: 'Yes, they offered something but I\'m not satisfied' },
      ],
    },
  ],
  relevantEvidence: ['correspondence', 'credit_agreement', 'bank_statements'],
  regulations: {
    primary: 'FCA Principle 6 (Treating Customers Fairly)',
    secondary: ['DISP 1.4'],
  },
  letterTemplate: {
    breach: 'failure to treat me fairly',
    regulation: 'FCA Principles',
    harm: 'as described above',
    remedy: 'as outlined above',
  },
}

function VulnerabilitySelector({
  selectedVulnerabilities,
  onToggle
}: {
  selectedVulnerabilities: string[]
  onToggle: (id: string) => void  
}) {
  const vulnerabilities = Object.entries(SUCCESS_FACTORS.vulnerability)
  
  return (
    <div className="space-y-3">
      <p className="text-sm text-white/50 mb-4">
        The FCA requires firms to consider customers in vulnerable circumstances. 
        If any of the following applied to you at the time, it may be relevant to your complaint.
      </p>
      {vulnerabilities.map(([id, vuln]) => {
        const isSelected = selectedVulnerabilities.includes(id)
        
        return (
          <button
            key={id}
            type="button"
            onClick={() => onToggle(id)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
              isSelected 
                ? 'border-violet-500/50 bg-violet-500/10' 
                : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.05] hover:border-white/20'
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              isSelected ? 'border-violet-500 bg-violet-500' : 'border-white/30'
            }`}>
              {isSelected && <Check className="w-3 h-3 text-white" />}
            </div>
            <p className={`flex-1 ${isSelected ? 'text-white' : 'text-white/80'}`}>
              {vuln.label}
            </p>
          </button>
        )
      })}
      
      {selectedVulnerabilities.length > 0 && (
        <div className="mt-6 p-4 bg-violet-500/10 border border-violet-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <Upload className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white mb-1">Supporting evidence</p>
              <p className="text-xs text-white/60">
                If you have any documents that support these circumstances (medical letters, 
                benefit statements, or other evidence), you can upload them to strengthen your complaint.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <p className="text-xs text-white/30 mt-3">
        This information is confidential and only used to ensure firms consider their obligations under FCA guidance.
      </p>
    </div>
  )
}

function EvidenceSelector({ 
  relevantEvidence, 
  selectedEvidence, 
  onToggle 
}: {
  relevantEvidence: string[]
  selectedEvidence: string[]
  onToggle: (id: string) => void
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-white/50 mb-4">
        Do you have any of the following documents? They can help support your complaint.
      </p>
      {relevantEvidence.map(evidenceId => {
        const evidence = (SUCCESS_FACTORS.evidence as any)[evidenceId]
        if (!evidence) return null
        const isSelected = selectedEvidence.includes(evidenceId)
        
        return (
          <button
            key={evidenceId}
            type="button"
            onClick={() => onToggle(evidenceId)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
              isSelected 
                ? 'border-emerald-500/50 bg-emerald-500/10' 
                : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.05] hover:border-white/20'
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-white/30'
            }`}>
              {isSelected && <Check className="w-3 h-3 text-black" />}
            </div>
            <div className="flex-1">
              <p className={`font-medium ${isSelected ? 'text-white' : 'text-white/80'}`}>
                {evidence.label}
              </p>
              <p className="text-xs text-white/40">{evidence.description}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function QuestionnaireContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const complaintType = searchParams.get('type') || 'car-finance'
  const isFreeform = complaintType === 'freeform'

  const config = useMemo(() => {
    if (isFreeform) return FREEFORM_CONFIG
    return COMPLAINT_CONFIGS[complaintType as keyof typeof COMPLAINT_CONFIGS]
  }, [complaintType, isFreeform])
  
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>([])
  const [selectedVulnerabilities, setSelectedVulnerabilities] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showEvidenceStep, setShowEvidenceStep] = useState(false)
  const [showVulnerabilityStep, setShowVulnerabilityStep] = useState(false)

  if (!config) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <p className="text-white/60">Invalid complaint type</p>
          <Link href="/" className="text-emerald-400 hover:underline mt-2 block">
            Go back
          </Link>
        </div>
      </div>
    )
  }

  const questions = config.questions
  const currentQuestion = questions[currentStep]
  const totalSteps = questions.length + 2
  const currentStepNumber = showVulnerabilityStep 
    ? questions.length + 2 
    : showEvidenceStep 
    ? questions.length + 1 
    : currentStep + 1

  const handleAnswer = (value: any) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }))
  }

  const toggleEvidence = (id: string) => {
    setSelectedEvidence(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id])
  }

  const toggleVulnerability = (id: string) => {
    setSelectedVulnerabilities(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id])
  }

  const canProceed = () => {
    if (showEvidenceStep || showVulnerabilityStep) return true
    const answer = answers[currentQuestion.id]
    if (!(currentQuestion as any).required) return true
    if (currentQuestion.type === 'multiselect') return Array.isArray(answer) && answer.length > 0
    if (currentQuestion.type === 'textarea') return answer && answer.toString().trim().length > 10
    return answer && answer.toString().trim().length > 0
  }

  const handleNext = () => {
    if (currentStep < questions.length - 1) setCurrentStep(prev => prev + 1)
    else if (!showEvidenceStep) setShowEvidenceStep(true)
    else if (!showVulnerabilityStep) setShowVulnerabilityStep(true)
    else handleSubmit()
  }

  const handleBack = () => {
    if (showVulnerabilityStep) setShowVulnerabilityStep(false)
    else if (showEvidenceStep) setShowEvidenceStep(false)
    else if (currentStep > 0) setCurrentStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const complaintData = {
      type: complaintType,
      title: config.title,
      answers,
      evidence: selectedEvidence,
      vulnerabilities: selectedVulnerabilities,
      fileNames: files.map(f => f.name),
      timestamp: new Date().toISOString(),
    }
    sessionStorage.setItem('complaintData', JSON.stringify(complaintData))
    router.push('/review')
  }

  const getSearchFn = (autocompleteType?: string) => {
    switch (autocompleteType) {
      case 'bank': return (q: string) => searchProviders(q, 'bank')
      case 'credit': return (q: string) => searchProviders(q, 'credit')
      case 'car': return (q: string) => searchProviders(q, 'car')
      case 'loan': return (q: string) => searchProviders(q, 'loan')
      case 'all': return (q: string) => searchProviders(q, 'all')
      default: return (q: string) => searchProviders(q, 'all')
    }
  }

  const renderQuestion = () => {
    const value = answers[currentQuestion.id] || ''
    const q = currentQuestion as any

    switch (currentQuestion.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder={q.placeholder}
            autoFocus
            className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 text-lg"
          />
        )

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder={q.placeholder}
            autoFocus
            rows={6}
            className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 text-lg resize-none"
          />
        )

      case 'select':
      case 'date_range':
      case 'currency_range':
        return (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {q.options?.map((option: any) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  handleAnswer(option.value)
                  setTimeout(() => handleNext(), 200)
                }}
                className={`w-full p-5 rounded-xl border text-left transition-all ${
                  value === option.value
                    ? 'border-white/30 bg-white/10'
                    : option.warning
                    ? 'border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10'
                    : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <span className="font-medium text-white">{option.label}</span>
                    {option.helpText && (
                      <p className="text-xs text-white/40 mt-1">{option.helpText}</p>
                    )}
                    {option.warning && (
                      <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {option.warning}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : []
        return (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {q.options?.map((option: any) => {
              const isSelected = selectedValues.includes(option.value)
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleAnswer(isSelected ? selectedValues.filter((v: string) => v !== option.value) : [...selectedValues, option.value])}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    isSelected ? 'border-white/30 bg-white/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isSelected ? 'border-white bg-white' : 'border-white/30'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-black" />}
                    </div>
                    <span className="text-white">{option.label}</span>
                  </div>
                </button>
              )
            })}
            <p className="text-xs text-white/40">Select all that apply</p>
          </div>
        )

      case 'autocomplete':
        return (
          <AutocompleteInput
            value={value}
            onChange={handleAnswer}
            onSearch={getSearchFn(q.autocompleteType)}
            placeholder={q.placeholder}
            dark
          />
        )

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleAnswer(e.target.value)}
            autoFocus
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30 text-lg"
          />
        )

      case 'currency':
        return (
          <div className="relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50 text-lg">£</span>
            <input
              type="number"
              value={value}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder={q.placeholder}
              autoFocus
              min="0"
              className="w-full pl-10 pr-5 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 text-lg"
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => currentStep === 0 && !showEvidenceStep ? router.back() : handleBack()}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <Link href="/" className="text-lg font-semibold">iComplain</Link>
          <div className="text-sm text-white/40">{currentStepNumber}/{totalSteps}</div>
        </div>
        <div className="h-0.5 bg-white/5">
          <div
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${(currentStepNumber / totalSteps) * 100}%` }}
          />
        </div>
      </header>

      <div className="pt-24 pb-12 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8">
            <div className="text-sm text-white/40 mb-6">{config.title}</div>

            {showVulnerabilityStep ? (
              <>
                <h1 className="text-2xl font-semibold mb-2">Were there any special circumstances?</h1>
                <p className="text-white/50 mb-8">Optional - but firms must consider vulnerability</p>
                <VulnerabilitySelector selectedVulnerabilities={selectedVulnerabilities} onToggle={toggleVulnerability} />
                
                {selectedVulnerabilities.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-white/10">
                    <p className="text-sm text-white/60 mb-4">Upload supporting evidence (optional)</p>
                    <FileUpload files={files} onChange={setFiles} helpText="Medical letters, benefit statements, or other documents" dark />
                  </div>
                )}
              </>
            ) : showEvidenceStep ? (
              <>
                <h1 className="text-2xl font-semibold mb-2">Do you have any supporting documents?</h1>
                <p className="text-white/50 mb-8">Not required, but can help support your complaint</p>
                <EvidenceSelector relevantEvidence={config.relevantEvidence || []} selectedEvidence={selectedEvidence} onToggle={toggleEvidence} />
                <div className="mt-8 pt-8 border-t border-white/10">
                  <p className="text-sm text-white/60 mb-4">Upload documents (optional)</p>
                  <FileUpload files={files} onChange={setFiles} helpText="PDFs, images, or documents" dark />
                </div>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-semibold mb-2">{currentQuestion.question}</h1>
                {(currentQuestion as any).helpText && (
                  <p className="text-white/50 mb-8 flex items-start gap-2">
                    <Info className="w-4 h-4 text-white/40 flex-shrink-0 mt-1" />
                    {(currentQuestion as any).helpText}
                  </p>
                )}
                <div className="mb-8">{renderQuestion()}</div>
              </>
            )}

            {(showEvidenceStep || showVulnerabilityStep || !['select', 'date_range', 'currency_range'].includes(currentQuestion.type)) && (
              <div className="flex items-center justify-between gap-4 mt-8 pt-8 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleNext}
                  className="text-white/40 hover:text-white text-sm transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={handleNext}
                  disabled={!canProceed() || isSubmitting}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                    canProceed() && !isSubmitting
                      ? 'bg-white text-black hover:bg-white/90'
                      : 'bg-white/10 text-white/30 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                  ) : showVulnerabilityStep ? (
                    <><span>Review complaint</span> <ArrowRight className="w-5 h-5" /></>
                  ) : (
                    <><span>Continue</span> <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Info card */}
          <div className="mt-6 bg-white/[0.02] border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Your information is secure and confidential</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function QuestionnairePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white/40" />
      </div>
    }>
      <QuestionnaireContent />
    </Suspense>
  )
}
