import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/common/Header';
import FooterSection from '../../homepage/components/FooterSection';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';
import { BLOG_ARTICLES } from '@/data/blogArticles';

export async function generateStaticParams() {
  return BLOG_ARTICLES.map((article) => ({
    articleSlug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ articleSlug: string }>;
}): Promise<Metadata> {
  const { articleSlug } = await params;
  const article = BLOG_ARTICLES.find((a) => a.slug === articleSlug);

  if (!article) return {};

  return {
    title: `${article.title} | TrustScan AI`,
    description: article.excerpt,
    alternates: {
      canonical: `/blog/${article.slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: `https://www.trustscanai.in/blog/${article.slug}`,
      type: 'article',
      siteName: 'TrustScan AI',
    },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ articleSlug: string }>;
}) {
  const { articleSlug } = await params;
  const article = BLOG_ARTICLES.find((a) => a.slug === articleSlug);

  if (!article) {
    notFound();
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt,
    author: {
      '@type': 'Person',
      name: article.author,
      url: 'https://www.linkedin.com/in/shubham-dubey-1a0293352/',
    },
    publisher: {
      '@type': 'Organization',
      name: 'TrustScan AI',
      url: 'https://www.trustscanai.in',
      logo: 'https://www.trustscanai.in/image.png',
    },
    datePublished: '2026-09-01T00:00:00+05:30',
    dateModified: '2026-09-15T00:00:00+05:30',
    mainEntityOfPage: `https://www.trustscanai.in/blog/${article.slug}`,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Article Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <main className="flex-grow pt-28 pb-20">
        <article className="container mx-auto px-4 max-w-3xl">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-foreground">Blog</Link>
            <span>/</span>
            <span className="text-foreground truncate max-w-xs">{article.category}</span>
          </nav>

          {/* Article Header */}
          <header className="mb-10 space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold">
                {article.category}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{article.readTime}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{article.date}</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-headline font-bold text-foreground leading-tight tracking-tight">
              {article.title}
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed pt-2">
              {article.excerpt}
            </p>

            {/* Author Card */}
            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center font-headline">
                SD
              </div>
              <div>
                <div className="text-sm font-bold text-foreground">{article.author}</div>
                <div className="text-xs text-muted-foreground">Founder & Lead AI Engineer, TrustScan AI</div>
              </div>
            </div>
          </header>

          {/* Article Body */}
          <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-subtle space-y-6 text-foreground/90 leading-relaxed text-base md:text-lg">
            {article.content.map((paragraph, idx) => {
              if (paragraph.startsWith('### ')) {
                return (
                  <h2
                    key={idx}
                    className="text-2xl font-headline font-bold text-foreground pt-4 mb-2 border-b border-border pb-2"
                  >
                    {paragraph.replace('### ', '')}
                  </h2>
                );
              }
              if (paragraph.startsWith('- ')) {
                return (
                  <div key={idx} className="flex items-start gap-2.5 text-sm md:text-base text-muted-foreground pl-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span>{paragraph.replace('- ', '')}</span>
                  </div>
                );
              }
              return (
                <p key={idx} className="text-muted-foreground text-sm md:text-base leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Scanner Inset Card */}
          <div className="mt-12 bg-primary/10 border border-primary/20 rounded-3xl p-8 text-center space-y-4">
            <h3 className="text-xl font-headline font-bold text-foreground">
              Verify Your Offer Letter or Certificate
            </h3>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Inspect suspicious documents with multi-modal AI heuristics, Error Level Analysis, and corporate database cross-referencing.
            </p>
            <Link
              href="/scan-interface"
              className="inline-block px-6 py-3 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:opacity-90 shadow-md transition-all"
            >
              Scan Document Now (Free)
            </Link>
          </div>

          {/* Navigation Back */}
          <div className="mt-12 text-center">
            <Link
              href="/blog"
              className="text-xs font-mono font-bold text-primary hover:underline inline-flex items-center gap-2"
            >
              ← Back to All Intelligence Articles
            </Link>
          </div>

        </article>
      </main>

      <FooterSection />
    </div>
  );
}
