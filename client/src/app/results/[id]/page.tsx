'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/common/Header';
import FooterSection from '@/app/homepage/components/FooterSection';
import ResultsInteractive from '@/app/results-dashboard/components/ResultsInteractive';
import { getScanResult } from '@/api/scan';
import Icon from '@/components/ui/AppIcon';

export default function SharedResultsPage() {
  const { id } = useParams();
  const [scanData, setScanData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchResult = async () => {
      try {
        const data = await getScanResult(id as string);
        setScanData(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center pt-20">
          <div className="animate-spin text-primary mb-4">
            <Icon name="ArrowPathIcon" size={48} />
          </div>
          <p className="text-muted-foreground font-headline font-bold">Verifying Shared Results...</p>
        </main>
        <FooterSection />
      </div>
    );
  }

  if (error || !scanData) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center pt-20 px-4">
          <div className="p-6 bg-error/10 rounded-full text-error mb-6">
            <Icon name="ExclamationTriangleIcon" size={64} />
          </div>
          <h1 className="text-3xl font-headline font-bold text-foreground mb-4 text-center">Result Not Found</h1>
          <p className="text-muted-foreground text-center max-w-md mb-8">
            The scan result you are looking for might have expired, been deleted, or the link is incorrect.
          </p>
          <a href="/homepage" className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:shadow-lg transition-all">
            Back to Safety
          </a>
        </main>
        <FooterSection />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow pt-32 pb-20">
        <div className="container mx-auto px-4">
            <div className="mb-8 text-center max-w-2xl mx-auto">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-primary text-xs font-bold uppercase tracking-widest mb-4">
                    <Icon name="ShieldCheckIcon" size={14} />
                    Verified TrustScan Report
                </span>
                <h1 className="text-4xl font-headline font-bold text-foreground">Safety Analysis Report</h1>
            </div>
            <ResultsInteractive scanData={scanData} showFeedback={false} />
        </div>
      </main>
      <FooterSection />
    </div>
  );
}
