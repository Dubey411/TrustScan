import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import FooterSection from '../homepage/components/FooterSection';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Live Scam Alerts & Threat Intelligence | TrustScan AI India',
  description: 'Real-time threat intelligence on active employment scams, fake internship syndicates, UPI payment fraud, and counterfeit MNC offer letters across India.',
  alternates: {
    canonical: '/scam-alerts',
  },
  keywords: [
    'live scam alerts India',
    'fake job offer warnings',
    'Telegram task fraud',
    'fake internship syndicate',
    'fraudulent UPI handles',
    'cyber fraud threat intelligence',
  ],
};

export default function ScamAlertsPage() {
  const alerts = [
    {
      id: 'TSA-2026-08',
      title: 'Bulk WhatsApp Internship & Part-Time Placement Syndicate',
      severity: 'High',
      severityColor: 'bg-red-500/10 text-red-500 border-red-500/20',
      target: 'Engineering & College Graduates across Maharashtra, Karnataka, NCR',
      date: 'Updated September 2026',
      vector: 'Unsolicited WhatsApp / Telegram Broadcast',
      description:
        'Syndicates impersonating major technology companies (Google, Microsoft, Amazon, TCS) targeting final-year engineering students. Victims are congratulated on being shortlisted without prior applications and asked to deposit ₹999–₹2,499 for "mandatory corporate kit processing and training batch allocation".',
      indicators: [
        'Spoofed domains ending in .xyz, .top, or .work',
        'Direct UPI payment requests to personal virtual payment addresses (VPAs)',
        'Offer letters bearing misaligned corporate logos and fabricated CIN numbers',
      ],
      action: 'Do not pay any amount. Legitimate recruiters never charge training or onboarding fees.',
    },
    {
      id: 'TSA-2026-07',
      title: 'Counterfeit Government Apprenticeship & Scholarship Portals',
      severity: 'Critical',
      severityColor: 'bg-rose-600/10 text-rose-600 border-rose-600/20',
      target: 'Vocational trainees, Diploma holders, Tier-2/3 college students',
      date: 'Updated September 2026',
      vector: 'Sponsored Search Ads & Lookalike URLs',
      description:
        'Phishing websites meticulously replicating national scholarship portals and public sector undertaking (PSU) recruitment pages. Fraudulent domains harvest Aadhaar numbers, PAN cards, and bank account credentials under the guise of "verification registration".',
      indicators: [
        'URLs mimicking .gov.in (e.g. scholarship-gov-portal.org, nsp-portal-gov.in)',
        'Lack of SSL organization validation certificates',
        'Immediate demand for banking OTPs or debit card details for "DBT verification"',
      ],
      action: 'Verify through official https://mca.gov.in, https://scholarships.gov.in, or direct PSU career links.',
    },
    {
      id: 'TSA-2026-06',
      title: 'Work-From-Home "Data Entry & Proofreading" Security Deposit Scam',
      severity: 'Medium',
      severityColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      target: 'Homemakers, freelance job seekers, and students',
      date: 'Updated August 2026',
      vector: 'Instagram & Facebook Sponsored Ads',
      description:
        'Advertisements promising ₹35,000–₹50,000/month for simple document conversion or typing. After applicants complete sample tests, they are told to pay a "refundable security deposit" of ₹3,000 for proprietary OCR software. Once paid, the contact numbers are deactivated.',
      indicators: [
        'Non-existent corporate office addresses (often citing fictional business towers in Bengaluru or Gurugram)',
        'HR contacts communicating exclusively via personal WhatsApp business profiles',
        'Standardized generic agreements signed by unauthorized non-registered LLPs',
      ],
      action: 'Always cross-check company registration records on the MCA portal before accepting contract terms.',
    },
    {
      id: 'TSA-2026-05',
      title: 'Counterfeit Airline Ground Staff & Hospitality Recruitment',
      severity: 'High',
      severityColor: 'bg-red-500/10 text-red-500 border-red-500/20',
      target: 'Aviation enthusiasts, cabin crew aspirants, front-desk applicants',
      date: 'Updated August 2026',
      vector: 'Classified portals & Job boards',
      description:
        'Fake recruitment agencies issuing forged appointment letters on counterfeit IndiGo, Air India, or airport authority letterheads. Victims are instructed to undergo paid "medical examinations" at specific fake diagnostic centres or transfer medical clearance fees.',
      indicators: [
        'Appointment letters sent within hours of submitting a resume without face-to-face interviews',
        'Use of free webmail addresses (e.g., indigo.recruitment2026@gmail.com)',
        'Medical test fees collected via personal QR codes rather than hospital cash counters',
      ],
      action: 'Indian airlines publish all job vacancies exclusively on their official career portals and never charge interview or medical fees.',
    },
    {
      id: 'TSA-2026-04',
      title: 'Telegram Cryptocurrency Task & YouTube Rating Investment Scheme',
      severity: 'Critical',
      severityColor: 'bg-rose-600/10 text-rose-600 border-rose-600/20',
      target: 'Young professionals, gig workers, online freelancers',
      date: 'Updated July 2026',
      vector: 'Telegram Groups & Direct Messages',
      description:
        'Victims are invited to join "Digital Marketing Rating Groups" to like social media videos, initially receiving small UPI credits (₹100–₹300). They are subsequently lured into transferring large sums into synthetic cryptocurrency wallets to execute "VIP prepaid rating tasks", resulting in complete financial loss.',
      indicators: [
        'Telegram bot interfaces showing simulated balances that cannot be withdrawn without further deposits',
        'Aggressive administrative pressure in large group chats filled with fake testimonial bots',
        'Sudden fee demands labeled "tax clearance charges" when attempting withdrawal',
      ],
      action: 'Immediately cease communication and report the transaction UTR number to helpline 1930.',
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-grow pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-500">
                  Live National Intelligence Feed
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-headline font-bold text-foreground">
                Scam & Fraud Threat Alerts
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl text-sm md:text-base">
                Curated intelligence on active criminal campaigns targeting job applicants, students, and citizens across India.
              </p>
            </div>

            <Link
              href="/scan-interface"
              className="px-6 py-3 bg-primary text-primary-foreground font-bold text-sm rounded-xl shadow-md hover:opacity-90 transition-opacity shrink-0"
            >
              Verify Your Offer Letter
            </Link>
          </div>

          {/* Threat Advisory Banner */}
          <div className="bg-muted/40 border border-border rounded-2xl p-6 mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Icon name="InformationCircleIcon" size={22} />
              </div>
              <div>
                <h2 className="font-bold text-foreground text-sm">Have you received a suspicious message?</h2>
                <p className="text-xs text-muted-foreground">Submit suspicious offer letters or links to our engine to assist our national safety heuristics.</p>
              </div>
            </div>
            <a
              href="mailto:trustscan.ai@gmail.com"
              className="text-xs font-mono font-bold text-primary hover:underline shrink-0"
            >
              Report Threat Payload →
            </a>
          </div>

          {/* Alerts List */}
          <div className="space-y-8">
            {alerts.map((alert) => (
              <article
                key={alert.id}
                className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-subtle hover:border-border/80 transition-colors space-y-6"
              >
                {/* Alert Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-muted-foreground">
                      {alert.id}
                    </span>
                    <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${alert.severityColor}`}>
                      {alert.severity} Severity
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                    <span>Target: {alert.target}</span>
                    <span>•</span>
                    <span>{alert.date}</span>
                  </div>
                </div>

                {/* Title and Description */}
                <div>
                  <h3 className="text-xl md:text-2xl font-headline font-bold text-foreground mb-3">
                    {alert.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                    {alert.description}
                  </p>
                </div>

                {/* Indicators of Compromise */}
                <div className="bg-muted/40 rounded-2xl p-5 border border-border space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground/80 flex items-center gap-2">
                    <Icon name="ExclamationTriangleIcon" size={16} className="text-amber-500" />
                    Key Indicators of Compromise (IOCs)
                  </h4>
                  <ul className="space-y-2 text-xs md:text-sm text-muted-foreground">
                    {alert.indicators.map((ioc, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                        <span>{ioc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Defensive Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <div className="text-xs text-foreground/90 font-medium">
                    <strong className="text-primary">Defensive Action:</strong> {alert.action}
                  </div>
                  <Link
                    href="/scan-interface"
                    className="text-xs font-mono font-bold text-primary hover:underline shrink-0"
                  >
                    Scan Document Against Threat Patterns →
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Bottom Resource Link */}
          <div className="mt-16 text-center bg-card border border-border rounded-3xl p-8 md:p-12">
            <h2 className="text-2xl font-headline font-bold text-foreground mb-3">
              Need Comprehensive Guidelines?
            </h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto mb-6">
              Review our complete checklist on verifying Corporate Identity Numbers (CIN), detecting forged digital seals, and reporting fraud to national cyber authorities.
            </p>
            <Link
              href="/safety-guide"
              className="inline-block bg-primary text-primary-foreground font-bold text-sm px-6 py-3 rounded-full hover:opacity-90 transition-opacity shadow-md"
            >
              Read Citizen Safety Guide
            </Link>
          </div>

        </div>
      </main>

      <FooterSection />
    </div>
  );
}
