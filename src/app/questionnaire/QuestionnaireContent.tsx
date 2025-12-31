'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'
import AutocompleteInput from '@/components/AutocompleteInput'
import { 
  searchLenders, 
  searchCarMakes,
  UK_CAR_FINANCE_LENDERS,
  UK_CREDIT_CARD_PROVIDERS,
  UK_LOAN_PROVIDERS,
  UK_HOLIDAY_PARK_COMPANIES 
} from '@/lib/data/lenders'

// Question types
interface Question {
  id: string
  question: string
  type: 'text' | 'select' | 'autocomplete' | 'date' | 'currency' | 'textarea' | 'email' | 'tel'
  placeholder?: string
  options?: string[]
  autocompleteType?: 'car' | 'credit' | 'loan' | 'holiday' | 'carMake'
  required?: boolean
  helpText?: string
}

// Questions per complaint type
const QUESTIONS: Record<string, Question[]> = {
  pcp: [
    {
      id: 'lender',
      question: 'Who provided your car finance?',
      type: 'autocomplete',
      autocompleteType: 'car',
      placeholder: 'Search for your lender...',
      required: true,
      helpText: 'Start typing the name of your finance company',
    },
    {
      id: 'car_make',
      question: 'What make of car was it?',
      type: 'autocomplete',
      autocompleteType: 'carMake',
      placeholder: 'Search for car make...',
      required: true,
    },
    {
      id: 'car_model',
      question: 'What model?',
      type: 'text',
      placeholder: 'e.g. Focus, Golf, A3',
      required: true,
    },
    {
      id: 'purchase_date',
      question: 'When did you take out the finance?',
      type: 'date',
      required: true,
      helpText: 'Approximate date is fine',
    },
    {
      id: 'finance_amount',
      question: 'How much was the total finance amount?',
      type: 'currency',
      placeholder: '15000',
      required: true,
      helpText: 'The total amount borrowed, not the car price',
    },
    {
      id: 'dealer_name',
      question: 'Which dealership sold you the car?',
      type: 'text',
      placeholder: 'e.g. Evans Halshaw Birmingham',
      required: true,
    },
    {
      id: 'commission_disclosed',
      question: 'Were you told about any commission the dealer would receive?',
      type: 'select',
      options: ['No, not at all', 'Mentioned briefly but not the amount', 'Yes, fully disclosed', 'I can\'t remember'],
      required: true,
    },
    {
      id: 'interest_rate',
      question: 'Do you know what interest rate (APR) you were charged?',
      type: 'text',
      placeholder: 'e.g. 9.9% or "I don\'t know"',
      required: false,
    },
    {
      id: 'still_paying',
      question: 'Are you still paying this finance?',
      type: 'select',
      options: ['Yes, still paying', 'No, paid off', 'No, returned the car'],
      required: true,
    },
    {
      id: 'additional_info',
      question: 'Anything else relevant to your complaint?',
      type: 'textarea',
      placeholder: 'Optional - any other details that might help',
      required: false,
    },
  ],
  section75: [
    {
      id: 'card_provider',
      question: 'Which credit card did you use?',
      type: 'autocomplete',
      autocompleteType: 'credit',
      placeholder: 'Search for your card provider...',
      required: true,
    },
    {
      id: 'purchase_description',
      question: 'What did you buy?',
      type: 'text',
      placeholder: 'e.g. Holiday package, Furniture, Electronics',
      required: true,
    },
    {
      id: 'merchant_name',
      question: 'Who did you buy from?',
      type: 'text',
      placeholder: 'Company or seller name',
      required: true,
    },
    {
      id: 'purchase_date',
      question: 'When did you make the purchase?',
      type: 'date',
      required: true,
    },
    {
      id: 'amount_paid',
      question: 'How much did you pay in total?',
      type: 'currency',
      placeholder: '500',
      required: true,
    },
    {
      id: 'card_amount',
      question: 'How much of that was on your credit card?',
      type: 'currency',
      placeholder: '500',
      required: true,
      helpText: 'Must be between £100 and £30,000 for Section 75',
    },
    {
      id: 'problem_type',
      question: 'What went wrong?',
      type: 'select',
      options: [
        'Goods never delivered',
        'Goods faulty or not as described',
        'Service not provided',
        'Company went bust',
        'Misrepresentation (told something untrue)',
        'Other',
      ],
      required: true,
    },
    {
      id: 'problem_description',
      question: 'Describe what happened',
      type: 'textarea',
      placeholder: 'Tell us what went wrong and when you noticed the problem',
      required: true,
    },
    {
      id: 'contacted_merchant',
      question: 'Have you tried to resolve this with the seller?',
      type: 'select',
      options: ['Yes, no response', 'Yes, they refused', 'Yes, they went bust', 'No'],
      required: true,
    },
    {
      id: 'amount_claiming',
      question: 'How much are you claiming?',
      type: 'currency',
      placeholder: '500',
      required: true,
    },
  ],
  unaffordable: [
    {
      id: 'lender',
      question: 'Who lent you the money?',
      type: 'autocomplete',
      autocompleteType: 'loan',
      placeholder: 'Search for your lender...',
      required: true,
    },
    {
      id: 'product_type',
      question: 'What type of credit was it?',
      type: 'select',
      options: ['Credit card', 'Personal loan', 'Car finance', 'Overdraft', 'Catalogue credit', 'Payday loan', 'Guarantor loan', 'Other'],
      required: true,
    },
    {
      id: 'start_date',
      question: 'When did you take out this credit?',
      type: 'date',
      required: true,
    },
    {
      id: 'credit_amount',
      question: 'What was the credit limit or loan amount?',
      type: 'currency',
      placeholder: '5000',
      required: true,
    },
    {
      id: 'income_at_time',
      question: 'What was your approximate monthly income then?',
      type: 'currency',
      placeholder: '1500',
      required: true,
    },
    {
      id: 'existing_debt',
      question: 'Did you have other debts at the time?',
      type: 'select',
      options: ['Yes, significant debts', 'Yes, some debts', 'No major debts', 'Can\'t remember'],
      required: true,
    },
    {
      id: 'affordability_checks',
      question: 'What checks did the lender do?',
      type: 'select',
      options: ['None that I know of', 'Basic credit check only', 'Asked about income', 'Thorough checks', 'Can\'t remember'],
      required: true,
    },
    {
      id: 'financial_difficulty',
      question: 'Did this credit cause you financial difficulty?',
      type: 'select',
      options: ['Yes, serious difficulty', 'Yes, some difficulty', 'It contributed to existing problems', 'No'],
      required: true,
    },
    {
      id: 'difficulty_description',
      question: 'Describe how this credit affected you',
      type: 'textarea',
      placeholder: 'e.g. missed payments, debt spiral, stress, had to borrow more',
      required: true,
    },
    {
      id: 'current_status',
      question: 'What\'s the current status?',
      type: 'select',
      options: ['Still paying', 'Paid off', 'Defaulted', 'In debt management plan', 'Written off'],
      required: true,
    },
  ],
  'holiday-park': [
    {
      id: 'company',
      question: 'Which company sold you the timeshare or holiday membership?',
      type: 'autocomplete',
      autocompleteType: 'holiday',
      placeholder: 'Search for company...',
      required: true,
    },
    {
      id: 'product_type',
      question: 'What did you buy?',
      type: 'select',
      options: ['Timeshare week(s)', 'Holiday club membership', 'Points-based scheme', 'Static caravan', 'Lodge ownership', 'Other'],
      required: true,
    },
    {
      id: 'purchase_date',
      question: 'When did you buy it?',
      type: 'date',
      required: true,
    },
    {
      id: 'purchase_price',
      question: 'How much did you pay?',
      type: 'currency',
      placeholder: '10000',
      required: true,
    },
    {
      id: 'payment_method',
      question: 'How did you pay?',
      type: 'select',
      options: ['Credit card', 'Finance/loan', 'Cash/bank transfer', 'Combination'],
      required: true,
    },
    {
      id: 'sales_presentation',
      question: 'Were you invited to a sales presentation?',
      type: 'select',
      options: ['Yes, lengthy presentation (2+ hours)', 'Yes, short presentation', 'No presentation', 'Can\'t remember'],
      required: true,
    },
    {
      id: 'pressure_tactics',
      question: 'Did you feel pressured to buy?',
      type: 'select',
      options: ['Yes, strong pressure', 'Yes, some pressure', 'No pressure', 'Not sure'],
      required: true,
    },
    {
      id: 'promises_made',
      question: 'What were you promised?',
      type: 'textarea',
      placeholder: 'e.g. rental income, exchange availability, investment value, discounts',
      required: true,
    },
    {
      id: 'problems_experienced',
      question: 'What problems have you experienced?',
      type: 'textarea',
      placeholder: 'e.g. can\'t book, fees increased, no rental income, can\'t exit',
      required: true,
    },
  ],
}

// Personal details questions (same for all types)
const PERSONAL_QUESTIONS: Question[] = [
  {
    id: 'full_name',
    question: 'What\'s your full name?',
    type: 'text',
    placeholder: 'As it appears on your documents',
    required: true,
  },
  {
    id: 'email',
    question: 'What\'s your email address?',
    type: 'email',
    placeholder: 'you@example.com',
    required: true,
    helpText: 'We\'ll send your complaint letter here',
  },
  {
    id: 'phone',
    question: 'What\'s your phone number?',
    type: 'tel',
    placeholder: '07xxx xxxxxx',
    required: false,
    helpText: 'Optional - only if you want the lender to call you',
  },
  {
    id: 'address',
    question: 'What\'s your address?',
    type: 'textarea',
    placeholder: '123 Example Street\nCity\nPostcode',
    required: true,
  },
]

export default function QuestionnaireContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const complaintType = searchParams.get('type') || 'pcp'
  
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Get questions for this complaint type
  const complaintQuestions = QUESTIONS[complaintType] || QUESTIONS.pcp
  const allQuestions = [...complaintQuestions, ...PERSONAL_QUESTIONS]
  const totalSteps = allQuestions.length
  
  const currentQuestion = allQuestions[currentStep]
  const progress = ((currentStep + 1) / totalSteps) * 100
  
  const isInPersonalDetails = currentStep >= complaintQuestions.length
  const sectionLabel = isInPersonalDetails ? 'Your details' : 'About your complaint'

  // Autocomplete search function
  const getSearchFunction = useCallback((type?: string) => {
    switch (type) {
      case 'car':
        return (q: string) => searchLenders(q, 'car')
      case 'credit':
        return (q: string) => searchLenders(q, 'credit')
      case 'loan':
        return (q: string) => searchLenders(q, 'loan')
      case 'holiday':
        return (q: string) => searchLenders(q, 'holiday')
      case 'carMake':
        return searchCarMakes
      default:
        return () => []
    }
  }, [])

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }))
  }

  const canProceed = () => {
    if (!currentQuestion.required) return true
    const answer = answers[currentQuestion.id]
    return answer && answer.trim().length > 0
  }

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
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
    
    // For testing - skip payment and go straight to generation
    // Store answers in session storage
    sessionStorage.setItem('complaintAnswers', JSON.stringify(answers))
    sessionStorage.setItem('complaintType', complaintType)
    
    // Go to download page for testing
    router.push('/download?test=true')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canProceed() && currentQuestion.type !== 'textarea') {
      e.preventDefault()
      handleNext()
    }
  }

  // Render the appropriate input based on question type
  const renderInput = () => {
    const value = answers[currentQuestion.id] || ''

    switch (currentQuestion.type) {
      case 'autocomplete':
        return (
          <AutocompleteInput
            value={value}
            onChange={handleAnswer}
            suggestions={[]}
            onSearch={getSearchFunction(currentQuestion.autocompleteType)}
            placeholder={currentQuestion.placeholder}
            required={currentQuestion.required}
          />
        )

      case 'select':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  handleAnswer(option)
                  // Auto-advance for select questions
                  setTimeout(() => handleNext(), 300)
                }}
                className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all ${
                  value === option
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center justify-between">
                  <span className="text-gray-900">{option}</span>
                  {value === option && <Check className="w-5 h-5 text-gray-900" />}
                </span>
              </button>
            ))}
          </div>
        )

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder={currentQuestion.placeholder}
            className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-gray-900 outline-none transition-all resize-none bg-gray-50 focus:bg-white"
            rows={4}
            required={currentQuestion.required}
          />
        )

      case 'currency':
        return (
          <div className="relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 text-lg">£</span>
            <input
              type="number"
              value={value}
              onChange={(e) => handleAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={currentQuestion.placeholder}
              className="w-full pl-10 pr-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-gray-900 outline-none transition-all bg-gray-50 focus:bg-white text-lg"
              required={currentQuestion.required}
            />
          </div>
        )

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-gray-900 outline-none transition-all bg-gray-50 focus:bg-white text-lg"
            required={currentQuestion.required}
          />
        )

      case 'email':
        return (
          <input
            type="email"
            value={value}
            onChange={(e) => handleAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={currentQuestion.placeholder}
            className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-gray-900 outline-none transition-all bg-gray-50 focus:bg-white text-lg"
            required={currentQuestion.required}
          />
        )

      case 'tel':
        return (
          <input
            type="tel"
            value={value}
            onChange={(e) => handleAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={currentQuestion.placeholder}
            className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-gray-900 outline-none transition-all bg-gray-50 focus:bg-white text-lg"
            required={currentQuestion.required}
          />
        )

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={currentQuestion.placeholder}
            className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-gray-900 outline-none transition-all bg-gray-50 focus:bg-white text-lg"
            required={currentQuestion.required}
            autoFocus
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={currentStep === 0 ? () => router.push('/') : handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          
          <span className="text-sm text-gray-500">
            {currentStep + 1} of {totalSteps}
          </span>
          
          <Link href="/" className="text-gray-400 hover:text-gray-600">
            Exit
          </Link>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div 
            className="h-full bg-gray-900 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-32 px-4">
        <div className="max-w-xl mx-auto">
          {/* Section label */}
          <p className="text-sm text-gray-500 mb-2">{sectionLabel}</p>
          
          {/* Question */}
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-8">
            {currentQuestion.question}
          </h1>

          {/* Help text */}
          {currentQuestion.helpText && (
            <p className="text-gray-500 mb-6 -mt-4">
              {currentQuestion.helpText}
            </p>
          )}

          {/* Input */}
          <div className="mb-8">
            {renderInput()}
          </div>
        </div>
      </main>

      {/* Footer with Continue button */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4">
        <div className="max-w-xl mx-auto">
          <button
            onClick={handleNext}
            disabled={!canProceed() || isSubmitting}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-medium transition-all ${
              canProceed() && !isSubmitting
                ? 'bg-gray-900 text-white hover:bg-gray-800'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating your letter...
              </>
            ) : currentStep === totalSteps - 1 ? (
              <>
                Generate complaint letter
                <ArrowRight className="w-5 h-5" />
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
          
          {currentQuestion.type !== 'select' && !currentQuestion.required && (
            <button
              onClick={handleNext}
              className="w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-3"
            >
              Skip this question
            </button>
          )}
        </div>
      </footer>
    </div>
  )
}
