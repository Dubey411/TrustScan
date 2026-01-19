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
      { label: 'Dashboard', href: '/user-dashboard' },
    ],
    resources: [
      { label: 'Blog', href: '#' },
      { label: 'Scam Alerts', href: '#' },
      { label: 'Safety Guide', href: '#' },
      { label: 'FAQ', href: '#' },
    ],
    company: [
      { label: 'About Us', href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Press', href: '#' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' },
      { label: 'Disclaimer', href: '#' },
    ],
  };

  const socialLinks = [
    { icon: 'EnvelopeIcon', href: 'mailto:support@TrustScan.com', label: 'Email' },
    { icon: 'PhoneIcon', href: 'tel:+911234567890', label: 'Phone' },
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/homepage" className="flex items-center gap-2 mb-4">
              <span className="text-xl font-headline font-bold text-primary">
                TrustScan
              </span>
            </Link>

            <p className="text-sm text-muted-foreground mb-4">
              Your digital guardian protecting students from job scams across India.
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
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {isHydrated ? `© ${currentYear}` : '© 2026'} TrustScan. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Icon name="ShieldCheckIcon" size={16} className="text-success-green" />
              SSL Secured
            </span>
            <span className="flex items-center gap-2">
              <Icon name="LockClosedIcon" size={16} className="text-primary" />
              ISO 27001 Certified
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
