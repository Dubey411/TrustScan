'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon'; // ✅ alias FIX

const FooterSection = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentYear, setCurrentYear] = useState(2026);

  useEffect(() => {
    setIsHydrated(true);
    setCurrentYear(new Date().getFullYear());
  }, []);

  const footerLinks = {
    product: [
      { label: 'How It Works', href: '/homepage#how-it-works' },
      { label: 'Scan Types', href: '/scan-interface' },
      { label: 'Pricing', href: '/pricing-page' },
    ],
    resources: [
      { label: 'Blog', href: '/blog' },
      { label: 'Scam Alerts', href: '/scam-alerts' },
      { label: 'Safety Guide', href: '/safety-guide' },
      { label: 'FAQ', href: '/faq' },
    ],
    company: [
      { label: 'About Us', href: '/about-page' },
      { label: 'Contact', href: '/contact' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms of Service', href: '/terms-of-service' },
      { label: 'Cookie Policy', href: '/cookie-policy' },
      { label: 'Disclaimer', href: '/disclaimer' },
    ],
  };

  const socialLinks = [
    { icon: 'EnvelopeIcon', href: 'mailto:trustscan.ai@gmail.com', label: 'Email' },
    { icon: 'PhoneIcon', href: 'tel:+918591694920', label: 'Phone' },
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-xl font-headline font-bold text-primary">
                TrustScan
              </span>
            </Link>

            <p className="text-sm text-muted-foreground mb-4">
              India's #1 AI-powered fraud detection platform. Protecting citizens from SMS spoofing, job scams, and fraudulent businesses.
            </p>

            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-muted text-muted-foreground
                             flex items-center justify-center
                             hover:bg-primary hover:text-primary-foreground
                             transition-colors"
                  aria-label={social.label}
                >
                  <Icon name={social.icon as any} size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-xs font-headline font-bold text-foreground mb-4 uppercase tracking-wider">
                {section}
              </h3>
              <ul className="space-y-3">
                {links.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-foreground font-bold">
              {isHydrated ? `© ${currentYear}` : '© 2026'} TrustScan AI. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground max-w-md">
              A private digital guardian initiative dedicated to protecting Indian citizens from financial fraud and identity theft. Results are provided for informational purposes only.
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full border border-border">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <div className="w-2 h-2 rounded-full bg-white border border-border" />
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Made with 🇮🇳 in India</span>
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-tighter opacity-50">
                Beta v1.0.4 • Security Cloud Powered by DeepMind Logic
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
