import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

const TrustSection = () => {
  const certifications = [
  {
    icon: 'ShieldCheckIcon',
    title: 'Privacy-First Logic',
    description: 'Minimal data retention by design'
  },
  {
    icon: 'LockClosedIcon',
    title: 'SSL Encrypted',
    description: 'Secure data transmission channels'
  },
  {
    icon: 'CommandLineIcon',
    title: 'Anonymized Signals',
    description: 'We process threats, not private data'
  },
  {
    icon: 'ServerIcon',
    title: 'Secure Infrastructure',
    description: 'Encrypted compute environment'
  }];


  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Security Foundation */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-headline font-bold text-foreground mb-4">
            Security by Architecture
          </h2>
          <p className="text-lg text-muted-foreground">
            Built from the ground up to protect your privacy while hunting for threats.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {certifications.map((cert, index) =>
          <div
            key={index}
            className="bg-card rounded-xl p-6 text-center shadow-brand hover:shadow-brand-elevated transition-all duration-300 hover:-translate-y-1">

              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name={cert.icon as any} size={32} variant="solid" className="text-primary" />
              </div>
              <h3 className="text-lg font-headline font-bold text-foreground mb-2">
                {cert.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {cert.description}
              </p>
            </div>
          )}
        </div>

        {/* Trust Stats */}
        <div className="mt-20 bg-gradient-to-r from-primary to-secondary rounded-xl p-12 text-center">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-headline font-bold text-primary-foreground mb-2">99.9%</div>
              <div className="text-primary-foreground/90">System Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-headline font-bold text-primary-foreground mb-2">100+</div>
              <div className="text-primary-foreground/90">Fraud Rules Vetted</div>
            </div>
            <div>
              <div className="text-4xl font-headline font-bold text-primary-foreground mb-2">24/7</div>
              <div className="text-primary-foreground/90">Automated Monitoring</div>
            </div>
          </div>
        </div>
      </div>
    </section>);

};

export default TrustSection;