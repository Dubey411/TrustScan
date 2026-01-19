import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import LoginInteractive from './components/LoginInteractive';

export const metadata: Metadata = {
  title: 'Login - TrustScan',
  description: 'Sign in to your TrustScan account to access your personalized dashboard, scan history, and comprehensive job fraud protection tools. Secure authentication with social login options.',
};

export default function LoginPage() {
  return (
    <>
      <Header />
      <LoginInteractive />
    </>
  );
}