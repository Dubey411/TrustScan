import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import ScanInterfaceInteractive from './components/ScanInterfaceInteractive';

export const metadata: Metadata = {
  title: 'Scan Interface - TrustScan',
  description: 'Comprehensive fraud detection suite for job offers, internships, phishing links, and suspicious messages. Get instant AI-powered verification with detailed safety reports.',
};

export default function ScanInterfacePage() {
  return (
    <>
      <Header />
      <ScanInterfaceInteractive />
    </>
  );
}