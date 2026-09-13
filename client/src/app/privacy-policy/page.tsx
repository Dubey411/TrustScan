import Header from '@/components/common/Header';
import FooterSection from '../homepage/components/FooterSection';
import Icon from '@/components/ui/AppIcon';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | TrustScan AI - Data Security & AdSense Disclosures',
  description: 'Learn how TrustScan AI protects your personal information, OCR scan payloads, and privacy under the Digital Personal Data Protection Act, 2023 (DPDPA) and Google AdSense policies.',
  alternates: {
    canonical: '/privacy-policy',
  },
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground mb-4">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              <Icon name="CalendarIcon" size={16} />
              <span>Effective & Last Updated: January 2026</span>
              <span className="mx-1">•</span>
              <span>Compliant with DPDPA 2023 & Google AdSense Policy</span>
            </p>
          </div>

          {/* Policy Container */}
          <div className="bg-card border border-border rounded-3xl p-8 md:p-12 space-y-12 shadow-subtle text-foreground/90">
            
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-headline font-bold text-foreground mb-4">
                1. Introduction & Scope
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                TrustScan AI (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), operated by Shubham Dubey, is committed to safeguarding the digital privacy of every individual who accesses our web application at <a href="https://www.trustscanai.in" className="text-primary hover:underline font-medium">https://www.trustscanai.in</a>.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                This Privacy Policy outlines how we collect, process, store, and protect your information when you utilize our automated fraud detection engine, upload job offers for verification, or interact with our content. We adhere strictly to the Indian Information Technology Act, 2000, the Digital Personal Data Protection Act, 2023 (DPDPA), and Google Publisher Policies.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-headline font-bold text-foreground mb-4">
                2. Information We Collect
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <div className="p-4 rounded-xl bg-muted/40 border border-border">
                  <h3 className="font-headline font-bold text-foreground mb-1">A. Information You Provide Directly</h3>
                  <p className="text-sm">
                    <strong>Account Information:</strong> When registering, we collect your full name, email address, and authentication credentials (managed securely via Firebase Authentication).
                  </p>
                  <p className="text-sm mt-1">
                    <strong>Inquiries & Contact:</strong> Information provided via our contact form, support requests, or direct correspondence with our team.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-muted/40 border border-border">
                  <h3 className="font-headline font-bold text-foreground mb-1">B. Document & Forensic Payloads</h3>
                  <p className="text-sm">
                    When you upload an offer letter, certificate, or image for scanning, the file is parsed in-memory using optical character recognition (OCR) and forensic heuristics. We do <strong>not</strong> sell, distribute, or permanently archive your raw document copies unless you explicitly choose to save the report to your personal user dashboard.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-muted/40 border border-border">
                  <h3 className="font-headline font-bold text-foreground mb-1">C. Automatically Collected Technical Data</h3>
                  <p className="text-sm">
                    Our servers automatically record standard log data, including your Internet Protocol (IP) address, browser user-agent, operating system, referring URL, time spent on pages, and diagnostic telemetry to prevent malicious denial-of-service attempts.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 - Google AdSense Mandatory Clause */}
            <section className="border-l-4 border-primary pl-6 py-2">
              <h2 className="text-2xl font-headline font-bold text-foreground mb-4">
                3. Google AdSense & Third-Party Advertising Disclosures
              </h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  TrustScan AI displays advertisements served by <strong>Google AdSense</strong> and authorized third-party ad networks to keep our core verification tools free for students and job seekers across India.
                </p>
                <div className="bg-muted/60 p-5 rounded-2xl border border-border text-sm space-y-3">
                  <p>
                    <strong className="text-foreground">Use of Advertising Cookies:</strong> Third-party vendors, including Google, use cookies to serve ads based on a user&rsquo;s prior visits to our website or other websites across the internet.
                  </p>
                  <p>
                    <strong className="text-foreground">DoubleClick Cookie:</strong> Google&rsquo;s use of advertising cookies enables it and its partners to serve ads to our visitors based on their visits to TrustScan AI and/or other websites on the Internet.
                  </p>
                  <p>
                    <strong className="text-foreground">User Opt-Out Options:</strong> Users may opt out of personalized advertising by visiting Google&rsquo;s Ads Settings at{' '}
                    <a
                      href="https://www.google.com/settings/ads"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-semibold hover:underline"
                    >
                      https://www.google.com/settings/ads
                    </a>
                    . Alternatively, you can opt out of a third-party vendor&rsquo;s use of cookies for personalized advertising by visiting{' '}
                    <a
                      href="https://www.aboutads.info/choices/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-semibold hover:underline"
                    >
                      www.aboutads.info
                    </a>{' '}
                    or the Network Advertising Initiative at{' '}
                    <a
                      href="https://optout.networkadvertising.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-semibold hover:underline"
                    >
                      optout.networkadvertising.org
                    </a>.
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  For further details regarding how Google processes user data when using partner sites, review Google&rsquo;s official partner privacy disclosure at{' '}
                  <a
                    href="https://policies.google.com/technologies/partner-sites"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    policies.google.com/technologies/partner-sites
                  </a>.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-headline font-bold text-foreground mb-4">
                4. Cookies and Local Storage
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Cookies are small files stored on your device that allow us to authenticate sessions, remember preference settings (such as dark mode), and gather aggregate usage metrics.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                For an exhaustive breakdown of individual cookies, expiry timelines, and third-party vendors, please consult our dedicated{' '}
                <a href="/cookie-policy" className="text-primary font-semibold hover:underline">
                  Cookie Policy
                </a>.
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-headline font-bold text-foreground mb-4">
                5. How We Use and Protect Your Data
              </h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <Icon name="CheckCircleIcon" size={18} className="text-primary mt-1 flex-shrink-0" />
                  <span><strong>Forensic Verification:</strong> To extract linguistic, domain, and metadata signals indicating counterfeit documents.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="CheckCircleIcon" size={18} className="text-primary mt-1 flex-shrink-0" />
                  <span><strong>Threat Intelligence:</strong> Aggregated, strictly de-identified threat patterns (e.g. fraudulent UPI handles or spoofed domains) are used to train our AI safety defenses.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="CheckCircleIcon" size={18} className="text-primary mt-1 flex-shrink-0" />
                  <span><strong>Zero Commercial Sale:</strong> We never sell, rent, or trade your personally identifiable data or uploaded CVs/letters to third-party data brokers.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="CheckCircleIcon" size={18} className="text-primary mt-1 flex-shrink-0" />
                  <span><strong>Encryption & Security:</strong> All web traffic is encrypted with industry-standard TLS 1.3 in transit and stored behind hardened cloud infrastructure.</span>
                </li>
              </ul>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-headline font-bold text-foreground mb-4">
                6. Data Retention Policy
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Transient scans executed by guest users are processed in memory and discarded upon scan completion. Registered users may retain their scan history in their private dashboard. You may delete your account and all associated scan records at any time by requesting deletion from your user dashboard or contacting our privacy team.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-headline font-bold text-foreground mb-4">
                7. Your Legal Rights (DPDPA 2023 & GDPR)
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Under the Indian Digital Personal Data Protection Act, 2023 (DPDPA) and international standards such as GDPR, you possess the right to:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Right to Access', desc: 'Request a summary of personal data held and processed about you.' },
                  { title: 'Right to Correction', desc: 'Request rectification of inaccurate or outdated personal data.' },
                  { title: 'Right to Erasure', desc: 'Request permanent deletion of your account and scan records.' },
                  { title: 'Right to Grievance Redressal', desc: 'Lodge complaints regarding your data processing with our designated Grievance Officer.' },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-muted/40 border border-border">
                    <h3 className="font-bold text-foreground text-sm mb-1">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 8 - Grievance Officer & Contact */}
            <section className="bg-muted p-8 rounded-2xl border border-border">
              <h2 className="text-xl font-headline font-bold text-foreground mb-2">
                8. Grievance Officer & Contact Details
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                In compliance with Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, and the Digital Personal Data Protection Act, 2023, the details of the designated Grievance Officer for TrustScan AI are provided below:
              </p>
              
              <div className="bg-card p-5 rounded-xl border border-border text-sm space-y-2 text-muted-foreground">
                <p><strong className="text-foreground">Officer Name:</strong> Shubham Dubey</p>
                <p><strong className="text-foreground">Designation:</strong> Founder & Lead AI Engineer / Grievance Officer</p>
                <p>
                  <strong className="text-foreground">Email:</strong>{' '}
                  <a href="mailto:trustscan.ai@gmail.com" className="text-primary font-bold hover:underline">
                    trustscan.ai@gmail.com
                  </a>
                </p>
                <p>
                  <strong className="text-foreground">Phone Support:</strong>{' '}
                  <a href="tel:+918591694920" className="text-primary font-medium hover:underline">
                    +91 85916 94920
                  </a>
                </p>
                <p><strong className="text-foreground">Location:</strong> Navi Mumbai, Maharashtra, India</p>
                <p className="text-xs text-muted-foreground pt-2">
                  We acknowledge all data grievance requests within 48 hours and resolve them within the statutory timeframe prescribed under Indian law.
                </p>
              </div>
            </section>

          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
}
