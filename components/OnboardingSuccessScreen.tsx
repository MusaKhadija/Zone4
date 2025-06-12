'use client';

import React from 'react';
import { Button } from './shared/Button';
import { Typography } from './shared/Typography';
import { Card } from './shared/Card';
import { ArrowRight, CheckCircle, Clock, Shield } from 'lucide-react';

interface OnboardingSuccessScreenProps {
  onComplete: () => void;
  accountStatus?: 'active' | 'pending';
}

export const OnboardingSuccessScreen: React.FC<OnboardingSuccessScreenProps> = ({
  onComplete,
  accountStatus = 'pending',
}) => {
  const isActive = accountStatus === 'active';

  return (
    <div className="container-mobile flex flex-col justify-center py-8">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <Typography variant="caption">Step 5 of 5</Typography>
          <Typography variant="caption">100%</Typography>
        </div>
        <div className="w-full bg-[var(--zone4-success)] rounded-full h-2">
          <div className="bg-[var(--zone4-success)] h-2 rounded-full w-full transition-all duration-300"></div>
        </div>
      </div>

      <div className="text-center mb-8">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
          isActive ? 'bg-[var(--zone4-success)]/10' : 'bg-[var(--zone4-warning)]/10'
        }`}>
          {isActive ? (
            <CheckCircle className="w-12 h-12 text-[var(--zone4-success)]" />
          ) : (
            <Clock className="w-12 h-12 text-[var(--zone4-warning)]" />
          )}
        </div>
        
        <Typography variant="h1" className="mb-4">
          {isActive ? 'Welcome to Zone4!' : 'Almost There!'}
        </Typography>
        
        <Typography variant="subtitle" className="text-balance max-w-sm mx-auto">
          {isActive 
            ? 'Your account is now active and ready to use.'
            : 'Your registration is complete and under review.'
          }
        </Typography>
      </div>

      {/* Status Card */}
      <Card padding="large" variant="elevated" className="mb-8">
        <div className="text-center">
          {isActive ? (
            <>
              <Typography variant="h3" className="mb-4 text-[var(--zone4-success)]">
                Account Activated
              </Typography>
              <Typography variant="body" className="text-[var(--zone4-text-muted)] mb-4">
                You can now start exchanging currencies safely with verified agents.
              </Typography>
              <div className="flex items-center justify-center space-x-2">
                <Shield className="w-5 h-5 text-[var(--zone4-accent)]" />
                <Typography variant="caption" className="text-[var(--zone4-accent)] font-medium">
                  Protected by Zone4 Escrow
                </Typography>
              </div>
            </>
          ) : (
            <>
              <Typography variant="h3" className="mb-4 text-[var(--zone4-warning)]">
                Under Review
              </Typography>
              <Typography variant="body" className="text-[var(--zone4-text-muted)] mb-4">
                Our team is reviewing your documents. This typically takes 1-2 business days.
              </Typography>
              <div className="space-y-2">
                <Typography variant="caption" className="block">
                  📧 We'll email you once verification is complete
                </Typography>
                <Typography variant="caption" className="block">
                  📱 You'll receive an SMS notification
                </Typography>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Next Steps */}
      <Card padding="normal" variant="outlined" className="mb-8 border-[var(--zone4-accent)]/20 bg-[var(--zone4-accent)]/5">
        <Typography variant="body" className="font-medium mb-3">
          {isActive ? 'What you can do now:' : 'While you wait:'}
        </Typography>
        <div className="space-y-2">
          {isActive ? (
            <>
              <Typography variant="caption">• Browse live exchange rates</Typography>
              <Typography variant="caption">• Find verified BDC agents near you</Typography>
              <Typography variant="caption">• Set up your payment preferences</Typography>
              <Typography variant="caption">• Explore security features</Typography>
            </>
          ) : (
            <>
              <Typography variant="caption">• Check your email for updates</Typography>
              <Typography variant="caption">• Download our mobile app</Typography>
              <Typography variant="caption">• Read our security guidelines</Typography>
              <Typography variant="caption">• Join our community forum</Typography>
            </>
          )}
        </div>
      </Card>

      {/* CTA Button */}
      <div className="space-y-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          rightIcon={<ArrowRight className="w-5 h-5" />}
          onClick={onComplete}
        >
          {isActive ? 'Go to Dashboard' : 'Check Status'}
        </Button>

        {!isActive && (
          <Typography variant="caption" className="text-center text-[var(--zone4-text-muted)] block">
            Need help? Contact our support team at{' '}
            <span className="text-[var(--zone4-accent)] font-medium">support@zone4.ng</span>
          </Typography>
        )}
      </div>

      {/* Legal Footer */}
      <div className="mt-8 text-center">
        <Typography variant="caption" className="text-xs text-[var(--zone4-text-muted)]">
          By using Zone4, you agree to our{' '}
          <button className="underline hover:no-underline text-[var(--zone4-accent)]">Terms of Service</button>
          {' '}and{' '}
          <button className="underline hover:no-underline text-[var(--zone4-accent)]">Privacy Policy</button>
        </Typography>
      </div>
    </div>
  );
};