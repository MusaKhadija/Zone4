'use client';

import React, { useState } from 'react';
import { Button } from './shared/Button';
import { Typography } from './shared/Typography';
import { Card } from './shared/Card';
import { ArrowRight, Camera, Eye, Shield, CheckCircle } from 'lucide-react';

interface FacialBiometricsScreenProps {
  onNext: () => void;
  onBack: () => void;
}

type BiometricStatus = 'idle' | 'starting' | 'active' | 'processing' | 'success';

export const FacialBiometricsScreen: React.FC<FacialBiometricsScreenProps> = ({
  onNext,
  onBack,
}) => {
  const [biometricStatus, setBiometricStatus] = useState<BiometricStatus>('idle');
  const [currentInstruction, setCurrentInstruction] = useState('');

  const instructions = [
    'Position your face in the center',
    'Look directly at the camera',
    'Blink when prompted',
    'Turn your head slightly left',
    'Turn your head slightly right',
    'Smile naturally'
  ];

  const handleStartLivenessCheck = () => {
    setBiometricStatus('starting');
    
    setTimeout(() => {
      setBiometricStatus('active');
      simulateLivenessCheck();
    }, 1000);
  };

  const simulateLivenessCheck = () => {
    let instructionIndex = 0;
    
    const showNextInstruction = () => {
      if (instructionIndex < instructions.length) {
        setCurrentInstruction(instructions[instructionIndex]);
        instructionIndex++;
        setTimeout(showNextInstruction, 2000);
      } else {
        setBiometricStatus('processing');
        setTimeout(() => {
          setBiometricStatus('success');
          setTimeout(() => {
            onNext();
          }, 1500);
        }, 2000);
      }
    };
    
    showNextInstruction();
  };

  return (
    <div className="container-mobile flex flex-col justify-center py-8">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <Typography variant="caption">Step 3 of 5</Typography>
          <Typography variant="caption">60%</Typography>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-[var(--zone4-accent)] h-2 rounded-full w-3/5 transition-all duration-300"></div>
        </div>
      </div>

      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[var(--zone4-accent)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Eye className="w-8 h-8 text-[var(--zone4-accent)]" />
        </div>
        <Typography variant="h2" className="mb-4">
          Confirm Your Presence
        </Typography>
        <Typography variant="subtitle" className="text-balance">
          A quick liveness check to secure your account
        </Typography>
      </div>

      {/* Privacy Notice */}
      <Card padding="normal" variant="outlined" className="mb-6 border-[var(--zone4-accent)]/20 bg-[var(--zone4-accent)]/5">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-[var(--zone4-accent)] mt-0.5" />
          <div>
            <Typography variant="body" className="font-medium mb-1">
              Your Privacy is Protected
            </Typography>
            <Typography variant="caption" className="text-[var(--zone4-text-muted)]">
              This biometric check is processed securely and helps prevent impersonation. Your facial data is encrypted and never stored permanently.
            </Typography>
          </div>
        </div>
      </Card>

      {/* Camera Area */}
      <Card padding="large" variant="elevated" className="mb-8">
        <div className="aspect-square max-w-sm mx-auto relative">
          <div className={`w-full h-full rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
            biometricStatus === 'idle' ? 'border-gray-300 bg-gray-50' :
            biometricStatus === 'starting' ? 'border-[var(--zone4-warning)] bg-[var(--zone4-warning)]/5' :
            biometricStatus === 'active' ? 'border-[var(--zone4-accent)] bg-[var(--zone4-accent)]/5' :
            biometricStatus === 'processing' ? 'border-[var(--zone4-accent)] bg-[var(--zone4-accent)]/10' :
            'border-[var(--zone4-success)] bg-[var(--zone4-success)]/5'
          }`}>
            {biometricStatus === 'idle' && (
              <Camera className="w-16 h-16 text-gray-400" />
            )}
            {biometricStatus === 'starting' && (
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-[var(--zone4-warning)] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <Typography variant="caption">Starting camera...</Typography>
              </div>
            )}
            {biometricStatus === 'active' && (
              <div className="text-center">
                <div className="w-20 h-20 bg-[var(--zone4-accent)]/20 rounded-full flex items-center justify-center mb-2">
                  <div className="w-16 h-16 bg-[var(--zone4-accent)]/40 rounded-full flex items-center justify-center">
                    <div className="w-12 h-12 bg-[var(--zone4-accent)] rounded-full animate-pulse"></div>
                  </div>
                </div>
                <Typography variant="caption" className="font-medium">
                  {currentInstruction}
                </Typography>
              </div>
            )}
            {biometricStatus === 'processing' && (
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-[var(--zone4-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <Typography variant="caption">Processing...</Typography>
              </div>
            )}
            {biometricStatus === 'success' && (
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-[var(--zone4-success)] mx-auto mb-2" />
                <Typography variant="caption" className="text-[var(--zone4-success)] font-medium">
                  Verification complete!
                </Typography>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Instructions */}
      {biometricStatus === 'idle' && (
        <Card padding="normal" variant="flat" className="mb-8">
          <Typography variant="body" className="font-medium mb-3 text-center">
            What to expect:
          </Typography>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-[var(--zone4-accent)]/10 rounded-full flex items-center justify-center">
                <span className="text-[var(--zone4-accent)] text-xs font-bold">1</span>
              </div>
              <Typography variant="caption">Position your face in the camera frame</Typography>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-[var(--zone4-accent)]/10 rounded-full flex items-center justify-center">
                <span className="text-[var(--zone4-accent)] text-xs font-bold">2</span>
              </div>
              <Typography variant="caption">Follow the simple instructions shown</Typography>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-[var(--zone4-accent)]/10 rounded-full flex items-center justify-center">
                <span className="text-[var(--zone4-accent)] text-xs font-bold">3</span>
              </div>
              <Typography variant="caption">Complete in under 30 seconds</Typography>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {biometricStatus === 'idle' && (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            rightIcon={<Camera className="w-5 h-5" />}
            onClick={handleStartLivenessCheck}
          >
            Start Liveness Check
          </Button>
        )}

        {biometricStatus === 'success' && (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            rightIcon={<ArrowRight className="w-5 h-5" />}
            onClick={onNext}
          >
            Continue
          </Button>
        )}

        {(biometricStatus === 'idle') && (
          <Button
            variant="ghost"
            size="lg"
            fullWidth
            onClick={onBack}
          >
            Back
          </Button>
        )}
      </div>
    </div>
  );
};