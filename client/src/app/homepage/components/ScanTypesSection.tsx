import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';

const ScanTypesSection = () => {
  const scanTypes = [
    {
      icon: 'BriefcaseIcon',
      title: 'Job Offer Verification',
      description: 'Verify legitimacy of job offers with company validation, salary analysis, and requirement authenticity checks.',
      features: ['Company verification', 'Salary range analysis', 'Job description validation', 'Contact detail verification'],
      color: 'primary',
    },
    {
      icon: 'AcademicCapIcon',
      title: 'Internship Screening',
      description: 'Protect yourself from fake internship programs with comprehensive screening of stipend, duration, and company credentials.',
      features: ['Stipend verification', 'Duration analysis', 'Certificate validation', 'Company background check'],
      color: 'secondary',
    },
    {
      icon: 'LinkIcon',
      title: 'Phishing Link Detection',
      description: 'Identify malicious URLs and phishing attempts before clicking with real-time threat intelligence and pattern recognition.',
      features: ['URL reputation check', 'Domain age analysis', 'SSL certificate validation', 'Blacklist cross-reference'],
      color: 'accent',
    },
    {
      icon: 'ChatBubbleLeftRightIcon',
      title: 'Message Analysis',
      description: 'Scan WhatsApp and email messages for scam indicators, urgency tactics, and fraudulent communication patterns.',
      features: ['Language pattern analysis', 'Urgency detection', 'Contact verification', 'Scam keyword identification'],
      color: 'success-green',
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-headline font-bold text-foreground mb-4">
            Comprehensive Fraud Detection
          </h2>
          <p className="text-lg text-muted-foreground">
            Multiple scan types to protect you from every angle of job market fraud
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {scanTypes.map((type, index) => (
            <div
              key={index}
              className="bg-card rounded-xl p-8 shadow-brand hover:shadow-brand-elevated transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start space-x-4 mb-6">
                <div className={`w-14 h-14 bg-${type.color}/10 rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon name={type.icon as any} size={28} variant="solid" className={`text-${type.color}`} />
                </div>
                <div>
                  <h3 className="text-xl font-headline font-bold text-foreground mb-2">
                    {type.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {type.description}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {type.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <Icon name="CheckCircleIcon" size={20} variant="solid" className="text-success-green flex-shrink-0" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/scan-interface"
                className="inline-flex items-center space-x-2 text-primary hover:text-trust-blue font-medium transition-colors duration-300"
              >
                <span>Try this scan</span>
                <Icon name="ArrowRightIcon" size={16} variant="outline" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScanTypesSection;