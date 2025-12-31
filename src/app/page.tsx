'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight, Shield, Clock, FileText, Star, Check, ArrowRight } from 'lucide-react'

// Consumer-friendly complaint types
const complaintTypes = [
  {
    id: 'pcp',
    title: 'Were you mis-sold car finance?',
    description: 'Hidden fees and secret commissions on PCP or HP deals',
    amount: '£1,000 - £3,000 back',
    icon: '🚗',
    time: '5 mins',
    hot: true,
  },
  {
    id: 'credit-card-affordability',
    title: 'Given a credit card you couldn\'t afford?',
    description: 'Limits increased without proper checks',
    amount: '£500 - £5,000 back',
    icon: '💳',
    time: '5 mins',
    hot: true,
  },
  {
    id: 'bank-fraud',
    title: 'Lost money to a scam? Bank won\'t help?',
    description: 'Get your money back after fraud',
    amount: '£500 - £10,000+ back',
    icon: '🚨',
    time: '6 mins',
    hot: false,
  },
  {
    id: 'unaffordable',
    title: 'Stuck with debt you should never have had?',
    description: 'Loans, overdrafts or credit they shouldn\'t have given you',
    amount: '£500 - £5,000 back',
    icon: '💷',
    time: '5 mins',
    hot: false,
  },
  {
    id: 'section75',
    title: 'Paid by card but never got what you paid for?',
    description: 'Company gone bust or goods never arrived',
    amount: '£100 - £30,000 back',
    icon: '🛡️',
    time: '5 mins',
    hot: false,
  },
  {
    id: 'other',
    title: 'Something else went wrong?',
    description: 'Banking, insurance, mortgages, pensions and more',
    amount: 'Varies',
    icon: '📝',
    time: '7 mins',
    hot: false,
  },
]

const faqs = [
  {
    q: 'How do I know if I have a claim?',
    a: 'If you feel you were treated unfairly by a bank, lender, or financial company - whether they gave you credit you couldn\'t afford, hid fees from you, or refused to help after fraud - you likely have grounds to complain. Our questionnaire will help you figure out if you have a case.',
  },
  {
    q: 'Is this free?',
    a: 'We charge £29 for your personalised complaint letter. Unlike claims companies who take 25-40% of your payout, you keep 100% of any compensation you receive.',
  },
  {
    q: 'What makes your letters better than a template?',
    a: 'Our AI analyses your specific situation and writes a letter tailored to your case, using the arguments and language that have been proven to work in 170,000+ complaint decisions. A generic template can\'t do that.',
  },
  {
    q: 'Do I need any documents?',
    a: 'Not necessarily. We can create your letter based on what you remember. But if you have your agreement, statements, or any letters from the company, uploading them helps us write an even stronger complaint.',
  },
  {
    q: 'What happens after I send my complaint?',
    a: 'The company has 8 weeks to respond. If they reject you or offer too little, you can escalate to the Financial Ombudsman Service (FOS) for free - we include an escalation letter too.',
  },
  {
    q: 'Are you a claims company?',
    a: 'No. We\'re a document preparation service. We help you write your complaint - you send it yourself and keep 100% of any money you get back. We don\'t take a cut of your compensation.',
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
            i<span className="text-blue-600">Complain</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900 text-sm">
              How it works
            </Link>
            <Link href="#complaints" className="text-gray-600 hover:text-gray-900 text-sm">
              What can I claim?
            </Link>
            <Link href="#faq" className="text-gray-600 hover:text-gray-900 text-sm">
              FAQ
            </Link>
          </nav>
          <Link
            href="#complaints"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
          >
            Check my claim
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            £8 billion car finance payout - are you owed?
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Been treated unfairly by<br />
            <span className="text-blue-600">a bank or lender?</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get the money you're owed. We help you write a professional complaint letter in minutes. 
            No legal jargon. No claims company taking a cut. Just results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="#complaints"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-medium transition-colors shadow-lg shadow-blue-600/25"
            >
              Check what I'm owed
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Takes 5 minutes. £29 flat fee. Keep 100% of your money.
          </p>
        </div>
      </section>

      {/* Trust badges */}
      <section className="py-8 px-4 border-b border-gray-100">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span>No win, no fee? No thanks - keep 100%</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>Letter ready in 5 minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Based on 170K+ real cases</span>
          </div>
        </div>
      </section>

      {/* The problem */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-50 rounded-3xl p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              Sound familiar?
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                '"I bought a car on finance and now I\'m hearing about hidden commissions"',
                '"My credit card limit kept going up even though I was struggling"',
                '"I got scammed and my bank is refusing to give my money back"',
                '"I was given a loan I clearly couldn\'t afford to repay"',
                '"I paid for something on my credit card and the company went bust"',
                '"I feel like I was taken advantage of but don\'t know where to start"',
              ].map((quote, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-xl">
                  <span className="text-blue-600 text-xl">→</span>
                  <p className="text-gray-700 italic">{quote}</p>
                </div>
              ))}
            </div>
            <p className="mt-8 text-gray-600">
              <strong className="text-gray-900">You're not alone.</strong> Millions of people have been treated unfairly by banks and lenders. 
              The good news? You can fight back - and we'll show you how.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4 bg-blue-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Here's how it works</h2>
          <p className="text-gray-600 text-center mb-12 max-w-xl mx-auto">
            No lawyers. No confusing forms. Just answer a few questions and we do the rest.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Tell us what happened</h3>
              <p className="text-gray-600">Answer simple questions about your situation. No jargon, just plain English.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <span className="text-3xl">✨</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">2. We write your letter</h3>
              <p className="text-gray-600">Our AI creates a professional complaint letter tailored to your case.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <span className="text-3xl">📬</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Send it and wait</h3>
              <p className="text-gray-600">Email your letter to the company. They have 8 weeks to respond.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Complaint types */}
      <section id="complaints" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">What happened to you?</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Pick the situation that sounds most like yours. Not sure? Choose "Something else" and we'll help you figure it out.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {complaintTypes.map((type) => (
              <Link
                key={type.id}
                href={`/questionnaire?type=${type.id}`}
                className="group bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-blue-500 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{type.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {type.title}
                      </h3>
                      <p className="text-sm text-gray-500">{type.description}</p>
                    </div>
                  </div>
                  {type.hot && (
                    <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap">
                      🔥 Millions owed
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500">
                      <span className="font-medium text-blue-600">{type.amount}</span>
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">{type.time}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why do it yourself?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Claims company */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="text-center mb-6">
                <span className="text-4xl">🦈</span>
                <h3 className="text-xl font-semibold text-gray-900 mt-2">Claims companies</h3>
              </div>
              <ul className="space-y-3">
                {[
                  'Take 25-40% of your payout',
                  'You could lose £1,000+ in fees',
                  'Often use the same template for everyone',
                  'Can take months to process',
                  'Endless phone calls and emails',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-600">
                    <span className="text-red-500 mt-1">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* iComplain */}
            <div className="bg-blue-600 rounded-2xl p-6 text-white">
              <div className="text-center mb-6">
                <span className="text-4xl">✨</span>
                <h3 className="text-xl font-semibold mt-2">iComplain</h3>
              </div>
              <ul className="space-y-3">
                {[
                  'One-off £29 fee, that\'s it',
                  'Keep 100% of your compensation',
                  'AI writes a letter specific to YOUR case',
                  'Ready in 5 minutes',
                  'You\'re in control the whole time',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-blue-200 mt-1">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-6 border-t border-blue-500">
                <p className="text-blue-100 text-sm">
                  <strong className="text-white">Example:</strong> On a £2,000 payout, a claims company takes £500-800. 
                  With us, you pay £29 and keep £2,000.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 md:p-12">
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <blockquote className="text-xl md:text-2xl text-gray-900 mb-6">
              "I had no idea I could claim for my car finance. The questionnaire was so easy - just asked me normal questions, 
              not legal stuff I don't understand. Got my letter, sent it off, and Black Horse paid me £2,400. 
              Best £29 I ever spent."
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                JT
              </div>
              <div>
                <div className="font-medium text-gray-900">James T.</div>
                <div className="text-sm text-gray-600">Car finance claim, Birmingham</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Common questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
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

      {/* Final CTA */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to get your money back?</h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            It takes 5 minutes. If you've been treated unfairly, you deserve to be compensated. 
            Let us help you fight back.
          </p>
          <Link
            href="#complaints"
            className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-medium hover:bg-blue-50 transition-colors"
          >
            Start my complaint
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-blue-200 text-sm mt-4">
            £29 flat fee • No percentage taken • FOS escalation included
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-gray-600 text-sm">
              © 2025 iComplain. Helping you fight back.
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
              <Link href="/terms" className="hover:text-gray-900">Terms</Link>
              <Link href="/contact" className="hover:text-gray-900">Contact</Link>
            </div>
          </div>
          <div className="mt-6 text-xs text-gray-400 text-center">
            iComplain is a document preparation service, not a law firm or claims management company. 
            We help you write your complaint - we don't provide legal advice or guarantee outcomes.
          </div>
        </div>
      </footer>
    </div>
  )
}
