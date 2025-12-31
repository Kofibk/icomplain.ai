'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight, Shield, Clock, FileText, Star, Check, ArrowRight } from 'lucide-react'

// Top 5 complaint types + Other
const complaintTypes = [
  {
    id: 'pcp',
    title: 'Car Finance (PCP/HP)',
    description: 'Hidden commission claims',
    amount: '£1,000 - £3,000',
    icon: '🚗',
    time: '5 mins',
    hot: true,
  },
  {
    id: 'credit-card-affordability',
    title: 'Credit Card Affordability',
    description: 'Unaffordable lending & limit increases',
    amount: '£500 - £5,000',
    icon: '💳',
    time: '5 mins',
    hot: true,
  },
  {
    id: 'bank-fraud',
    title: 'Bank Fraud Refund',
    description: 'Scam or unauthorised transaction',
    amount: '£500 - £10,000+',
    icon: '🚨',
    time: '6 mins',
    hot: false,
  },
  {
    id: 'unaffordable',
    title: 'Unaffordable Lending',
    description: 'Loans, overdrafts & credit you couldn\'t afford',
    amount: '£500 - £5,000',
    icon: '💷',
    time: '5 mins',
    hot: false,
  },
  {
    id: 'section75',
    title: 'Section 75',
    description: 'Credit card purchase protection',
    amount: '£100 - £30,000',
    icon: '🛡️',
    time: '5 mins',
    hot: false,
  },
  {
    id: 'other',
    title: 'Other Financial Complaint',
    description: 'Banking, insurance, mortgages, pensions & more',
    amount: 'Varies',
    icon: '📝',
    time: '7 mins',
    hot: false,
  },
]

const faqs = [
  {
    q: 'What is iComplain?',
    a: 'iComplain is an AI-powered tool that helps you write professional complaint letters for UK financial services issues. We cover everything from car finance and credit cards to banking, insurance, mortgages and pensions.',
  },
  {
    q: 'Is this legal advice?',
    a: 'No. iComplain is a document preparation service, not a legal or claims management service. We help you draft your complaint letter - you decide whether and how to use it.',
  },
  {
    q: 'How does the AI know what to write?',
    a: 'Our AI is trained on 170,000+ complaint decisions to understand which arguments and language lead to successful outcomes.',
  },
  {
    q: 'Why is this better than using a claims company?',
    a: 'Claims companies take 25-40% of your compensation. With iComplain, you pay £29 once and keep 100% of anything you receive. You stay in control of your own complaint.',
  },
  {
    q: 'What if my complaint isn\'t successful?',
    a: 'We can\'t guarantee outcomes, but our letters are designed to give you the best chance. If the company rejects your complaint, we can help you escalate to the Financial Ombudsman Service.',
  },
]

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">
            i<span className="text-green-600">Complain</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900 text-sm">
              How it works
            </Link>
            <Link href="#complaints" className="text-gray-600 hover:text-gray-900 text-sm">
              Complaint types
            </Link>
            <Link href="#faq" className="text-gray-600 hover:text-gray-900 text-sm">
              FAQ
            </Link>
          </nav>
          <Link
            href="#complaints"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
          >
            Start complaint
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Car finance claims now open
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Fight back against<br />
            <span className="text-green-600">unfair financial services</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            AI-powered complaint letters for UK consumers. From car finance and credit cards to banking, insurance and pensions. £29 flat fee. Keep 100% of your compensation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="#complaints"
              className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full text-lg font-medium transition-colors"
            >
              Start your complaint
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 border-y border-gray-100 bg-gray-50">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-gray-900">170K+</div>
            <div className="text-sm text-gray-600">Complaint decisions analysed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">£29</div>
            <div className="text-sm text-gray-600">Flat fee, no percentage</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">5 mins</div>
            <div className="text-sm text-gray-600">Average completion time</div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Tell us what happened</h3>
              <p className="text-gray-600">Answer a few questions or upload your documents. Our AI extracts the key details.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">2. AI generates your letter</h3>
              <p className="text-gray-600">We create a professional complaint letter using arguments that work.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Send and track</h3>
              <p className="text-gray-600">Download your letter, send it to the company, and await their response.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Complaint types */}
      <section id="complaints" className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">What's your complaint about?</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Select your complaint type below. We cover all UK financial services including consumer credit, banking, insurance, mortgages and pensions.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {complaintTypes.map((type) => (
              <Link
                key={type.id}
                href={`/questionnaire?type=${type.id}`}
                className="group bg-white border border-gray-200 rounded-2xl p-6 hover:border-green-500 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{type.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                        {type.title}
                      </h3>
                      <p className="text-sm text-gray-500">{type.description}</p>
                    </div>
                  </div>
                  {type.hot && (
                    <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded-full">
                      🔥 Hot
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500">
                      <span className="font-medium text-gray-900">{type.amount}</span> typical
                    </span>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-500">{type.time}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-green-50 rounded-3xl p-8 md:p-12">
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <blockquote className="text-xl md:text-2xl text-gray-900 mb-6">
              "I was quoted £800+ by a claims company. Used iComplain for £29 and got £2,400 back from my car finance. 
              The letter was professional and covered everything. So easy."
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                JT
              </div>
              <div>
                <div className="font-medium text-gray-900">James T.</div>
                <div className="text-sm text-gray-600">PCP Commission Claim</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why choose iComplain?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: 'Keep 100% of your compensation', desc: 'No success fees. No hidden charges. Just £29 flat.' },
              { title: 'All financial services covered', desc: 'Consumer credit, Section 75, banking, insurance, mortgages, pensions and more.' },
              { title: 'Trained on real outcomes', desc: 'Our AI analyses 170,000+ complaint decisions to craft effective letters.' },
              { title: 'Ready in minutes', desc: 'Answer a few questions, upload documents if you have them, get your letter.' },
              { title: 'You stay in control', desc: 'We prepare the letter. You decide if and when to send it.' },
              { title: 'FOS escalation ready', desc: 'If they reject your complaint, we can help you escalate to the Ombudsman.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Frequently asked questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-gray-600">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-green-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to make your complaint?</h2>
          <p className="text-green-100 mb-8 max-w-xl mx-auto">
            Join thousands of consumers fighting back against unfair financial services. 
            £29 flat fee. No percentage of your compensation.
          </p>
          <Link
            href="#complaints"
            className="inline-flex items-center justify-center gap-2 bg-white text-green-600 px-8 py-4 rounded-full text-lg font-medium hover:bg-green-50 transition-colors"
          >
            Start your complaint
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-gray-600 text-sm">
              © 2025 iComplain. Document preparation service.
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
              <Link href="/terms" className="hover:text-gray-900">Terms</Link>
              <Link href="/contact" className="hover:text-gray-900">Contact</Link>
            </div>
          </div>
          <div className="mt-6 text-xs text-gray-400 text-center">
            iComplain is a document preparation service. We are not a law firm, claims management company, or financial adviser. 
            We do not provide legal or financial advice. The information provided should not be considered a substitute for professional advice.
          </div>
        </div>
      </footer>
    </div>
  )
}
