import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface ScanRecord {
  id: string | number;
  scanType: string;
  target: string;
  result: 'safe' | 'risky' | 'scam';
  confidence: number;
  date: string;
  time: string;
}

interface ScanHistoryTableProps {
  scans: ScanRecord[];
  onSelectScan?: (id: string | number) => void;
}

const ScanHistoryTable = ({ scans, onSelectScan }: ScanHistoryTableProps) => {
  const sortedScans = React.useMemo(() => {
    return [...scans].sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`).getTime();
      const dateB = new Date(`${b.date} ${b.time}`).getTime();
      return isNaN(dateA) || isNaN(dateB) ? 0 : dateB - dateA;
    });
  }, [scans]);

  const getResultBadge = (result: string, confidence: number) => {
    const badges = {
      safe: { bg: 'bg-success-green/10', text: 'text-success-green', icon: 'CheckCircleIcon' },
      risky: { bg: 'bg-warning/10', text: 'text-warning', icon: 'ExclamationCircleIcon' },
      scam: { bg: 'bg-error/10', text: 'text-error', icon: 'XCircleIcon' }
    };
    
    const badge = badges[result as keyof typeof badges] || badges.risky; // Fallback to risky if unknown

    
    return (
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
          <Icon name={badge.icon as any} size={14} variant="solid" />
          {result.charAt(0).toUpperCase() + result.slice(1)}
        </span>
        <span className="text-xs text-muted-foreground">{confidence}%</span>
      </div>
    );
  };

  const getScanTypeIcon = (type: string): string => {
    const icons: Record<string, string> = {
      'Job Offer': 'BriefcaseIcon',
      'Internship': 'AcademicCapIcon',
      'Email': 'EnvelopeIcon',
      'WhatsApp': 'ChatBubbleLeftRightIcon',
      'Link': 'LinkIcon'
    };
    return icons[type] || 'DocumentTextIcon';
  };

  return (
    <div className="bg-card rounded-lg shadow-brand overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-headline font-bold text-foreground">Scan History</h2>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:text-trust-blue transition-colors duration-300">
            <Icon name="ArrowDownTrayIcon" size={16} variant="outline" />
            Export
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-muted/20">
        <table className="w-full relative">
          <thead className="bg-muted sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted">
                Scan Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted">
                Target
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted">
                Result
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedScans.map((scan) => (
              <tr 
                key={scan.id} 
                className={`hover:bg-muted/50 transition-colors duration-200 ${onSelectScan ? 'cursor-pointer' : ''}`}
                onClick={() => onSelectScan && onSelectScan(scan.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Icon name={getScanTypeIcon(scan.scanType) as any} size={18} variant="outline" className="text-primary" />
                    <span className="text-sm font-medium text-foreground">{scan.scanType}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-foreground max-w-xs truncate" title={scan.target}>
                    {scan.target}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getResultBadge(scan.result, scan.confidence)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-foreground">{scan.date}</div>
                  <div className="text-xs text-muted-foreground">{scan.time}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectScan) onSelectScan(scan.id);
                    }}
                    className="text-primary hover:text-trust-blue transition-colors duration-300"
                  >
                    <Icon name="EyeIcon" size={18} variant="outline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScanHistoryTable;