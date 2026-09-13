import Header from '@/components/common/Header';
import FooterSection from '../homepage/components/FooterSection';
import Icon from '@/components/ui/AppIcon';
import Image from 'next/image';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About TrustScan | Fake Job Offer Check & UPI Fraud Detection',
  description: 'Learn how TrustScan AI helps you with fake job offer checks, determining if a link is safe, and CIN verification online. Meet the team behind India\'s leading fraud detection engine.',
  alternates: {
    canonical: '/about-page',
  },
  keywords: ['about trustscan', 'fake job offer check', 'UPI fraud message', 'is this link safe', 'TrustScan AI team'],
};

export default function AboutPage() {
  const stats = [
    { label: 'Rules Processed', value: '100+', icon: 'ShieldExclamationIcon' },
    { label: 'Analysis Layers', value: '3-Step', icon: 'CommandLineIcon' },
    { label: 'Scan Speed', value: '<2s', icon: 'BoltIcon' },
  ];

  const values = [
    {
      title: 'Transparency',
      desc: 'We believe security is a right, not a luxury. Our results are always explained in plain English — no jargon, no confusion.',
    },
    {
      title: 'Excellence',
      desc: 'We use state-of-the-art OCR, LLM reasoning (Sarvam 30B/105B), and ML forensics to stay one step ahead of the latest fraudulent tactics.',
    },
    {
      title: 'Privacy First',
      desc: 'Your uploaded documents are never stored permanently. We process, analyze, and discard — your data stays yours.',
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="pt-32 pb-20 container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-headline font-bold text-foreground mb-8 text-center leading-tight">
              Combatting Digital Fraud with{' '}
              <span className="text-primary">Human-Centric AI</span>
            </h1>
            <p className="text-xl text-muted-foreground text-center mb-12 leading-relaxed">
              In an era where digital job offers arrive via WhatsApp and{' '}
              <strong>UPI fraud messages</strong> can appear in seconds, TrustScan stands as the
              ultimate line of defense for the Indian youth.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-20">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="bg-card border border-border rounded-3xl p-8 text-center hover:shadow-brand transition-all"
                >
                  <div className="text-primary mb-3 flex justify-center">
                    <Icon name={stat.icon as any} size={32} />
                  </div>
                  <div className="text-3xl font-headline font-bold text-foreground mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="bg-muted py-24">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-bold text-sm">
                  <Icon name="HandRaisedIcon" size={16} />
                  Our Founding Mission
                </div>
                <h2 className="text-4xl font-headline font-bold text-foreground">
                  Why we started TrustScan
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  TrustScan was born out of a simple observation: thousands of deserving students in
                  India were losing their hard-earned money to &ldquo;Registration Fee&rdquo; scams
                  and identity theft.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We realized that while scammers were using technology to deceive, we could use even
                  more advanced technology to protect. Today, TrustScan is a production-grade
                  infrastructure that analyzes millions of data points to keep dreams safe — with{' '}
                  <strong className="text-foreground">13,000+ Google Search impressions</strong> and
                  real users protected every day.
                </p>
              </div>
              <div className="grid gap-6">
                {values.map((v, i) => (
                  <div
                    key={i}
                    className="bg-card p-8 rounded-3xl border border-border shadow-subtle group hover:border-primary transition-all"
                  >
                    <h3 className="text-xl font-headline font-bold text-foreground mb-3">{v.title}</h3>
                    <p className="text-muted-foreground">{v.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Meet the Team */}
        <section className="py-24 container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-bold text-sm mb-6">
                <Icon name="UserGroupIcon" size={16} />
                The Team
              </div>
              <h2 className="text-4xl font-headline font-bold text-foreground mb-4">
                Built by a Developer Who Cares
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                TrustScan AI is the work of a passionate builder who experienced the problem firsthand
                and decided to engineer the solution.
              </p>
            </div>

            {/* Founder Card */}
            <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-brand">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-headline font-bold text-4xl select-none">
                    SD
                  </div>
                </div>

                {/* Bio */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="text-2xl font-headline font-bold text-foreground">
                      Shubham Dubey
                    </h3>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
                      Founder &amp; Lead Engineer
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium mb-4">
                    AI &amp; Software Engineer · Navi Mumbai, Maharashtra
                  </p>

                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Computer Engineering student at Datta Meghe College of Engineering (B.E., expected 2027)
                    with hands-on experience developing Generative AI workflows, LLM applications, AI Agents,
                    and RAG pipelines. Shubham architected TrustScan AI from the ground up — designing its
                    multi-modal LLM reasoning engine (Sarvam 30B/105B, Gemini), risk-tiered routing system,
                    autonomous agent decision trees, and real-time API microservices.
                  </p>

                  <p className="text-muted-foreground leading-relaxed mb-6">
                    Previously an AI &amp; Software Development Intern at Edunet Foundation, where he built
                    production AI-driven application modules and REST API integrations. Proficient in Python,
                    TypeScript, Node.js, Docker, AWS, and vector search technologies.
                  </p>

                  {/* Skills Chips */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {['Python', 'TypeScript', 'Node.js', 'LLMs & AI Agents', 'RAG Pipelines', 'Docker', 'AWS', 'MongoDB', 'PostgreSQL'].map(skill => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-muted border border-border rounded-lg text-xs font-medium text-muted-foreground"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Social Links */}
                  <div className="flex flex-wrap gap-4">
                    <a
                      href="https://www.linkedin.com/in/shubham-dubey-1a0293352/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                    >
                      <Icon name="LinkIcon" size={16} />
                      LinkedIn
                    </a>
                    <a
                      href="https://github.com/Dubey411"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                    >
                      <Icon name="CodeBracketIcon" size={16} />
                      GitHub
                    </a>
                    <a
                      href="mailto:trustscan.ai@gmail.com"
                      className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                    >
                      <Icon name="EnvelopeIcon" size={16} />
                      trustscan.ai@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <FooterSection />
    </div>
  );
}
