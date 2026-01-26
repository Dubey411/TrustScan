'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
}

const PaymentModal = ({ isOpen, onClose, planName }: PaymentModalProps) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      // Simulate API call
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setEmail('');
      }, 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300 border border-primary/20">
        <div className="p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Icon name="RocketLaunchIcon" size={40} variant="solid" className="text-primary" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-headline font-bold text-foreground italic flex items-center justify-center gap-2">
               Coming Soon
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed px-4">
              We&apos;re currently finalizing the high-performance {planName} features including Google Vision OCR and LLM-powered deep analysis.
            </p>
          </div>

          {!submitted ? (
            <div className="bg-muted p-6 rounded-xl space-y-4">
              <p className="text-xs font-semibold text-primary uppercase tracking-widest">Join the Waitlist</p>
              <form onSubmit={handleWaitlistSubmit} className="space-y-3">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email" 
                  className="w-full p-3 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                  required
                />
                <button 
                  type="submit"
                  className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-bold text-sm hover:bg-trust-blue transition-all"
                >
                  Notify Me When it Launches
                </button>
              </form>
            </div>
          ) : (
            <div className="py-6 space-y-4">
              <div className="w-12 h-12 bg-success-green/10 rounded-full flex items-center justify-center mx-auto">
                <Icon name="CheckCircleIcon" size={24} variant="solid" className="text-success-green" />
              </div>
              <p className="text-success-green font-bold text-sm">You&apos;re on the list! We&apos;ll notify you soon.</p>
            </div>
          )}

          <button
            onClick={onClose}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors underline"
          >
            Go back to plans
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;

