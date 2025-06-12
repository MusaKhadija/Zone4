'use client';

import React from 'react';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { Typography } from '../shared/Typography';
import { ArrowRight, Shield, Star } from 'lucide-react';

interface TransactionDetailsScreenProps {
  onNext: () => void;
  onBack: () => void;
  exchangeData: any;
}

export const TransactionDetailsScreen: React.FC<TransactionDetailsScreenProps> = ({
  onNext,
  onBack,
  exchangeData,
}) => {
  const { amount, fromCurrency, toCurrency, selectedAgent } = exchangeData;
  
  if (!selectedAgent) {
    return (
      <div className="container-mobile py-8">
        <Typography variant="h2" className="text-center text-[var(--zone4-error)]">
          No agent selected
        </Typography>
        <Button variant="primary" onClick={onBack} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const totalReceive = amount * selectedAgent.rate;
  const serviceFee = totalReceive * 0.005; // 0.5% service fee
  const finalAmount = totalReceive - serviceFee;

  return (
    <div className="container-mobile py-8">
      <div className="text-center mb-8">
        <Typography variant="h2" className="mb-4">
          Transaction Details
        </Typography>
        <Typography variant="subtitle" className="text-balance">
          Review your exchange details
        </Typography>
      </div>

      {/* Exchange Summary */}
      <Card padding="large" variant="elevated" className="mb-6">
        <Typography variant="h3" className="mb-4">
          Exchange Summary
        </Typography>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <Typography variant="body">You send:</Typography>
            <Typography variant="body" className="font-semibold">
              {amount} {fromCurrency}
            </Typography>
          </div>
          <div className="flex justify-between">
            <Typography variant="body">Exchange rate:</Typography>
            <Typography variant="body" className="font-semibold">
              1 {fromCurrency} = ₦{selectedAgent.rate.toLocaleString()}
            </Typography>
          </div>
          <div className="flex justify-between">
            <Typography variant="body">Gross amount:</Typography>
            <Typography variant="body">
              ₦{totalReceive.toLocaleString()}
            </Typography>
          </div>
          <div className="flex justify-between">
            <Typography variant="body">Service fee (0.5%):</Typography>
            <Typography variant="body">
              -₦{serviceFee.toLocaleString()}
            </Typography>
          </div>
          <hr className="border-[var(--zone4-border)]" />
          <div className="flex justify-between">
            <Typography variant="h3">You receive:</Typography>
            <Typography variant="h3" className="text-[var(--zone4-accent)]">
              ₦{finalAmount.toLocaleString()}
            </Typography>
          </div>
        </div>
      </Card>

      {/* Selected Agent */}
      <Card padding="large" variant="elevated" className="mb-6">
        <Typography variant="h3" className="mb-4">
          Selected Agent
        </Typography>
        
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-[var(--zone4-accent)]/10 rounded-full flex items-center justify-center">
            <span className="text-[var(--zone4-accent)] font-bold">
              {selectedAgent.bdc_agents?.company_name?.charAt(0) || 'A'}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <Typography variant="body" className="font-semibold">
                {selectedAgent.bdc_agents?.company_name || 'Unknown Agent'}
              </Typography>
              {selectedAgent.bdc_agents?.is_verified_agent && (
                <div className="w-5 h-5 bg-[var(--zone4-success)] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            <Typography variant="caption" className="text-[var(--zone4-text-muted)] mb-2">
              {selectedAgent.bdc_agents?.company_address || 'Location not specified'}
            </Typography>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <Typography variant="caption">
                {selectedAgent.bdc_agents?.average_rating?.toFixed(1) || '0.0'} ({selectedAgent.bdc_agents?.total_reviews || 0} reviews)
              </Typography>
            </div>
          </div>
        </div>
      </Card>

      {/* Security Notice */}
      <Card padding="normal" variant="outlined" className="mb-8 border-[var(--zone4-accent)]/20 bg-[var(--zone4-accent)]/5">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-[var(--zone4-accent)] mt-0.5" />
          <div>
            <Typography variant="body" className="font-medium mb-1">
              Secure Escrow Protection
            </Typography>
            <Typography variant="caption">
              Your funds will be held securely in escrow until the exchange is completed successfully.
            </Typography>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          rightIcon={<ArrowRight className="w-5 h-5" />}
          onClick={onNext}
        >
          Proceed to Payment
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