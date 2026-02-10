import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import FooterSection from '../homepage/components/FooterSection';
import Icon from '@/components/ui/AppIcon';

export const metadata: Metadata = {
  title: 'Live Scam Alerts | UPI Fraud Messages & Fake Job Offers',
  description: 'Stay updated on the latest fraudulent schemes. Check fake job offers and UPI fraud messages targeting students.',
  keywords: ['live scam alerts', 'UPI fraud message', 'fake job offer check', 'online fraud India'],
};

export default function ScamAlertsPage() {
  const alerts = [
    {
      id: 1,
      title: 'Bulk WhatsApp Internship Offers',
      severity: 'high',
      date: 'Jan 24, 2026',
      description: 'Massive campaign targeting engineering students with fake Google/Amazon internship offers via WhatsApp. Asking for ₹999 for "ID card processing".',
      type: 'Job Scam',
    },
    {
      id: 2,
      title: 'Fake Govt. Scholarship Portals',
      severity: 'critical',
      date: 'Jan 22, 2026',
      description: 'Phishing sites mimicking the National Scholarship Portal (NSP). Stealing PAN and Aadhaar data of applicants.',
      type: 'Phishing',
    },
    {
      id: 3,
      title: 'Remote Data Entry "Security Deposit"',
      severity: 'medium',
      date: 'Jan 20, 2026',
      description: 'Adverts on Instagram for "Typing Jobs" requiring a ₹2500 security deposit for specialized keyboard software.',
      type: 'Financial Fraud',
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-12">
                <div className="w-12 h-12 bg-error/10 rounded-2xl flex items-center justify-center text-error">
                    <Icon name="BellAlertIcon" size={28} />
                </div>
                <div>
                    <h1 className="text-4xl font-headline font-bold text-foreground">Live Scam Alerts</h1>
                    <p className="text-muted-foreground">Real-time intelligence on active fraudulent campaigns.</p>
                </div>
            </div>

            <div className="space-y-6">
              {alerts.map((alert) => (
                <div key={alert.id} className="bg-card border-l-4 border-l-error border border-border rounded-xl p-6 shadow-subtle">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-error py-1 px-3 bg-error/10 rounded-full">
                        {alert.severity} Risk
                    </span>
                    <span className="text-sm text-muted-foreground">{alert.date}</span>
                  </div>
                  <h2 className="text-2xl font-headline font-bold text-foreground mb-2">{alert.title}</h2>
                  <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-primary">
                    <Icon name="TagIcon" size={14} />
                    {alert.type}
                  </div>
                  <p className="text-muted-foreground bg-muted/30 p-4 rounded-lg leading-relaxed border border-border/50">
                    {alert.description}
                  </p>
                  <div className="mt-6 flex justify-end">
                    <button className="text-sm font-bold text-foreground flex items-center gap-2 hover:text-primary transition-colors">
                        Report Similar Case
                        <Icon name="ArrowTopRightOnSquareIcon" size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
                <p className="text-foreground font-semibold mb-4 text-lg">Did you get a <strong>UPI fraud message</strong> or need a <strong>fake job offer check</strong>?</p>
                <a href="/scan-interface" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-bold hover:shadow-brand transition-all">
                    Analyze it Now
                    <Icon name="MagnifyingGlassIcon" size={18} />
                </a>
            </div>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
