import Header from '@/components/common/Header';
import FooterSection from '../homepage/components/FooterSection';
import Icon from '@/components/ui/AppIcon';

export default function AboutPage() {
  const stats = [
    { label: 'Rules Processed', value: '100+', icon: 'ShieldExclamationIcon' },
    { label: 'Analysis Layers', value: '3-Step', icon: 'CommandLineIcon' },
    { label: 'Scan Speed', value: '<2s', icon: 'BoltIcon' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Story Section */}
        <section className="pt-32 pb-20 container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-headline font-bold text-foreground mb-8 text-center leading-tight">
                Combatting Digital Fraud with <span className="text-primary">Human-Centric AI</span>
            </h1>
            <p className="text-xl text-muted-foreground text-center mb-12 leading-relaxed">
                In an era where digital job offers arrive via WhatsApp and PDF documents can be forged in seconds, TrustScan stands as the ultimate line of defense for the Indian youth.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-20">
              {stats.map((stat, i) => (
                <div key={i} className="bg-card border border-border rounded-3xl p-8 text-center hover:shadow-brand transition-all">
                  <div className="text-primary mb-3 flex justify-center">
                    <Icon name={stat.icon as any} size={32} />
                  </div>
                  <div className="text-3xl font-headline font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Vision/Mission */}
        <section className="bg-muted py-24">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-bold text-sm">
                            <Icon name="HandRaisedIcon" size={16} />
                            Our Founding Mission
                        </div>
                        <h2 className="text-4xl font-headline font-bold text-foreground">Why we started TrustScan</h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            TrustScan was born out of a simple observation: thousands of deserving students in India were losing their hard-earned money to "Registration Fee" scams and identity theft. 
                        </p>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            We realized that while scammers were using technology to deceive, we could use even more advanced technology to protect. Today, TrustScan is a production-grade infrastructure that analyzes millions of data points to keep dreams safe.
                        </p>
                    </div>
                    <div className="grid gap-6">
                        <div className="bg-card p-8 rounded-3xl border border-border shadow-subtle group hover:border-primary transition-all">
                            <h3 className="text-xl font-headline font-bold text-foreground mb-3">Transparency</h3>
                            <p className="text-muted-foreground">We believe security is a right, not a luxury. Our results are always explained in plain English.</p>
                        </div>
                        <div className="bg-card p-8 rounded-3xl border border-border shadow-subtle group hover:border-primary transition-all">
                            <h3 className="text-xl font-headline font-bold text-foreground mb-3">Excellence</h3>
                            <p className="text-muted-foreground">We use state-of-the-art OCR and ML weights to stay one step ahead of the latest fraudulent tactics.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
      </main>
      <FooterSection />
    </div>
  );
}
