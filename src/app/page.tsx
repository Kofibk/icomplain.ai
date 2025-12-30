import Link from 'next/link'
import { Shield, FileText, PoundSterling, Clock, CheckCircle, ArrowRight } from 'lucide-react'

const complaintTypes = [
  {
    id: 'pcp',
    title: 'PCP / Motor Finance',
    description: 'Hidden commission on car finance? You could be owed £700+ per agreement.',
    icon: '🚗',
    popular: true,
  },
  {
    id: 'section75',
    title: 'Section 75 Credit Card',
    description: 'Goods not delivered, faulty, or company gone bust? Your card provider is liable.',
    icon: '💳',
    popular: false,
  },
  {
    id: 'unaffordable',
    title: 'Unaffordable Lending',
    description: 'Credit cards or loans you couldn\'t afford? Lenders must check affordability.',
    icon: '📊',
    popular: true,
  },
  {
    id: 'holiday-park',
    title: 'Holiday Park Mis-selling',
    description: 'Promised rental income that never materialised? You may have been mis-sold.',
    icon: '🏕️',
    popular: false,
  },
]

const pricingTiers = [
  { value: '£1,000', price: '£29', label: 'Claims up to £1,000' },
  { value: '£3,000', price: '£49', label: 'Claims £1,000 - £3,000' },
  { value: '£10,000', price: '£79', label: 'Claims £3,000 - £10,000' },
  { value: '£10,000+', price: '£129', label: 'Claims over £10,000' },
]

const benefits = [
  {
    icon: FileText,
    title: 'Ombudsman-Quality Letters',
    description: 'Our AI is trained on 170,000+ Financial Ombudsman decisions. It knows exactly what language and arguments succeed.',
  },
  {
    icon: PoundSterling,
    title: 'Keep 100% of Your Compensation',
    description: 'Unlike claims companies that take 25-40%, you keep everything you recover. One small fee, no hidden charges.',
  },
  {
    icon: Clock,
    title: 'Ready in Minutes',
    description: 'Answer a few questions, pay once, and download your professional complaint letter instantly.',
  },
  {
    icon: Shield,
    title: 'Evidence Checklist Included',
    description: 'We tell you exactly what documents to attach. Complete complaints have higher success rates.',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-brand-600">ComplaintAI</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">How It Works</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
              <a href="#faq" className="text-gray-600 hover:text-gray-900">FAQ</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-brand-50 to-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Write Professional Complaint Letters That Get Results
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Our AI is trained on 170,000+ Financial Ombudsman decisions. 
              Generate complaint letters that use the exact language and arguments that succeed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/questionnaire" className="btn-primary flex items-center justify-center gap-2">
                Start Your Complaint
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#how-it-works" className="btn-secondary">
                See How It Works
              </a>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              No account needed • From £29 • Letter ready in minutes
            </p>
          </div>
        </div>
      </section>

      {/* Complaint Types */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            What Type of Complaint Do You Have?
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Select your complaint type to get started. We'll guide you through the process.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {complaintTypes.map((type) => (
              <Link
                key={type.id}
                href={`/questionnaire?type=${type.id}`}
                className="card hover:shadow-md hover:border-brand-300 transition-all group relative"
              >
                {type.popular && (
                  <span className="absolute -top-3 right-4 bg-brand-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Popular
                  </span>
                )}
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{type.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                      {type.title}
                    </h3>
                    <p className="text-gray-600 mt-1">{type.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Answer Questions', desc: 'Tell us about your complaint in 5-10 minutes' },
              { step: 2, title: 'AI Generates Letter', desc: 'We create an ombudsman-quality complaint' },
              { step: 3, title: 'Pay & Download', desc: 'One-time payment, instant PDF download' },
              { step: 4, title: 'Submit Yourself', desc: 'Send to the business, keep 100% of any compensation' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-brand-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Use ComplaintAI?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center">
                    <benefit.icon className="w-6 h-6 text-brand-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            One payment. No percentage of your compensation. No hidden fees.
          </p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {pricingTiers.map((tier, idx) => (
              <div key={idx} className="card text-center">
                <p className="text-sm text-gray-600 mb-2">{tier.label}</p>
                <p className="text-3xl font-bold text-gray-900 mb-4">{tier.price}</p>
                <p className="text-xs text-gray-500">One-time payment</p>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Compare: Claims companies typically charge <span className="font-semibold">25-40%</span> of your compensation.
              <br />
              On a £1,000 claim, that's £250-400. With us, you pay just £29-49 and keep the rest.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            {[
              {
                q: 'Is this a claims management company?',
                a: 'No. We are a document preparation service. We help you write your own complaint letter - we don\'t submit it for you or act on your behalf. You send the letter yourself and keep 100% of any compensation.',
              },
              {
                q: 'Do I need to use a claims company?',
                a: 'No. You can complain directly to businesses and the Financial Ombudsman Service for free. Our tool simply helps you write a more professional, effective complaint letter.',
              },
              {
                q: 'How does the AI know what to write?',
                a: 'Our AI is trained on 170,000+ published Financial Ombudsman decisions. It has learned the exact language, legal references, and argument structures that lead to successful complaints.',
              },
              {
                q: 'What if my complaint is rejected?',
                a: 'If the business rejects your complaint, you can escalate to the Financial Ombudsman Service for free. We can generate an FOS complaint form for an additional £19.',
              },
              {
                q: 'Is my data secure?',
                a: 'Yes. We use bank-level encryption. Your personal details are used only to generate your complaint letter and are deleted after 30 days.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="card">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-brand-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Write Your Complaint?
          </h2>
          <p className="text-brand-100 mb-8 max-w-2xl mx-auto">
            Join thousands of consumers who have used professional complaint letters to get the compensation they deserve.
          </p>
          <Link href="/questionnaire" className="inline-flex items-center gap-2 bg-white text-brand-600 font-semibold py-3 px-8 rounded-lg hover:bg-brand-50 transition-colors">
            Start Your Complaint
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <span className="text-xl font-bold text-white">ComplaintAI</span>
              <p className="mt-4 text-sm">
                Document preparation service for UK consumer complaints. 
                Not a claims management company.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Complaint Types</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/questionnaire?type=pcp" className="hover:text-white">PCP / Motor Finance</Link></li>
                <li><Link href="/questionnaire?type=section75" className="hover:text-white">Section 75</Link></li>
                <li><Link href="/questionnaire?type=unaffordable" className="hover:text-white">Unaffordable Lending</Link></li>
                <li><Link href="/questionnaire?type=holiday-park" className="hover:text-white">Holiday Parks</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://www.financial-ombudsman.org.uk" target="_blank" rel="noopener" className="hover:text-white">Financial Ombudsman</a></li>
                <li><a href="https://www.fca.org.uk" target="_blank" rel="noopener" className="hover:text-white">FCA</a></li>
                <li><a href="https://www.citizensadvice.org.uk" target="_blank" rel="noopener" className="hover:text-white">Citizens Advice</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/disclaimer" className="hover:text-white">Disclaimer</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center">
            <p>
              © {new Date().getFullYear()} ComplaintAI. This is a document preparation service, not legal advice.
              <br />
              We do not assess the merits of your individual claim or act on your behalf.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
