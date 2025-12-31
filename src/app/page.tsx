'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ArrowRight, Check } from 'lucide-react'

const complaintTypes = [
  {
    id: 'car-finance',
    title: 'Car finance',
    subtitle: 'Hidden commissions on PCP/HP',
    amount: '£1,000 - £3,000',
    tag: 'Popular',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    id: 'credit-card',
    title: 'Credit card',
    subtitle: 'Unaffordable limits',
    amount: '£500 - £5,000',
    tag: null,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'bank-fraud',
    title: 'Bank fraud',
    subtitle: 'Scam refunds',
    amount: '£500 - £10,000+',
    tag: 'New rules',
    gradient: 'from-rose-500 to-pink-600',
  },
  {
    id: 'unaffordable-loan',
    title: 'Loans & debt',
    subtitle: 'Irresponsible lending',
    amount: '£500 - £5,000',
    tag: null,
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    id: 'section-75',
    title: 'Card protection',
    subtitle: 'Section 75 claims',
    amount: '£100 - £30,000',
    tag: null,
    gradient: 'from-emerald-500 to-teal-500',
  },
]

const faqs = [
  {
    q: 'How do I know if I have a claim?',
    a: 'If you feel you were treated unfairly by a bank or lender—whether they gave you credit you couldn\'t afford, hid fees, or refused to help after fraud—you likely have grounds. Our questionnaire helps you find out.',
  },
  {
    q: 'What does it cost?',
    a: '£29 flat fee. Unlike claims companies who take 25-40% of your payout, you keep 100% of any compensation.',
  },
  {
    q: 'How is this different from a template?',
    a: 'Our AI writes a letter specific to your case, using arguments proven effective in 170,000+ Financial Ombudsman decisions. A template can\'t do that.',
  },
  {
    q: 'Do I need documents?',
    a: 'Not essential. We can work from what you remember. But agreements, statements, or letters help us write a stronger complaint.',
  },
  {
    q: 'What happens after I send it?',
    a: 'The company has 8 weeks to respond. If they reject you, escalate to the Financial Ombudsman for free—we include that letter too.',
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
            <Link href="#claims" className="text-sm text-white/60 hover:text-white transition-colors hidden sm:block">
              Claims
            </Link>
            <Link href="#faq" className="text-sm text-white/60 hover:text-white transition-colors hidden sm:block">
              FAQ
            </Link>
            <Link
              href="#claims"
              className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-white/90 transition-colors"
            >
              Start claim
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
            Get your money back
            <br />
            <span className="text-white/40">from banks & lenders</span>
          </h1>
          
          <p className="text-xl text-white/60 max-w-xl mb-10 leading-relaxed">
            Professional complaint letters in 5 minutes. 
            Keep 100% of your compensation—no claims company taking a cut.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link
              href="#claims"
              className="inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-full text-lg font-medium hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Check my claim
              <ArrowRight className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2 text-white/40 px-4">
              <span className="text-sm">£29 flat fee</span>
              <span>•</span>
              <span className="text-sm">5 minutes</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/10">
            <div>
              <div className="text-3xl font-semibold mb-1">170K+</div>
              <div className="text-sm text-white/40">Cases analysed</div>
            </div>
            <div>
              <div className="text-3xl font-semibold mb-1">75%</div>
              <div className="text-sm text-white/40">FOS overturn rate</div>
            </div>
            <div>
              <div className="text-3xl font-semibold mb-1">100%</div>
              <div className="text-sm text-white/40">Yours to keep</div>
            </div>
          </div>
        </div>
      </section>

      {/* Claims grid */}
      <section id="claims" className="py-20 px-6 scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold tracking-tight mb-4">What can you claim?</h2>
          <p className="text-white/50 mb-10">Select your situation to get started</p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {complaintTypes.map((type) => (
              <Link
                key={type.id}
                href={`/questionnaire?type=${type.id}`}
                className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 rounded-2xl p-6 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {type.tag && (
                  <span className="absolute top-4 right-4 text-xs bg-white/10 px-2 py-1 rounded-full">
                    {type.tag}
                  </span>
                )}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.gradient} mb-4 flex items-center justify-center`}>
                  <div className="w-6 h-6 bg-white/20 rounded-lg" />
                </div>
                <h3 className="text-lg font-medium mb-1">{type.title}</h3>
                <p className="text-sm text-white/40 mb-4">{type.subtitle}</p>
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
                title: 'Answer questions',
                desc: 'Simple questions about what happened. No legal jargon, no complicated forms.',
              },
              {
                step: '02',
                title: 'We write your letter',
                desc: 'AI generates a professional complaint citing the right regulations for your case.',
              },
              {
                step: '03',
                title: 'Send & get paid',
                desc: 'Email your letter. They have 8 weeks to respond. Keep 100% of what you get back.',
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

      {/* Comparison */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold tracking-tight mb-12 text-center">
            Why not use a claims company?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Claims company */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8">
              <div className="text-2xl mb-6">🦈</div>
              <h3 className="text-xl font-medium mb-6">Claims companies</h3>
              <ul className="space-y-4">
                {[
                  'Take 25-40% of your payout',
                  'You could lose £1,000+',
                  'Same template for everyone',
                  'Endless calls and emails',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-white/50">
                    <span className="text-rose-400 mt-0.5">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* iComplain */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8">
              <div className="text-2xl mb-6">✨</div>
              <h3 className="text-xl font-medium mb-6">iComplain</h3>
              <ul className="space-y-4">
                {[
                  '£29 flat fee, nothing else',
                  'Keep 100% of compensation',
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
                  With us, you pay £29 and keep the full £2,000.
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
            "Got my letter, sent it to Black Horse, and they paid me £2,400. 
            <span className="text-white/40"> Best £29 I ever spent.</span>"
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-medium">
              JT
            </div>
            <div className="text-left">
              <div className="font-medium">James T.</div>
              <div className="text-sm text-white/40">Car finance claim</div>
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
            href="#claims"
            className="inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-full text-lg font-medium hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Start my claim
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
            iComplain is a document preparation service. We help you write complaints—we don't provide legal advice or guarantee outcomes. 
            Not a law firm or claims management company.
          </p>
        </div>
      </footer>
    </div>
  )
}
