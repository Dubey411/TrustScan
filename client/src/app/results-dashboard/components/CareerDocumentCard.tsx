'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface CareerDocumentProps {
  companyName?: string;
  candidateName?: string;
  roleTitle?: string;
  joiningDate?: string;
  hasMcaRegistration?: boolean;
  hasOfficialDomain?: boolean;
  softwareTraces?: string[];
  mathBalanceValid?: boolean;
  trustScore?: number;
}

export default function CareerDocumentCard({
  companyName = 'AMDOX TECHNOLOGIES',
  candidateName = 'Candidate',
  roleTitle = 'Intern / Software Engineer',
  joiningDate = 'Nov 2025',
  hasMcaRegistration = false,
  hasOfficialDomain = true,
  softwareTraces = [],
  mathBalanceValid = true,
  trustScore = 62
}: CareerDocumentProps) {
  return (
    <div className="bg-card rounded-3xl border-2 border-indigo-500/20 shadow-2xl overflow-hidden mb-8 transition-all duration-300 hover:border-indigo-500/40">
      {/* 🌟 Bespoke Career & Offer Letter Header */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 p-6 md:p-8 border-b border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 text-indigo-400 shadow-inner">
            <Icon name="BriefcaseIcon" size={36} variant="solid" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Employment Credential Portal
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                Job Offer & CTC Spec
              </span>
            </div>
            <h2 className="font-headline font-black text-2xl md:text-3xl text-foreground">
              💼 Offer Letter & Career Credential Audit
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              MCA corporate cross-match, compensation arithmetic & software template trace detection
            </p>
          </div>
        </div>

        {/* Big Verdict Dial */}
        <div className="flex items-center gap-4 bg-background/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-border shadow-sm">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Offer Authenticity</div>
            <div className={`text-3xl font-black ${trustScore >= 80 ? 'text-success' : trustScore >= 50 ? 'text-warning' : 'text-destructive'}`}>
              {trustScore} / 100
            </div>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${trustScore >= 80 ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
            <Icon name={trustScore >= 80 ? 'CheckBadgeIcon' : 'ExclamationTriangleIcon'} size={28} variant="solid" />
          </div>
        </div>
      </div>

      {/* 📊 Core Inspection Grid */}
      <div className="p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Card 1: MCA / Corporate Identity */}
          <div className="bg-muted/30 hover:bg-muted/40 transition-colors rounded-2xl p-5 border border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Icon name="BuildingOffice2Icon" size={16} className="text-indigo-400" />
                  Corporate Registration
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${hasMcaRegistration ? 'bg-success/10 text-success border border-success/20' : 'bg-warning/10 text-warning border border-warning/20'}`}>
                  {hasMcaRegistration ? 'MCA VERIFIED' : 'UNREGISTERED CIN'}
                </span>
              </div>
              <div className="text-base font-bold text-foreground truncate">
                {companyName}
              </div>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                {hasMcaRegistration 
                  ? 'Official 21-digit CIN active in Ministry of Corporate Affairs registry.' 
                  : 'Document lacks official 21-digit CIN or GSTIN registration on Indian registries.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/50 text-[11px] font-mono text-indigo-400 flex items-center gap-1">
              <Icon name="DocumentMagnifyingGlassIcon" size={14} />
              {hasMcaRegistration ? 'Official Company Verified' : 'Manual HR Verification Advised'}
            </div>
          </div>

          {/* Card 2: CTC & Salary Math Balance */}
          <div className="bg-muted/30 hover:bg-muted/40 transition-colors rounded-2xl p-5 border border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Icon name="CalculatorIcon" size={16} className="text-emerald-400" />
                  CTC & Salary Math
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${mathBalanceValid ? 'bg-success/10 text-success border border-success/20' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
                  {mathBalanceValid ? 'ARITHMETIC OK' : 'MATH DISCREPANCY'}
                </span>
              </div>
              <div className="text-base font-bold text-foreground">
                {mathBalanceValid ? 'Gross & Net Breakdown Balanced' : 'CTC Calculation Error'}
              </div>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                {mathBalanceValid 
                  ? 'Basic salary, HRA, statutory PF deductions and allowances match total compensation structure.' 
                  : 'Deductions and gross figures do not sum up mathematically. Common indicator of forged templates.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/50 text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <Icon name="CheckCircleIcon" size={14} />
              Statutory Breakdown Validated
            </div>
          </div>

          {/* Card 3: Edit Traces / Software Signatures */}
          <div className="bg-muted/30 hover:bg-muted/40 transition-colors rounded-2xl p-5 border border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Icon name="DocumentDuplicateIcon" size={16} className="text-amber-400" />
                  Software Signatures
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${softwareTraces.length === 0 ? 'bg-success/10 text-success border border-success/20' : 'bg-warning/10 text-warning border border-warning/20'}`}>
                  {softwareTraces.length === 0 ? 'CLEAN EXIF' : 'TEMPLATE DETECTED'}
                </span>
              </div>
              <div className="text-base font-bold text-foreground">
                {softwareTraces.length === 0 ? 'Original Document Stream' : `${softwareTraces.join(', ')} Traces`}
              </div>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                {softwareTraces.length === 0 
                  ? 'No Photoshop, Canva, or online PDF editor watermark streams detected.' 
                  : 'Document was generated or altered using visual editing software.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/50 text-[11px] font-mono text-amber-400 flex items-center gap-1">
              <Icon name="SparklesIcon" size={14} />
              PDF Object Stream Analyzed
            </div>
          </div>
        </div>

        {/* 💼 Offer Candidate & Designation Bar */}
        <div className="bg-gradient-to-r from-indigo-500/10 via-background to-purple-500/10 border border-indigo-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Icon name="UserCircleIcon" size={22} variant="solid" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground flex items-center gap-2">
                Candidate: <span className="text-foreground font-black">{candidateName}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Offered Role: <span className="font-semibold text-foreground">{roleTitle}</span> • Start Date: {joiningDate}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-xl border border-border">
            <span className="text-xs text-muted-foreground">Issuing Org:</span>
            <span className="font-black text-sm text-foreground truncate max-w-[200px]">{companyName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
