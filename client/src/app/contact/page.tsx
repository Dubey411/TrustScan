'use client';

import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import FooterSection from '../homepage/components/FooterSection';
import Icon from '@/components/ui/AppIcon';
import { useState, FormEvent } from 'react';

// Note: metadata must be in a server component — contact page is now client-side
// The metadata is defined below as a workaround via a separate server wrapper if needed.
// For now, this page uses 'use client' for form state.

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'Support Request', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus('sent');
        setForm({ name: '', email: '', subject: 'Support Request', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground mb-4">
                Let&apos;s Talk Security
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Have questions about a scan or want to report a new scam? Reach us directly — we respond within 24 hours.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Form */}
              <div className="bg-card rounded-3xl p-8 border border-border shadow-brand">
                {status === 'sent' ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center text-success mx-auto mb-4">
                      <Icon name="CheckCircleIcon" size={36} />
                    </div>
                    <h2 className="text-2xl font-headline font-bold text-foreground mb-2">Message Sent!</h2>
                    <p className="text-muted-foreground">We&apos;ll get back to you at <strong>{form.email || 'your email'}</strong> within 24 hours.</p>
                    <button onClick={() => setStatus('idle')} className="mt-6 text-primary font-bold hover:underline">Send another message</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-bold text-foreground ml-1">Full Name</label>
                        <input
                          id="name"
                          type="text"
                          required
                          placeholder="Your Name"
                          value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          className="w-full bg-muted border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-bold text-foreground ml-1">Email Address</label>
                        <input
                          id="email"
                          type="email"
                          required
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                          className="w-full bg-muted border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-bold text-foreground ml-1">Subject</label>
                      <select
                        id="subject"
                        value={form.subject}
                        onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                        className="w-full bg-muted border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium appearance-none"
                      >
                        <option>Support Request</option>
                        <option>Report Fraud Case</option>
                        <option>Business Inquiry</option>
                        <option>Partnership</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-bold text-foreground ml-1">Message</label>
                      <textarea
                        id="message"
                        rows={5}
                        required
                        placeholder="How can we help you?"
                        value={form.message}
                        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                        className="w-full bg-muted border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium resize-none"
                      />
                    </div>
                    {status === 'error' && (
                      <p className="text-sm text-red-500 font-medium">Something went wrong. Please email us directly at <a href="mailto:trustscan.ai@gmail.com" className="underline">trustscan.ai@gmail.com</a></p>
                    )}
                    <button
                      type="submit"
                      disabled={status === 'sending'}
                      className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold hover:shadow-lg transition-transform active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {status === 'sending' ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                )}
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
                      <a href="mailto:trustscan.ai@gmail.com" className="text-sm text-muted-foreground mt-1 text-wrap break-all hover:text-primary transition-colors block">
                        trustscan.ai@gmail.com
                      </a>
                      <p className="text-xs text-primary font-bold mt-2">Avg. Response: 24 hours</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start p-6 bg-card border border-border rounded-2xl">
                    <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center text-success flex-shrink-0">
                      <Icon name="ChatBubbleLeftRightIcon" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">WhatsApp / Phone</h3>
                      <a href="tel:+918591694920" className="text-sm text-muted-foreground mt-1 hover:text-primary transition-colors block">
                        +91 85916 94920
                      </a>
                      <p className="text-xs text-success font-bold mt-2">Mon – Sat, 10 AM – 7 PM IST</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start p-6 bg-card border border-border rounded-2xl">
                    <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 flex-shrink-0">
                      <Icon name="MapPinIcon" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">Location</h3>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        Navi Mumbai, Maharashtra,<br />India
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
