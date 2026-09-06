'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import PricingCard from './PricingCard';
import ComparisonTable from './ComparisonTable';
import FAQSection from './FAQSection';
import TestimonialCard from './TestimonialCard';
import PaymentModal from './PaymentModal';

interface Feature {
  text: string;
  included: boolean;
}

interface PricingPlan {
  id: string;
  title: string;
  subtitle: string;
  monthlyPrice: string;
  annualPrice: string;
  features: Feature[];
  isPopular?: boolean;
  ctaText: string;
  badge?: string;
}

interface ComparisonFeature {
  category: string;
  features: {
    name: string;
    free: boolean | string;
    student: boolean | string;
    premium: boolean | string;
  }[];
}

interface FAQ {
  question: string;
  answer: string;
}

interface Testimonial {
  name: string;
  role: string;
  image: string;
  alt: string;
  rating: number;
  testimonial: string;
}

const PricingInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentPlanDetails, setPaymentPlanDetails] = useState<{ name: string; price: string; period: string } | null>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    title: 'Free',
    subtitle: 'Perfect for trying out our service',
    monthlyPrice: '₹0',
    annualPrice: '₹0',
    features: [
    { text: '5 Basic scans per month', included: true },
    { text: '3 Deep Vision scans per month', included: true },
    { text: 'Basic fraud detection', included: true },
    { text: 'Email support', included: true },
    { text: 'Scan history (7 days)', included: true },
    { text: 'Deep Vision (10+ Page Search)', included: false }],

    ctaText: 'Get Started Free'
  },
  {
    id: 'student',
    title: 'Student',
    subtitle: 'Best value for students & freshers',
    monthlyPrice: '₹99',
    annualPrice: '₹999',
    features: [
    { text: '50 scans per month', included: true },
    { text: 'Advanced AI detection', included: true },
    { text: 'Priority email support', included: true },
    { text: 'Scan history (90 days)', included: true },
    { text: 'Detailed PDF reports', included: true },
    { text: 'WhatsApp alerts', included: true },
    { text: 'Student verification required', included: true }],

    isPopular: true,
    ctaText: 'Start Student Plan',
    badge: 'Most Popular'
  },
  {
    id: 'premium',
    title: 'Premium',
    subtitle: 'Unlimited protection for professionals',
    monthlyPrice: '₹299',
    annualPrice: '₹2,999',
    features: [
    { text: 'Unlimited scans', included: true },
    { text: 'Unlimited Deep Vision (10+ pg)', included: true },
    { text: 'Advanced AI + Human verification', included: true },
    { text: '24/7 priority support', included: true },
    { text: 'Unlimited scan history', included: true },
    { text: 'Detailed PDF reports', included: true },
    { text: 'WhatsApp & SMS alerts', included: true }],

    ctaText: 'Go Premium'
  }];


  const comparisonData: ComparisonFeature[] = [
  {
    category: 'Scanning Capabilities',
    features: [
    { name: 'Monthly scan limit', free: '5', student: '50', premium: 'Unlimited' },
    { name: 'Job offer scanning', free: true, student: true, premium: true },
    { name: 'Internship verification', free: true, student: true, premium: true },
    { name: 'Phishing link detection', free: true, student: true, premium: true },
    { name: 'WhatsApp message scan', free: false, student: true, premium: true },
    { name: 'Email verification', free: false, student: true, premium: true },
    { name: 'Company background check', free: false, student: false, premium: true }]

  },
  {
    category: 'Detection & Analysis',
    features: [
    { name: 'Basic fraud detection', free: true, student: true, premium: true },
    { name: 'Advanced AI analysis', free: false, student: true, premium: true },
    { name: 'Human expert verification', free: false, student: false, premium: true },
    { name: 'Risk probability score', free: true, student: true, premium: true },
    { name: 'Red flag identification', free: true, student: true, premium: true },
    { name: 'Scam pattern matching', free: false, student: true, premium: true }]

  },
  {
    category: 'Reports & History',
    features: [
    { name: 'Scan history retention', free: '7 days', student: '90 days', premium: 'Unlimited' },
    { name: 'Basic scan results', free: true, student: true, premium: true },
    { name: 'Detailed PDF reports', free: false, student: true, premium: true },
    { name: 'Downloadable certificates', free: false, student: true, premium: true },
    { name: 'Share results', free: true, student: true, premium: true }]

  },
  {
    category: 'Support & Alerts',
    features: [
    { name: 'Email support', free: true, student: true, premium: true },
    { name: 'Priority support', free: false, student: true, premium: true },
    { name: '24/7 support', free: false, student: false, premium: true },
    { name: 'WhatsApp alerts', free: false, student: true, premium: true },
    { name: 'SMS alerts', free: false, student: false, premium: true },
    { name: 'Real-time notifications', free: false, student: true, premium: true }]

  }];


  const faqs: FAQ[] = [
  {
    question: 'How do I verify my student status for the Student plan?',
    answer: `Upload a valid student ID card, college enrollment certificate, or use your .edu email address during signup. Verification typically takes 24-48 hours. Once verified, you'll receive an email confirmation and can start using your Student plan benefits immediately.`
  },
  {
    question: 'Can I upgrade or downgrade my plan anytime?',
    answer: `Yes, you can change your plan at any time. When upgrading, you'll get immediate access to new features and pay the prorated difference. When downgrading, changes take effect at the end of your current billing cycle, and you'll retain access to premium features until then.`
  },
  {
    question: 'How many scans do I get for free?',
    answer: `Free plan users get 5 Basic scans and 3 Deep Vision scans monthly (resets every 30 days). Basic scans are optimized for single-page documents and quick messages. Deep Vision scans enable our advanced 10+ page deep search for complex multi-page contracts and high-resolution scanned PDFs.`
  },
  {
    question: 'What is Deep Vision?',
    answer: `Deep Vision is our premium scanning mode designed for multi-page documents (10+ pages). It uses high-resolution rendering and specialized OCR workers to extract text from every page of long contracts, offer letters, or blurry PDF scans that basic scanners miss.`
  },
  {
    question: 'Is there a money-back guarantee?',
    answer: `Yes! We offer a 7-day money-back guarantee on all paid plans. If you're not satisfied with our service within the first week, contact our support team for a full refund. No questions asked. This applies to both monthly and annual subscriptions.`
  },
  {
    question: 'How does annual billing work and what are the savings?',
    answer: `Annual billing gives you 2 months free compared to monthly payments. Student plan saves ₹189/year (₹999 vs ₹1,188), and Premium saves ₹589/year (₹2,999 vs ₹3,588). You're billed once annually and can cancel anytime with a prorated refund for unused months.`
  },
  {
    question: 'What payment methods do you accept?',
    answer: `We accept all major credit/debit cards (Visa, Mastercard, RuPay), UPI payments, net banking, and popular digital wallets like Paytm, PhonePe, and Google Pay. All transactions are secured with 256-bit SSL encryption and comply with RBI payment security standards.`
  }];


  const testimonials: Testimonial[] = [
  {
    name: 'Priya Sharma',
    role: 'Engineering Student, IIT Delhi',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_1c48da832-1763299032357.png",
    alt: 'Young Indian woman with long black hair wearing blue shirt smiling at camera',
    rating: 5,
    testimonial: `The Student plan saved me from a fake internship scam! The detailed report showed red flags I completely missed. Worth every rupee for peace of mind during job hunting.`
  },
  {
    name: 'Rahul Verma',
    role: 'MBA Graduate, XLRI',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_1a6fad4bf-1763295560698.png",
    alt: 'Young Indian man with short black hair and beard in formal white shirt',
    rating: 5,
    testimonial: `Upgraded to Premium after the free trial. The unlimited scans and API access are perfect for my consulting work. Best investment for protecting my career and clients.`
  },
  {
    name: 'Ananya Patel',
    role: 'Computer Science Student, NIT',
    image: "https://images.unsplash.com/photo-1695322319841-f3d009e78d62",
    alt: 'Young woman with brown hair in casual attire smiling outdoors',
    rating: 5,
    testimonial: `Started with the free plan, then got the Student discount. The WhatsApp alerts are super helpful! Detected 3 fake job offers in my first month. Highly recommend to all students.`
  }];


  const handlePlanSelect = (planId: string) => {
    if (!isHydrated) return;
    setSelectedPlan(planId);
    
    // For paid plans, open the payment modal
    if (planId !== 'free') {
      const plan = pricingPlans.find(p => p.id === planId);
      if (plan) {
        setPaymentPlanDetails({
          name: plan.title,
          price: billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice,
          period: billingCycle === 'monthly' ? 'month' : 'year'
        });
        setIsPaymentModalOpen(true);
      }
    } else {
      // For free plan, simulate signup
      console.log('Selected free plan');
      window.location.href = '/login';
    }
  };

  const toggleBillingCycle = () => {
    if (!isHydrated) return;
    setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly');
  };

  const currentPrice = (plan: PricingPlan) => {
    return billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
  };

  const savingsAmount = billingCycle === 'annual' ?
  <span className="text-success-green text-sm font-semibold">
      Save up to ₹589/year
    </span> :
  null;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-background pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground mb-4">
              Choose Your Protection Plan
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transparent pricing designed for students and professionals. Start free, upgrade anytime.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span
              className={`text-sm font-medium ${
              billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`
              }>

              Monthly
            </span>
            <button
              onClick={toggleBillingCycle}
              className="relative w-14 h-7 bg-muted rounded-full transition-colors duration-300 hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Toggle billing cycle">

              <span
                className={`absolute top-1 left-1 w-5 h-5 bg-primary rounded-full transition-transform duration-300 ${
                billingCycle === 'annual' ? 'translate-x-7' : ''}`
                } />

            </button>
            <span
              className={`text-sm font-medium ${
              billingCycle === 'annual' ? 'text-foreground' : 'text-muted-foreground'}`
              }>

              Annual
            </span>
            {savingsAmount && <div className="ml-2">{savingsAmount}</div>}
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {pricingPlans.map((plan) =>
            <PricingCard
              key={plan.id}
              title={plan.title}
              subtitle={plan.subtitle}
              price={currentPrice(plan)}
              period={billingCycle === 'monthly' ? 'month' : 'year'}
              features={plan.features}
              isPopular={plan.isPopular}
              ctaText={plan.ctaText}
              onCtaClick={() => handlePlanSelect(plan.id)}
              badge={plan.badge} />

            )}
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-center">
            <div className="flex items-center gap-2 text-muted-foreground group hover:text-foreground transition-colors">
              <Icon name="ShieldCheckIcon" size={24} variant="solid" className="text-primary/50 group-hover:text-primary transition-colors" />
              <span className="text-sm">Human-Vetted Rules</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground group hover:text-foreground transition-colors">
              <Icon name="LockClosedIcon" size={24} variant="solid" className="text-primary/50 group-hover:text-primary transition-colors" />
              <span className="text-sm">Secure In-Memory Processing</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground group hover:text-foreground transition-colors">
              <Icon name="CommandLineIcon" size={24} variant="solid" className="text-primary/50 group-hover:text-primary transition-colors" />
              <span className="text-sm">Transparent Analysis Logic</span>
            </div>
          </div>
        </div>
      </section>


      {/* FAQ Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-[#0C0E17] to-transparent border-t border-white/[0.06]">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Everything you need to know about our pricing
            </p>
          </div>
          <FAQSection faqs={faqs} />
        </div>
      </section>

      {/* Payment Modal / Coming Soon */}
      {paymentPlanDetails && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          planName={paymentPlanDetails.name}
        />
      )}

    </div>);

};

export default PricingInteractive;