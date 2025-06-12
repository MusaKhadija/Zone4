'use client';

import React, { useState } from 'react';
import { Button } from './shared/Button';
import { Typography } from './shared/Typography';
import { Input } from './shared/Input';
import { Card } from './shared/Card';
import { ArrowRight, Shield, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';

interface NINBVNVerificationScreenProps {
  onNext: (data: VerificationData) => void;
  onBack: () => void;
}

interface VerificationData {
  nin: string;
  bvn: string;
}

type VerificationStatus = 'idle' | 'loading' | 'success' | 'error';

export const NINBVNVerificationScreen: React.FC<NINBVNVerificationScreenProps> = ({
  onNext,
  onBack,
}) => {
  const [formData, setFormData] = useState<VerificationData>({
    nin: '',
    bvn: '',
  });

  const [errors, setErrors] = useState<Partial<VerificationData>>({});
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('idle');

  const validateForm = () => {
    const newErrors: Partial<VerificationData> = {};

    if (!formData.nin.trim()) {
      newErrors.nin = 'NIN is required';
    } else if (formData.nin.length !== 11) {
      newErrors.nin = 'NIN must be 11 digits';
    }

    if (!formData.bvn.trim()) {
      newErrors.bvn = 'BVN is required';
    } else if (formData.bvn.length !== 11) {
      newErrors.bvn = 'BVN must be 11 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof VerificationData, value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, [field]: numericValue }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleVerify = async () => {
    if (!validateForm()) return;

    setVerificationStatus('loading');

    // Simulate verification process
    setTimeout(() => {
      // Simulate random success/failure for demo
      const isSuccess = Math.random() > 0.3;
      
      if (isSuccess) {
        setVerificationStatus('success');
        setTimeout(() => {
          onNext(formData);
        }, 1500);
      } else {
        setVerificationStatus('error');
      }
    }, 2000);
  };

  const isFormValid = formData.nin.length === 11 && formData.bvn.length === 11;

  return (
    <div className="container-mobile flex flex-col justify-center py-8">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <Typography variant="caption">Step 2 of 5</Typography>
          <Typography variant="caption">40%</Typography>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-[var(--zone4-accent)] h-2 rounded-full w-2/5 transition-all duration-300"></div>
        </div>
      </div>

      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[var(--zone4-accent)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-[var(--zone4-accent)]" />
        </div>
        <Typography variant="h2" className="mb-4">
          Verify Your Identity
        </Typography>
        <Typography variant="subtitle" className="text-balance">
          For your security and CBN compliance
        </Typography>
      </div>

      {/* Information Card */}
      <Card padding="normal" variant="outlined" className="mb-6 border-[var(--zone4-accent)]/20 bg-[var(--zone4-accent)]/5">
        <Typography variant="caption" className="text-[var(--zone4-text-muted)]">
          We need your National Identification Number (NIN) and Bank Verification Number (BVN) to comply with Central Bank of Nigeria regulations and ensure the highest level of security for your transactions.
        </Typography>
      </Card>

      {verificationStatus === 'success' && (
        <Card padding="normal" variant="outlined" className="mb-6 border-[var(--zone4-success)]/20 bg-[var(--zone4-success)]/5">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-[var(--zone4-success)]" />
            <Typography variant="body" className="text-[var(--zone4-success)] font-medium">
              Verification successful! Proceeding to next step...
            </Typography>
          </div>
        </Card>
      )}

      {verificationStatus === 'error' && (
        <Card padding="normal" variant="outlined" className="mb-6 border-[var(--zone4-error)]/20 bg-[var(--zone4-error)]/5">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-[var(--zone4-error)]" />
            <Typography variant="body" className="text-[var(--zone4-error)] font-medium">
              Verification failed. Please check your details and try again.
            </Typography>
          </div>
        </Card>
      )}

      <div className="space-y-6 mb-8">
        <Input
          label="National Identification Number (NIN)"
          placeholder="Enter your 11-digit NIN"
          value={formData.nin}
          onChange={(e) => handleInputChange('nin', e.target.value)}
          error={errors.nin}
          maxLength={11}
          helperText="Your NIN is found on your national ID card"
        />

        <Input
          label="Bank Verification Number (BVN)"
          placeholder="Enter your 11-digit BVN"
          value={formData.bvn}
          onChange={(e) => handleInputChange('bvn', e.target.value)}
          error={errors.bvn}
          maxLength={11}
          helperText="Dial *565*0# from your registered phone to get your BVN"
        />
      </div>

      <div className="space-y-4 mb-6">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!isFormValid || verificationStatus === 'loading' || verificationStatus === 'success'}
          loading={verificationStatus === 'loading'}
          rightIcon={verificationStatus === 'success' ? <CheckCircle className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
          onClick={handleVerify}
        >
          {verificationStatus === 'loading' ? 'Verifying...' : 
           verificationStatus === 'success' ? 'Verified' : 'Verify Identity'}
        </Button>

        <Button
          variant="ghost"
          size="lg"
          fullWidth
          onClick={onBack}
          disabled={verificationStatus === 'loading' || verificationStatus === 'success'}
        >
          Back
        </Button>
      </div>

      <button className="flex items-center justify-center space-x-2 text-[var(--zone4-accent)] hover:text-[var(--zone4-accent)]/80 transition-colors mx-auto">
        <HelpCircle className="w-4 h-4" />
        <Typography variant="caption">Having trouble with verification?</Typography>
      </button>
    </div>
  );
};