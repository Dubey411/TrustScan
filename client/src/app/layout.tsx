import React from 'react';
import type { Metadata, Viewport } from 'next';
import '../styles/index.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { AuthProvider } from '@/context/AuthContext';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.trustscanai.in'),
  title: 'TrustScan AI | India\'s Leading Fraud Detection Engine',
  description: 'Instant verification for Indian SMS, CIN, GST, and Documents. Protect yourself from digital scams using advanced behavioral intelligence.',
  openGraph: {
    title: 'TrustScan AI',
    description: 'Instant verification for Indian digital identity and documents.',
    url: 'https://www.trustscanai.in',
    siteName: 'TrustScan AI',
    locale: 'en_IN',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/image.png', type: 'image/png' }
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "TrustScan AI",
              "operatingSystem": "All",
              "applicationCategory": "SecurityApplication",
              "description": "India's most advanced AI fraud detection engine for SMS Headers, Business CIN/GST verification, and Scam Script analysis.",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "INR"
              },
              "author": {
                "@type": "Organization",
                "name": "TrustScan AI India"
              },
              "areaServed": "IN"
            })
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
