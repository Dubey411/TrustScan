import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import FooterSection from '../homepage/components/FooterSection';
import Icon from '@/components/ui/AppIcon';

export const metadata: Metadata = {
  title: 'Contact Us - TrustScan',
  description: 'Get in touch with the TrustScan security team for support or reporting fraud.',
  alternates: {
    canonical: '/contact',
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground mb-4">
                Let's Talk Security
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Have questions about a scan or want to report a new scam? Our team is available 24/7.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Form */}
              <div className="bg-card rounded-3xl p-8 border border-border shadow-brand">
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-foreground ml-1">Full Name</label>
                        <input type="text" placeholder="John Doe" className="w-full bg-muted border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-foreground ml-1">Email Address</label>
                        <input type="email" placeholder="john@example.com" className="w-full bg-muted border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground ml-1">Subject</label>
                    <select className="w-full bg-muted border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium appearance-none">
                        <option>Support Request</option>
                        <option>Report Fraud Case</option>
                        <option>Business Inquiry</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground ml-1">Message</label>
                    <textarea rows={5} placeholder="How can we help you?" className="w-full bg-muted border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium resize-none" />
                  </div>
                  <button className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold hover:shadow-lg transition-transform active:scale-[0.98]">
                    Send Message
                  </button>
                </form>
              </div>

              {/* Info */}
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-1 gap-6">
                  <div className="flex gap-4 items-start p-6 bg-card border border-border rounded-2xl">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                      <Icon name="EnvelopeIcon" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">Email Support</h3>
                      <p className="text-sm text-muted-foreground mt-1 text-wrap break-all">support@trustscan.ai</p>
                      <p className="text-xs text-primary font-bold mt-2">Avg. Response: 2 hours</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start p-6 bg-card border border-border rounded-2xl">
                    <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center text-success flex-shrink-0">
                      <Icon name="ChatBubbleLeftRightIcon" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">WhatsApp Hotline</h3>
                      <p className="text-sm text-muted-foreground mt-1">+91 98765 43210</p>
                      <p className="text-xs text-success font-bold mt-2">Available 24/7</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start p-6 bg-card border border-border rounded-2xl">
                    <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 flex-shrink-0">
                      <Icon name="MapPinIcon" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">HQ Office</h3>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        Security Lab v4, IT Park, <br />
                        Bengaluru, Karnataka 560103
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
