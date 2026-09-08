'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Icon from '@/components/ui/AppIcon';

const FooterSection = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentYear, setCurrentYear] = useState(2026);

  useEffect(() => {
    setIsHydrated(true);
    setCurrentYear(new Date().getFullYear());
  }, []);

  const footerLinks = {
    Product: [
      { label: 'UPI & Payment Forensics', href: '/scan-interface' },
      { label: 'Offer Letter & CTC Audit', href: '/scan-interface' },
      { label: 'Company & CIN Registry', href: '/scan-interface' },
      { label: 'AI Image Tamper Detection', href: '/scan-interface' },
      { label: 'Pricing Plans', href: '/pricing-page' },
    ],
    Resources: [
      { label: 'Live Scam Alerts', href: '/scam-alerts' },
      { label: 'Citizen Safety Guide', href: '/safety-guide' },
      { label: 'Calibration Architecture', href: '#architecture' },
      { label: 'FAQ & Knowledge Base', href: '/faq' },
    ],
    Company: [
      { label: 'About TrustScan AI', href: '/about-page' },
      { label: 'Contact Support', href: '/contact' },
      { label: 'Security Practices', href: '/about-page' },
      { label: 'Press & Media', href: '/about-page' },
    ],
    Legal: [
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms of Service', href: '/terms-of-service' },
      { label: 'Compliance & Disclaimer', href: '/terms-of-service' },
    ],
  };

  return (
    <footer className="bg-card border-t border-border relative z-10 pt-16 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-14">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center space-x-3 group inline-block">
              <Image
                src="/Logo-mark.png"
                alt="TrustScan Logo"
                width={36}
                height={36}
                className="w-9 h-9 object-contain drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
              />
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-headline font-bold text-foreground tracking-tight">
                  TrustScan
                </span>
                <span className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/30">
                  AI
                </span>
              </div>
            </Link>

            <p className="text-sm text-muted-foreground font-body leading-relaxed max-w-sm">
              India's sovereign AI fraud and credential verification engine. Protecting citizens and businesses with high-accuracy multi-modal digital forensics.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="mailto:trustscan.ai@gmail.com"
                className="w-9 h-9 rounded-lg bg-muted border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 flex items-center justify-center transition-colors"
                aria-label="Email TrustScan"
              >
                <Icon name="EnvelopeIcon" size={16} />
              </a>
              <a
                href="tel:+918591694920"
                className="w-9 h-9 rounded-lg bg-muted border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 flex items-center justify-center transition-colors"
                aria-label="Phone Support"
              >
                <Icon name="PhoneIcon" size={16} />
              </a>
            </div>
          </div>

          {/* 4 Navigation Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground/70">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar with Indian Flag Sovereign Credit */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-xs font-mono text-muted-foreground/80">
            <span>© {isHydrated ? currentYear : '2026'} TrustScan AI. All rights reserved.</span>
            <span className="hidden sm:inline">•</span>
            <span>National Digital Security Initiative</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-muted border border-border">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="w-2 h-2 rounded-full bg-foreground/70" />
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <span className="text-[11px] font-mono font-medium text-foreground/80">
              Engineered with pride in India 🇮🇳
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
