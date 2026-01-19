import Icon from '@/components/ui/AppIcon';

const ComparisonSection = () => {
  const features = [
    { name: 'Job Offer Verification', free: true, premium: true },
    { name: 'Internship Screening', free: true, premium: true },
    { name: 'Phishing Link Detection', free: true, premium: true },
    { name: 'Message Analysis', free: true, premium: true },
    { name: 'Scans per Month', free: '5 scans', premium: 'Unlimited' },
    { name: 'Detailed Reports', free: false, premium: true },
    { name: 'Historical Scan Access', free: '7 days', premium: 'Lifetime' },
    { name: 'Priority Support', free: false, premium: true },
    { name: 'Advanced AI Analysis', free: false, premium: true },
    { name: 'Company Database Access', free: false, premium: true },
    { name: 'Real-time Alerts', free: false, premium: true },
    { name: 'Export Reports (PDF)', free: false, premium: true },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-headline font-bold text-foreground mb-4">
            Free vs Premium Features
          </h2>
          <p className="text-lg text-muted-foreground">
            Start with our free plan and upgrade anytime for comprehensive protection
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-card rounded-xl shadow-brand-elevated overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-3 gap-4 p-6 bg-muted/30 border-b border-border">
            <div className="text-lg font-headline font-bold text-foreground">Features</div>
            <div className="text-center">
              <div className="text-lg font-headline font-bold text-foreground mb-1">Free Plan</div>
              <div className="text-sm text-muted-foreground">₹0/month</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-headline font-bold text-primary mb-1">Premium Plan</div>
              <div className="text-sm text-muted-foreground">₹199/month</div>
            </div>
          </div>

          {/* Features List */}
          <div className="divide-y divide-border">
            {features?.map((feature, index) => (
              <div
                key={index}
                className="grid grid-cols-3 gap-4 p-6 hover:bg-muted/20 transition-colors duration-300"
              >
                <div className="text-foreground font-medium">{feature?.name}</div>
                <div className="flex justify-center">
                  {typeof feature?.free === 'boolean' ? (
                    feature?.free ? (
                      <Icon name="CheckCircleIcon" size={24} variant="solid" className="text-success-green" />
                    ) : (
                      <Icon name="XCircleIcon" size={24} variant="solid" className="text-muted-foreground" />
                    )
                  ) : (
                    <span className="text-sm text-muted-foreground">{feature?.free}</span>
                  )}
                </div>
                <div className="flex justify-center">
                  {typeof feature?.premium === 'boolean' ? (
                    feature?.premium ? (
                      <Icon name="CheckCircleIcon" size={24} variant="solid" className="text-primary" />
                    ) : (
                      <Icon name="XCircleIcon" size={24} variant="solid" className="text-muted-foreground" />
                    )
                  ) : (
                    <span className="text-sm font-medium text-primary">{feature?.premium}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* CTA Footer */}
          <div className="grid grid-cols-2 gap-4 p-6 bg-muted/30 border-t border-border">
            <div className="flex justify-center">
              <button className="px-6 py-3 bg-muted text-foreground rounded-lg font-headline font-semibold hover:bg-muted-foreground/20 transition-all duration-300">
                Start Free
              </button>
            </div>
            <div className="flex justify-center">
              <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-headline font-semibold hover:bg-trust-blue hover:shadow-brand hover:-translate-y-0.5 transition-all duration-300">
                Upgrade to Premium
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;