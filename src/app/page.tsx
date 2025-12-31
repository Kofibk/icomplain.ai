'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, Check, Shield, Clock, ChevronDown, Star } from 'lucide-react'

const complaintTypes = [
  {
    id: 'pcp',
    title: 'Car Finance (PCP)',
    description: 'Hidden commission claims',
    amount: '£700 - £4,000',
    icon: '🚗',
    time: '8 mins',
  },
  {
    id: 'section75',
    title: 'Credit Card',
    description: 'Section 75 claims',
    amount: '£100 - £30,000',
    icon: '💳',
    time: '6 mins',
  },
  {
    id: 'unaffordable',
    title: 'Unaffordable Lending',
    description: 'Loans & credit you couldn\'t afford',
    amount: '£500 - £10,000',
    icon: '📊',
    time: '7 mins',
  },
  {
    id: 'holiday-park',
    title: 'Holiday Park',
    description: 'Timeshare & holiday park mis-selling',
    amount: '£2,000 - £50,000',
    icon: '🏕️',
    time: '10 mins',
  },
]

const steps = [
  { num: '1', title: 'Answer questions', desc: 'About your complaint' },
  { num: '2', title: 'AI writes letter', desc: 'Professional & effective' },
  { num: '3', title: 'Send it yourself', desc: 'Keep 100% of compensation' },
]

const faqs = [
  {
    q: 'Is this a claims company?',
    a: 'No. We\'re a document preparation service. You send the letter yourself and keep 100% of any compensation. Claims companies take 25-40%.',
  },
  {
    q: 'How does the AI know what to write?',
    a: 'Our AI is trained on Financial Ombudsman decisions. It knows the exact arguments and language that lead to successful complaints.',
  },
  {
    q: 'What if my complaint is rejected?',
    a: 'You can escalate to the Financial Ombudsman Service for free. We can generate an escalation letter for £19.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. We use bank-level encryption and delete your data after 30 days.',
  },
]

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-xl font-semibold text-gray-900">ComplaintAI</span>
          <div className="flex items-center gap-6">
            <a href="#how" className="text-sm text-gray-600 hover:text-gray-900 hidden sm:block">How it works</a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 hidden sm:block">Pricing</a>
            <Link 
              href="/questionnaire" 
              className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
            >
              Start claim
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-sm font-medium px-4 py-2 rounded-full mb-8">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            170,000+ FOS decisions analysed
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-gray-900 tracking-tight mb-6">
            Get the compensation you're owed
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
            AI-powered complaint letters that use the exact language the Financial Ombudsman responds to. Ready in minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link 
              href="/questionnaire" 
              className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white font-medium px-8 py-4 rounded-full hover:bg-gray-800 transition-all hover:scale-105"
            >
              Start your complaint
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              No account needed
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              From £29
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              Keep 100%
            </span>
          </div>
        </div>
      </section>

      {/* Complaint Types */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 text-center mb-4">
            What's your complaint about?
          </h2>
          <p className="text-gray-500 text-center mb-10">
            Select your complaint type to get started
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {complaintTypes.map((type) => (
              <Link
                key={type.id}
                href={`/questionnaire?type=${type.id}`}
                className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{type.icon}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                    {type.time}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
                  {type.title}
                </h3>
                <p className="text-sm text-gray-500 mb-3">{type.description}</p>
                <p className="text-sm font-medium text-emerald-600">
                  Typical claim: {type.amount}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 sm:p-12 text-white">
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <blockquote className="text-xl sm:text-2xl font-medium mb-6">
              "Got £1,200 back from my car finance company. The letter was incredibly professional - 
              they didn't even try to reject it."
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-sm font-medium">
                JT
              </div>
              <div>
                <p className="font-medium">James T.</p>
                <p className="text-sm text-gray-400">PCP Commission Claim</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 text-center mb-12">
            How it works
          </h2>

          <div className="grid sm:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center text-lg font-semibold mx-auto mb-4">
                  {step.num}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">You stay in control</p>
                  <p className="text-sm text-gray-500">We never contact lenders on your behalf</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Ready in minutes</p>
                  <p className="text-sm text-gray-500">Download instantly after payment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 text-center mb-4">
            Simple pricing
          </h2>
          <p className="text-gray-500 text-center mb-10">
            One payment. Keep 100% of your compensation.
          </p>

          <div className="grid sm:grid-cols-4 gap-4 mb-8">
            {[
              { range: 'Up to £1k', price: '£29' },
              { range: '£1k - £3k', price: '£49' },
              { range: '£3k - £10k', price: '£79' },
              { range: 'Over £10k', price: '£129' },
            ].map((tier, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 text-center">
                <p className="text-sm text-gray-500 mb-2">{tier.range}</p>
                <p className="text-2xl font-semibold text-gray-900">{tier.price}</p>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
            <p className="text-amber-800">
              <span className="font-semibold">Claims companies charge 25-40%.</span>
              {' '}On a £1,000 claim, that's £250-400. With us, you pay £29-49.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 text-center mb-10">
            Questions?
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-medium text-gray-900">{faq.q}</span>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} 
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-gray-500">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-6">
            Ready to get your money back?
          </h2>
          <p className="text-gray-500 mb-8">
            Takes about 8 minutes. No account needed.
          </p>
          <Link 
            href="/questionnaire" 
            className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white font-medium px-8 py-4 rounded-full hover:bg-gray-800 transition-all hover:scale-105"
          >
            Start your complaint
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-4 gap-8 mb-8">
            <div>
              <span className="font-semibold text-gray-900">ComplaintAI</span>
              <p className="text-sm text-gray-500 mt-2">
                Document preparation service. Not a claims company.
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-3">Complaints</p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/questionnaire?type=pcp" className="hover:text-gray-900">Car Finance</Link></li>
                <li><Link href="/questionnaire?type=section75" className="hover:text-gray-900">Credit Card</Link></li>
                <li><Link href="/questionnaire?type=unaffordable" className="hover:text-gray-900">Unaffordable Lending</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-3">Resources</p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="https://www.financial-ombudsman.org.uk" target="_blank" className="hover:text-gray-900">Financial Ombudsman</a></li>
                <li><a href="https://www.fca.org.uk" target="_blank" className="hover:text-gray-900">FCA</a></li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-3">Legal</p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/terms" className="hover:text-gray-900">Terms</Link></li>
                <li><Link href="/privacy" className="hover:text-gray-900">Privacy</Link></li>
                <li><Link href="/disclaimer" className="hover:text-gray-900">Disclaimer</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} ComplaintAI. Not legal advice.
          </div>
        </div>
      </footer>
    </div>
  )
}
