import './globals.css'
import type { Metadata } from 'next'
import CookieConsent from '@/components/CookieConsent'

export const metadata: Metadata = {
  title: 'ComplaintAI - Professional Complaint Letter Generator',
  description: 'Generate ombudsman-quality complaint letters for PCP claims, Section 75, and more. Keep 100% of your compensation.',
  keywords: 'PCP claim, Section 75, car finance complaint, consumer credit complaint, ombudsman complaint',
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
