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
}

export default function CareerDocumentCard({
  companyName = 'AMDOX TECHNOLOGIES',
  candidateName = 'Candidate',
  roleTitle = 'Intern / Software Engineer',
  joiningDate = 'Nov 2025',
  hasMcaRegistration = false,
  hasOfficialDomain = true,
  softwareTraces = [],
  mathBalanceValid = true
}: CareerDocumentProps) {
  return (
    <div className="bg-card rounded-2xl border-2 border-indigo-500/20 shadow-brand overflow-hidden mb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-indigo-500/5 to-transparent p-5 border-b border-indigo-500/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Icon name="BriefcaseIcon" size={24} variant="solid" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-lg text-foreground">
              💼 Employment & Credential Audit
            </h3>
            <p className="text-xs text-muted-foreground">
              Offer letter authenticity, compensation arithmetic & corporate validation
            </p>
          </div>
        </div>
        <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full uppercase tracking-wider">
          Credential Scanned
        </span>
      </div>

      {/* Grid Content */}
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: MCA / CIN Cross-Match */}
          <div className="bg-muted/30 rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="BuildingOffice2Icon" size={18} className="text-indigo-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Corporate Registration
              </span>
            </div>
            <div className="text-sm font-semibold text-foreground">
              {hasMcaRegistration ? (
                <span className="text-success flex items-center gap-1.5">
                  <Icon name="CheckCircleIcon" size={16} variant="solid" />
                  Verified MCA Entity
                </span>
              ) : (
                <span className="text-warning flex items-center gap-1.5 font-bold">
                  <Icon name="ExclamationTriangleIcon" size={16} variant="solid" />
                  Missing MCA CIN / GSTIN
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Company: {companyName}
            </p>
          </div>

          {/* Card 2: Compensation & Math Balance */}
          <div className="bg-muted/30 rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="CalculatorIcon" size={18} className="text-emerald-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                CTC & Math Consistency
              </span>
            </div>
            <div className="text-sm font-semibold text-foreground">
              {mathBalanceValid ? (
                <span className="text-success flex items-center gap-1.5">
                  <Icon name="CheckCircleIcon" size={16} variant="solid" />
                  Arithmetic Balanced
                </span>
              ) : (
                <span className="text-destructive flex items-center gap-1.5 font-bold">
                  <Icon name="XCircleIcon" size={16} variant="solid" />
                  Salary Math Discrepancy
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Gross, Net & Allowance structure
            </p>
          </div>

          {/* Card 3: Edit Traces / Software Signatures */}
          <div className="bg-muted/30 rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="DocumentDuplicateIcon" size={18} className="text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Software & Edit Traces
              </span>
            </div>
            <div className="text-sm font-semibold text-foreground">
              {softwareTraces.length === 0 ? (
                <span className="text-success">Clean (No Canva/Photoshop trace)</span>
              ) : (
                <span className="text-warning font-semibold">{softwareTraces.join(', ')} Detected</span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              EXIF & PDF Object Stream Audit
            </p>
          </div>
        </div>

        {/* Offer Details Bar */}
        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="UserCircleIcon" size={20} className="text-indigo-500" />
            <div>
              <p className="text-xs font-bold text-foreground">Designation & Candidate</p>
              <p className="text-[11px] text-muted-foreground">
                Role: <span className="text-foreground font-semibold">{roleTitle}</span> • Start: {joiningDate}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold bg-background px-3 py-1 rounded border border-border">
            {candidateName}
          </span>
        </div>
      </div>
    </div>
  );
}
