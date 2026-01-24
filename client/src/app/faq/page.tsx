import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import FooterSection from '../homepage/components/FooterSection';
import Icon from '@/components/ui/AppIcon';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions - TrustScan',
  description: 'Common questions about how TrustScan works and how to protect yourself.',
};

export default function FAQPage() {
  const faqs = [
    {
      question: 'How does the scan work?',
      answer: "We use a combination of OCR (Optical Character Recognition) to read document text and a multi-layered Rules Engine + Machine Learning model to detect patterns common in scams. It checks for financial demands, identity theft risks, and structural anomalies in official IDs.",
    },
    {
      question: 'Is my data safe?',
      answer: "Yes. We do not store your private documents permanently. Files are processed in memory and scanned for threats. We only keep anonymized 'signals' to improve our security model unless you explicitly report a fraud case.",
    },
    {
      question: 'What is a "Confidence Score"?',
      answer: "It reflects how certain our AI is about its verdict. A 100% score means we found undeniable proof of fraud (like a fake GST number). A lower score means multiple suspicious signals were found but manual verification is recommended.",
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
