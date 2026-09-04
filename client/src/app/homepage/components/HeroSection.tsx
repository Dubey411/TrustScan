'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface HeroSectionProps {
  onScanClick: () => void;
}

const HeroSection = ({ onScanClick }: HeroSectionProps) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <section className="relative bg-gradient-to-br from-primary via-trust-blue to-secondary text-primary-foreground py-20 lg:py-32 overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-accent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-success-green rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Icon name="ShieldCheckIcon" size={20} variant="solid" className="text-success-green" />
              <span className="text-sm font-medium">India's Smartest AI Fraud & Credential Engine</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-headline font-bold leading-tight">
              Verify Offers, Payments, <br />
              <span className="text-success-green">Images & Companies</span> 
            </h1>

            <p className="text-lg lg:text-xl text-primary-foreground/90 leading-relaxed">
              Instantly audit <strong>Job Offer Letters, UPI Payments, AI-Generated Images, and MCA CIN/GSTIN</strong> with deep forensic AI. Protect yourself from fake credentials and fraudulent transactions.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-4">
              <div className="text-center lg:text-left">
                <div className="text-3xl lg:text-4xl font-headline font-bold text-success-green">100K+</div>
                <div className="text-sm text-primary-foreground/80 mt-1">Docs Verified</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl lg:text-4xl font-headline font-bold text-success-green">50K+</div>
                <div className="text-sm text-primary-foreground/80 mt-1">Entities Checked</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl lg:text-4xl font-headline font-bold text-success-green">99.2%</div>
                <div className="text-sm text-primary-foreground/80 mt-1">Accuracy Rate</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={onScanClick}
                className="flex items-center justify-center space-x-2 px-8 py-4 bg-accent text-accent-foreground rounded-lg font-headline font-semibold text-lg hover:bg-conversion-accent hover:shadow-brand-elevated hover:-translate-y-1 transition-all duration-300"
              >
                <Icon name="MagnifyingGlassIcon" size={24} variant="outline" />
                <span>Scan Now - Free</span>
              </button>
              <Link
                href="/pricing-page"
                className="flex items-center justify-center space-x-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-primary-foreground rounded-lg font-headline font-semibold text-lg hover:bg-white/20 hover:-translate-y-1 transition-all duration-300"
              >
                <span>View Pricing</span>
                <Icon name="ArrowRightIcon" size={20} variant="outline" />
              </Link>
            </div>
          </div>

          {/* Right Content - Animated Shield */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-80 h-80 lg:w-96 lg:h-96">
              {/* Outer Ring */}
              <div className="absolute inset-0 border-4 border-white/20 rounded-full animate-spin-slow"></div>
              
              {/* Middle Ring */}
              <div className="absolute inset-8 border-4 border-success-green/30 rounded-full animate-spin-reverse"></div>
              
              {/* Shield Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  width="200"
                  height="200"
                  viewBox="0 0 200 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="animate-shield-pulse"
                >
                  <path
                    d="M100 10L20 50V90C20 139.706 54.2 179.18 100 190C145.8 179.18 180 139.706 180 90V50L100 10Z"
                    fill="url(#shield-gradient)"
                    stroke="white"
                    strokeWidth="4"
                  />
                  <path
                    d="M100 60L70 80V110C70 129.33 83.43 145.545 100 150C116.57 145.545 130 129.33 130 110V80L100 60Z"
                    fill="white"
                  />
                  <path
                    d="M85 105L95 115L115 95"
                    stroke="#10B981"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <defs>
                    <linearGradient id="shield-gradient" x1="20" y1="10" x2="180" y2="190">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              
              {/* Floating Icons */}
              {isHydrated && (
                <>
                  <div className="absolute top-0 right-0 bg-white/10 backdrop-blur-sm p-3 rounded-full animate-float">
                    <Icon name="CheckBadgeIcon" size={24} variant="solid" className="text-success-green" />
                  </div>
                  <div className="absolute bottom-0 left-0 bg-white/10 backdrop-blur-sm p-3 rounded-full animate-float delay-500">
                    <Icon name="LockClosedIcon" size={24} variant="solid" className="text-accent" />
                  </div>
                  <div className="absolute top-1/2 right-0 bg-white/10 backdrop-blur-sm p-3 rounded-full animate-float delay-1000">
                    <Icon name="ShieldExclamationIcon" size={24} variant="solid" className="text-error" />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes shield-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .animate-spin-reverse {
          animation: spin-reverse 15s linear infinite;
        }
        .animate-shield-pulse {
          animation: shield-pulse 3s ease-in-out infinite;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .delay-500 {
          animation-delay: 0.5s;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;