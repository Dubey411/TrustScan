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
      className={`w-full p-6 rounded-xl border-2 transition-all duration-300 text-left hover:-translate-y-0.5 ${
        isSelected
          ? 'border-primary bg-primary/[0.06] dark:bg-gradient-to-br dark:from-[#1E233D] dark:via-[#15192A] dark:to-[#121522] shadow-[0_0_22px_rgba(255,107,74,0.15)]'
          : 'border-border bg-card dark:bg-gradient-to-br dark:from-[#131726] dark:to-[#0F121E] hover:border-primary/40 shadow-sm dark:shadow-md'
      }`}
      aria-pressed={isSelected}
    >
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-xl transition-colors ${isSelected ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-muted border border-border text-muted-foreground'}`}>
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