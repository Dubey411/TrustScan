import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import ResultsInteractive from './components/ResultsInteractive';

export const metadata: Metadata = {
  title: 'Scan Results - TrustScan',
  description: 'View detailed analysis of your scan with threat assessment, red flags, and recommended actions to protect yourself from fraud.',
};

export default function ResultsDashboardPage() {
  return (
    <>
      <Header />
      <ResultsInteractive />
    </>
  );
}