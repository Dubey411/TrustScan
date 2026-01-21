import Header from '@/components/common/Header';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-16 container mx-auto px-4">
        <h1 className="text-4xl font-headline font-bold text-foreground mb-8">About TrustScan AI</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-xl text-muted-foreground mb-6">
            TrustScan AI is a production-grade fraud detection platform specifically designed for the Indian digital landscape.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="p-6 bg-card rounded-xl border border-border">
              <h3 className="text-xl font-bold mb-4">Our Mission</h3>
              <p>To provide advanced, AI-driven protection against digital fraud, ensuring safety for students, job seekers, and organizations.</p>
            </div>
            <div className="p-6 bg-card rounded-xl border border-border">
              <h3 className="text-xl font-bold mb-4">Our Technology</h3>
              <p>We leverage multi-modal AI, OCR, and structural analysis to detect anomalies in documents, links, and transaction records.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
