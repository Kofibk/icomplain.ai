import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'iComplain - AI-Powered Financial Complaints',
  description: 'Generate professional complaint letters for UK financial services. Consumer credit, Section 75, car finance, banking and more.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
