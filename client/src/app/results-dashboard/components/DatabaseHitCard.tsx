
import React from 'react';
import Icon from '@/components/ui/AppIcon';

/**
 * DatabaseHitCard Component
 * 
 * Displays intelligence matches against known fraud registries:
 * - Red Flag: Confirmed fraud operations and fake recruitment networks
 * - Grey List: Emerging entities with reported behavioral anomalies
 */
interface DatabaseHit {
  name: string;
  category: 'red_flag' | 'grey_list';
  type: string;
  addedAt?: string;
}

interface DatabaseHitCardProps {
  hits: DatabaseHit[];
}

export const DatabaseHitCard = ({ hits }: DatabaseHitCardProps) => {
  if (!hits || hits.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
         <Icon name="ServerStackIcon" size={18} className="text-primary" />
         <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Intelligence Database Matches</h3>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {hits.map((hit, idx) => {
          const isRed = hit.category === 'red_flag';
          
          return (
            <div 
              key={idx} 
              className={`relative overflow-hidden rounded-2xl border ${
                isRed 
                  ? 'bg-error/5 border-error/20' 
                  : 'bg-warning/5 border-warning/20'
              } p-5 transition-all hover:shadow-lg`}
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4 focus-visible:outline-none">
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter border ${
                  isRed 
                    ? 'bg-error text-white border-error shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                    : 'bg-warning text-white border-warning shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                }`}>
                  {isRed ? 'Blacklisted' : 'Greylisted'}
                </span>
              </div>

              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${isRed ? 'bg-error/20 text-error' : 'bg-warning/20 text-warning'}`}>
                   <Icon name={isRed ? 'ShieldExclamationIcon' : 'ExclamationTriangleIcon'} size={28} variant="solid" />
                </div>
                
                <div className="flex-1">
                  <h4 className="text-lg font-headline font-bold text-foreground mb-1 leading-tight">
                    {hit.name}
                  </h4>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                       Classification: {hit.type}
                    </span>
                  </div>
                  
                  <p className="text-sm text-foreground/80 leading-relaxed italic border-l-2 border-primary/20 pl-3">
                    {isRed 
                      ? "Confirmed fraudulent entity. High probability of malicious intent or documented scam activity." 
                      : "Registered entity with reported predatory behavior or fee-based recruitment models."}
                  </p>
                  
                  {hit.addedAt && (
                    <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                       <span>Source: TrustScan Global Database</span>
                       <span>Reported: {new Date(hit.addedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
