import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import FooterSection from '../homepage/components/FooterSection';
import Icon from '@/components/ui/AppIcon';

export const metadata: Metadata = {
  title: 'FAQ - Fake Job Offer Check, Link Safety & CIN Verification',
  description: 'Common questions about how to check fake job offers, verify if a link is safe, and detect UPI fraud messages using TrustScan AI.',
  keywords: ['fake job offer check', 'is this link safe', 'UPI fraud message', 'CIN verification online', 'TrustScan FAQ'],
};

export default function FAQPage() {
  const faqs = [
    {
      question: 'How does the fake job offer check work?',
      answer: "We use a combination of OCR (Optical Character Recognition) to read document text and a multi-layered Rules Engine to detect fake job offers. It checks for financial demands, identity theft risks, and structural anomalies in official IDs.",
    },
    {
      question: 'Is my data safe?',
      answer: "Yes. We do not store your private documents permanently. Files are processed in memory and scanned for threats. We only keep anonymized 'signals' to improve our security model unless you explicitly report a fraud case.",
    },
    {
      question: 'How do I know if this link is safe?',
      answer: "Our 'Link/URL Scan' tool analyzes the URL for phishing patterns and malicious redirects. The 'Confidence Score' reflects how certain we are. A 100% score means we found undeniable proof of fraud (like a fake GST number).",
    },
    {
      question: 'Can you detect deepfake documents?',
      answer: "Yes. Our pipeline checks for visual paradoxes and 'Artificial Intelligence Traces' in document metadata and text formatting that are often left behind by AI document generators.",
    },
    {
      question: 'Is TrustScan free?',
      answer: "We offer Free scans for basic text and single-page images. Detailed PDF analysis and high-limit scanning are part of our Premium plan for serious job seekers.",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground text-center mb-16">
              FAQ
            </h1>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <details key={index} className="group bg-card border border-border rounded-2xl p-6 hover:shadow-subtle transition-all cursor-pointer">
                  <summary className="flex justify-between items-center font-headline font-bold text-lg text-foreground list-none">
                    {faq.question}
                    <span className="text-primary transition-transform group-open:rotate-180">
                      <Icon name="ChevronDownIcon" size={20} />
                    </span>
                  </summary>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>

            <div className="mt-16 bg-muted rounded-3xl p-8 text-center">
              <h2 className="text-2xl font-headline font-bold mb-2">Still have questions?</h2>
              <p className="text-muted-foreground mb-6">Contact our support team for specialized assistance.</p>
              <a href="/contact" className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-full font-bold hover:opacity-90 transition-opacity">
                Get in Touch
              </a>
            </div>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
