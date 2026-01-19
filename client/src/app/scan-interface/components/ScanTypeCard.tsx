import Icon from '@/components/ui/AppIcon';

interface ScanTypeCardProps {
  icon: string;
  title: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
}

export default function ScanTypeCard({ icon, title, description, isSelected, onClick }: ScanTypeCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-6 rounded-lg border-2 transition-all duration-300 text-left hover:shadow-brand hover:-translate-y-1 ${
        isSelected
          ? 'border-primary bg-primary/5 shadow-brand'
          : 'border-border bg-card hover:border-primary/50'
      }`}
      aria-pressed={isSelected}
    >
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-lg ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          <Icon name={icon as any} size={24} variant={isSelected ? 'solid' : 'outline'} />
        </div>
        <div className="flex-1">
          <h3 className="font-headline font-semibold text-lg text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {isSelected && (
          <div className="flex-shrink-0">
            <Icon name="CheckCircleIcon" size={24} variant="solid" className="text-success" />
          </div>
        )}
      </div>
    </button>
  );
}