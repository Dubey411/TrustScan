import React from 'react';
import type { Metadata, Viewport } from 'next';
import '../styles/index.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { AuthProvider } from '@/context/AuthContext';
import CookieConsent from '@/components/common/CookieConsent';
import GoogleAdSense from '@/components/common/GoogleAdSense';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.trustscanai.in'),
  title: {
    default: 'TrustScan AI | India\'s Leading Fraud Detection Engine',
    template: '%s | TrustScan AI'
  },
  description: 'Instant AI fraud verification for Indian job seekers and businesses. Check fake offer letters, verify academic degrees, detect manipulated UPI screenshots, and verify MCA CIN records.',
  keywords: ['offer letter check online', 'fake offer letter check online free', 'fake offer letter detection pdf', 'job offer letter check online free', 'check offer letter online', 'fake upi payment screenshot check', 'ai image detection online', 'degree verification online', 'CIN verification online', 'GST verification', 'online scam protection', 'TrustScan AI'],
  authors: [{ name: 'TrustScan Team' }],
  creator: 'TrustScan AI',
  publisher: 'TrustScan AI India',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'TrustScan AI | India\'s Smartest Fraud Detector',
    description: 'Verify Job Offers, SMS Headers, Business IDs (CIN/GST), and suspicious links instantly with AI-powered accuracy.',
    url: 'https://www.trustscanai.in',
    siteName: 'TrustScan AI',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/image.png',
        width: 1200,
        height: 630,
        alt: 'TrustScan AI Security Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TrustScan AI | Stop Indian Online Scams',
    description: 'Protecting citizens from SMS spoofing, job scams, and fraudulent businesses using advanced AI.',
    images: ['/image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/image.png', type: 'image/png' }
    ],
    shortcut: '/image.png',
    apple: '/image.png',
  },
  manifest: '/site.webmanifest',
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
              "description": "India's most advanced AI fraud detection engine. Perform a fake job offer check, verify if this link is safe, and detect UPI fraud messages instantly.",
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
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <CookieConsent />
            <GoogleAdSense />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
