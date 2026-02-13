import { notFound } from 'next/navigation';
import Header from '@/components/common/Header';
import FooterSection from '../homepage/components/FooterSection';
import Icon from '@/components/ui/AppIcon';

export default async function InfoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const titles: Record<string, string> = {
    'blog': 'TrustScan Blog',
    'scam-alerts': 'Live Scam Alerts',
    'contact': 'Contact Us',
    'careers': 'Join Our Mission',
    'press': 'Press & Media',
    'cookie-policy': 'Cookie Policy',
    'disclaimer': 'Legal Disclaimer',
  };

  if (!titles[slug]) {
    notFound();
  }

  const title = titles[slug];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-grow pt-32 pb-16">
        <div className="container mx-auto px-4 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-6">
                <Icon name="InformationCircleIcon" size={40} />
            </div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground mb-4">
            {title}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
            We are currently building this section to provide you with the most accurate and up-to-date security information.
          </p>
          
          <div className="max-w-md mx-auto aspect-video bg-muted rounded-2xl flex flex-col items-center justify-center border border-dashed border-border p-8">
             <div className="animate-spin text-primary mb-4">
                <Icon name="ArrowPathIcon" size={32} />
             </div>
             <p className="font-bold text-foreground">Coming Soon</p>
             <p className="text-xs text-muted-foreground mt-1 text-center">
                Our team is actively compiling data for the {title} section. Stay tuned!
             </p>
          </div>

          <div className="mt-12 group">
            <a href="/" className="text-primary font-bold flex items-center justify-center gap-2 hover:gap-3 transition-all">
                <Icon name="ArrowLeftIcon" size={18} />
                Back to Safety
            </a>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}

export function generateStaticParams() {
  return [
    { slug: 'blog' },
    { slug: 'scam-alerts' },
    { slug: 'contact' },
    { slug: 'careers' },
    { slug: 'press' },
    { slug: 'cookie-policy' },
    { slug: 'disclaimer' },
  ];
}
