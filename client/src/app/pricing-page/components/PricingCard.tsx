import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface Feature {
  text: string;
  included: boolean;
}

interface PricingCardProps {
  title: string;
  subtitle: string;
  price: string;  
  period: string;
  features: Feature[];
  isPopular?: boolean;
  ctaText: string;
  onCtaClick: () => void;
  badge?: string;
}

const PricingCard = ({
  title,
  subtitle,
  price,
  period,
  features,
  isPopular = false,
  ctaText,
  onCtaClick,
  badge,
}: PricingCardProps) => {
  return (
    <div
      className={`relative bg-card rounded-xl p-8 transition-all duration-300 hover:shadow-brand-elevated ${
        isPopular
          ? 'border-2 border-primary shadow-brand-elevated scale-105'
          : 'border border-border shadow-brand hover:border-primary'
      }`}
    >
      {badge && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-headline font-semibold shadow-md">
            {badge}
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-2xl font-headline font-bold text-foreground mb-2">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className="text-center mb-8">
        <div className="flex items-baseline justify-center">
          <span className="text-5xl font-headline font-bold text-primary">
            {price}
          </span>
          <span className="text-muted-foreground ml-2">/{period}</span>
        </div>
      </div>

      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Icon
              name={feature.included ? 'CheckCircleIcon' : 'XCircleIcon'}
              size={20}
              variant="solid"
              className={
                feature.included ? 'text-success-green' : 'text-muted-foreground'
              }
            />
            <span
              className={`ml-3 text-sm ${
                feature.included ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      <button
        onClick={onCtaClick}
        className={`w-full py-3 rounded-md font-headline font-semibold text-sm transition-all duration-300 hover:-translate-y-0.5 ${
          isPopular
            ? 'bg-primary text-primary-foreground hover:bg-trust-blue shadow-brand'
            : 'bg-muted text-foreground hover:bg-primary hover:text-primary-foreground'
        }`}
      >
        {ctaText}
      </button>
    </div>
  );
};

export default PricingCard;