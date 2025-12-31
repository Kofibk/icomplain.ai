'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ArrowRight, Check } from 'lucide-react'

// Top 5 financial complaints + Other
const topComplaints = [
  {
    id: 'car-finance',
    title: 'Mis-sold car finance?',
    subtitle: 'Hidden commission on PCP/HP',
    amount: 'Avg. £1,100 back',
    icon: '🚗',
    gradient: 'from-violet-500 to-purple-600',
    tag: 'Popular',
    examples: ['Secret commission', 'No rate options', 'DCA period'],
  },
  {
    id: 'bank-fraud',
    title: 'Scammed & bank won\'t refund?',
    subtitle: 'New rules mean they should pay',
    amount: 'Avg. £3,000 back',
    icon: '🚨',
    gradient: 'from-rose-500 to-pink-600',
    tag: 'New rules',
    examples: ['APP fraud', 'Impersonation', 'Investment scam'],
  },
  {
    id: 'credit-card',
    title: 'Given credit you couldn\'t afford?',
    subtitle: 'Limits increased without checks',
    amount: 'Up to £5,000',
    icon: '💳',
    gradient: 'from-blue-500 to-cyan-500',
    tag: null,
    examples: ['Auto limit increase', 'No affordability check', 'Debt spiral'],
  },
  {
    id: 'unaffordable-loan',
    title: 'Loan you should never have had?',
    subtitle: 'Irresponsible lending',
    amount: 'Up to £5,000',
    icon: '💷',
    gradient: 'from-amber-500 to-orange-500',
    tag: null,
    examples: ['Multiple loans', 'Already in debt', 'Payday lenders'],
  },
  {
    id: 'section-75',
    title: 'Paid by card, got nothing?',
    subtitle: 'Section 75 protection',
    amount: '£100 - £30,000',
    icon: '🛡️',
    gradient: 'from-emerald-500 to-teal-500',
    tag: null,
    examples: ['Company bust', 'Never delivered', 'Goods faulty'],
  },
  {
    id: 'other',
    title: 'Other financial complaint?',
    subtitle: 'Insurance, investments, mortgages...',
    amount: 'We can help',
    icon: '📝',
    gradient: 'from-gray-500 to-gray-600',
    tag: null,
    examples: ['Insurance claim', 'Pension mis-sold', 'Unfair charges'],
    isOther: true,
  },
]

const commonProblems = [
  'My car dealer never told me about commission',
  'I was given a credit card I couldn\'t afford',
  'I got scammed and my bank won\'t refund me',
  'They kept lending to me when I was already in debt',
  'The company went bust and I lost my money',
  'My insurance claim was rejected unfairly',
  'I was mis-sold a pension',
  'They put a default on my credit file wrongly',
]

const faqs = [
  {
    q: 'What kind of complaints can you help with?',
    a: 'Any complaint against an FCA-regulated financial firm: banks, lenders, credit card companies, car finance providers, insurers, investment firms, and more. If it\'s financial services, we can help.',
  },
  {
    q: 'How much does it cost?',
    a: '£29 flat fee for your personalised complaint letter. Unlike claims companies who take 25-40% of your payout, you keep 100% of any compensation you receive.',
  },
  {
    q: 'What makes your letters better than a template?',
    a: 'Our AI analyses your specific situation and writes a letter citing the exact regulations that apply to your case. We\'ve studied 170,000+ Financial Ombudsman decisions to know what works.',
  },
  {
    q: 'Do I need any documents?',
    a: 'Not essential. We can create your letter based on what you remember. But if you have your agreement, statements, or correspondence, they help strengthen your case.',
  },
  {
    q: 'What happens after I send the complaint?',
    a: 'The firm has 8 weeks to send a Final Response. If they reject you or don\'t respond, you can escalate to the Financial Ombudsman Service (FOS) for free - we include guidance on how.',
  },
  {
    q: 'Is this a claims company?',
    a: 'No. We\'re a document preparation service. We help you write your complaint - you send it yourself and keep 100% of any money you get back. We\'re not FCA regulated because we don\'t manage your claim.',
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
              Complaints
            </Link>
            <Link href="#faq" className="text-sm text-white/60 hover:text-white transition-colors hidden sm:block">
              FAQ
            </Link>
            <Link
              href="#complaints"
              className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-white/90 transition-colors"
            >
              Start complaint
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-sm mb-8">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-white/70">£8bn car finance payout underway</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight leading-[1.1] mb-6">
            Been treated unfairly
            <br />
            <span className="text-white/40">by a bank or lender?</span>
          </h1>
          
          <p className="text-xl text-white/60 max-w-xl mb-10 leading-relaxed">
            Get the money you're owed. Professional complaint letters in 5 minutes. 
            Keep 100% of your compensation—no claims company taking a cut.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link
              href="#complaints"
              className="inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-full text-lg font-medium hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Start my complaint
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Common problems scroll */}
          <div className="overflow-hidden">
            <p className="text-sm text-white/40 mb-3">Sound familiar?</p>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
              {commonProblems.map((problem, i) => (
                <Link
                  key={i}
                  href="#complaints"
                  className="flex-shrink-0 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-4 py-2 text-sm text-white/70 hover:text-white transition-colors whitespace-nowrap"
                >
                  "{problem}"
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-3xl font-semibold mb-1">170K+</div>
            <div className="text-sm text-white/40">FOS cases analysed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-semibold mb-1">75%</div>
            <div className="text-sm text-white/40">FOS overturn rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-semibold mb-1">100%</div>
            <div className="text-sm text-white/40">Yours to keep</div>
          </div>
        </div>
      </section>

      {/* Complaint types */}
      <section id="complaints" className="py-20 px-6 scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold tracking-tight mb-4">What's your complaint about?</h2>
          <p className="text-white/50 mb-10">Choose the closest match—or select "Other" for any financial complaint</p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topComplaints.map((type) => (
              <Link
                key={type.id}
                href={`/questionnaire?type=${type.id}`}
                className={`group relative border rounded-2xl p-6 transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  type.isOther 
                    ? 'bg-white/[0.02] border-dashed border-white/20 hover:border-white/40' 
                    : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/10 hover:border-white/20'
                }`}
              >
                {type.tag && (
                  <span className="absolute top-4 right-4 text-xs bg-white/10 px-2 py-1 rounded-full">
                    {type.tag}
                  </span>
                )}
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
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-emerald-400">{type.amount}</span>
                  <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold tracking-tight mb-12">How it works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Tell us what happened',
                desc: 'Answer simple questions about your situation. No legal jargon—just tell us what went wrong.',
              },
              {
                step: '02',
                title: 'We write your complaint',
                desc: 'Our AI creates a professional letter citing the exact regulations and arguments that work.',
              },
              {
                step: '03',
                title: 'Send it & get paid',
                desc: 'Email your letter to the firm. They have 8 weeks to respond. You keep 100% of any payout.',
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

      {/* Why not claims company */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold tracking-tight mb-12 text-center">
            Why not use a claims company?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8">
              <div className="text-2xl mb-6">🦈</div>
              <h3 className="text-xl font-medium mb-6">Claims companies</h3>
              <ul className="space-y-4">
                {[
                  'Take 25-40% of your money',
                  'You could lose £1,000+',
                  'Same template for everyone',
                  'Endless phone calls',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-white/50">
                    <span className="text-rose-400 mt-0.5">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8">
              <div className="text-2xl mb-6">✨</div>
              <h3 className="text-xl font-medium mb-6">iComplain</h3>
              <ul className="space-y-4">
                {[
                  '£29 flat fee - that\'s it',
                  'Keep 100% of your money',
                  'Letter written for YOUR case',
                  'Ready in 5 minutes',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-sm text-white/50">
                  <span className="text-white">Example:</span> On a £2,000 payout, claims companies take £500-800. 
                  With us, pay £29 and keep the full £2,000.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 px-6 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center gap-1 mb-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} className="text-amber-400">★</span>
            ))}
          </div>
          <blockquote className="text-2xl sm:text-3xl font-medium leading-relaxed mb-8">
            "Black Horse never told me about commission on my car finance. 
            iComplain wrote my letter and I got £2,400 back.
            <span className="text-white/40"> Best £29 I ever spent.</span>"
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-medium">
              JT
            </div>
            <div className="text-left">
              <div className="font-medium">James T.</div>
              <div className="text-sm text-white/40">Car finance complaint</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6 scroll-mt-20">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-semibold tracking-tight mb-12 text-center">Questions</h2>
          
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
            Ready to get your money back?
          </h2>
          <p className="text-white/50 mb-10 text-lg">
            5 minutes. £29. Keep 100% of what you're owed.
          </p>
          <Link
            href="#complaints"
            className="inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-full text-lg font-medium hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Start my complaint
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
            iComplain is a document preparation service. We help you write complaints against FCA-regulated firms—we don't provide legal advice or guarantee outcomes. 
            Not a law firm or claims management company.
          </p>
        </div>
      </footer>
    </div>
  )
}
