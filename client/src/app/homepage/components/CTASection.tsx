import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary via-trust-blue to-secondary">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-5xl font-headline font-bold text-primary-foreground mb-6">
            Start Protecting Your Career Today
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 leading-relaxed">
            Join 1 lakh+ students who trust SafeJobIndia to verify job offers and protect themselves from scams. Your first scan is completely free!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              href="/scan-interface"
              className="flex items-center space-x-2 px-8 py-4 bg-accent text-accent-foreground rounded-lg font-headline font-semibold text-lg hover:bg-conversion-accent hover:shadow-brand-elevated hover:-translate-y-1 transition-all duration-300"
            >
              <Icon name="ShieldCheckIcon" size={24} variant="solid" />
              <span>Scan Now - Free</span>
            </Link>
            <Link
              href="/pricing-page"
              className="flex items-center space-x-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-primary-foreground rounded-lg font-headline font-semibold text-lg hover:bg-white/20 hover:-translate-y-1 transition-all duration-300"
            >
              <span>View Pricing</span>
              <Icon name="ArrowRightIcon" size={20} variant="outline" />
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-primary-foreground/80">
            <div className="flex items-center space-x-2">
              <Icon name="CheckCircleIcon" size={20} variant="solid" className="text-success-green" />
              <span className="text-sm">No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="CheckCircleIcon" size={20} variant="solid" className="text-success-green" />
              <span className="text-sm">Cancel anytime</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="CheckCircleIcon" size={20} variant="solid" className="text-success-green" />
              <span className="text-sm">100% secure</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;