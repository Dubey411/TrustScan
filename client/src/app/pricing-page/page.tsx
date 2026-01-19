import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import PricingInteractive from './components/PricingInteractive';

export const metadata: Metadata = {
  title: 'Pricing Plans - TrustScan',
  description: 'Choose the perfect protection plan for your job search. Transparent pricing with student-focused options starting from free. Compare features and find the best value for unlimited fraud detection and career safety.',
};

export default function PricingPage() {
  return (
    <>
      <Header />
      <PricingInteractive />
    </>
  );
}