import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import FooterSection from '../homepage/components/FooterSection';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Citizen & Student Job Safety Guide | Fake Offer Detection & Cybercrime Prevention',
  description: 'Comprehensive manual on identifying fake job offer letters, verifying Corporate Identity Numbers (CIN) on MCA, avoiding WhatsApp job scams, and reporting cybercrime via 1930.',
  alternates: {
    canonical: '/safety-guide',
  },
  keywords: [
    'fake job offer check',
    'offer letter forensic verification',
    'CIN verification online MCA',
    'WhatsApp job scam detection',
    'report cyber fraud India 1930',
    'job search safety tips India',
  ],
};

export default function SafetyGuidePage() {
  const forensicChecklist = [
    {
      title: '1. Upfront Payment Demands (100% Scam)',
      desc: 'Legitimate companies in India NEVER request fees for laptops, courier delivery, uniform charges, aptitude tests, or security deposits. Section 66D of the IT Act makes cheating by personation through computer resources a punishable offense.',
      badge: 'Zero Tolerance',
      badgeColor: 'bg-red-500/10 text-red-500 border-red-500/20',
    },
    {
      title: '2. Email Domain Authenticity vs. Spoofed Free Mail',
      desc: 'Genuine enterprises communicate via authenticated company domains (e.g. name@tcs.com, hr@infosys.com). If you receive an offer from a "@gmail.com", "@outlook.com", "@consultant-hiring.xyz", or a misspelled domain like "@tataconsultancy-careers.in", it is guaranteed fraud.',
      badge: 'Email Header Check',
      badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    },
    {
      title: '3. Corporate Identification Number (CIN) Verification',
      desc: 'Every genuine corporate entity registered in India holds a 21-digit alphanumeric Corporate Identity Number (CIN) issued by the Ministry of Corporate Affairs (MCA). Fraudsters frequently copy real CINs or forge them with invalid state codes.',
      badge: 'MCA Verification',
      badgeColor: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    },
    {
      title: '4. Forensic Seal & Digital Signature Integrity',
      desc: 'Scammers frequently download low-resolution company logos, paste pixelated blue stamp graphics, and apply generic handwritten signatures. TrustScan AI analyzes compression artifacts, color quantization, and font raster mismatches to detect these edits.',
      badge: 'Visual Heuristics',
      badgeColor: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    },
    {
      title: '5. Interview Process Reality Check',
      desc: 'If you are selected for a ₹12,00,000 CTC job without a rigorous technical evaluation, HR video interview, or written coding test—purely based on a 5-question Google Form or Telegram chat—the offer is counterfeit.',
      badge: 'Process Evaluation',
      badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    },
  ];

  const scamPhases = [
    {
      phase: 'Phase 1: Unsolicited Baiting',
      channel: 'WhatsApp, Telegram, SMS, or Instagram DM',
      modus: 'You receive a congratulatory message: "Your resume was shortlisted for part-time remote work (₹2,000–₹5,000/day). Flexible hours. No prior experience required."',
    },
    {
      phase: 'Phase 2: Micro-Task Grooming',
      channel: 'Telegram Channel or Specialized Portal',
      modus: 'You are asked to perform basic tasks such as liking YouTube videos, reviewing Google Maps locations, or rating hotels. You are actually paid ₹150–₹500 on UPI to build false trust.',
    },
    {
      phase: 'Phase 3: The Investment / Deposit Trap',
      channel: 'Crypto Platform or Merchant Wallet',
      modus: 'The recruiter introduces "VIP Tasks" or "Merchant Order Filling". You must transfer ₹3,000 to "unlock" ₹6,000 profit. Once sent, the platform shows a fake digital balance you cannot withdraw without depositing more.',
    },
    {
      phase: 'Phase 4: Coercion & Complete Exit',
      channel: 'Ghosting or Legal Threats',
      modus: 'When you refuse further deposits, fraudsters threaten legal action claiming "breach of contract". Shortly after, the Telegram group deletes chat logs and blocks your number.',
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-grow pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold tracking-wider uppercase px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 inline-block mb-4">
              National Citizen Defense Manual
            </span>
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground mb-5 tracking-tight">
              Job Offer Forensic & Career Safety Guide
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Every day, over 50,000 Indian students and fresh graduates are targeted with sophisticated employment fraud. Learn the multi-step forensic inspection protocol to safeguard your savings and identity.
            </p>
          </div>

          {/* Core Rules Grid */}
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Icon name="ShieldCheckIcon" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-headline font-bold text-foreground">
                  The 5 Core Forensic Pillars of Offer Verification
                </h2>
                <p className="text-sm text-muted-foreground">Follow this protocol before signing any document or sharing KYC data</p>
              </div>
            </div>

            <div className="grid gap-6">
              {forensicChecklist.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-card rounded-2xl p-6 md:p-8 border border-border hover:border-primary/40 transition-colors shadow-subtle flex flex-col md:flex-row gap-6 items-start"
                >
                  <div className="flex-grow space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-headline font-bold text-foreground">{item.title}</h3>
                      <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scam Anatomy Walkthrough */}
          <div className="mb-20 bg-muted/40 rounded-3xl p-8 md:p-12 border border-border">
            <div className="mb-10 text-left">
              <span className="text-xs font-mono font-bold text-error uppercase tracking-wider">Modus Operandi Breakdown</span>
              <h2 className="text-3xl font-headline font-bold text-foreground mt-1 mb-3">
                Anatomy of a Modern Task & Job Scam
              </h2>
              <p className="text-muted-foreground text-sm md:text-base">
                Understanding the psychological stages cyber syndicates use to systematically drain bank accounts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {scamPhases.map((phase, idx) => (
                <div key={idx} className="bg-card p-6 rounded-2xl border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-primary px-2.5 py-1 rounded-md bg-primary/10">
                      Stage {idx + 1}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      {phase.channel}
                    </span>
                  </div>
                  <h3 className="text-lg font-headline font-bold text-foreground">{phase.phase}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{phase.modus}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Official Verification Portals in India */}
          <div className="mb-20">
            <h2 className="text-2xl font-headline font-bold text-foreground mb-6">
              Official Indian Government Verification Portals
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card p-6 rounded-2xl border border-border space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold font-mono">
                  MCA
                </div>
                <h3 className="font-bold font-headline text-foreground">Ministry of Corporate Affairs</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Verify legitimate company registration status, authorized directors, registered office address, and paid-up capital using CIN.
                </p>
                <a
                  href="https://www.mca.gov.in/content/mca/global/en/home.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-primary inline-flex items-center gap-1 hover:underline"
                >
                  Visit MCA Portal <Icon name="ArrowTopRightOnSquareIcon" size={14} />
                </a>
              </div>

              <div className="bg-card p-6 rounded-2xl border border-border space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold font-mono">
                  GST
                </div>
                <h3 className="font-bold font-headline text-foreground">GST Portal Verification</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Check whether the GSTIN mentioned on the invoice or offer letter is active and corresponds to the exact operating business trade name.
                </p>
                <a
                  href="https://services.gst.gov.in/services/searchtp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-primary inline-flex items-center gap-1 hover:underline"
                >
                  Search GSTIN <Icon name="ArrowTopRightOnSquareIcon" size={14} />
                </a>
              </div>

              <div className="bg-card p-6 rounded-2xl border border-border space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold font-mono">
                  1930
                </div>
                <h3 className="font-bold font-headline text-foreground">National Cybercrime Portal</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Report financial cyber fraud immediately. Dial <strong>1930</strong> within the "golden hour" to freeze fraudulent beneficiary bank accounts.
                </p>
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-primary inline-flex items-center gap-1 hover:underline"
                >
                  cybercrime.gov.in <Icon name="ArrowTopRightOnSquareIcon" size={14} />
                </a>
              </div>
            </div>
          </div>

          {/* Emergency Step-by-Step Response */}
          <div className="bg-card border border-border rounded-3xl p-8 md:p-10 mb-16">
            <h2 className="text-2xl font-headline font-bold text-foreground mb-4">
              What To Do If You Have Transferred Money
            </h2>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">Step 1: Immediate Call to 1930:</strong> Call the Indian National Cybercrime Helpline at <strong>1930</strong> without delay. Provide the transaction UTR number, debit account number, and destination UPI ID/account.
              </p>
              <p>
                <strong className="text-foreground">Step 2: Lodge Formal Complaint on cybercrime.gov.in:</strong> File a formal financial fraud complaint with screenshot evidence of chats, transaction receipts, and phone numbers.
              </p>
              <p>
                <strong className="text-foreground">Step 3: Alert Your Bank Fraud Desk:</strong> Request your issuing bank to initiate a chargeback and request a lien on the recipient bank account.
              </p>
              <p>
                <strong className="text-foreground">Step 4: Secure Your Identity:</strong> If you uploaded your Aadhaar or PAN card to a scam portal, monitor your CIBIL report and consider locking your Aadhaar biometrics via the UIDAI portal/mAadhaar app.
              </p>
            </div>
          </div>

          {/* Call to Action Banner */}
          <div className="text-center bg-primary rounded-3xl p-10 md:p-12 text-primary-foreground">
            <h2 className="text-3xl font-headline font-bold mb-3">
              Have an Offer Letter You Wish to Inspect?
            </h2>
            <p className="mb-6 opacity-90 text-base max-w-xl mx-auto">
              Run our automated forensic scanner to inspect company seals, email domains, salary patterns, and cryptographic tampering in seconds.
            </p>
            <Link
              href="/scan-interface"
              className="inline-block bg-background text-foreground font-bold px-8 py-3.5 rounded-full hover:opacity-95 transition-opacity shadow-lg"
            >
              Launch Free AI Scanner
            </Link>
          </div>

        </div>
      </main>

      <FooterSection />
    </div>
  );
}
