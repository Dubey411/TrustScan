'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import Image from 'next/image';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  price: string;
  period: string;
}

const PaymentModal = ({ isOpen, onClose, planName, price, period }: PaymentModalProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const [step, setStep] = useState<'auth' | 'payment' | 'processing' | 'success'>('auth');
  const [cardNumber, setCardNumber] = useState('');
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    if (isOpen) {
      const authStatus = localStorage.getItem('isAuthenticated') === 'true';
      setIsAuthenticated(authStatus);
      if (authStatus) {
        setStep('payment');
      } else {
        setStep('auth');
      }
    }
  }, [isOpen]);

  const handleLogin = () => {
    // Simulate login
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userEmail', 'simulated_user@example.com');
    setIsAuthenticated(true);
    setStep('payment');
    // In a real app, we might redirect or open a login modal, but here we simulate success
  };

  const handlePayment = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('success');
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
          <div>
            <h3 className="text-xl font-headline font-bold text-foreground">Complete Payment</h3>
            <p className="text-sm text-muted-foreground">{planName} Plan • {price}/{period}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <Icon name="XMarkIcon" size={24} variant="outline" />
          </button>
        </div>

        <div className="p-6">
          {step === 'auth' && (
            <div className="text-center py-6 space-y-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Icon name="UserCircleIcon" size={48} variant="solid" className="text-primary" />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-foreground">Login Required</h4>
                <p className="text-muted-foreground">Please log in to your account to proceed with the payment and activate your premium protection.</p>
              </div>
              <button
                onClick={handleLogin}
                className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-trust-blue transition-all shadow-lg hover:shadow-primary/25"
              >
                Login to Continue
              </button>
              <p className="text-xs text-muted-foreground">
                Don't have an account? <span className="text-primary font-semibold cursor-pointer">Sign up</span>
              </p>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-6">
              {/* Tabs */}
              <div className="flex p-1 bg-muted rounded-lg">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                    paymentMethod === 'card' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Icon name="CreditCardIcon" size={18} variant={paymentMethod === 'card' ? 'solid' : 'outline'} />
                    Card
                  </div>
                </button>
                <button
                  onClick={() => setPaymentMethod('upi')}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                    paymentMethod === 'upi' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Icon name="CurrencyRupeeIcon" size={18} variant={paymentMethod === 'upi' ? 'solid' : 'outline'} />
                    UPI
                  </div>
                </button>
              </div>

              {paymentMethod === 'card' ? (
                <div className="space-y-4 animate-in slide-in-from-right-2 duration-300">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        className="w-full p-3 bg-background border border-border rounded-lg pl-10 focus:ring-2 focus:ring-primary focus:outline-none"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                      />
                      <Icon name="CreditCardIcon" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">CVV</label>
                      <input
                        type="password"
                        placeholder="***"
                        className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-in slide-in-from-left-2 duration-300 text-center">
                  <div className="bg-white p-4 rounded-xl inline-block shadow-inner border border-border">
                    <img
                      src="/images/upi-qr.png"
                      alt="UPI QR Code"
                      width={200}
                      height={200}
                      className="rounded-lg"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground italic">Scan QR with any UPI App</p>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground font-medium">Or enter UPI ID</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <label className="text-sm font-medium text-muted-foreground">UPI ID</label>
                    <input
                      type="text"
                      placeholder="username@bank"
                      className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={paymentMethod === 'card' ? !cardNumber : !upiId && paymentMethod === 'upi'}
                className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-trust-blue transition-all shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:grayscale"
              >
                Pay {price} Now
              </button>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Icon name="LockClosedIcon" size={14} variant="solid" className="text-success-green" />
                Secure 256-bit SSL Encrypted Payment
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="py-12 flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-500">
              <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <div className="text-center space-y-2">
                <h4 className="text-lg font-bold text-foreground">Processing Payment</h4>
                <p className="text-muted-foreground italic">Please do not close the window or press back...</p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-12 flex flex-col items-center justify-center space-y-6 animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-success-green/10 rounded-full flex items-center justify-center animate-bounce">
                <Icon name="CheckCircleIcon" size={64} variant="solid" className="text-success-green" />
              </div>
              <div className="text-center space-y-2">
                <h4 className="text-2xl font-bold text-foreground">Payment Successful!</h4>
                <p className="text-muted-foreground">Welcome to {planName} protection. Your account has been upgraded.</p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-4 bg-success-green text-white rounded-xl font-bold hover:bg-success-green/90 transition-all shadow-lg"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
