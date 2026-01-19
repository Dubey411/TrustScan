'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface BusinessEntity {
  type: string;
  value: string;
  isValid: boolean;
  portalUrl: string;
  label: string;
}

interface BusinessVerificationCardProps {
  entities: BusinessEntity[];
  scanType?: string;
  target?: string;
}

export const BusinessVerificationCard: React.FC<BusinessVerificationCardProps> = ({ entities, scanType, target }) => {
  const isCompanyScan = scanType === 'company';
  const hasEntities = entities && entities.length > 0;
  
  // Logic: 
  // - If it's a company scan + valid entities -> Registered (Green)
  // - If it's a company scan + entities but invalid -> Fake ID (Red)
  // - If it's a company scan + NO entities -> ID Missing (Orange)
  // - If it's NOT a company scan (e.g. text scan) and no entities -> Don't show
  
  if (!hasEntities && !isCompanyScan) return null;

  const isRegistered = hasEntities && entities.some(e => e.isValid);
  const hasInvalidId = hasEntities && entities.some(e => !e.isValid);
  
  let statusColor = 'text-slate-400';
  let statusBg = 'bg-slate-500/10';
  let statusIcon = 'QuestionMarkCircleIcon';
  let statusText = 'Unknown Status';

  if (isRegistered) {
      statusColor = 'text-emerald-400';
      statusBg = 'bg-emerald-500/10';
      statusIcon = 'CheckBadgeIcon';
      statusText = 'Registered Entity';
  } else if (hasInvalidId) {
      statusColor = 'text-rose-400';
      statusBg = 'bg-rose-500/10';
      statusIcon = 'ExclamationTriangleIcon';
      statusText = 'Invalid / Fake ID';
  } else {
      // ID Missing State
      statusColor = 'text-amber-400';
      statusBg = 'bg-amber-500/10';
      statusIcon = 'MagnifyingGlassIcon';
      statusText = 'ID Required';
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden mb-6">
      <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${statusBg}`}>
            <Icon name={statusIcon} size={20} className={statusColor} />
          </div>
          <div>
             <h3 className="text-lg font-semibold text-white">Company Verification</h3>
             <p className="text-xs text-slate-400 uppercase tracking-wide">
                Status: <span className={`font-bold ${statusColor}`}>{statusText}</span>
             </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Entity Details or Warning */}
        {hasEntities ? (
            entities.map((entity, index) => (
            <div 
                key={index}
                className="group flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-900/80 border border-slate-700 rounded-xl hover:border-blue-500/50 transition-all duration-300 gap-4"
            >
                <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${entity.isValid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    <Icon name={entity.isValid ? 'ShieldCheckIcon' : 'ExclamationTriangleIcon'} size={24} />
                </div>
                <div>
                    <div className="text-sm font-medium text-slate-400 mb-0.5">{entity.label}</div>
                    <div className="text-lg font-mono font-bold text-white tracking-wider">{entity.value}</div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold uppercase ${
                            entity.isValid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                            {entity.isValid ? 'Valid Checksum' : 'Invalid Checksum'}
                        </span>
                    </div>
                </div>
                </div>

                {entity.isValid && (
                    <a 
                    href={entity.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/20"
                    >
                    <Icon name="ArrowTopRightOnSquareIcon" size={18} />
                    Verify on Official Portal
                    </a>
                )}
            </div>
            ))
        ) : (
             <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                <div className="flex items-start gap-3">
                    <Icon name="MagnifyingGlassIcon" size={24} className="text-amber-400 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="text-amber-400 font-bold mb-1">Company ID Required</h4>
                        <p className="text-slate-400 text-sm mb-3">
                            We couldn't detect a valid GSTIN or CIN in "<strong>{target || 'input'}</strong>". 
                            To verify this company, please find their registration ID.
                        </p>
                        <a 
                            href={`https://www.google.com/search?q=${encodeURIComponent((target || '') + ' GSTIN Number CIN Number')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
                        >
                            <Icon name="MagnifyingGlassIcon" size={14} />
                            Search Google for ID
                        </a>
                    </div>
                </div>
             </div>
        )}

        {/* Recommendations Section */}
        <div className="mt-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <Icon name="LightBulbIcon" size={16} />
                Recommendations
            </h4>
            <div className="grid gap-3">
                {isRegistered ? (
                    <>
                        <div className="flex items-start gap-3 p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                            <Icon name="CheckCircleIcon" size={18} className="text-emerald-400 mt-0.5" />
                            <p className="text-sm text-slate-300">
                                <span className="text-emerald-400 font-semibold">Verify Active Status:</span> Use the "Verify on MCA" button above to ensure the company status is "Active" and not "Struck Off".
                            </p>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                            <Icon name="DocumentMagnifyingGlassIcon" size={18} className="text-blue-400 mt-0.5" />
                            <p className="text-sm text-slate-300">
                                Check for recent annual filings on the MCA portal to confirm the business is operationally active.
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex items-start gap-3 p-3 bg-rose-500/5 rounded-lg border border-rose-500/10">
                            <Icon name="HandRaisedIcon" size={18} className="text-rose-400 mt-0.5" />
                            <p className="text-sm text-slate-300">
                                <span className="text-rose-400 font-semibold">Proceed with Caution:</span> Do not make any payments or share sensitive documents until you receive a valid GSTIN or CIN.
                            </p>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                            <Icon name="ChatBubbleBottomCenterTextIcon" size={18} className="text-blue-400 mt-0.5" />
                            <p className="text-sm text-slate-300">
                                Ask the representative/employer explicitly for their Company Registration Number (CIN) or GST Number.
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

