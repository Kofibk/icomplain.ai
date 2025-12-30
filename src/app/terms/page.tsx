import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-brand-600">
            ComplaintAI
          </Link>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-sm text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString('en-GB')}</p>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. What We Are</h2>
            <p className="text-gray-700 mb-4">
              ComplaintAI is a <strong>document preparation service</strong>. We provide tools to help you 
              draft complaint letters based on information you provide.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>We are NOT:</strong>
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>A Claims Management Company (CMC)</li>
              <li>A law firm or legal advice service</li>
              <li>A financial advice service</li>
              <li>Acting on your behalf in any capacity</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. What We Do</h2>
            <p className="text-gray-700 mb-4">
              Our service generates template complaint letters based on:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>The information you provide through our questionnaire</li>
              <li>General knowledge about consumer rights and regulations</li>
              <li>Patterns from publicly available Financial Ombudsman Service decisions</li>
            </ul>
            <p className="text-gray-700">
              The documents we generate are templates that you may choose to use, modify, or discard. 
              You are solely responsible for reviewing any document before use and for submitting 
              any complaint yourself.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. What We Don't Do</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>We do NOT assess whether you have a valid claim</li>
              <li>We do NOT advise you on whether to make a complaint</li>
              <li>We do NOT submit complaints on your behalf</li>
              <li>We do NOT communicate with businesses or the ombudsman for you</li>
              <li>We do NOT guarantee any outcome from using our documents</li>
              <li>We do NOT take any percentage of compensation you receive</li>
              <li>We do NOT provide ongoing case management</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. No Legal Advice</h2>
            <p className="text-gray-700 mb-4">
              <strong>The documents and information provided by ComplaintAI do not constitute legal advice.</strong>
            </p>
            <p className="text-gray-700 mb-4">
              Our service is educational and informational in nature. The documents we generate are 
              based on general principles and may not be appropriate for your specific circumstances.
            </p>
            <p className="text-gray-700">
              If you need legal advice, please consult a qualified solicitor or legal professional. 
              Free legal advice may be available from Citizens Advice or through legal aid if you qualify.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Your Responsibilities</h2>
            <p className="text-gray-700 mb-4">By using our service, you agree that:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>You will provide accurate information in the questionnaire</li>
              <li>You will review any generated document before using it</li>
              <li>You are responsible for deciding whether to submit a complaint</li>
              <li>You will submit any complaint yourself (we do not act on your behalf)</li>
              <li>You understand this is a document preparation service, not legal advice</li>
              <li>You will not hold us responsible for the outcome of any complaint</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Payment and Refunds</h2>
            <p className="text-gray-700 mb-4">
              Payment is required before document generation. Our fees are one-time payments based on 
              estimated claim value at the time of purchase.
            </p>
            <p className="text-gray-700 mb-4">
              We do not charge any percentage of compensation you may receive. You keep 100% of any 
              money recovered from your complaint.
            </p>
            <p className="text-gray-700">
              Refunds may be provided at our discretion if there is a technical issue preventing 
              document delivery. We do not provide refunds based on complaint outcomes, as we make 
              no guarantees about results.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Data Protection</h2>
            <p className="text-gray-700 mb-4">
              We collect personal information solely for the purpose of generating your complaint 
              document. Your data is processed in accordance with our Privacy Policy and UK GDPR.
            </p>
            <p className="text-gray-700">
              Personal data is automatically deleted 30 days after document generation unless you 
              request earlier deletion.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              To the fullest extent permitted by law, ComplaintAI shall not be liable for:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Any loss arising from the use of our documents</li>
              <li>The outcome of any complaint you make</li>
              <li>Any decisions made based on our documents or information</li>
              <li>Any indirect, incidental, or consequential damages</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Our total liability for any claim shall not exceed the amount you paid for the service.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Changes to Terms</h2>
            <p className="text-gray-700">
              We may update these terms from time to time. Continued use of the service after changes 
              constitutes acceptance of the new terms.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Contact</h2>
            <p className="text-gray-700">
              For questions about these terms, contact us at: legal@complaintai.co.uk
            </p>
          </section>
          
          <section className="bg-amber-50 border border-amber-200 rounded-xl p-6 mt-12">
            <h3 className="font-semibold text-amber-800 mb-2">Important Notice</h3>
            <p className="text-amber-700">
              By using ComplaintAI, you acknowledge that you have read and understood these terms, 
              and that you are using a document preparation service - not receiving legal advice 
              or representation.
            </p>
          </section>
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-sm text-gray-600">
          <Link href="/" className="hover:text-brand-600">Home</Link>
          {' • '}
          <Link href="/privacy" className="hover:text-brand-600">Privacy Policy</Link>
          {' • '}
          <Link href="/disclaimer" className="hover:text-brand-600">Disclaimer</Link>
        </div>
      </footer>
    </div>
  )
}
