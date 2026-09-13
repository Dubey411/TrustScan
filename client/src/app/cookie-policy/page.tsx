import Header from '@/components/common/Header';
import FooterSection from '../homepage/components/FooterSection';
import Icon from '@/components/ui/AppIcon';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy | TrustScan AI',
  description: 'Learn how TrustScan AI uses cookies to improve security, remember your preferences, and deliver advertising. You are in full control of your cookie settings.',
  alternates: {
    canonical: '/cookie-policy',
  },
  robots: { index: true, follow: true },
};

const sections = [
  {
    title: '1. What Are Cookies?',
    content: `Cookies are small text files placed on your device (computer, tablet, or mobile phone) by a website when you visit it. They are widely used to make websites work, function more efficiently, and provide information to the website owners.

Cookies do not contain any personally identifiable information on their own. They are identified by a unique string and are read only by the server that created them.`,
  },
  {
    title: '2. How TrustScan AI Uses Cookies',
    content: `TrustScan AI uses cookies for the following purposes:

**Strictly Necessary Cookies**
These cookies are essential for you to use our service. They include session authentication, security tokens, and preferences like your selected theme (dark/light mode). Without these cookies, the service cannot function properly. These cookies cannot be disabled.

**Analytics and Performance Cookies**
We may use analytics tools (such as Google Analytics) to understand how visitors interact with TrustScan AI. These cookies collect anonymized information — such as pages visited, time spent, and how you arrived at our site — to help us improve the platform. No personally identifiable information is collected through analytics cookies.

**Advertising Cookies (Google AdSense)**
TrustScan AI uses Google AdSense to display advertisements. Google AdSense uses cookies (including the DoubleClick cookie) to serve ads based on your prior visits to this or other websites. Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to TrustScan AI and/or other sites on the Internet.

You may opt out of personalized advertising by visiting Google's Ads Settings at https://www.google.com/settings/ads or by visiting www.aboutads.info.

**Functional Cookies**
These cookies allow our website to remember choices you make (such as language preference or scan history within your session) and provide enhanced, personalized features. Information collected by these cookies may be anonymized.`,
  },
  {
    title: '3. Third-Party Cookies',
    content: `Some cookies on our website are set by third-party services. We do not control these third-party cookies. The following third parties may set cookies on our website:

- **Google AdSense / Google Advertising** — for serving and measuring ad performance
- **Google Analytics** — for website traffic analysis
- **Cloudflare / CDN providers** — for security and performance

Please refer to the respective third-party privacy policies for information on how they use cookies and how you can opt out.`,
  },
  {
    title: '4. Your Cookie Choices',
    content: `You have the right to choose whether to accept or reject cookies (except strictly necessary cookies).

**Browser Settings**
You can control cookies through your browser settings. Most browsers allow you to:
- View what cookies are stored on your device
- Delete specific cookies or all cookies
- Block cookies from specific websites
- Block all third-party cookies

Please note that restricting cookies may impact the functionality of TrustScan AI.

**Cookie Consent Banner**
When you first visit TrustScan AI, you will be shown a cookie consent notice. You can accept or decline non-essential cookies at that time. You may change your preferences at any time by clearing your cookies and revisiting the site.

**Opt-Out of Google Advertising**
To opt out of Google's interest-based advertising, visit: https://www.google.com/settings/ads`,
  },
  {
    title: '5. Cookies We Set',
    content: `The following is a summary of the primary cookies set by TrustScan AI:

| Cookie Name | Purpose | Duration | Type |
|------------|---------|----------|------|
| theme | Stores your dark/light mode preference | 1 year | Functional |
| trustscan_session | User session authentication | Session | Strictly Necessary |
| cookie_consent | Records your cookie consent choice | 1 year | Strictly Necessary |
| _ga, _gid | Google Analytics tracking | 2 years / 24 hrs | Analytics |
| __gads, NID | Google Advertising / AdSense | Varies | Advertising |`,
  },
  {
    title: '6. Data Retention',
    content: `Cookie data is retained only for the period necessary to fulfill the purpose for which it was collected. Session cookies are deleted when you close your browser. Persistent cookies remain on your device for the period specified in the cookie or until you delete them manually.`,
  },
  {
    title: '7. Changes to This Cookie Policy',
    content: `We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our data practices. When we make significant changes, we will update the "Last Updated" date at the top of this page. We encourage you to review this policy periodically.`,
  },
  {
    title: '8. Contact Us',
    content: `If you have any questions about our use of cookies, please contact us:

**Email:** trustscan.ai@gmail.com  
**Phone:** +91 85916 94920  
**Address:** Navi Mumbai, Maharashtra, India`,
  },
];

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground mb-4">
              Cookie Policy
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Icon name="CalendarIcon" size={16} />
              Last updated: September 13, 2026
            </p>
            <p className="text-muted-foreground mt-3 max-w-2xl leading-relaxed">
              This Cookie Policy explains how TrustScan AI (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) uses cookies and similar tracking technologies when you visit{' '}
              <strong>www.trustscanai.in</strong>. By continuing to use our website, you consent to our use of cookies as described in this policy.
            </p>
          </div>

          <div className="bg-card border border-border rounded-3xl p-8 md:p-12 space-y-12 shadow-subtle">
            {sections.map((section, i) => (
              <section key={i}>
                <h2 className="text-2xl font-headline font-bold text-foreground mb-4">
                  {section.title}
                </h2>
                <div className="text-muted-foreground leading-relaxed space-y-3">
                  {section.content.split('\n\n').map((para, j) => {
                    if (para.startsWith('|')) {
                      // Simple table rendering
                      const lines = para.trim().split('\n').filter(l => !l.match(/^\|[-|]+\|$/));
                      return (
                        <div key={j} className="overflow-x-auto">
                          <table className="w-full text-sm border-collapse">
                            {lines.map((row, ri) => {
                              const cells = row.split('|').filter(c => c.trim());
                              const Tag = ri === 0 ? 'th' : 'td';
                              return (
                                <tr key={ri} className={ri === 0 ? 'border-b border-border font-bold text-foreground' : 'border-b border-border/50'}>
                                  {cells.map((cell, ci) => (
                                    <Tag key={ci} className="py-2 px-3 text-left">{cell.trim()}</Tag>
                                  ))}
                                </tr>
                              );
                            })}
                          </table>
                        </div>
                      );
                    }
                    if (para.startsWith('**')) {
                      const boldEnd = para.indexOf('**', 2);
                      const boldText = para.substring(2, boldEnd);
                      const rest = para.substring(boldEnd + 2);
                      return (
                        <p key={j}>
                          <strong className="text-foreground">{boldText}</strong>
                          {rest}
                        </p>
                      );
                    }
                    if (para.startsWith('-')) {
                      const items = para.split('\n').filter(l => l.startsWith('-'));
                      return (
                        <ul key={j} className="list-disc list-inside space-y-1">
                          {items.map((item, li) => {
                            const text = item.replace(/^- /, '');
                            const boldMatch = text.match(/^\*\*(.+?)\*\* — (.+)/);
                            return (
                              <li key={li}>
                                {boldMatch ? (
                                  <><strong className="text-foreground">{boldMatch[1]}</strong> — {boldMatch[2]}</>
                                ) : text}
                              </li>
                            );
                          })}
                        </ul>
                      );
                    }
                    return <p key={j}>{para}</p>;
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
}
