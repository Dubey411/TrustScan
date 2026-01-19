import type { Metadata } from 'next';
import HomepageInteractive from './components/HomepageInteractive';

export const metadata: Metadata = {
  title: 'TrustScan - Your Digital Guardian Against Scams',
  description: 'India\'s first AI-powered job fraud detection platform protecting students and freshers from fake job offers, internship scams, and phishing attempts. Get instant verification with 98% accuracy.',
};

export default function Homepage() {
  return <HomepageInteractive />;
}