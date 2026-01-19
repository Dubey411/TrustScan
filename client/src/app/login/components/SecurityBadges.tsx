import Icon from '@/components/ui/AppIcon';

const SecurityBadges = () => {
  const badges = [
    {
      icon: 'ShieldCheckIcon',
      title: 'SSL Encrypted',
      description: '256-bit encryption',
    },
    {
      icon: 'LockClosedIcon',
      title: 'Data Protected',
      description: 'GDPR compliant',
    },
    {
      icon: 'CheckBadgeIcon',
      title: 'Verified Platform',
      description: 'ISO 27001 certified',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      {badges.map((badge, index) => (
        <div
          key={index}
          className="flex flex-col items-center text-center p-6 bg-card/50 rounded-lg border border-border"
        >
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Icon name={badge.icon as any} size={24} variant="solid" className="text-primary" />
          </div>
          <h3 className="text-sm font-headline font-semibold text-foreground mb-1">
            {badge.title}
          </h3>
          <p className="text-xs text-muted-foreground">{badge.description}</p>
        </div>
      ))}
    </div>
  );
};

export default SecurityBadges;