import Header from '@/components/common/Header';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-16 container mx-auto px-4">
        <h1 className="text-4xl font-headline font-bold text-foreground mb-8">Terms of Service</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-muted-foreground mb-6">Last updated: January 2026</p>
          <p>
            By using TrustScan AI, you agree to the following terms and conditions. Our service is provided to help detect potential fraud, but results should be verified.
          </p>
          <h2 className="text-2xl font-bold mt-8 mb-4">Usage Limits</h2>
          <p>
            Free tier users are limited to a certain number of scans per day. Excessive use or abuse of the service may lead to account suspension.
          </p>
        </div>
      </main>
    </div>
  );
}
