'use client';

import { useState, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

/**
 * FileUploadArea Component
 * 
 * Accessible drag-and-drop file upload target:
 * - Validates file extension against allowed format whitelist
 * - Enforces client-side size boundaries (up to 15MB)
 * - Displays active file details, size formatting, and instant clear trigger
 */
interface FileUploadAreaProps {
  onFileSelect: (file: File | null) => void;
  acceptedFormats: string[];
  maxSize: number;
}

export default function FileUploadArea({ onFileSelect, acceptedFormats, maxSize }: FileUploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!acceptedFormats.includes(fileExtension)) {
      setError(`Invalid file type. Accepted formats: ${acceptedFormats.join(', ')}`);
      return false;
    }
    
    if (file.size > maxSize) {
      setError(`File too large. Maximum size: ${(maxSize / (1024 * 1024)).toFixed(0)}MB`);
      return false;
    }
    
    setError('');
    return true;
  };

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    } else {
      setSelectedFile(null);
      onFileSelect(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    onFileSelect(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const createSampleFile = (type: 'pdf' | 'mountain' | 'receipt') => {
    if (type === 'pdf') {
      const pdfText = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 214 >>
stream
BT
/F1 16 Tf
50 720 Td
(TATA CONSULTANCY SERVICES - EMPLOYMENT OFFER) Tj
/F1 12 Tf
0 -30 Td
(Candidate Name: Rahul Sharma) Tj
0 -20 Td
(Designation: Senior Systems Engineer) Tj
0 -20 Td
(CIN: L22210MH1995PLC084781) Tj
0 -20 Td
(Annual CTC: INR 12,50,000) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000222 00000 n 
0000000488 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
562
%%EOF`;
      const blob = new Blob([pdfText], { type: 'application/pdf' });
      const mockFile = new File([blob], 'tcs_offer_letter_verified.pdf', { type: 'application/pdf' });
      handleFileSelect(mockFile);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (type === 'mountain') {
      canvas.width = 800;
      canvas.height = 500;
      const sky = ctx.createLinearGradient(0, 0, 0, 500);
      sky.addColorStop(0, '#1E293B');
      sky.addColorStop(0.5, '#334155');
      sky.addColorStop(1, '#64748B');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, 800, 500);

      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.moveTo(100, 500);
      ctx.lineTo(380, 110);
      ctx.lineTo(660, 500);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.moveTo(350, 500);
      ctx.lineTo(550, 160);
      ctx.lineTo(750, 500);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#94A3B8';
      ctx.font = '16px sans-serif';
      ctx.fillText('Sample Landscape Photographic Artifact', 30, 40);

      canvas.toBlob((blob) => {
        if (blob) {
          const mockFile = new File([blob], 'mountain.png', { type: 'image/png' });
          handleFileSelect(mockFile);
        }
      }, 'image/png');
    } else {
      canvas.width = 400;
      canvas.height = 550;
      ctx.fillStyle = '#161922';
      ctx.fillRect(0, 0, 400, 550);

      ctx.fillStyle = 'rgba(74, 222, 128, 0.2)';
      ctx.beginPath();
      ctx.arc(200, 70, 30, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#4ADE80';
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✓', 200, 78);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('₹ 12,500.00', 200, 135);

      ctx.fillStyle = '#9CA3AF';
      ctx.font = '12px monospace';
      ctx.fillText('UPI Ref: 328901928392', 200, 165);
      ctx.fillText('Paid to: merchant@okaxis', 200, 185);
      ctx.fillText('Date: 05 Sep 2026, 08:30 PM', 200, 205);

      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.beginPath();
      ctx.moveTo(30, 230);
      ctx.lineTo(370, 230);
      ctx.stroke();

      ctx.fillStyle = '#4ADE80';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('Payment Successful', 200, 270);

      canvas.toBlob((blob) => {
        if (blob) {
          const mockFile = new File([blob], 'upi_payment_receipt_328901.png', { type: 'image/png' });
          handleFileSelect(mockFile);
        }
      }, 'image/png');
    }
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 transition-all duration-300 ${
          isDragging
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : error
            ? 'border-error bg-error/5'
            : selectedFile
            ? 'border-success bg-success/5' :'border-border bg-muted/30 hover:border-primary/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleInputChange}
          accept={acceptedFormats.join(',')}
          className="hidden"
          id="file-upload"
          aria-label="File upload input"
        />
        
        {!selectedFile ? (
          <div>
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex flex-col items-center space-y-4">
                <div className={`p-4 rounded-full ${isDragging ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  <Icon name="CloudArrowUpIcon" size={40} variant="outline" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-headline font-semibold text-foreground mb-1">
                    {isDragging ? 'Drop file here' : 'Drag & drop your file here'}
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">or click to browse</p>
                  <p className="text-xs text-muted-foreground">
                    Supported formats: {acceptedFormats.join(', ')} • Max size: {(maxSize / (1024 * 1024)).toFixed(0)}MB
                  </p>
                </div>
              </div>
            </label>

            {/* Quick Demo Sample Files */}
            <div className="mt-5 pt-4 border-t border-border/50 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-mono text-muted-foreground mr-1">Quick Demo:</span>
              <button
                type="button"
                onClick={() => createSampleFile('pdf')}
                className="px-2.5 py-1 rounded-md bg-muted/50 hover:bg-primary/15 hover:text-primary text-[11px] font-mono border border-border text-foreground transition-all"
              >
                📄 Sample Offer Letter
              </button>
              <button
                type="button"
                onClick={() => createSampleFile('mountain')}
                className="px-2.5 py-1 rounded-md bg-muted/50 hover:bg-primary/15 hover:text-primary text-[11px] font-mono border border-border text-foreground transition-all"
              >
                🖼️ Sample Mountain (Image)
              </button>
              <button
                type="button"
                onClick={() => createSampleFile('receipt')}
                className="px-2.5 py-1 rounded-md bg-muted/50 hover:bg-primary/15 hover:text-primary text-[11px] font-mono border border-border text-foreground transition-all"
              >
                💳 Sample UPI Receipt
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-success/10 rounded-lg">
                <Icon name="DocumentIcon" size={32} variant="solid" className="text-success" />
              </div>
              <div>
                <p className="font-medium text-foreground">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="p-2 hover:bg-error/10 rounded-full transition-colors duration-300"
              aria-label="Remove file"
            >
              <Icon name="TrashIcon" size={20} variant="outline" className="text-error" />
            </button>
          </div>
        )}
      </div>
      
      {error && (
        <div className="flex items-center space-x-2 text-error text-sm bg-error/10 p-3 rounded-lg">
          <Icon name="ExclamationTriangleIcon" size={16} variant="solid" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}