import Header from '@/components/common/Header';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-16 container mx-auto px-4">
        <h1 className="text-4xl font-headline font-bold text-foreground mb-8">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-muted-foreground mb-6">Last updated: January 2026</p>
          <p>
            At TrustScan AI, your privacy is our top priority. We only collect the necessary data to perform fraud analysis and improve our security models.
          </p>
          <h2 className="text-2xl font-bold mt-8 mb-4">Data We Collect</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Account Information (Email, Name)</li>
            <li>Uploaded Documents (Processed for scan only, not permanently stored by default)</li>
            <li>Scan Metadata (Type, Confidence, Results)</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
