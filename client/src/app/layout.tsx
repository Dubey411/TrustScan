import React from 'react';
import type { Metadata, Viewport } from 'next';
import '../styles/index.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { AuthProvider } from '@/context/AuthContext';
import CookieConsent from '@/components/common/CookieConsent';

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
  description: 'Instant AI fraud verification for Indian job seekers and businesses. Check fake offer letters, verify UPI payments, detect manipulated images, and verify MCA CIN records.',
  keywords: ['offer letter check online', 'fake offer letter check online free', 'fake offer letter detection pdf', 'job offer letter check online free', 'check offer letter online', 'fake upi payment screenshot check', 'ai image detection online', 'payment fraud check online', 'CIN verification online', 'GST verification', 'online scam protection', 'TrustScan AI'],
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
  other: {
    'google-adsense-account': 'ca-pub-5575657922634928',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5575657922634928"
          crossOrigin="anonymous"
        />
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
              "url": "https://www.trustscanai.in",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "INR"
              },
              "author": {
                "@type": "Organization",
                "name": "TrustScan AI",
                "url": "https://www.trustscanai.in",
                "logo": "https://www.trustscanai.in/image.png",
                "email": "trustscan.ai@gmail.com",
                "telephone": "+91-8591694920",
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": "Navi Mumbai",
                  "addressRegion": "Maharashtra",
                  "addressCountry": "IN"
                },
                "founder": {
                  "@type": "Person",
                  "name": "Shubham Dubey",
                  "jobTitle": "Founder & Lead AI Engineer",
                  "url": "https://www.linkedin.com/in/shubham-dubey-1a0293352/"
                }
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
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
