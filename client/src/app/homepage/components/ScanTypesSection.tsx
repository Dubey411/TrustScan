import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';

const ScanTypesSection = () => {
  const scanTypes = [
    {
      icon: 'IdentificationIcon',
      title: 'Government ID Verification',
      description: 'Audit official Government identifiers including Aadhaar Verhoeff checksums, PAN format & entity status, Driving License, and Passport MRZ logic.',
      features: ['Aadhaar Verhoeff checksum validation', 'PAN entity & structure check (Individual/Company)', 'Driving License format mapping', 'Masked Aadhaar compliance check'],
      color: 'primary',
    },
    {
      icon: 'BuildingOffice2Icon',
      title: 'Company & Business Registration',
      description: 'Verify corporate legitimacy using official MCA Corporate Identity Numbers (CIN), GSTIN 15-digit state mappings, and Business Invoices.',
      features: ['CIN 21-digit MCA structure audit', 'GSTIN state & checksum validation', 'Business invoice tax calculations', 'Active registration status verification'],
      color: 'secondary',
    },
    {
      icon: 'DocumentCheckIcon',
      title: 'Career & Academic Credentials',
      description: 'Audit employment offer letters, experience certificates, and academic marksheets for digital edits, font tampering, and domain validity.',
      features: ['AI digital edit & Photoshop trace detection', 'Company domain & address verification', 'Salary/stipend range benchmark check', 'Font consistency & alignment audit'],
      color: 'accent',
    },
    {
      icon: 'CreditCardIcon',
      title: 'Financial & Bank Statements',
      description: 'Perform mathematical & structural integrity audits on salary slips, bank statements, UPI payment receipts, and billing invoices.',
      features: ['Net vs Gross pay balance audit', 'Tax deduction & TDS verification', 'Bank statement alignment check', 'UPI payment receipt fraud detection'],
      color: 'success-green',
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-headline font-bold text-foreground mb-4">
            Universal AI Verification Engine
          </h2>
          <p className="text-lg text-muted-foreground">
            Multi-modal verification for Government IDs, Corporate Records, Employment Credentials, and Invoices
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