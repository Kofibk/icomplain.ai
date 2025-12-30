import Link from 'next/link'

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-sm text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString('en-GB')}</p>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Who We Are</h2>
            <p className="text-gray-700 mb-4">
              ComplaintAI is a document preparation service that helps consumers draft complaint letters.
              We are the data controller for the personal information we collect through our website.
            </p>
            <p className="text-gray-700">
              Contact: privacy@complaintai.co.uk
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. What Information We Collect</h2>
            <p className="text-gray-700 mb-4">We collect the following information when you use our service:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Identity information:</strong> Name, address, email, phone number</li>
              <li><strong>Complaint details:</strong> Information you provide about your complaint (dates, amounts, descriptions)</li>
              <li><strong>Payment information:</strong> Processed securely by Stripe - we do not store card details</li>
              <li><strong>Technical information:</strong> IP address, browser type, device information</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">We use your information to:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Generate your personalised complaint letter</li>
              <li>Process your payment</li>
              <li>Send you your complaint document</li>
              <li>Respond to support queries</li>
              <li>Improve our service</li>
            </ul>
            <p className="text-gray-700 mt-4">
              <strong>We do NOT:</strong> Sell your data, share it with third parties for marketing, 
              or use it for any purpose other than providing our service.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Legal Basis for Processing</h2>
            <p className="text-gray-700 mb-4">We process your data on the following legal bases:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Contract:</strong> Processing necessary to provide the service you purchased</li>
              <li><strong>Legitimate interests:</strong> Improving our service, preventing fraud</li>
              <li><strong>Legal obligation:</strong> Tax records, responding to legal requests</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Data Retention</h2>
            <p className="text-gray-700 mb-4">
              We retain your personal data for <strong>30 days</strong> after generating your complaint letter, 
              after which it is automatically deleted.
            </p>
            <p className="text-gray-700">
              Payment records are retained for 7 years as required by UK tax law.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Data Sharing</h2>
            <p className="text-gray-700 mb-4">We share data only with:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Stripe:</strong> Payment processing (see Stripe's privacy policy)</li>
              <li><strong>Anthropic:</strong> AI processing to generate your letter (data is not retained by them)</li>
              <li><strong>Supabase:</strong> Secure database hosting</li>
              <li><strong>Vercel:</strong> Website hosting</li>
            </ul>
            <p className="text-gray-700 mt-4">
              All our service providers are GDPR compliant and process data only on our instructions.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Your Rights</h2>
            <p className="text-gray-700 mb-4">Under UK GDPR, you have the right to:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Rectification:</strong> Correct inaccurate data</li>
              <li><strong>Erasure:</strong> Request deletion of your data</li>
              <li><strong>Restriction:</strong> Limit how we use your data</li>
              <li><strong>Portability:</strong> Receive your data in a portable format</li>
              <li><strong>Objection:</strong> Object to certain processing</li>
            </ul>
            <p className="text-gray-700 mt-4">
              To exercise any of these rights, email: privacy@complaintai.co.uk
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Data Security</h2>
            <p className="text-gray-700">
              We use industry-standard security measures including encryption in transit (HTTPS), 
              encryption at rest, and secure authentication. Payment data is handled entirely by 
              Stripe and never touches our servers.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Cookies</h2>
            <p className="text-gray-700 mb-4">We use only essential cookies required for the service to function:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Session cookies:</strong> To maintain your questionnaire progress</li>
              <li><strong>Stripe cookies:</strong> Required for payment processing</li>
            </ul>
            <p className="text-gray-700 mt-4">
              We do not use advertising or tracking cookies.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. International Transfers</h2>
            <p className="text-gray-700">
              Your data may be processed in the US by our service providers (Anthropic, Vercel). 
              These transfers are protected by Standard Contractual Clauses approved by the UK ICO.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Complaints</h2>
            <p className="text-gray-700">
              If you are unhappy with how we handle your data, you have the right to complain to the 
              Information Commissioner's Office (ICO): <a href="https://ico.org.uk" className="text-brand-600 hover:underline" target="_blank" rel="noopener">ico.org.uk</a>
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Changes to This Policy</h2>
            <p className="text-gray-700">
              We may update this policy from time to time. We will notify you of significant changes 
              by email or by posting a notice on our website.
            </p>
          </section>
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-sm text-gray-600">
          <Link href="/" className="hover:text-brand-600">Home</Link>
          {' • '}
          <Link href="/terms" className="hover:text-brand-600">Terms of Service</Link>
          {' • '}
          <Link href="/disclaimer" className="hover:text-brand-600">Disclaimer</Link>
        </div>
      </footer>
    </div>
  )
}
