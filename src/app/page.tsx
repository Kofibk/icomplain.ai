'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ArrowRight } from 'lucide-react'

// Financial complaint types
const complaintTypes = [
  {
    id: 'car-finance',
    title: 'Car finance',
    subtitle: 'PCP, HP, or motor finance',
    icon: '🚗',
    gradient: 'from-violet-500 to-purple-600',
    examples: ['Commission disclosure', 'Interest rates', 'Agreement terms'],
  },
  {
    id: 'credit-card',
    title: 'Credit cards',
    subtitle: 'Limits, charges, affordability',
    icon: '💳',
    gradient: 'from-blue-500 to-cyan-500',
    highlight: true,
    examples: ['Credit limits', 'Affordability checks', 'Fees and charges'],
  },
  {
    id: 'bank-fraud',
    title: 'Fraud & scams',
    subtitle: 'Unauthorised transactions',
    icon: '🚨',
    gradient: 'from-rose-500 to-pink-600',
    examples: ['APP fraud', 'Unauthorised payments', 'Account security'],
  },
  {
    id: 'unaffordable-loan',
    title: 'Loans & lending',
    subtitle: 'Personal loans, overdrafts',
    icon: '💷',
    gradient: 'from-amber-500 to-orange-500',
    examples: ['Affordability', 'Loan terms', 'Debt collection'],
  },
  {
    id: 'section-75',
    title: 'Section 75',
    subtitle: 'Credit card purchase protection',
    icon: '🛡️',
    gradient: 'from-emerald-500 to-teal-500',
    examples: ['Goods not received', 'Misrepresentation', 'Breach of contract'],
  },
  {
    id: 'other',
    title: 'Other financial',
    subtitle: 'Insurance, investments, more',
    icon: '📝',
    gradient: 'from-gray-500 to-gray-600',
    examples: ['Insurance', 'Pensions', 'Mortgages', 'Investments'],
    isOther: true,
  },
]

const faqs = [
  {
    q: 'What is iComplain?',
    a: 'iComplain is a document preparation service. We help you create structured complaint letters to send to financial services firms. You send the complaint yourself and manage your own case.',
  },
  {
    q: 'What types of complaints can I create?',
    a: 'Any complaint to an FCA-regulated financial services firm: banks, lenders, credit card providers, insurers, investment firms, and similar organisations.',
  },
  {
    q: 'How much does it cost?',
    a: '£29 for a personalised complaint letter based on your answers.',
  },
  {
    q: 'What documents will I receive?',
    a: 'A formal complaint letter addressed to the firm, structured with the relevant facts of your case. You can also receive guidance on next steps including the Financial Ombudsman Service.',
  },
  {
    q: 'Do I need to provide documents?',
    a: 'Not required, but any supporting documents you have (agreements, statements, correspondence) can help us create a more detailed letter.',
  },
  {
    q: 'What happens after I send the complaint?',
    a: 'The firm has 8 weeks to provide a Final Response. If you\'re unhappy with the outcome, you may be able to refer your complaint to the Financial Ombudsman Service.',
  },
  {
    q: 'Are you a claims management company?',
    a: 'No. We are a document preparation service. We do not submit complaints on your behalf, provide legal or financial advice, or take a percentage of any outcome.',
  },
]

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white antialiased">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            iComplain
          </Link>
          <div className="flex items-center gap-8">
            <Link href="#complaints" className="text-sm text-white/60 hover:text-white transition-colors hidden sm:block">
              Complaint types
            </Link>
            <Link href="#faq" className="text-sm text-white/60 hover:text-white transition-colors hidden sm:block">
              FAQ
            </Link>
            <Link
              href="#complaints"
              className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-white/90 transition-colors"
            >
              Create complaint
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight leading-[1.1] mb-6">
            Financial services
            <br />
            <span className="text-white/40">complaint letters</span>
          </h1>
          
          <p className="text-xl text-white/60 max-w-xl mb-10 leading-relaxed">
            Create a structured complaint letter for banks, lenders, and other 
            FCA-regulated firms. Answer questions about your situation and 
            receive a personalised document.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Link
              href="#complaints"
              className="inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-full text-lg font-medium hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Create a complaint
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/questionnaire?type=freeform"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white border border-white/20 px-8 py-4 rounded-full text-lg font-medium hover:bg-white/20 transition-all"
            >
              Or tell us what happened
            </Link>
          </div>

          <p className="text-sm text-white/40">
            £29 per complaint letter • Document preparation service
          </p>
        </div>
      </section>

      {/* What we do / What we don't do */}
      <section className="py-12 px-6 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">What we do</h3>
              <ul className="space-y-3 text-white/70">
                <li>• Create personalised complaint letters</li>
                <li>• Structure your case with relevant details</li>
                <li>• Provide document templates</li>
                <li>• Include guidance on complaint processes</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">What we don't do</h3>
              <ul className="space-y-3 text-white/70">
                <li>• Submit complaints on your behalf</li>
                <li>• Provide legal or financial advice</li>
                <li>• Take a percentage of outcomes</li>
                <li>• Manage your case or correspondence</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Complaint types */}
      <section id="complaints" className="py-20 px-6 scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold tracking-tight mb-4">Select complaint type</h2>
          <p className="text-white/50 mb-10">Choose the category that best matches your situation</p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {complaintTypes.map((type) => (
              <Link
                key={type.id}
                href={`/questionnaire?type=${type.id}`}
                className={`group relative border rounded-2xl p-6 transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  type.isOther 
                    ? 'bg-white/[0.02] border-dashed border-white/20 hover:border-white/40' 
                    : type.highlight
                    ? 'bg-white/[0.05] border-white/20 hover:border-white/30'
                    : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/10 hover:border-white/20'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.gradient} mb-4 flex items-center justify-center text-2xl`}>
                  {type.icon}
                </div>
                <h3 className="text-lg font-medium mb-1">{type.title}</h3>
                <p className="text-sm text-white/40 mb-3">{type.subtitle}</p>
                
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {type.examples.map((ex, i) => (
                    <span key={i} className="text-xs bg-white/5 px-2 py-1 rounded-full text-white/50">
                      {ex}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-end">
                  <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>

          {/* Free-form option */}
          <div className="mt-8 p-6 bg-white/[0.02] border border-white/10 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-medium mb-1">Not sure which category?</h3>
                <p className="text-sm text-white/50">Tell us what happened in your own words and we'll help structure your complaint.</p>
              </div>
              <Link
                href="/questionnaire?type=freeform"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-2.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap"
              >
                Write freely
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 px-6 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold tracking-tight mb-12">How it works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Provide details',
                desc: 'Answer questions about your situation or describe what happened in your own words.',
              },
              {
                step: '02',
                title: 'Review your letter',
                desc: 'We create a structured complaint letter based on the information you provide.',
              },
              {
                step: '03',
                title: 'Send it yourself',
                desc: 'Download your letter and send it to the firm. You manage your own complaint.',
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="text-5xl font-semibold text-white/10 mb-4">{item.step}</div>
                <h3 className="text-lg font-medium mb-2">{item.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6 scroll-mt-20">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-semibold tracking-tight mb-12 text-center">Frequently asked questions</h2>
          
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className="font-medium pr-8">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-white/40 transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-white/60 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-6">
            Create your complaint letter
          </h2>
          <p className="text-white/50 mb-10 text-lg">
            £29 per document. You send it, you manage it, you keep any outcome.
          </p>
          <Link
            href="#complaints"
            className="inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-full text-lg font-medium hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Get started
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-white/40 text-sm">
              © 2025 iComplain
            </div>
            <div className="flex items-center gap-6 text-sm text-white/40">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
          <p className="mt-8 text-xs text-white/30 text-center max-w-xl mx-auto">
            iComplain is a document preparation service. We create complaint letters based on information you provide. 
            We do not provide legal or financial advice, submit complaints on your behalf, or guarantee any outcome. 
            Not a law firm or claims management company.
          </p>
        </div>
      </footer>
    </div>
  )
}
