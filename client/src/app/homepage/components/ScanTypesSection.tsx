import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';

const ScanTypesSection = () => {
  const scanTypes = [
    {
      icon: 'CreditCardIcon',
      title: 'UPI & Payment Fraud Forensics',
      description: 'Audit payment receipts, transaction screenshots, and banking transfers for fake APK generators and altered ₹ amounts.',
      features: ['12-digit NPCI UTR reference audit', 'Fake payment APK template detection', 'Pixel-level ELA tampering on amounts', 'Bank IFSC & UPI VPA handle resolver'],
      color: 'primary',
    },
    {
      icon: 'BuildingOffice2Icon',
      title: 'Company & CIN Verification',
      description: 'Verify corporate legitimacy using official MCA Corporate Identity Numbers (CIN), 15-digit GSTIN, and active company filings.',
      features: ['CIN 21-digit MCA structure audit', 'GSTIN state & checksum validation', 'Active registration status check', 'Official MCA corporate registry lookup'],
      color: 'secondary',
    },
    {
      icon: 'DocumentCheckIcon',
      title: 'Offer Letter & CTC Audit',
      description: 'Audit employment offer letters and experience certificates for forged letterheads, salary math, and fake HR domains.',
      features: ['Salary/stipend range benchmark check', 'HR email domain & address verification', 'Font consistency & alignment audit', 'AI digital edit & Photoshop trace detection'],
      color: 'accent',
    },
    {
      icon: 'PhotoIcon',
      title: 'AI Image Detection & Forensics',
      description: 'Detect AI-generated images (Stable Diffusion, Midjourney, DALL-E, FLUX) and pixel-level tampering.',
      features: ['2D FFT spectral fingerprinting', 'Stable Diffusion & Midjourney prompt metadata scan', 'Error Level Analysis (ELA) pixel tampering', 'DCT AC coefficient distribution kurtosis'],
      color: 'success-green',
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-headline font-bold text-foreground mb-4">
            AI Fraud & Credential Verification
          </h2>
          <p className="text-lg text-muted-foreground">
            Multi-modal verification for UPI Payments, Corporate Records, Employment Offers, and AI Image Forensics
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {scanTypes.map((type, index) => (
            <div
              key={index}
              className="bg-card rounded-xl p-8 shadow-brand hover:shadow-brand-elevated transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start space-x-4 mb-6">
                <div className={`w-14 h-14 bg-${type.color}/10 rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon name={type.icon as any} size={28} variant="solid" className={`text-${type.color}`} />
                </div>
                <div>
                  <h3 className="text-xl font-headline font-bold text-foreground mb-2">
                    {type.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {type.description}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {type.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <Icon name="CheckCircleIcon" size={20} variant="solid" className="text-success-green flex-shrink-0" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/scan-interface"
                className="inline-flex items-center space-x-2 text-primary hover:text-trust-blue font-medium transition-colors duration-300"
              >
                <span>Try this scan</span>
                <Icon name="ArrowRightIcon" size={16} variant="outline" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScanTypesSection;