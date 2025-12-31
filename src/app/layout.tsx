import './globals.css'
import type { Metadata } from 'next'
import CookieConsent from '@/components/CookieConsent'

export const metadata: Metadata = {
  title: 'iComplain - AI-Powered Complaint Letter Generator',
  description: 'Turn your evidence into winning complaint letters. Upload documents, explain what happened, and let AI build your case. Keep 100% of your compensation.',
  keywords: 'PCP claim, Section 75, car finance complaint, consumer credit complaint, ombudsman complaint, complaint letter generator',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
        <CookieConsent />
      </body>
    </html>
  )
}
