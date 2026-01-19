'use client';

import { useState, useEffect } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  college: string;
  image: string;
  alt: string;
  rating: number;
  text: string;
  savedAmount: string;
}

const TestimonialsSection = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Priya Sharma',
    role: 'Computer Science Student',
    college: 'IIT Delhi',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_1c48da832-1763299032357.png",
    alt: 'Young Indian woman with long black hair wearing blue shirt smiling at camera',
    rating: 5,
    text: 'SafeJobIndia saved me from a fake internship that demanded ₹15,000 as registration fee. The AI detected multiple red flags instantly. Highly recommended for all students!',
    savedAmount: '₹15,000'
  },
  {
    id: 2,
    name: 'Rahul Verma',
    role: 'MBA Graduate',
    college: 'XLRI Jamshedpur',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_15c82c971-1763293909823.png",
    alt: 'Young Indian man with short black hair in formal white shirt smiling professionally',
    rating: 5,
    text: 'I was about to share my bank details with a fraudulent recruiter. SafeJobIndia\'s phishing detection caught it before I made a mistake. This platform is a lifesaver!',
    savedAmount: 'Identity Theft'
  },
  {
    id: 3,
    name: 'Ananya Patel',
    role: 'Engineering Student',
    college: 'NIT Trichy',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_19205d2aa-1763296356182.png",
    alt: 'Young Indian woman with shoulder-length brown hair wearing professional attire smiling warmly',
    rating: 5,
    text: 'The detailed reports helped me understand scam patterns. Now I can identify fake offers myself. The educational resources are incredibly valuable for freshers like me.',
    savedAmount: '₹25,000'
  },
  {
    id: 4,
    name: 'Arjun Singh',
    role: 'Final Year Student',
    college: 'Delhi University',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_1ca3d7670-1763294113540.png",
    alt: 'Young Indian man with beard wearing casual blue shirt outdoors smiling confidently',
    rating: 5,
    text: 'My parents were worried about my job search safety. SafeJobIndia gave them peace of mind. The verification process is thorough and the results are instant.',
    savedAmount: '₹10,000'
  }];


  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  if (!isHydrated) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-headline font-bold text-foreground mb-4">
              Trusted by Students Across India
            </h2>
            <p className="text-lg text-muted-foreground">
              Real stories from students we've protected from job scams
            </p>
          </div>
          <div className="max-w-4xl mx-auto bg-card rounded-xl p-8 shadow-brand">
            <div className="animate-pulse space-y-4">
              <div className="h-20 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </section>);

  }

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-headline font-bold text-foreground mb-4">
            Trusted by Students Across India
          </h2>
          <p className="text-lg text-muted-foreground">
            Real stories from students we've protected from job scams
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-xl p-8 lg:p-12 shadow-brand-elevated">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <div className="relative w-32 h-32 lg:w-40 lg:h-40">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full opacity-20"></div>
                  <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-primary/20">
                    <AppImage
                      src={currentTestimonial.image}
                      alt={currentTestimonial.alt}
                      className="w-full h-full object-cover" />

                  </div>
                  {/* Saved Badge */}
                  <div className="absolute -bottom-2 -right-2 bg-success-green text-success-green-foreground px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    Saved {currentTestimonial.savedAmount}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 text-center lg:text-left">
                {/* Rating */}
                <div className="flex justify-center lg:justify-start space-x-1 mb-4">
                  {[...Array(currentTestimonial.rating)].map((_, i) =>
                  <Icon key={i} name="StarIcon" size={20} variant="solid" className="text-accent" />
                  )}
                </div>

                {/* Testimonial Text */}
                <blockquote className="text-lg text-foreground leading-relaxed mb-6">
                  "{currentTestimonial.text}"
                </blockquote>

                {/* Author Info */}
                <div className="space-y-1">
                  <div className="text-xl font-headline font-bold text-foreground">
                    {currentTestimonial.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {currentTestimonial.role}
                  </div>
                  <div className="flex items-center justify-center lg:justify-start space-x-2 text-sm text-primary">
                    <Icon name="AcademicCapIcon" size={16} variant="solid" />
                    <span>{currentTestimonial.college}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-8 border-t border-border">
              <button
                onClick={prevTestimonial}
                className="p-3 rounded-full hover:bg-muted transition-colors duration-300"
                aria-label="Previous testimonial">

                <Icon name="ChevronLeftIcon" size={24} variant="outline" />
              </button>

              {/* Dots */}
              <div className="flex space-x-2">
                {testimonials.map((_, index) =>
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'w-8 bg-primary' : 'bg-muted-foreground'}`
                  }
                  aria-label={`Go to testimonial ${index + 1}`} />

                )}
              </div>

              <button
                onClick={nextTestimonial}
                className="p-3 rounded-full hover:bg-muted transition-colors duration-300"
                aria-label="Next testimonial">

                <Icon name="ChevronRightIcon" size={24} variant="outline" />
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="bg-card rounded-lg p-6 text-center shadow-brand">
              <div className="text-3xl font-headline font-bold text-success-green mb-2">50K+</div>
              <div className="text-sm text-muted-foreground">Students Protected</div>
            </div>
            <div className="bg-card rounded-lg p-6 text-center shadow-brand">
              <div className="text-3xl font-headline font-bold text-success-green mb-2">₹2Cr+</div>
              <div className="text-sm text-muted-foreground">Money Saved</div>
            </div>
            <div className="bg-card rounded-lg p-6 text-center shadow-brand">
              <div className="text-3xl font-headline font-bold text-success-green mb-2">4.9/5</div>
              <div className="text-sm text-muted-foreground">User Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>);

};

export default TestimonialsSection;