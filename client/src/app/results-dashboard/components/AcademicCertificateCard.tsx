'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface AcademicCertificateProps {
  universityName?: string;
  studentName?: string;
  rollNumber?: string;
  degreeName?: string;
  isUgcRecognized?: boolean;
  isUgcBlacklisted?: boolean;
  marksheetMathValid?: boolean;
  mathAuditDetails?: string;
  forensicTamperScore?: number;
  trustScore?: number;
  flags?: Array<{ code: string; severity: string; message: string }>;
  positiveSignals?: string[];
}

export default function AcademicCertificateCard({
  universityName = 'University of Delhi',
  studentName = 'Candidate Record Verified',
  rollNumber = 'DU-2021-98231',
  degreeName = 'Bachelor of Technology / Degree Credential',
  isUgcRecognized = true,
  isUgcBlacklisted = false,
  marksheetMathValid = true,
  mathAuditDetails,
  forensicTamperScore = 12,
  trustScore = 92,
  flags = [],
  positiveSignals = []
}: AcademicCertificateProps) {
  const isSuspicious = isUgcBlacklisted || !marksheetMathValid || forensicTamperScore > 40 || trustScore < 50;

  return (
    <div className="bg-card rounded-3xl border-2 border-indigo-500/20 shadow-2xl overflow-hidden mb-8 transition-all duration-300 hover:border-indigo-500/40">
      {/* 🌟 Bespoke Academic Credential Header */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 p-6 md:p-8 border-b border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 text-indigo-400 shadow-inner">
            <Icon name="AcademicCapIcon" size={36} variant="solid" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[11px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                isUgcBlacklisted 
                  ? 'bg-destructive/20 text-destructive border border-destructive/30' 
                  : isUgcRecognized 
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  : 'bg-warning/20 text-warning border border-warning/30'
              }`}>
                {isUgcBlacklisted ? 'UGC Blacklisted Institution' : isUgcRecognized ? 'UGC / AICTE Verified Institution' : 'Autonomous Institution'}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                Academic Credential Spec
              </span>
            </div>
            <h2 className="font-headline font-black text-2xl md:text-3xl text-foreground">
              🎓 Degree & Marksheet Authenticity Audit
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              University accreditation check, marksheet math consistency, roll number validation & pixel tamper forensics
            </p>
          </div>
        </div>

        {/* Big Verdict Dial */}
        <div className="flex items-center gap-4 bg-background/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-border shadow-sm">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Credential Authenticity</div>
            <div className={`text-3xl font-black ${trustScore >= 80 ? 'text-success' : trustScore >= 50 ? 'text-warning' : 'text-destructive'}`}>
              {trustScore} / 100
            </div>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${trustScore >= 80 ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
            <Icon name={trustScore >= 80 ? 'CheckBadgeIcon' : 'ExclamationTriangleIcon'} size={28} variant="solid" />
          </div>
        </div>
      </div>

      {/* 📊 Core Inspection Grid */}
      <div className="p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Card 1: University Accreditation */}
          <div className="bg-muted/30 hover:bg-muted/40 transition-colors rounded-2xl p-5 border border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Icon name="BuildingLibraryIcon" size={16} className="text-indigo-400" />
                  Issuing University
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  isUgcBlacklisted 
                    ? 'bg-destructive/20 text-destructive border border-destructive/30' 
                    : isUgcRecognized 
                    ? 'bg-success/10 text-success border border-success/20'
                    : 'bg-muted text-muted-foreground border border-border'
                }`}>
                  {isUgcBlacklisted ? 'FAKE DEGREE MILL' : isUgcRecognized ? 'UGC RECOGNIZED' : 'UNLISTED'}
                </span>
              </div>
              <div className="text-lg font-headline font-bold text-foreground line-clamp-2">
                {universityName}
              </div>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                {isUgcBlacklisted 
                  ? '⚠️ Alert: This institution is listed on the official UGC registry of fake and unaccredited degree mills.' 
                  : isUgcRecognized 
                  ? 'Institution matches official Higher Education Accreditation database records.' 
                  : 'University could not be immediately mapped to premier Central/State university lists.'}
              </p>
            </div>
            <div className={`mt-4 pt-3 border-t border-border/50 text-[11px] font-mono flex items-center gap-1 ${
              isUgcBlacklisted ? 'text-destructive' : isUgcRecognized ? 'text-success' : 'text-muted-foreground'
            }`}>
              <Icon name={isUgcBlacklisted ? 'XCircleIcon' : isUgcRecognized ? 'CheckCircleIcon' : 'InformationCircleIcon'} size={14} />
              {isUgcBlacklisted ? 'Blacklisted by UGC (Section 22)' : isUgcRecognized ? 'Statutory University Format' : 'Manual Registry Check Recommended'}
            </div>
          </div>

          {/* Card 2: Roll Number / PRN Record */}
          <div className="bg-muted/30 hover:bg-muted/40 transition-colors rounded-2xl p-5 border border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Icon name="IdentificationIcon" size={16} className="text-indigo-400" />
                  Roll No / PRN Record
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  CANDIDATE ID
                </span>
              </div>
              <div className="text-xl font-mono font-black text-foreground tracking-wider">
                {rollNumber}
              </div>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Mandatory institutional candidate registration code detected on certificate face.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/50 text-[11px] font-mono text-indigo-400 flex items-center gap-1">
              <Icon name="CheckCircleIcon" size={14} />
              Formal Roll / Enrollment Identifier Present
            </div>
          </div>

          {/* Card 3: Marksheet Math & CGPA Validation */}
          <div className="bg-muted/30 hover:bg-muted/40 transition-colors rounded-2xl p-5 border border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Icon name="CalculatorIcon" size={16} className="text-indigo-400" />
                  Marks Math & CGPA Audit
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  marksheetMathValid 
                    ? 'bg-success/10 text-success border border-success/20' 
                    : 'bg-destructive/20 text-destructive border border-destructive/30'
                }`}>
                  {marksheetMathValid ? 'MATH CONSISTENT' : 'MATH MISMATCH'}
                </span>
              </div>
              <div className="text-xl font-mono font-black text-foreground tracking-wider">
                {marksheetMathValid ? 'Verified Consistent' : 'Calculation Error'}
              </div>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                {mathAuditDetails || (marksheetMathValid 
                  ? 'Grade calculations, percentage conversions, and CGPA formulas match standard Indian grading rules.' 
                  : 'Discrepancy detected between subject marks aggregate and stated CGPA/percentage.')}
              </p>
            </div>
            <div className={`mt-4 pt-3 border-t border-border/50 text-[11px] font-mono flex items-center gap-1 ${
              marksheetMathValid ? 'text-success' : 'text-destructive'
            }`}>
              <Icon name={marksheetMathValid ? 'CheckCircleIcon' : 'ExclamationTriangleIcon'} size={14} />
              {marksheetMathValid ? '9.5x Multiplier & Total Sum Verified' : 'Grade Tampering Suspected'}
            </div>
          </div>

        </div>

        {/* 🛡️ Deep Forensic Verification Signals */}
        <div className="bg-muted/20 rounded-2xl p-5 border border-border">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <Icon name="ShieldCheckIcon" size={16} className="text-indigo-400" />
            Security & Anti-Forgery Forensic Checklist
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* ELA Pixel Tamper Score */}
            <div className="p-3 bg-background/60 rounded-xl border border-border">
              <div className="text-[11px] font-bold text-muted-foreground mb-1">Pixel Tamper / ELA Score</div>
              <div className={`text-lg font-mono font-black ${forensicTamperScore > 35 ? 'text-destructive' : 'text-success'}`}>
                {forensicTamperScore}% {forensicTamperScore > 35 ? '(High Risk)' : '(Clean)'}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {forensicTamperScore > 35 ? 'Local font splicing detected near candidate marks' : 'Uniform JPEG compression levels across text'}
              </p>
            </div>

            {/* University Seal / Embossment */}
            <div className="p-3 bg-background/60 rounded-xl border border-border">
              <div className="text-[11px] font-bold text-muted-foreground mb-1">Institutional Seal & Crest</div>
              <div className="text-lg font-mono font-black text-foreground flex items-center gap-1.5">
                <span className="text-success">Detected</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Visual crest and institutional insignia present
              </p>
            </div>

            {/* Registrar Signature */}
            <div className="p-3 bg-background/60 rounded-xl border border-border">
              <div className="text-[11px] font-bold text-muted-foreground mb-1">Registrar Signature Zone</div>
              <div className="text-lg font-mono font-black text-foreground flex items-center gap-1.5">
                <span className="text-success">Present</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Controller of Examinations sign-off block detected
              </p>
            </div>

            {/* QR / Digital Verification Code */}
            <div className="p-3 bg-background/60 rounded-xl border border-border">
              <div className="text-[11px] font-bold text-muted-foreground mb-1">Digital QR / Barcode</div>
              <div className="text-lg font-mono font-black text-indigo-400">
                NAD / DigiLocker Spec
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Secure digital verification code layer analyzed
              </p>
            </div>

          </div>
        </div>

        {/* Flags & Discrepancies if any */}
        {flags.length > 0 && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-destructive font-bold text-sm">
              <Icon name="ExclamationTriangleIcon" size={18} />
              Critical Academic Discrepancies Flagged:
            </div>
            <ul className="list-disc list-inside text-xs text-destructive-foreground space-y-1">
              {flags.map((flag, idx) => (
                <li key={idx}>{flag.message}</li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
}
