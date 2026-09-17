import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import FooterSection from '../homepage/components/FooterSection';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';
import { BLOG_ARTICLES } from '@/data/blogArticles';

export const metadata: Metadata = {
  title: 'Cybersecurity & Job Fraud Intelligence Blog | TrustScan AI',
  description: 'Expert research, forensic analysis, and citizen defense guides on identifying fake offer letters, corporate impersonation, UPI scams, and digital forensics in India.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Cybersecurity & Scam Intelligence Blog | TrustScan AI',
    description: 'Practical guides and forensic breakdowns of employment scams, fake IT offer letters, and cyber fraud prevention.',
    url: 'https://www.trustscanai.in/blog',
    siteName: 'TrustScan AI',
    type: 'website',
  },
};

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-grow pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold tracking-wider uppercase px-3.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 inline-block mb-3">
              Research & Threat Analysis
            </span>
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground mb-4">
              Security & Fraud Intelligence Blog
            </h1>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              Forensic case studies, recruitment scam warnings, and legal recovery guides engineered to protect Indian students and professionals.
            </p>
          </div>

          {/* Articles Grid */}
          <div className="grid gap-8 mb-16">
            {BLOG_ARTICLES.map((article) => (
              <article
                key={article.slug}
                className="bg-card border border-border rounded-3xl p-6 md:p-8 hover:border-primary/40 transition-all shadow-subtle flex flex-col md:flex-row gap-6 justify-between items-start"
              >
                <div className="space-y-3 flex-grow">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold">
                      {article.category}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{article.readTime}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{article.date}</span>
                  </div>

                  <h2 className="text-2xl font-headline font-bold text-foreground hover:text-primary transition-colors">
                    <Link href={`/blog/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h2>

                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {article.excerpt}
                  </p>

                  <div className="pt-2 flex items-center gap-2 text-xs text-muted-foreground font-mono">
                    <span>Author: <strong className="text-foreground">{article.author}</strong></span>
                  </div>
                </div>

                <Link
                  href={`/blog/${article.slug}`}
                  className="px-5 py-2.5 bg-muted border border-border text-foreground text-xs md:text-sm font-semibold rounded-xl hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shrink-0 self-end md:self-center"
                >
                  Read Article →
                </Link>
              </article>
            ))}
          </div>

          {/* Newsletter / Security Briefing CTA */}
          <div className="text-center bg-card border border-border rounded-3xl p-8 md:p-10 max-w-3xl mx-auto">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon name="ShieldCheckIcon" size={28} />
            </div>
            <h3 className="text-2xl font-headline font-bold text-foreground mb-2">
              Have an Offer Letter You Need Verified Right Now?
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Run our automated forensic scanner to inspect company seals, email domains, and salary CTC math in under 10 seconds.
            </p>
            <Link
              href="/scan-interface"
              className="inline-block px-8 py-3.5 bg-primary text-primary-foreground font-bold text-sm rounded-xl shadow-lg hover:opacity-95 transition-opacity"
            >
              Verify Offer Letter (Free)
            </Link>
          </div>

        </div>
      </main>

      <FooterSection />
    </div>
  );
}
