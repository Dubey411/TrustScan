'use client';

import { useState, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

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