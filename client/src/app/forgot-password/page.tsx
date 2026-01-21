import Header from '@/components/common/Header';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function ForgotPassword() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card rounded-xl shadow-brand p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
            <Icon name="KeyIcon" size={32} />
          </div>
          <h1 className="text-3xl font-headline font-bold text-foreground mb-4">Forgot Password?</h1>
          <p className="text-muted-foreground mb-8 font-body">
            No worries! Enter your email below and we'll send you instructions to reset your password.
          </p>
          <form className="space-y-6">
            <div className="text-left">
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">Email Address</label>
              <input 
                type="email" 
                id="email" 
                className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground"
                placeholder="student@example.com"
              />
            </div>
            <button className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-trust-blue transition-colors">
              Send Reset Link
            </button>
          </form>
          <div className="mt-8 pt-6 border-t border-border">
            <Link href="/login" className="text-primary hover:text-trust-blue font-medium flex items-center justify-center gap-2">
              <Icon name="ArrowLeftIcon" size={16} />
              Back to Sign In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
