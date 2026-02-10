import Icon from '@/components/ui/AppIcon';

const HowItWorksSection = () => {
  const steps = [
    {
      icon: 'DocumentTextIcon',
      title: 'Submit Details',
      description: 'Paste details for a fake job offer check, check if this link is safe, or analyze UPI fraud messages in our secure scanning interface.',
    },
    {
      icon: 'CpuChipIcon',
      title: 'AI Analysis',
      description: 'Our advanced AI algorithms analyze patterns, perform CIN verification online, and cross-reference against known scam databases.',
    },
    {
      icon: 'ShieldCheckIcon',
      title: 'Get Results',
      description: 'Receive instant verdict with probability scores, red flag indicators, and actionable recommendations for your safety.',
    },
    {
      icon: 'AcademicCapIcon',
      title: 'Learn & Protect',
      description: 'Access educational resources, understand scam patterns, and build awareness to protect yourself in future job searches.',
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-headline font-bold text-foreground mb-4">
            How TrustScan AI Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Our multi-layered security engine protects Indian users from SMS spoofing, fake business registrations, and fraudulent job offers in four simple steps.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative group"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-primary to-transparent -translate-x-1/2 z-0"></div>
              )}

              <div className="relative bg-card rounded-xl p-6 shadow-brand hover:shadow-brand-elevated transition-all duration-300 hover:-translate-y-2 z-10">
                {/* Step Number */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-headline font-bold text-xl shadow-lg">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                  <Icon name={step.icon as any} size={32} variant="solid" className="text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-headline font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;