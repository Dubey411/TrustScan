import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import ScanInterfaceInteractive from './components/ScanInterfaceInteractive';

export const metadata: Metadata = {
  title: 'Free Scam Checker & Link Scanner | TrustScan AI',
  description: 'Instant free tool to check suspicious links, verify job offers, and scan WhatsApp messages for fraud. Powered by AI and RBI/MCA databases for maximum accuracy in India.',
  alternates: {
    canonical: '/scan-interface',
  },
  openGraph: {
    title: 'Free Scam Checker & Link Scanner | TrustScan AI',
    description: 'Check any link, message, or file for fraud instantly. 100% Free & Private.',
    url: 'https://www.trustscanai.in/scan-interface',
  },
  keywords: ['free link scanner', 'scam checker India', 'fake job detector', 'WhatsApp fraud check', 'URL safety check', 'document verification AI'],
};

export default function ScanInterfacePage() {
  return (
    <>
      <Header />
      <ScanInterfaceInteractive />
    </>
  );
}