import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

const TrustSection = () => {
  const certifications = [
  {
    icon: 'ShieldCheckIcon',
    title: 'ISO 27001 Certified',
    description: 'Information security management'
  },
  {
    icon: 'LockClosedIcon',
    title: 'SSL Encrypted',
    description: 'Bank-grade data protection'
  },
  {
    icon: 'CheckBadgeIcon',
    title: 'GDPR Compliant',
    description: 'Privacy-first approach'
  },
  {
    icon: 'ServerIcon',
    title: 'India Data Centers',
    description: 'Your data stays in India'
  }];


  const partners = [
  {
    name: 'IIT Delhi',
    logo: "https://img.rocket.new/generatedImages/rocket_gen_img_1cb07460e-1764656716041.png",
    alt: 'IIT Delhi logo with institutional building in background'
  },
  {
    name: 'NASSCOM',
    logo: "https://img.rocket.new/generatedImages/rocket_gen_img_12ccd93f2-1766957480269.png",
    alt: 'Modern corporate office building representing NASSCOM partnership'
  },
  {
    name: 'Cyber Security Alliance',
    logo: "https://img.rocket.new/generatedImages/rocket_gen_img_133a3eb0b-1767807975164.png",
    alt: 'Digital security shield icon representing cybersecurity alliance'
  },
  {
    name: 'AICTE',
    logo: "https://img.rocket.new/generatedImages/rocket_gen_img_15a2d8bc2-1767807974949.png",
    alt: 'Educational institution building representing AICTE accreditation'
  }];


  const mediaLogos = [
  {
    name: 'The Times of India',
    logo: "https://img.rocket.new/generatedImages/rocket_gen_img_17817559a-1766915076670.png",
    alt: 'Newspaper layout representing Times of India media coverage'
  },
  {
    name: 'Economic Times',
    logo: "https://img.rocket.new/generatedImages/rocket_gen_img_1a8600778-1766470561558.png",
    alt: 'Business newspaper representing Economic Times feature'
  },
  {
    name: 'YourStory',
    logo: "https://img.rocket.new/generatedImages/rocket_gen_img_1dd1e3859-1764651774953.png",
    alt: 'Startup magazine representing YourStory publication'
  },
  {
    name: 'Inc42',
    logo: "https://img.rocket.new/generatedImages/rocket_gen_img_1c4178c30-1764651772883.png",
    alt: 'Tech magazine representing Inc42 coverage'
  }];


  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Security Certifications */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-headline font-bold text-foreground mb-4">
            Your Security is Our Priority
          </h2>
          <p className="text-lg text-muted-foreground">
            Industry-leading security standards and certifications
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {certifications.map((cert, index) =>
          <div
            key={index}
            className="bg-card rounded-xl p-6 text-center shadow-brand hover:shadow-brand-elevated transition-all duration-300 hover:-translate-y-1">

              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name={cert.icon as any} size={32} variant="solid" className="text-primary" />
              </div>
              <h3 className="text-lg font-headline font-bold text-foreground mb-2">
                {cert.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {cert.description}
              </p>
            </div>
          )}
        </div>

        {/* Partner Institutions */}
        <div className="mb-20">
          <h3 className="text-2xl font-headline font-bold text-foreground text-center mb-12">
            Trusted by Leading Institutions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {partners.map((partner, index) =>
            <div
              key={index}
              className="bg-card rounded-lg p-6 flex items-center justify-center hover:shadow-brand transition-all duration-300">

                <div className="w-full h-20 relative overflow-hidden rounded">
                  <AppImage
                  src={partner.logo}
                  alt={partner.alt}
                  className="w-full h-full object-contain grayscale hover:grayscale-0 transition-all duration-300" />

                </div>
              </div>
            )}
          </div>
        </div>

        {/* Media Coverage */}
        <div>
          <h3 className="text-2xl font-headline font-bold text-foreground text-center mb-12">
            Featured In
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {mediaLogos.map((media, index) =>
            <div
              key={index}
              className="bg-card rounded-lg p-6 flex items-center justify-center hover:shadow-brand transition-all duration-300">

                <div className="w-full h-16 relative overflow-hidden rounded">
                  <AppImage
                  src={media.logo}
                  alt={media.alt}
                  className="w-full h-full object-contain grayscale hover:grayscale-0 transition-all duration-300" />

                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trust Stats */}
        <div className="mt-20 bg-gradient-to-r from-primary to-secondary rounded-xl p-12 text-center">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-headline font-bold text-primary-foreground mb-2">99.8%</div>
              <div className="text-primary-foreground/90">Detection Accuracy</div>
            </div>
            <div>
              <div className="text-4xl font-headline font-bold text-primary-foreground mb-2">&lt;2s</div>
              <div className="text-primary-foreground/90">Average Scan Time</div>
            </div>
            <div>
              <div className="text-4xl font-headline font-bold text-primary-foreground mb-2">24/7</div>
              <div className="text-primary-foreground/90">Support Available</div>
            </div>
          </div>
        </div>
      </div>
    </section>);

};

export default TrustSection;