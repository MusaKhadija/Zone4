'use client';

import React, { useState } from 'react';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { Typography } from '../shared/Typography';
import { ArrowRight, Shield, CheckCircle, MapPin, CreditCard, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface TransactionConfirmationScreenProps {
  onNext: (data: any) => void;
  onBack: () => void;
  exchangeData: any;
}

export const TransactionConfirmationScreen: React.FC<TransactionConfirmationScreenProps> = ({
  onNext,
  onBack,
  exchangeData,
}) => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionError, setTransactionError] = useState<string | null>(null);

  const { amount, fromCurrency, toCurrency, selectedAgent, recipientDetails } = exchangeData;
  
  if (!selectedAgent || !recipientDetails) {
    return (
      <div className="container-mobile py-8">
        <Typography variant="h2" className="text-center text-[var(--zone4-error)]">
          Missing transaction data
        </Typography>
        <Button variant="primary" onClick={onBack} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const totalReceive = amount * selectedAgent.rate;
  const serviceFee = totalReceive * 0.005;
  const finalAmount = totalReceive - serviceFee;

  const handleConfirm = async () => {
    setIsProcessing(true);
    setTransactionError(null);

    try {
      // Get current authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Prepare transaction data
      const transactionData = {
        customer_id: user.id,
        agent_id: selectedAgent.agent_id,
        currency_from: fromCurrency,
        currency_to: toCurrency,
        amount_sent: amount,
        amount_received: finalAmount,
        agreed_rate: selectedAgent.rate,
        zone4_fee: serviceFee,
        payment_method_customer: recipientDetails.deliveryMethod === 'physical' ? 'physical_cash' : 'bank_transfer',
        recipient_details: recipientDetails.formData,
        status: 'funds_in_escrow',
        escrow_status: 'held'
      };

      // Insert transaction into Supabase
      const { data: transaction, error: insertError } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to create transaction: ${insertError.message}`);
      }

      if (!transaction) {
        throw new Error('Transaction creation failed');
      }

      // Success - pass transaction ID to next step
      onNext({ transactionId: transaction.id });
    } catch (error) {
      console.error('Transaction creation error:', error);
      setTransactionError(error instanceof Error ? error.message : 'Failed to create transaction');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container-mobile py-8">
      <div className="text-center mb-8">
        <Typography variant="h2" className="mb-4">
          Confirm Exchange
        </Typography>
        <Typography variant="subtitle" className="text-balance">
          Review all details before proceeding
        </Typography>
      </div>

      {/* Transaction Error */}
      {transactionError && (
        <Card padding="normal" variant="outlined" className="mb-6 border-[var(--zone4-error)]/20 bg-[var(--zone4-error)]/5">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-[var(--zone4-error)] mt-0.5" />
            <div>
              <Typography variant="body" className="font-medium mb-1 text-[var(--zone4-error)]">
                Transaction Failed
              </Typography>
              <Typography variant="caption" className="text-[var(--zone4-error)]">
                {transactionError}
              </Typography>
            </div>
          </div>
        </Card>
      )}

      {/* Transaction Summary */}
      <Card padding="large" variant="elevated" className="mb-6">
        <Typography variant="h3" className="mb-4">
          Transaction Summary
        </Typography>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <Typography variant="body">You send:</Typography>
            <Typography variant="body" className="font-semibold">
              {amount} {fromCurrency}
            </Typography>
          </div>
          <div className="flex justify-between">
            <Typography variant="body">You receive:</Typography>
            <Typography variant="body" className="font-semibold text-[var(--zone4-accent)]">
              ₦{finalAmount.toLocaleString()}
            </Typography>
          </div>
          <div className="flex justify-between">
            <Typography variant="body">Exchange rate:</Typography>
            <Typography variant="body">
              1 {fromCurrency} = ₦{selectedAgent.rate.toLocaleString()}
            </Typography>
          </div>
          <div className="flex justify-between">
            <Typography variant="body">Service fee:</Typography>
            <Typography variant="body">
              ₦{serviceFee.toLocaleString()}
            </Typography>
          </div>
        </div>
      </Card>

      {/* Agent Details */}
      <Card padding="large" variant="elevated" className="mb-6">
        <Typography variant="h3" className="mb-4">
          Agent Details
        </Typography>
        
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-[var(--zone4-accent)]/10 rounded-full flex items-center justify-center">
            <span className="text-[var(--zone4-accent)] font-bold">
              {selectedAgent.bdc_agents?.company_name?.charAt(0) || 'A'}
            </span>
          </div>
          <div>
            <Typography variant="body" className="font-semibold">
              {selectedAgent.bdc_agents?.company_name || 'Unknown Agent'}
            </Typography>
            <Typography variant="caption" className="text-[var(--zone4-text-muted)]">
              {selectedAgent.bdc_agents?.company_address || 'Location not specified'} • ⭐ {selectedAgent.bdc_agents?.average_rating?.toFixed(1) || '0.0'}
            </Typography>
          </div>
        </div>
      </Card>

      {/* Delivery Details */}
      <Card padding="large" variant="elevated" className="mb-6">
        <Typography variant="h3" className="mb-4">
          Delivery Details
        </Typography>
        
        <div className="flex items-start space-x-3">
          {recipientDetails.deliveryMethod === 'physical' ? (
            <MapPin className="w-5 h-5 text-[var(--zone4-accent)] mt-0.5" />
          ) : (
            <CreditCard className="w-5 h-5 text-[var(--zone4-accent)] mt-0.5" />
          )}
          <div>
            <Typography variant="body" className="font-semibold mb-1">
              {recipientDetails.deliveryMethod === 'physical' ? 'Physical Exchange' : 'Bank Transfer'}
            </Typography>
            {recipientDetails.deliveryMethod === 'physical' ? (
              <div>
                <Typography variant="caption" className="block">
                  Location: {recipientDetails.formData.pickupLocation}
                </Typography>
                <Typography variant="caption" className="block">
                  Time: {recipientDetails.formData.preferredTime}
                </Typography>
              </div>
            ) : (
              <div>
                <Typography variant="caption" className="block">
                  {recipientDetails.formData.accountName}
                </Typography>
                <Typography variant="caption" className="block">
                  {recipientDetails.formData.accountNumber} • {recipientDetails.formData.bankName}
                </Typography>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Escrow Notice */}
      <Card padding="normal" variant="outlined" className="mb-6 border-[var(--zone4-accent)]/20 bg-[var(--zone4-accent)]/5">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-[var(--zone4-accent)] mt-0.5" />
          <div>
            <Typography variant="body" className="font-medium mb-1">
              Escrow Protection Active
            </Typography>
            <Typography variant="caption">
              Your {amount} {fromCurrency} will be held securely in escrow until the exchange is completed. 
              The agent will only receive payment after you confirm receipt of your {toCurrency}.
            </Typography>
          </div>
        </div>
      </Card>

      {/* Terms and Conditions */}
      <div className="mb-8">
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-1 w-4 h-4 text-[var(--zone4-accent)] border-gray-300 rounded focus:ring-[var(--zone4-accent)]"
          />
          <Typography variant="caption" className="text-[var(--zone4-text-muted)]">
            I agree to the{' '}
            <button className="text-[var(--zone4-accent)] underline hover:no-underline">
              Terms of Service
            </button>
            {' '}and{' '}
            <button className="text-[var(--zone4-accent)] underline hover:no-underline">
              Exchange Policy
            </button>
            . I understand that this transaction is protected by escrow.
          </Typography>
        </label>
      </div>

      <div className="space-y-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!acceptedTerms || isProcessing}
          loading={isProcessing}
          rightIcon={!isProcessing && <ArrowRight className="w-5 h-5" />}
          onClick={handleConfirm}
        >
          {isProcessing ? 'Creating Transaction...' : 'Confirm & Initiate Exchange'}
        </Button>

        <Button
          variant="ghost"
          size="lg"
          fullWidth
          onClick={onBack}
          disabled={isProcessing}
        >
          Back
        </Button>
      </div>
    </div>
  );
};