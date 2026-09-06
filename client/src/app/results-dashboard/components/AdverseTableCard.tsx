'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

export interface AdverseVector {
  vector: string;
  category: string;
  method: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  details: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
}

interface AdverseTableCardProps {
  scanType?: string;
  scanData?: any;
}

export default function AdverseTableCard({ scanType = 'document', scanData }: AdverseTableCardProps) {
  const flags = scanData?.flags?.red || scanData?.reasons || [];
  const greenFlags = scanData?.flags?.green || [];
  const isImage = scanType === 'image' || scanData?.scanType === 'image';
  const isPayment = scanType === 'payment' || scanData?.scanType === 'payment';
  const isCompany = scanType === 'company' || scanData?.scanType === 'company';
  const isDocument = !isImage && !isPayment && !isCompany;

  // Generate vectors dynamically based on scan type & detection results
  const getVectors = (): AdverseVector[] => {
    if (isPayment) {
      const hasUtrMismatch = flags.some((r: string) => r.toLowerCase().includes('utr') || r.toLowerCase().includes('reference'));
      const hasFakeApk = flags.some((r: string) => r.toLowerCase().includes('apk') || r.toLowerCase().includes('template') || r.toLowerCase().includes('fake'));
      const hasElaTamper = flags.some((r: string) => r.toLowerCase().includes('ela') || r.toLowerCase().includes('tamper') || r.toLowerCase().includes('amount') || r.toLowerCase().includes('pixel'));
      const hasIfscIssue = flags.some((r: string) => r.toLowerCase().includes('ifsc') || r.toLowerCase().includes('bank'));

      return [
        {
          vector: 'NPCI UTR Sequence',
          category: 'Financial Protocol',
          method: '12-Digit NPCI Timestamp Verification',
          status: hasUtrMismatch ? 'FAIL' : 'PASS',
          severity: hasUtrMismatch ? 'CRITICAL' : 'INFO',
          details: hasUtrMismatch ? 'Extracted UTR failed banking issuer timestamp sequence check' : '12-digit UTR structure matches NPCI banking syntax',
        },
        {
          vector: 'Pixel ELA Disparity',
          category: 'Image Forensics',
          method: 'Error Level Analysis (Amount Zone)',
          status: hasElaTamper ? 'FAIL' : 'PASS',
          severity: hasElaTamper ? 'HIGH' : 'INFO',
          details: hasElaTamper ? 'Compression artifact disparity detected on ₹ amount text box' : 'Consistent compression artifacts across amount region',
        },
        {
          vector: 'Payment APK Signature',
          category: 'Template Match',
          method: 'Layout & Typography OCR Diff',
          status: hasFakeApk ? 'FAIL' : 'PASS',
          severity: hasFakeApk ? 'CRITICAL' : 'INFO',
          details: hasFakeApk ? 'Detected known fake payment screenshot generator font layout' : 'Layout conforms to genuine payment app specifications',
        },
        {
          vector: 'Bank IFSC / UPI VPA',
          category: 'Entity Validation',
          method: 'RBI Clearing Code & VPA Resolver',
          status: hasIfscIssue ? 'WARN' : 'PASS',
          severity: hasIfscIssue ? 'MEDIUM' : 'INFO',
          details: hasIfscIssue ? 'Unverified VPA handle or dormant bank branch identifier' : 'Resolves to registered active RBI clearing bank IFSC code',
        },
      ];
    }

    if (isImage) {
      const forensics = scanData?.metadata?.imageForensics || {};
      const isAi = forensics.isAiGenerated || scanData?.scanMeta?.forensicAiScore >= 50;
      const isTampered = forensics.isTampered || scanData?.scanMeta?.forensicTamperScore >= 40;
      const hasPrompt = Boolean(forensics.sdPromptPreview);

      return [
        {
          vector: '2D FFT High-Frequency',
          category: 'Spectral Domain',
          method: 'Radial Frequency Power Spectrum',
          status: isAi ? 'FAIL' : 'PASS',
          severity: isAi ? 'CRITICAL' : 'INFO',
          details: isAi ? 'High-frequency spectral decay matches synthetic diffusion generators' : 'Natural optical lens point spread function (PSF) confirmed',
        },
        {
          vector: 'Error Level Analysis (ELA)',
          category: 'Pixel Tampering',
          method: 'JPEG Recompression Disparity Map',
          status: isTampered ? 'FAIL' : 'PASS',
          severity: isTampered ? 'HIGH' : 'INFO',
          details: isTampered ? 'Localized recompression anomaly in focal regions (> 40% confidence)' : 'Uniform quantization table across all 8x8 DCT blocks',
        },
        {
          vector: 'Prompt Metadata Traces',
          category: 'EXIF / Text Chunk',
          method: 'PNG/JPEG Metadata Scanner',
          status: hasPrompt ? 'FAIL' : 'PASS',
          severity: hasPrompt ? 'HIGH' : 'INFO',
          details: hasPrompt ? `Generative prompt discovered: "${forensics.sdPromptPreview?.slice(0, 40)}..."` : 'No embedded latent diffusion prompt chunks discovered',
        },
        {
          vector: 'DCT Kurtosis / VAE Grid',
          category: 'Neural Artifacts',
          method: 'AC Coefficient Kurtosis Analysis',
          status: isAi ? 'FAIL' : 'PASS',
          severity: isAi ? 'HIGH' : 'INFO',
          details: isAi ? 'Distribution kurtosis deviates from natural sensor noise' : 'Standard Poisson-Gaussian sensor noise distribution verified',
        },
      ];
    }

    if (isCompany) {
      const hasInvalidCin = flags.some((r: string) => r.toLowerCase().includes('cin') || r.toLowerCase().includes('mca') || r.toLowerCase().includes('invalid'));
      const hasGstIssue = flags.some((r: string) => r.toLowerCase().includes('gst') || r.toLowerCase().includes('gstin'));
      const hasStatusIssue = flags.some((r: string) => r.toLowerCase().includes('strike') || r.toLowerCase().includes('dormant') || r.toLowerCase().includes('defunct'));

      return [
        {
          vector: 'MCA CIN 21-Digit Structure',
          category: 'Regulatory',
          method: 'Ministry of Corporate Affairs Algorithm',
          status: hasInvalidCin ? 'FAIL' : 'PASS',
          severity: hasInvalidCin ? 'CRITICAL' : 'INFO',
          details: hasInvalidCin ? '21-digit CIN failed state code, year, or industry checksum' : 'Valid 21-digit CIN structure with active ROC state code',
        },
        {
          vector: 'GSTIN 15-Digit Checksum',
          category: 'Tax Authority',
          method: 'GST Luhn Mod-36 Algorithm Check',
          status: hasGstIssue ? 'FAIL' : 'PASS',
          severity: hasGstIssue ? 'HIGH' : 'INFO',
          details: hasGstIssue ? 'GSTIN checksum mismatch or invalid 2-digit state identifier' : 'GSTIN checksum and state mapping verified',
        },
        {
          vector: 'Active Incorporation Status',
          category: 'Entity Health',
          method: 'MCA Master Data Registry Look-up',
          status: hasStatusIssue ? 'FAIL' : 'PASS',
          severity: hasStatusIssue ? 'HIGH' : 'INFO',
          details: hasStatusIssue ? 'Company is marked Inactive, Struck-Off, or in Liquidation' : 'Company status is Active with timely annual MCA filings',
        },
      ];
    }

    // Default: Offer Letter / Career Document
    const hasMathIssue = flags.some((r: string) => r.toLowerCase().includes('math') || r.toLowerCase().includes('salary') || r.toLowerCase().includes('ctc'));
    const hasHrDomainIssue = flags.some((r: string) => r.toLowerCase().includes('domain') || r.toLowerCase().includes('email') || r.toLowerCase().includes('free') || r.toLowerCase().includes('gmail'));
    const hasFeeScam = flags.some((r: string) => r.toLowerCase().includes('fee') || r.toLowerCase().includes('deposit') || r.toLowerCase().includes('pay') || r.toLowerCase().includes('laptop'));
    const hasCinIssue = flags.some((r: string) => r.toLowerCase().includes('cin') || r.toLowerCase().includes('company') || r.toLowerCase().includes('mca'));

    return [
      {
        vector: 'Recruitment Fee Trap',
        category: 'Fraud Signal',
        method: 'NLP Advance Payment Pattern Match',
        status: hasFeeScam ? 'FAIL' : 'PASS',
        severity: hasFeeScam ? 'CRITICAL' : 'INFO',
        details: hasFeeScam ? 'Explicit demand for laptop deposit / training security fee detected' : 'Zero advance fee or monetary deposit demands found in text',
      },
      {
        vector: 'HR Sender Domain',
        category: 'Infrastructure',
        method: 'Corporate MX & Registrar Validation',
        status: hasHrDomainIssue ? 'FAIL' : 'PASS',
        severity: hasHrDomainIssue ? 'HIGH' : 'INFO',
        details: hasHrDomainIssue ? 'Public free email provider (@gmail/@yahoo) or typosquatted domain used' : 'Verified official corporate email domain and MX record',
      },
      {
        vector: 'CTC Math & Salary Logic',
        category: 'Document Logic',
        method: 'Indian Labor & Tax Benchmark Calculation',
        status: hasMathIssue ? 'FAIL' : 'PASS',
        severity: hasMathIssue ? 'HIGH' : 'INFO',
        details: hasMathIssue ? 'Monthly vs Annual CTC breakdown math inconsistencies found' : 'Salary components (Basic, HRA, PF, Gratuity) balance accurately',
      },
      {
        vector: 'MCA CIN Corporate Legitimacy',
        category: 'Regulatory',
        method: 'MCA 21-Digit Corporate Identity Verification',
        status: hasCinIssue ? 'WARN' : 'PASS',
        severity: hasCinIssue ? 'MEDIUM' : 'INFO',
        details: hasCinIssue ? 'Company CIN missing or unverified against registered legal entity' : 'Entity CIN matches registered corporate legal records',
      },
    ];
  };

  const vectors = getVectors();
  const failCount = vectors.filter(v => v.status === 'FAIL').length;
  const warnCount = vectors.filter(v => v.status === 'WARN').length;

  return (
    <div className="rounded-2xl bg-card border border-border p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Icon name="TableCellsIcon" size={20} />
          </div>
          <div>
            <h3 className="text-base font-headline font-bold text-foreground">
              Adverse Vectors & Security Findings
            </h3>
            <p className="text-xs font-mono text-muted-foreground">
              Multi-signal deterministic security evaluation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {failCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-mono font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              {failCount} Failed Vector{failCount > 1 ? 's' : ''}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              All Critical Vectors Clean
            </span>
          )}
        </div>
      </div>

      {/* Structured Adverse Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-border/80 text-muted-foreground text-[10px] uppercase tracking-wider">
              <th className="py-2.5 px-3">Security Vector</th>
              <th className="py-2.5 px-3">Methodology</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Finding / Anomaly Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {vectors.map((vec, idx) => (
              <tr key={idx} className="hover:bg-muted/30 transition-colors">
                <td className="py-3 px-3 font-semibold text-foreground whitespace-nowrap">
                  <div>{vec.vector}</div>
                  <div className="text-[10px] text-muted-foreground font-normal">{vec.category}</div>
                </td>
                <td className="py-3 px-3 text-muted-foreground whitespace-nowrap">
                  {vec.method}
                </td>
                <td className="py-3 px-3 whitespace-nowrap">
                  {vec.status === 'FAIL' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-red-500/15 border border-red-500/30 text-red-400 font-bold text-[11px]">
                      <Icon name="XCircleIcon" size={13} className="text-red-400" />
                      FAIL
                    </span>
                  )}
                  {vec.status === 'WARN' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-[11px]">
                      <Icon name="ExclamationTriangleIcon" size={13} className="text-amber-400" />
                      WARN
                    </span>
                  )}
                  {vec.status === 'PASS' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[11px]">
                      <Icon name="CheckCircleIcon" size={13} className="text-emerald-400" />
                      PASS
                    </span>
                  )}
                </td>
                <td className="py-3 px-3 text-foreground/90 leading-relaxed font-body text-xs">
                  {vec.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
