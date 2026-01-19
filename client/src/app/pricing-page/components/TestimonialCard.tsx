import React from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

interface TestimonialCardProps {
  name: string;
  role: string;
  image: string;
  alt: string;
  rating: number;
  testimonial: string;
}

const TestimonialCard = ({
  name,
  role,
  image,
  alt,
  rating,
  testimonial,
}: TestimonialCardProps) => {
  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-brand hover:shadow-brand-elevated transition-all duration-300">
      <div className="flex items-center mb-4">
        <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
          <AppImage
            src={image}
            alt={alt}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="ml-4">
          <h4 className="font-headline font-semibold text-foreground">{name}</h4>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </div>

      <div className="flex mb-3">
        {[...Array(5)].map((_, index) => (
          <Icon
            key={index}
            name="StarIcon"
            size={16}
            variant={index < rating ? 'solid' : 'outline'}
            className={index < rating ? 'text-accent' : 'text-muted-foreground'}
          />
        ))}
      </div>

      <p className="text-sm text-foreground leading-relaxed">{testimonial}</p>
    </div>
  );
};

export default TestimonialCard;