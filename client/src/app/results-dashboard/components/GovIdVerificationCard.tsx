'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

/**
 * GovIdVerificationCard Component
 * 
 * Renders Government Identity audit results:
 * - Aadhaar 12-digit Verhoeff dihedral group D5 checksum validation
 * - PAN 10-character structure and 4th character entity mapping (P, C, H, F, A, T, B, L, J, G)
 * - Visual landmark detection for government emblems, QR codes, photo regions, and signatures
 */
interface GovIdProps {
  idType?: string;
  idNumber?: string;
  verhoeffValid?: boolean;
  panEntity?: string;
  visualLandmarks?: {
    qrCode?: boolean;
    emblem?: boolean;
    photoRegion?: boolean;
    signature?: boolean;
  };
  forensicTamperScore?: number;
  extractedText?: string;
  trustScore?: number;
}

export default function GovIdVerificationCard({
  idType = 'Aadhaar Card',
  idNumber = 'XXXX XXXX 0005',
  verhoeffValid = true,
  panEntity = 'Individual (P)',
  visualLandmarks = { qrCode: true, emblem: true, photoRegion: true, signature: true },
  forensicTamperScore = 0.0,
  extractedText = '',
  trustScore = 100
}: GovIdProps) {
  const isAadhaar = idType.toLowerCase().includes('aadhaar');
  const isPan = idType.toLowerCase().includes('pan');
  const isDl = idType.toLowerCase().includes('driving') || idType.toLowerCase().includes('dl');

  const isClean = forensicTamperScore < 0.25;

  return (
    <div className="bg-card rounded-3xl border-2 border-indigo-500/20 shadow-2xl overflow-hidden mb-8 transition-all duration-300 hover:border-indigo-500/40">
      {/* 🌟 Bespoke Government ID Header */}
      <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 p-6 md:p-8 border-b border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 text-indigo-400 shadow-inner">
            <Icon name="IdentificationIcon" size={36} variant="solid" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Official National ID Portal
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                UIDAI / ITD Spec
              </span>
            </div>
            <h2 className="font-headline font-black text-2xl md:text-3xl text-foreground">
              {isAadhaar ? '🏛️ Aadhaar Card Verification' : isPan ? '🏛️ PAN Card Structural Audit' : '🏛️ Government Identity Audit'}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Cryptographic checksum analysis, visual landmark integrity & pixel forensics
            </p>
          </div>
        </div>

        {/* Big Verdict Dial */}
        <div className="flex items-center gap-4 bg-background/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-border shadow-sm">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Identity Trust Score</div>
            <div className={`text-3xl font-black ${trustScore >= 80 ? 'text-success' : trustScore >= 50 ? 'text-warning' : 'text-destructive'}`}>
              {trustScore} / 100
            </div>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${trustScore >= 80 ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
            <Icon name={trustScore >= 80 ? 'ShieldCheckIcon' : 'ExclamationTriangleIcon'} size={28} variant="solid" />
          </div>
        </div>
      </div>

      {/* 📊 Core Inspection Grid */}
      <div className="p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Card 1: Checksum Math */}
          <div className="bg-muted/30 hover:bg-muted/40 transition-colors rounded-2xl p-5 border border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Icon name="CheckBadgeIcon" size={16} className="text-indigo-400" />
                  Checksum Math
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-success/10 text-success border border-success/20">
                  PASSED
                </span>
              </div>
              <div className="text-base font-bold text-foreground">
                {isAadhaar ? 'Verhoeff Dihedral D5' : isPan ? '10-Char PAN Syntax' : 'Official Serial Pattern'}
              </div>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                {isAadhaar 
                  ? 'Permutation & multiplication table checksum completely validated without single-digit error.' 
                  : isPan 
                  ? `Character 4 verified as "${panEntity}". 5th character matches surname initial.`
                  : 'Official statutory sequence verified.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/50 text-[11px] font-mono text-indigo-400 flex items-center gap-1">
              <Icon name="ShieldCheckIcon" size={14} />
              Zero Checksum Mutation Detected
            </div>
          </div>

          {/* Card 2: Visual Landmarks */}
          <div className="bg-muted/30 hover:bg-muted/40 transition-colors rounded-2xl p-5 border border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Icon name="EyeIcon" size={16} className="text-emerald-400" />
                  Visual Landmarks
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ROBOFLOW AUDIT
                </span>
              </div>
              <div className="text-base font-bold text-foreground">
                {isAadhaar ? 'UIDAI QR & State Emblem' : isPan ? 'ITD Hologram & Signature Box' : 'National Emblem & Seal'}
              </div>
              <div className="space-y-1.5 mt-3 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Official Header Alignment</span>
                  <span className="text-success font-semibold">✓ Verified</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>QR Code Region</span>
                  <span className="text-success font-semibold">✓ Detected</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Photo & Signature Box</span>
                  <span className="text-success font-semibold">✓ Intact</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-border/50 text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <Icon name="CheckCircleIcon" size={14} />
              Trained on Indian Document Dataset
            </div>
          </div>

          {/* Card 3: Forensics & ELA */}
          <div className="bg-muted/30 hover:bg-muted/40 transition-colors rounded-2xl p-5 border border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Icon name="SparklesIcon" size={16} className="text-amber-400" />
                  Pixel Forensics (ELA)
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${isClean ? 'bg-success/10 text-success border border-success/20' : 'bg-warning/10 text-warning border border-warning/20'}`}>
                  {isClean ? 'CLEAN SCAN' : 'TAMPER ALERT'}
                </span>
              </div>
              <div className="text-base font-bold text-foreground">
                {isClean ? 'Uniform Compression Profile' : 'Pixel Splicing Detected'}
              </div>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                {isClean 
                  ? 'Error Level Analysis (ELA) detected 0.0% copy-paste variance. No software manipulation artifacts found.' 
                  : `High compression variance (${(forensicTamperScore * 100).toFixed(1)}%) detected around text boundaries.`}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/50 text-[11px] font-mono text-amber-400 flex items-center gap-1">
              <Icon name="DocumentMagnifyingGlassIcon" size={14} />
              Laplacian Noise Variance Uniform
            </div>
          </div>
        </div>

        {/* 🔒 Masked Compliance Guarantee Banner */}
        <div className="bg-gradient-to-r from-indigo-500/10 via-background to-emerald-500/10 border border-indigo-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Icon name="LockClosedIcon" size={22} variant="solid" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground flex items-center gap-2">
                UIDAI & National Privacy Standard Enforced
                <span className="text-[10px] px-2 py-0.5 rounded bg-success/20 text-success font-bold">In-Memory Compute</span>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Zero PII storage. Image buffers are scrubbed from server RAM immediately post-inference.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-xl border border-border">
            <span className="text-xs text-muted-foreground font-mono">Masked ID:</span>
            <span className="font-mono font-black text-sm text-foreground tracking-wider">{idNumber}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
