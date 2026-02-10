import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import ScanInterfaceInteractive from './components/ScanInterfaceInteractive';

export const metadata: Metadata = {
  title: 'Is This Link Safe? Free Fake Job Offer Check & UPI Fraud Scanner',
  description: 'Instant free tool to check if this link is safe, verify fake job offers, and scan UPI fraud messages. Powered by AI for maximum accuracy in India.',
  alternates: {
    canonical: '/scan-interface',
  },
  openGraph: {
    title: 'Is This Link Safe? Free Fake Job Offer Check',
    description: 'Check any link, UPI message, or fake job offer instantly. 100% Free & Private.',
    url: 'https://www.trustscanai.in/scan-interface',
  },
  keywords: ['is this link safe', 'fake job offer check', 'UPI fraud message', 'free link scanner', 'scam checker India', 'WhatsApp fraud check'],
};

export default function ScanInterfacePage() {
  return (
    <>
      <Header />
      <ScanInterfaceInteractive />
    </>
  );
}