'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from 'lucide-react'

// Question definitions for each complaint type
const questionSets: Record<string, QuestionSet> = {
  pcp: {
    title: 'PCP / Motor Finance Complaint',
    description: 'Let\'s gather the details about your car finance agreement.',
    questions: [
      {
        id: 'vehicle_type',
        question: 'What type of vehicle did you finance?',
        type: 'select',
        options: ['Car', 'Van', 'Motorbike', 'Campervan', 'Other'],
        required: true,
      },
      {
        id: 'finance_type',
        question: 'What type of finance agreement did you have?',
        type: 'select',
        options: ['PCP (Personal Contract Purchase)', 'HP (Hire Purchase)', 'Conditional Sale', 'Not sure'],
        required: true,
      },
      {
        id: 'lender_name',
        question: 'Who was your finance provider (lender)?',
        type: 'text',
        placeholder: 'e.g. Black Horse, Santander Consumer Finance, Close Brothers',
        required: true,
      },
      {
        id: 'dealer_name',
        question: 'Which dealership arranged the finance?',
        type: 'text',
        placeholder: 'e.g. Arnold Clark, Evans Halshaw',
        required: true,
      },
      {
        id: 'agreement_date',
        question: 'When did you sign the finance agreement?',
        type: 'date',
        required: true,
        helpText: 'Agreements between April 2007 and November 2024 may be eligible.',
      },
      {
        id: 'finance_amount',
        question: 'What was the total amount financed (approximately)?',
        type: 'currency',
        placeholder: '15000',
        required: true,
      },
      {
        id: 'commission_disclosed',
        question: 'Were you told about any commission the dealer would receive from the lender?',
        type: 'select',
        options: ['No, I was not told about any commission', 'Yes, commission was mentioned', 'I don\'t remember', 'Not sure'],
        required: true,
      },
      {
        id: 'interest_rate_explained',
        question: 'Was the interest rate fully explained to you?',
        type: 'select',
        options: ['No, I wasn\'t given details about how the rate was set', 'Yes, the rate was explained clearly', 'I don\'t remember'],
        required: true,
      },
      {
        id: 'agreement_status',
        question: 'What is the current status of this agreement?',
        type: 'select',
        options: ['Fully paid off', 'Still paying', 'Settled early', 'Vehicle returned', 'Vehicle repossessed'],
        required: true,
      },
      {
        id: 'additional_details',
        question: 'Is there anything else relevant to your complaint?',
        type: 'textarea',
        placeholder: 'Any additional details about how the finance was sold to you...',
        required: false,
      },
    ],
  },
  section75: {
    title: 'Section 75 Credit Card Claim',
    description: 'Let\'s gather the details about your credit card purchase.',
    questions: [
      {
        id: 'card_provider',
        question: 'Which credit card provider did you use?',
        type: 'text',
        placeholder: 'e.g. Barclaycard, HSBC, Lloyds',
        required: true,
      },
      {
        id: 'purchase_description',
        question: 'What did you purchase?',
        type: 'textarea',
        placeholder: 'Describe what you bought (e.g. holiday, furniture, electronics)',
        required: true,
      },
      {
        id: 'merchant_name',
        question: 'Who did you buy it from?',
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
        id: 'total_cost',
        question: 'What was the total cost of the purchase?',
        type: 'currency',
        placeholder: '500',
        required: true,
        helpText: 'Must be between £100 and £30,000 to qualify for Section 75.',
      },
      {
        id: 'amount_on_card',
        question: 'How much did you pay on the credit card?',
        type: 'currency',
        placeholder: '100',
        required: true,
        helpText: 'Even if you only paid a deposit on the card, you may still be covered.',
      },
      {
        id: 'problem_type',
        question: 'What went wrong?',
        type: 'select',
        options: [
          'Goods never delivered',
          'Goods faulty or damaged',
          'Goods not as described',
          'Service not provided',
          'Company went bust',
          'Other breach of contract',
        ],
        required: true,
      },
      {
        id: 'problem_description',
        question: 'Please describe the problem in detail:',
        type: 'textarea',
        placeholder: 'What happened? When did you discover the problem?',
        required: true,
      },
      {
        id: 'contacted_merchant',
        question: 'Have you tried to resolve this with the merchant?',
        type: 'select',
        options: ['Yes, but they refused to help', 'Yes, but they didn\'t respond', 'No, they\'ve gone out of business', 'No, I haven\'t contacted them yet'],
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
  },
  unaffordable: {
    title: 'Unaffordable Lending Complaint',
    description: 'Let\'s gather details about the credit that was unaffordable for you.',
    questions: [
      {
        id: 'credit_type',
        question: 'What type of credit is this complaint about?',
        type: 'select',
        options: ['Credit card', 'Personal loan', 'Overdraft', 'Store card', 'Catalogue credit', 'Payday loan', 'Other'],
        required: true,
      },
      {
        id: 'lender_name',
        question: 'Who is the lender?',
        type: 'text',
        placeholder: 'e.g. Barclays, Capital One, Very',
        required: true,
      },
      {
        id: 'account_opened',
        question: 'When was the account opened?',
        type: 'date',
        required: true,
      },
      {
        id: 'credit_limit_or_amount',
        question: 'What was the credit limit or loan amount?',
        type: 'currency',
        placeholder: '5000',
        required: true,
      },
      {
        id: 'income_at_time',
        question: 'What was your approximate annual income when you applied?',
        type: 'currency',
        placeholder: '25000',
        required: true,
      },
      {
        id: 'affordability_checks',
        question: 'What affordability checks did the lender do?',
        type: 'select',
        options: [
          'None that I\'m aware of',
          'They asked about income but didn\'t verify',
          'They did a credit check only',
          'They asked for bank statements',
          'I don\'t remember',
        ],
        required: true,
      },
      {
        id: 'financial_situation',
        question: 'What was your financial situation when you applied?',
        type: 'multiselect',
        options: [
          'Had other debts',
          'Was struggling to pay bills',
          'Had defaults on credit file',
          'Was using credit to pay credit',
          'Had gambling issues',
          'Was on benefits',
          'Had recently lost job',
          'None of the above',
        ],
        required: true,
      },
      {
        id: 'limit_increases',
        question: 'Did the lender increase your credit limit?',
        type: 'select',
        options: ['Yes, multiple times', 'Yes, once', 'No'],
        required: true,
      },
      {
        id: 'persistent_debt',
        question: 'Were you in persistent debt (paying mostly interest)?',
        type: 'select',
        options: ['Yes, for over 18 months', 'Yes, for some time', 'No', 'Not sure'],
        required: true,
      },
      {
        id: 'harm_caused',
        question: 'How did this unaffordable lending affect you?',
        type: 'textarea',
        placeholder: 'Describe the impact on your finances and wellbeing...',
        required: true,
      },
    ],
  },
  'holiday-park': {
    title: 'Holiday Park Mis-selling Complaint',
    description: 'Let\'s gather details about your holiday park purchase.',
    questions: [
      {
        id: 'park_name',
        question: 'Which holiday park is this complaint about?',
        type: 'text',
        placeholder: 'e.g. Haven, Parkdean Resorts, Away Resorts',
        required: true,
      },
      {
        id: 'purchase_type',
        question: 'What did you purchase?',
        type: 'select',
        options: ['Static caravan', 'Lodge', 'Chalet', 'Other'],
        required: true,
      },
      {
        id: 'purchase_date',
        question: 'When did you make the purchase?',
        type: 'date',
        required: true,
      },
      {
        id: 'purchase_price',
        question: 'What was the purchase price?',
        type: 'currency',
        placeholder: '50000',
        required: true,
      },
      {
        id: 'finance_used',
        question: 'How did you pay?',
        type: 'select',
        options: ['Cash/savings', 'Finance arranged by park', 'Personal loan', 'Credit card', 'Combination'],
        required: true,
      },
      {
        id: 'promises_made',
        question: 'What promises were made during the sale?',
        type: 'multiselect',
        options: [
          'Rental income would cover costs',
          'Unit would hold its value',
          'Could live there year-round',
          'Fees would stay the same',
          'Easy to sell later',
          'Good investment',
          'Other promises',
        ],
        required: true,
      },
      {
        id: 'actual_experience',
        question: 'What actually happened?',
        type: 'multiselect',
        options: [
          'Rental income much lower than promised',
          'Significant depreciation',
          'Cannot live there year-round',
          'Fees increased substantially',
          'Difficult/impossible to sell',
          'Hidden charges discovered',
          'Forced to use expensive park services',
          'Other issues',
        ],
        required: true,
      },
      {
        id: 'financial_loss',
        question: 'What is your estimated financial loss?',
        type: 'currency',
        placeholder: '20000',
        required: true,
      },
      {
        id: 'detailed_complaint',
        question: 'Please describe your experience in detail:',
        type: 'textarea',
        placeholder: 'What were you told? What happened? Include specific examples...',
        required: true,
      },
    ],
  },
}

// Personal details questions (same for all complaint types)
const personalDetailsQuestions = [
  {
    id: 'full_name',
    question: 'Your full name',
    type: 'text',
    placeholder: 'As it appears on your agreement/account',
    required: true,
  },
  {
    id: 'address',
    question: 'Your current address',
    type: 'textarea',
    placeholder: 'Full address including postcode',
    required: true,
  },
  {
    id: 'email',
    question: 'Your email address',
    type: 'email',
    placeholder: 'you@example.com',
    required: true,
  },
  {
    id: 'phone',
    question: 'Your phone number',
    type: 'tel',
    placeholder: '07xxx xxxxxx',
    required: false,
  },
  {
    id: 'account_reference',
    question: 'Account/Agreement reference number (if known)',
    type: 'text',
    placeholder: 'Found on statements or agreement',
    required: false,
  },
]

interface Question {
  id: string
  question: string
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'date' | 'currency' | 'email' | 'tel'
  placeholder?: string
  options?: string[]
  required: boolean
  helpText?: string
}

interface QuestionSet {
  title: string
  description: string
  questions: Question[]
}

export default function QuestionnaireContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const complaintType = searchParams.get('type') || 'pcp'
  
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const questionSet = questionSets[complaintType] || questionSets.pcp
  const allQuestions = [...questionSet.questions, ...personalDetailsQuestions]
  const currentQuestion = allQuestions[currentStep]
  const totalSteps = allQuestions.length
  const progress = ((currentStep + 1) / totalSteps) * 100
  
  const isLastStep = currentStep === totalSteps - 1
  const isPersonalDetailsSection = currentStep >= questionSet.questions.length
  
  const handleAnswer = (value: any) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value,
    }))
  }
  
  const canProceed = () => {
    if (!currentQuestion.required) return true
    const answer = answers[currentQuestion.id]
    if (Array.isArray(answer)) return answer.length > 0
    return answer && answer.toString().trim() !== ''
  }
  
  const handleNext = async () => {
    if (!canProceed()) return
    
    if (isLastStep) {
      // Submit and go to payment
      setIsSubmitting(true)
      try {
        const response = await fetch('/api/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            complaintType,
            answers,
          }),
        })
        
        const data = await response.json()
        if (data.checkoutUrl) {
          // Store answers in session storage for after payment
          sessionStorage.setItem('complaintData', JSON.stringify({
            complaintType,
            answers,
            sessionId: data.sessionId,
          }))
          window.location.href = data.checkoutUrl
        }
      } catch (error) {
        console.error('Error creating checkout:', error)
        alert('Something went wrong. Please try again.')
      } finally {
        setIsSubmitting(false)
      }
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }
  
  const renderInput = () => {
    const value = answers[currentQuestion.id] || ''
    
    switch (currentQuestion.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <input
            type={currentQuestion.type}
            className="input text-lg"
            placeholder={currentQuestion.placeholder}
            value={value}
            onChange={(e) => handleAnswer(e.target.value)}
            autoFocus
          />
        )
      
      case 'textarea':
        return (
          <textarea
            className="input text-lg min-h-[150px]"
            placeholder={currentQuestion.placeholder}
            value={value}
            onChange={(e) => handleAnswer(e.target.value)}
            autoFocus
          />
        )
      
      case 'select':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => (
              <button
                key={option}
                type="button"
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  value === option
                    ? 'border-brand-600 bg-brand-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleAnswer(option)}
              >
                <span className="flex items-center gap-3">
                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    value === option ? 'border-brand-600' : 'border-gray-300'
                  }`}>
                    {value === option && (
                      <span className="w-3 h-3 rounded-full bg-brand-600" />
                    )}
                  </span>
                  {option}
                </span>
              </button>
            ))}
          </div>
        )
      
      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : []
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => (
              <button
                key={option}
                type="button"
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedValues.includes(option)
                    ? 'border-brand-600 bg-brand-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  const newValues = selectedValues.includes(option)
                    ? selectedValues.filter(v => v !== option)
                    : [...selectedValues, option]
                  handleAnswer(newValues)
                }}
              >
                <span className="flex items-center gap-3">
                  <span className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    selectedValues.includes(option) ? 'border-brand-600 bg-brand-600' : 'border-gray-300'
                  }`}>
                    {selectedValues.includes(option) && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </span>
                  {option}
                </span>
              </button>
            ))}
            <p className="text-sm text-gray-500">Select all that apply</p>
          </div>
        )
      
      case 'date':
        return (
          <input
            type="date"
            className="input text-lg"
            value={value}
            onChange={(e) => handleAnswer(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            autoFocus
          />
        )
      
      case 'currency':
        return (
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">£</span>
            <input
              type="number"
              className="input text-lg pl-8"
              placeholder={currentQuestion.placeholder}
              value={value}
              onChange={(e) => handleAnswer(e.target.value)}
              min="0"
              step="1"
              autoFocus
            />
          </div>
        )
      
      default:
        return null
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Home</span>
            </button>
            <span className="text-sm text-gray-500">
              Step {currentStep + 1} of {totalSteps}
            </span>
          </div>
        </div>
      </header>
      
      {/* Progress bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto">
          <div className="h-1 bg-gray-200">
            <div
              className="h-1 bg-brand-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Section header */}
        {currentStep === 0 && (
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {questionSet.title}
            </h1>
            <p className="text-gray-600">{questionSet.description}</p>
          </div>
        )}
        
        {isPersonalDetailsSection && currentStep === questionSet.questions.length && (
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your Details
            </h2>
            <p className="text-gray-600">
              We need a few details to personalise your complaint letter.
            </p>
          </div>
        )}
        
        {/* Question card */}
        <div className="card">
          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-900 mb-2">
              {currentQuestion.question}
              {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {currentQuestion.helpText && (
              <p className="text-sm text-gray-500 mb-4">{currentQuestion.helpText}</p>
            )}
          </div>
          
          {renderInput()}
        </div>
        
        {/* Navigation buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              currentStep === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          
          <button
            onClick={handleNext}
            disabled={!canProceed() || isSubmitting}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              canProceed() && !isSubmitting
                ? 'bg-brand-600 text-white hover:bg-brand-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : isLastStep ? (
              <>
                Continue to Payment
                <ArrowRight className="w-5 h-5" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </main>
      
      {/* Footer disclaimer */}
      <footer className="max-w-3xl mx-auto px-4 py-8 text-center">
        <p className="text-xs text-gray-500">
          This is a document preparation service, not legal advice.
          We help you write your complaint letter - we do not submit it for you or act on your behalf.
        </p>
      </footer>
    </div>
  )
}
