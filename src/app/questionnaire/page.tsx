'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import AutocompleteInput from '@/components/AutocompleteInput'
import MultiSelect from '@/components/MultiSelect'
import FileUpload from '@/components/FileUpload'
import { 
  getQuestionnaireConfig, 
  Question 
} from '@/lib/questionnaire-config'
import { 
  searchProviders, 
  searchCarMakes,
  getIssuesForCategory 
} from '@/lib/data/providers'

function QuestionnaireContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const complaintType = searchParams.get('type') || 'other'

  const [config, setConfig] = useState(getQuestionnaireConfig(complaintType))
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dynamicIssues, setDynamicIssues] = useState<string[]>([])

  // Update issues when category changes (for generic questionnaire)
  useEffect(() => {
    if (complaintType === 'other' && answers.category) {
      const issues = getIssuesForCategory(answers.category)
      setDynamicIssues(issues)
    }
  }, [answers.category, complaintType])

  const questions = config.questions
  const currentQuestion = questions[currentStep]
  const progress = ((currentStep + 1) / questions.length) * 100

  // Get options for dynamic issue type
  const getCurrentOptions = () => {
    if (currentQuestion.id === 'issue_type' && complaintType === 'other') {
      return dynamicIssues.length > 0 ? dynamicIssues : ['Please select a category first']
    }
    return currentQuestion.options || []
  }

  const handleAnswer = (value: any) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }))
  }

  const handleFileChange = (newFiles: File[]) => {
    setFiles(newFiles)
    handleAnswer(newFiles.map(f => f.name).join(', ') || '')
  }

  const canProceed = () => {
    const answer = answers[currentQuestion.id]
    if (!currentQuestion.required) return true
    if (currentQuestion.type === 'multiselect') {
      return Array.isArray(answer) && answer.length > 0
    }
    if (currentQuestion.type === 'file') {
      return true // Files are optional
    }
    return answer && answer.toString().trim().length > 0
  }

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    // Store answers in sessionStorage for the next page
    const complaintData = {
      type: complaintType,
      title: config.title,
      answers,
      fileNames: files.map(f => f.name),
      timestamp: new Date().toISOString(),
    }
    
    sessionStorage.setItem('complaintData', JSON.stringify(complaintData))
    
    // Navigate to review page
    router.push('/review')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && canProceed()) {
      if (currentQuestion.type !== 'textarea') {
        e.preventDefault()
        handleNext()
      }
    }
  }

  // Get autocomplete search function
  const getSearchFn = () => {
    switch (currentQuestion.autocompleteType) {
      case 'bank': return (q: string) => searchProviders(q, 'bank')
      case 'credit': return (q: string) => searchProviders(q, 'credit')
      case 'car': return (q: string) => searchProviders(q, 'car')
      case 'loan': return (q: string) => searchProviders(q, 'loan')
      case 'mortgage': return (q: string) => searchProviders(q, 'mortgage')
      case 'insurance': return (q: string) => searchProviders(q, 'insurance')
      case 'pension': return (q: string) => searchProviders(q, 'pension')
      case 'all': return (q: string) => searchProviders(q, 'all')
      case 'carMake': return searchCarMakes
      default: return () => []
    }
  }

  const renderInput = () => {
    const value = answers[currentQuestion.id] || ''

    switch (currentQuestion.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={currentQuestion.placeholder}
            required={currentQuestion.required}
            autoFocus
            className="w-full px-4 py-4 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
          />
        )

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder={currentQuestion.placeholder}
            required={currentQuestion.required}
            autoFocus
            rows={5}
            className="w-full px-4 py-4 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg resize-none"
          />
        )

      case 'select':
        const options = getCurrentOptions()
        return (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  handleAnswer(option)
                  // Auto-advance for select questions after short delay
                  setTimeout(() => {
                    if (currentStep < questions.length - 1) {
                      setCurrentStep(prev => prev + 1)
                    }
                  }, 300)
                }}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  value === option
                    ? 'border-green-500 bg-green-50 text-green-900'
                    : 'border-gray-300 hover:border-gray-400 text-gray-900'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )

      case 'multiselect':
        return (
          <MultiSelect
            options={currentQuestion.options || []}
            value={Array.isArray(value) ? value : []}
            onChange={handleAnswer}
            required={currentQuestion.required}
          />
        )

      case 'autocomplete':
        return (
          <AutocompleteInput
            value={value}
            onChange={handleAnswer}
            onSearch={getSearchFn()}
            placeholder={currentQuestion.placeholder}
            required={currentQuestion.required}
          />
        )

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            required={currentQuestion.required}
            autoFocus
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-4 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
          />
        )

      case 'currency':
        return (
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">£</span>
            <input
              type="number"
              value={value}
              onChange={(e) => handleAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={currentQuestion.placeholder}
              required={currentQuestion.required}
              autoFocus
              min="0"
              step="1"
              className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
            />
          </div>
        )

      case 'file':
        return (
          <FileUpload
            files={files}
            onChange={handleFileChange}
            helpText={currentQuestion.helpText}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => currentStep === 0 ? router.back() : handleBack()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <Link href="/" className="text-xl font-bold text-gray-900">
            i<span className="text-green-600">Complain</span>
          </Link>
          <div className="text-sm text-gray-500">
            {currentStep + 1} of {questions.length}
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-green-600 progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-2">
          <span className="inline-flex items-center gap-2 text-sm text-gray-500">
            <span className="text-2xl">{config.icon}</span>
            {config.title}
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          {currentQuestion.question}
        </h1>

        {currentQuestion.helpText && (
          <p className="text-gray-600 mb-6">{currentQuestion.helpText}</p>
        )}

        <div className="mb-8">
          {renderInput()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <div>
            {currentQuestion.required === false && currentStep < questions.length - 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Skip this question
              </button>
            )}
          </div>
          
          {/* Only show Continue button for non-select questions */}
          {currentQuestion.type !== 'select' && (
            <button
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                canProceed() && !isSubmitting
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : currentStep === questions.length - 1 ? (
                <>
                  Review & Generate Letter
                  <ArrowRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          )}
        </div>

        {/* Keyboard hint */}
        {currentQuestion.type !== 'select' && currentQuestion.type !== 'textarea' && canProceed() && (
          <p className="text-center text-sm text-gray-400 mt-4">
            Press <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-600">Enter</kbd> to continue
          </p>
        )}
      </main>
    </div>
  )
}

export default function QuestionnairePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    }>
      <QuestionnaireContent />
    </Suspense>
  )
}
