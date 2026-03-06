import { notFound } from 'next/navigation';
import Header from '@/components/common/Header';
import FooterSection from '../homepage/components/FooterSection';
import Icon from '@/components/ui/AppIcon';
import { Metadata } from 'next';

const pageData: Record<string, { title: string; desc: string }> = {
  'blog': { 
    title: 'TrustScan Blog', 
    desc: 'Deep dives into Indian cyber-fraud trends, security tips, and TrustScan product updates.' 
  },
  'careers': { 
    title: 'Join Our Mission', 
    desc: 'Help us build India\'s strongest AI defense against digital fraud. Explore career opportunities at TrustScan.' 
  },
  'press': { 
    title: 'Press & Media', 
    desc: 'Official news, media assets, and press contact information for TrustScan AI.' 
  },
  'cookie-policy': { 
    title: 'Cookie Policy', 
    desc: 'Information about how TrustScan uses cookies to improve your security experience.' 
  },
  'disclaimer': { 
    title: 'Legal Disclaimer', 
    desc: 'Important legal notices regarding the use of TrustScan AI results and data.' 
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = pageData[slug];

  if (!page) return {};

  return {
    title: `${page.title} | TrustScan AI`,
    description: page.desc,
    alternates: {
      canonical: `/${slug}`,
    },
  };
}

export default async function InfoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = pageData[slug];

  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-grow pt-32 pb-16">
        <div className="container mx-auto px-4 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-6">
                <Icon name="InformationCircleIcon" size={40} />
            </div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground mb-4">
            {page.title}
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
                Our team is actively compiling data for the {page.title} section. Stay tuned!
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
  return Object.keys(pageData).map((slug) => ({ slug }));
}
