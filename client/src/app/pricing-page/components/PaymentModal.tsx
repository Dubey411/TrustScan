import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
}

const PaymentModal = ({ isOpen, onClose, planName }: PaymentModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-card rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300 border border-primary/30">
        <div className="p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary">
            <Icon name="SparklesIcon" size={36} />
          </div>
          
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 inline-block">
              Free Community Access
            </span>
            <h3 className="text-2xl font-headline font-bold text-foreground">
              {planName} Features Unlocked
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              As part of our national anti-fraud initiative, all high-accuracy forensic AI and deep scanning capabilities are currently <strong>100% free</strong> for Indian students, job seekers, and citizens.
            </p>
          </div>

          <div className="bg-muted/50 p-5 rounded-2xl border border-border text-left space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Icon name="CheckCircleIcon" size={16} className="text-primary" />
              <span>No credit card or payment required</span>
            </div>
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Icon name="CheckCircleIcon" size={16} className="text-primary" />
              <span>Unlimited OCR and digital seal inspections</span>
            </div>
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Icon name="CheckCircleIcon" size={16} className="text-primary" />
              <span>Instant forensic verification reports</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href="/scan-interface"
              onClick={onClose}
              className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm block shadow-lg hover:shadow-primary/25 hover:opacity-95 transition-all"
            >
              Start Free Verification Now
            </Link>
            <button
              onClick={onClose}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
