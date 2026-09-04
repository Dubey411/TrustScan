import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import ScanInterfaceInteractive from './components/ScanInterfaceInteractive';

export const metadata: Metadata = {
  title: 'Offer Letter Check Online Free | Fake Job Offer Detection - TrustScan AI',
  description: 'Free online tool to check fake offer letters in PDF or image. Detect forged company seals, fake HR emails, registration fee scams, UPI payment receipts, and AI images with deep forensic AI.',
  alternates: {
    canonical: '/scan-interface',
  },
  openGraph: {
    title: 'Offer Letter Check Online Free | Fake Job Offer Detection',
    description: 'Upload your job offer letter PDF or image to check for fraud, fake company seals, and HR email spoofing. 100% Free & Private.',
    url: 'https://www.trustscanai.in/scan-interface',
  },
  keywords: [
    'offer letter check online',
    'fake offer letter check online free',
    'fake offer letter detection',
    'fake offer letter detection pdf',
    'job offer letter check online free',
    'offer letter check online free',
    'check offer letter online',
    'fake upi payment screenshot check',
    'ai image detection online',
    'fake payment receipt verification online',
    'scam checker India',
    'TrustScan AI'
  ],
};

export default function ScanInterfacePage() {
  return (
    <>
      <Header />
      <ScanInterfaceInteractive />
    </>
  );
}