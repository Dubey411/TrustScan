'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

export default function CompanyReportClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const name = searchParams.get('name') || 'Unknown Company';
  const cin = searchParams.get('cin') || 'N/A';
  const address = searchParams.get('address') || 'Address Not Available';
  const status = searchParams.get('status') || 'Unknown';
  const regDate = searchParams.get('regDate') || 'N/A';
  const type = searchParams.get('type') || 'N/A';
  const isValid = searchParams.get('valid') === 'true';
  const scanId = searchParams.get('scanId'); 

  const [feedbackSubmitted, setFeedbackSubmitted] = React.useState(false);
  const [hoverRating, setHoverRating] = React.useState(0);

  const submitFeedback = async (rating: number) => {
    if (!scanId) return;
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      await fetch(`${API_BASE}/feedback`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ scanId, rating }) 
      });
      setFeedbackSubmitted(true);
    } catch (e) {
      console.error("Feedback failed", e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-12 font-sans">
      
      <button 
        onClick={() => router.back()}
        className="flex items-center text-slate-400 hover:text-white mb-8 transition-colors group"
      >
        <div className="p-2 rounded-full bg-slate-900 group-hover:bg-slate-800 mr-3">
             <Icon name="ArrowLeftIcon" size={20} />
        </div>
        <span className="font-semibold">Back to Scan Results</span>
      </button>

      <div className="max-w-4xl mx-auto">
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-8 relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-2 ${isValid ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${isValid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                             <Icon name="BuildingOffice2Icon" size={24} variant="solid" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Corporate Profile</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{name}</h1>
                    <p className="font-mono text-slate-400 text-sm flex items-center gap-2">
                        CIN: <span className="text-slate-200">{cin}</span>
                        {isValid && <Icon name="CheckBadgeIcon" size={16} className="text-emerald-400" />}
                    </p>
                </div>

                <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${
                    status === 'Active' 
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
                    : 'bg-rose-500/5 border-rose-500/20 text-rose-400'
                }`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${status === 'Active' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                    <span className="font-bold uppercase tracking-wide text-sm">{status}</span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Icon name="DocumentTextIcon" size={20} className="text-blue-400" />
                    Registration Details
                </h3>
                
                <div className="space-y-6">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Company Category</p>
                        <p className="text-lg text-slate-200">{type}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Date of Incorporation (MCA)</p>
                            <p className="text-lg text-slate-200">{regDate}</p>
                        </div>
                         <div>
                            <p className="text-xs font-bold text-slate-500 uppercase mb-1">ROC Code</p>
                            <p className="text-lg text-slate-200">{cin.substring(6,8) || 'N/A'}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Listing Status</p>
                        <p className="text-lg text-slate-200 flex items-center gap-2">
                            {cin.startsWith('L') ? 'Listed (Publicly Traded)' : 'Unlisted (Private)'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Icon name="MapPinIcon" size={20} className="text-amber-400" />
                    Registered Office Address
                </h3>

                <div className="space-y-6">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">Official Address (MCA Records)</p>
                        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                             <p className="text-slate-300 leading-relaxed font-medium">
                                {address}
                             </p>
                        </div>
                    </div>
                    

                    <div className="pt-4 border-t border-slate-800 text-center md:text-left">
                        <p className="text-xs text-amber-500/80 mb-1 flex items-center gap-2">
                             <Icon name="StarIcon" size={14} />
                             Community Insight
                        </p>
                        <p className="text-xs text-slate-400">
                            Is this company suspicious? Scroll down to rate it and warn others.
                        </p>
                    </div>
                </div>
            </div>

        </div>
        
        {scanId && (
            <div className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center max-w-2xl mx-auto">
                <h3 className="text-lg font-bold text-white mb-2">Help us build the Community Trust Score</h3>
                <p className="text-slate-400 text-sm mb-6">
                    Verified ID doesn't always mean safe. If this company is involved in fraud, report it here to flags it for others.
                </p>

                {!feedbackSubmitted ? (
                    <div className="flex justify-center gap-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => submitFeedback(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="p-2 transition-transform hover:scale-110"
                            >
                                <Icon 
                                    name="StarIcon" 
                                    size={32} 
                                    variant={(hoverRating || 0) >= star ? "solid" : "outline"}
                                    className={(hoverRating || 0) >= star ? "text-amber-400" : "text-slate-600"}
                                />
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-2 text-emerald-400 bg-emerald-500/10 py-3 px-6 rounded-xl mx-auto inline-flex">
                        <Icon name="CheckCircleIcon" size={24} />
                        <span className="font-bold">Thanks! Your report has been logged.</span>
                    </div>
                )}
            </div>
        )}

        <div className="mt-8 text-center">
            <p className="text-xs text-slate-600 max-w-2xl mx-auto">
                Source: Ministry of Corporate Affairs (MCA) Registry. 
                This report is generated for entity verification purposes.
            </p>
        </div>

      </div>
    </div>
  );
}
