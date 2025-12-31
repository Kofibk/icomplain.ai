'use client'

import { useState, Suspense, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Loader2, Check, AlertCircle, TrendingUp, Shield, Info } from 'lucide-react'
import AutocompleteInput from '@/components/AutocompleteInput'
import FileUpload from '@/components/FileUpload'
import { 
  COMPLAINT_CONFIGS,
  SUCCESS_FACTORS,
  calculateSuccessRate,
} from '@/lib/complaint-engine'
import { searchProviders } from '@/lib/data/providers'

function SuccessIndicator({ rate, factors }: { 
  rate: number
  factors: { factor: string; impact: number; positive: boolean }[]
}) {
  const getColor = () => {
    if (rate >= 70) return 'text-emerald-400'
    if (rate >= 50) return 'text-amber-400'
    return 'text-rose-400'
  }
  
  const getBarColor = () => {
    if (rate >= 70) return 'bg-emerald-500'
    if (rate >= 50) return 'bg-amber-500'
    return 'bg-rose-500'
  }

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className={`w-4 h-4 ${getColor()}`} />
          <span className="text-sm text-white/60">Success estimate</span>
        </div>
        <span className={`text-2xl font-semibold ${getColor()}`}>{rate}%</span>
      </div>
      
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
        <div 
          className={`h-full ${getBarColor()} transition-all duration-500`}
          style={{ width: `${rate}%` }}
        />
      </div>
      
      {factors.length > 0 && (
        <div className="space-y-2">
          {factors.slice(0, 3).map((factor, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              {factor.positive ? (
                <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-3 h-3 text-amber-400 flex-shrink-0" />
              )}
              <span className="text-white/50 truncate">{factor.factor}</span>
              <span className={`ml-auto font-medium ${factor.positive ? 'text-emerald-400' : 'text-amber-400'}`}>
                {factor.positive ? '+' : ''}{factor.impact}%
              </span>
            </div>
          ))}
        </div>
      )}
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
        Evidence strengthens your complaint. Select what you have:
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
            <span className="text-xs font-medium text-emerald-400">+{evidence.impact}%</span>
          </button>
        )
      })}
    </div>
  )
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
        FCA requires firms to consider vulnerability. Select any that applied:
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
            <span className="text-xs font-medium text-emerald-400">+{vuln.impact}%</span>
          </button>
        )
      })}
      <p className="text-xs text-white/30 mt-3">
        This is confidential and only used to strengthen your complaint.
      </p>
    </div>
  )
}

function QuestionnaireContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const complaintType = searchParams.get('type') || 'car-finance'

  const config = useMemo(() => 
    COMPLAINT_CONFIGS[complaintType as keyof typeof COMPLAINT_CONFIGS], 
    [complaintType]
  )
  
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>([])
  const [selectedVulnerabilities, setSelectedVulnerabilities] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showEvidenceStep, setShowEvidenceStep] = useState(false)
  const [showVulnerabilityStep, setShowVulnerabilityStep] = useState(false)

  const successData = useMemo(() => {
    if (!config) return { rate: 0, factors: [], recommendations: [] }
    return calculateSuccessRate(complaintType, answers, selectedEvidence, selectedVulnerabilities)
  }, [complaintType, answers, selectedEvidence, selectedVulnerabilities, config])

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
      successRate: successData.rate,
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
      default: return () => []
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
                  <div className="flex items-center gap-2">
                    {option.badge && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        option.highlight ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-white/60'
                      }`}>
                        {option.badge}
                      </span>
                    )}
                    {option.successModifier > 0 && (
                      <span className="text-xs font-medium text-emerald-400">+{option.successModifier}%</span>
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
                    {option.successModifier > 0 && (
                      <span className="ml-auto text-xs font-medium text-emerald-400">+{option.successModifier}%</span>
                    )}
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
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main */}
            <div className="lg:col-span-2">
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8">
                <div className="text-sm text-white/40 mb-6">{config.title}</div>

                {showVulnerabilityStep ? (
                  <>
                    <h1 className="text-2xl font-semibold mb-2">Any circumstances we should know?</h1>
                    <p className="text-white/50 mb-8">Optional, but can strengthen your case</p>
                    <VulnerabilitySelector selectedVulnerabilities={selectedVulnerabilities} onToggle={toggleVulnerability} />
                  </>
                ) : showEvidenceStep ? (
                  <>
                    <h1 className="text-2xl font-semibold mb-2">What evidence do you have?</h1>
                    <p className="text-white/50 mb-8">More evidence = stronger complaint</p>
                    <EvidenceSelector relevantEvidence={config.relevantEvidence || []} selectedEvidence={selectedEvidence} onToggle={toggleEvidence} />
                    <div className="mt-8 pt-8 border-t border-white/10">
                      <p className="text-sm text-white/60 mb-4">Upload documents (optional)</p>
                      <FileUpload files={files} onChange={setFiles} helpText="PDFs, images, docs" dark />
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
                        <><span>Review & Generate</span> <ArrowRight className="w-5 h-5" /></>
                      ) : (
                        <><span>Continue</span> <ArrowRight className="w-5 h-5" /></>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <SuccessIndicator rate={successData.rate} factors={successData.factors} />
                
                {successData.recommendations.length > 0 && (
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                    <h3 className="text-sm font-medium text-white/60 mb-3">Boost your chances</h3>
                    <ul className="space-y-2">
                      {successData.recommendations.slice(0, 2).map((rec, i) => (
                        <li key={i} className="text-xs text-white/40 flex items-start gap-2">
                          <TrendingUp className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>Your data is secure</span>
                  </div>
                  <p className="text-xs text-white/30 mt-2">
                    We never share your info. Used only to generate your letter.
                  </p>
                </div>
              </div>
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
