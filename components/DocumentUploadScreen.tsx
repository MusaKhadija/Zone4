'use client';

import React, { useState } from 'react';
import { Button } from './shared/Button';
import { Typography } from './shared/Typography';
import { Card } from './shared/Card';
import { ArrowRight, Upload, Camera, Image, CheckCircle, FileText } from 'lucide-react';

interface DocumentUploadScreenProps {
  onNext: () => void;
  onBack: () => void;
}

interface DocumentStatus {
  proofOfAddress: 'pending' | 'uploaded' | 'processing';
  additionalId: 'pending' | 'uploaded' | 'processing';
}

export const DocumentUploadScreen: React.FC<DocumentUploadScreenProps> = ({
  onNext,
  onBack,
}) => {
  const [documentStatus, setDocumentStatus] = useState<DocumentStatus>({
    proofOfAddress: 'pending',
    additionalId: 'pending',
  });

  const handleDocumentUpload = (type: keyof DocumentStatus, method: 'camera' | 'gallery') => {
    setDocumentStatus(prev => ({ ...prev, [type]: 'processing' }));
    
    // Simulate upload process
    setTimeout(() => {
      setDocumentStatus(prev => ({ ...prev, [type]: 'uploaded' }));
    }, 2000);
  };

  const isAllUploaded = Object.values(documentStatus).every(status => status === 'uploaded');

  const DocumentUploadCard = ({ 
    title, 
    description, 
    examples, 
    type,
    status 
  }: {
    title: string;
    description: string;
    examples: string[];
    type: keyof DocumentStatus;
    status: 'pending' | 'uploaded' | 'processing';
  }) => (
    <Card padding="large" variant="elevated" className="mb-6">
      <div className="flex items-start space-x-4 mb-4">
        <div className={`p-3 rounded-full ${
          status === 'uploaded' ? 'bg-[var(--zone4-success)]/10' : 'bg-[var(--zone4-accent)]/10'
        }`}>
          {status === 'uploaded' ? (
            <CheckCircle className="w-6 h-6 text-[var(--zone4-success)]" />
          ) : (
            <FileText className="w-6 h-6 text-[var(--zone4-accent)]" />
          )}
        </div>
        <div className="flex-1">
          <Typography variant="h3" className="mb-2">
            {title}
          </Typography>
          <Typography variant="body" className="text-[var(--zone4-text-muted)] mb-3">
            {description}
          </Typography>
          <Typography variant="caption" className="text-[var(--zone4-text-muted)]">
            Examples: {examples.join(', ')}
          </Typography>
        </div>
      </div>

      {status === 'pending' && (
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Camera className="w-4 h-4" />}
            onClick={() => handleDocumentUpload(type, 'camera')}
          >
            Take Photo
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Image className="w-4 h-4" />}
            onClick={() => handleDocumentUpload(type, 'gallery')}
          >
            Choose File
          </Button>
        </div>
      )}

      {status === 'processing' && (
        <div className="flex items-center space-x-3 p-4 bg-[var(--zone4-accent)]/5 rounded-lg">
          <div className="w-5 h-5 border-2 border-[var(--zone4-accent)] border-t-transparent rounded-full animate-spin"></div>
          <Typography variant="caption">Uploading document...</Typography>
        </div>
      )}

      {status === 'uploaded' && (
        <div className="flex items-center space-x-3 p-4 bg-[var(--zone4-success)]/5 rounded-lg">
          <CheckCircle className="w-5 h-5 text-[var(--zone4-success)]" />
          <Typography variant="caption" className="text-[var(--zone4-success)] font-medium">
            Document uploaded successfully
          </Typography>
        </div>
      )}
    </Card>
  );

  return (
    <div className="container-mobile flex flex-col justify-center py-8">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <Typography variant="caption">Step 4 of 5</Typography>
          <Typography variant="caption">80%</Typography>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-[var(--zone4-accent)] h-2 rounded-full w-4/5 transition-all duration-300"></div>
        </div>
      </div>

      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[var(--zone4-accent)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Upload className="w-8 h-8 text-[var(--zone4-accent)]" />
        </div>
        <Typography variant="h2" className="mb-4">
          Upload Your Documents
        </Typography>
        <Typography variant="subtitle" className="text-balance">
          Final step to complete your verification
        </Typography>
      </div>

      {/* Document Upload Cards */}
      <DocumentUploadCard
        title="Proof of Address"
        description="A recent document showing your current address"
        examples={["Utility bill", "Bank statement", "Rent receipt"]}
        type="proofOfAddress"
        status={documentStatus.proofOfAddress}
      />

      <DocumentUploadCard
        title="Additional ID (Optional)"
        description="Any additional government-issued identification"
        examples={["Driver's license", "Voter's card", "Passport"]}
        type="additionalId"
        status={documentStatus.additionalId}
      />

      {/* Upload Tips */}
      <Card padding="normal" variant="outlined" className="mb-8 border-[var(--zone4-accent)]/20 bg-[var(--zone4-accent)]/5">
        <Typography variant="body" className="font-medium mb-2">
          📸 Photo Tips:
        </Typography>
        <div className="space-y-1">
          <Typography variant="caption">• Ensure all text is clearly visible</Typography>
          <Typography variant="caption">• Use good lighting, avoid shadows</Typography>
          <Typography variant="caption">• Keep documents flat and straight</Typography>
          <Typography variant="caption">• File size should be under 5MB</Typography>
        </div>
      </Card>

      <div className="space-y-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!isAllUploaded}
          rightIcon={<ArrowRight className="w-5 h-5" />}
          onClick={onNext}
        >
          Submit for Review
        </Button>

        <Button
          variant="ghost"
          size="lg"
          fullWidth
          onClick={onBack}
        >
          Back
        </Button>
      </div>
    </div>
  );
};