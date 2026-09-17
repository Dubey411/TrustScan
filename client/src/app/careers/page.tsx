import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import FooterSection from '../homepage/components/FooterSection';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Careers & Open Positions | TrustScan AI',
  description: 'Join the engineering team building India\'s sovereign AI fraud detection engine. Explore internships and full-time engineering roles in Navi Mumbai.',
  alternates: {
    canonical: '/careers',
  },
};

export default function CareersPage() {
  const openings = [
    {
      role: 'AI / ML Computer Vision Research Intern',
      type: 'Internship / Hybrid',
      location: 'Navi Mumbai, Maharashtra',
      desc: 'Work directly on diffusion model artifacts, Error Level Analysis (ELA) models, and pixel-level forensic tamper detection for Indian official documents.',
      skills: ['Python', 'PyTorch', 'OpenCV', 'FastAPI', 'Deep Learning'],
    },
    {
      role: 'Full-Stack Next.js & Systems Engineer',
      type: 'Full-Time / Hybrid',
      location: 'Navi Mumbai, Maharashtra',
      desc: 'Build resilient, low-latency UI interfaces, verification pipelines, and responsive forensic reporting dashboards used by thousands of students daily.',
      skills: ['TypeScript', 'Next.js App Router', 'Tailwind CSS', 'Node.js', 'REST APIs'],
    },
    {
      role: 'Cyber Fraud Threat Intelligence Analyst',
      type: 'Part-Time / Remote',
      location: 'India',
      desc: 'Investigate emerging Telegram recruitment scams, collect indicators of compromise (IOCs), and catalog fake IT appointment letter templates across India.',
      skills: ['OSINT', 'Threat Analysis', 'Cybercrime Law (IT Act)', 'Document Auditing'],
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-grow pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold tracking-wider uppercase px-3.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 inline-block mb-3">
              Join Our Engineering Mission
            </span>
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground mb-4">
              Build India&rsquo;s Digital Shield
            </h1>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              At TrustScan AI, we are engineering sovereign artificial intelligence to protect students, fresh graduates, and businesses from sophisticated cyber-fraud syndicates.
            </p>
          </div>

          {/* Core Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              { title: 'Zero Tolerance for Fraud', desc: 'Every model we train directly prevents students from losing hard-earned savings to malicious actors.' },
              { title: 'Research-First Innovation', desc: 'We combine classical signal processing (ELA, Fourier transforms) with modern multi-modal vision LLMs.' },
              { title: 'Sovereign Architecture', desc: 'Engineered in Navi Mumbai, Maharashtra with deep focus on Indian legal compliance (DPDPA 2023).' },
            ].map((v, i) => (
              <div key={i} className="bg-card border border-border p-6 rounded-2xl space-y-2">
                <h3 className="font-bold font-headline text-foreground">{v.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>

          {/* Open Roles */}
          <div className="space-y-6 mb-16">
            <h2 className="text-2xl font-headline font-bold text-foreground">Open Roles</h2>

            <div className="grid gap-6">
              {openings.map((job, idx) => (
                <div
                  key={idx}
                  className="bg-card border border-border rounded-3xl p-6 md:p-8 hover:border-primary/40 transition-colors shadow-subtle space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
                    <div>
                      <h3 className="text-xl font-headline font-bold text-foreground">{job.role}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono mt-1">
                        <span>{job.type}</span>
                        <span>•</span>
                        <span>{job.location}</span>
                      </div>
                    </div>

                    <a
                      href={`mailto:trustscan.ai@gmail.com?subject=Application for ${job.role}&body=Hi Shubham,%0D%0A%0D%0AI would like to apply for the ${job.role} position at TrustScan AI.%0D%0A%0D%0AMy Resume & GitHub link:%0D%0A`}
                      className="px-5 py-2.5 bg-primary text-primary-foreground text-xs md:text-sm font-bold rounded-xl hover:opacity-90 transition-opacity shrink-0 text-center"
                    >
                      Apply Now →
                    </a>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">{job.desc}</p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {job.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-xs font-mono font-medium px-2.5 py-1 rounded-md bg-muted text-muted-foreground border border-border"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How to Apply */}
          <div className="bg-card border border-border rounded-3xl p-8 md:p-10 text-center space-y-4">
            <h3 className="text-2xl font-headline font-bold text-foreground">Don&rsquo;t See an Exact Match?</h3>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              If you are passionate about cybersecurity, machine learning, or computer vision, send your resume and open-source project links directly to our founder.
            </p>
            <div className="pt-2">
              <a
                href="mailto:trustscan.ai@gmail.com"
                className="text-primary font-bold text-sm hover:underline"
              >
                trustscan.ai@gmail.com
              </a>
            </div>
          </div>

        </div>
      </main>

      <FooterSection />
    </div>
  );
}
