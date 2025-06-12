'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { Typography } from '../shared/Typography';
import { 
  CheckCircle, 
  Clock, 
  Shield, 
  MessageCircle, 
  AlertTriangle,
  Copy,
  Star
} from 'lucide-react';
import { supabase, Transaction } from '@/lib/supabase';

interface TransactionProgressScreenProps {
  onNext: () => void;
  onBack: () => void;
  exchangeData: any;
}

type TransactionStage = 'escrow' | 'agent_confirmed' | 'customer_confirmed' | 'completed';

const stages = [
  { id: 'escrow', label: 'Funds in Escrow', description: 'Your funds are secured' },
  { id: 'agent_confirmed', label: 'Agent Confirmed', description: 'Agent has confirmed the exchange' },
  { id: 'customer_confirmed', label: 'Customer Confirmed', description: 'You confirm receipt' },
  { id: 'completed', label: 'Completed', description: 'Transaction successful' },
];

export const TransactionProgressScreen: React.FC<TransactionProgressScreenProps> = ({
  onNext,
  onBack,
  exchangeData,
}) => {
  const [currentStage, setCurrentStage] = useState<TransactionStage>('escrow');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showConfirmButton, setShowConfirmButton] = useState(false);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const { transactionId } = exchangeData;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (transactionId) {
      fetchTransactionStatus();
      
      // Set up real-time subscription for transaction updates
      const subscription = supabase
        .channel('transaction-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'transactions',
            filter: `id=eq.${transactionId}`
          },
          (payload) => {
            console.log('Transaction updated:', payload);
            fetchTransactionStatus();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [transactionId]);

  const fetchTransactionStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!transactionId) {
        throw new Error('No transaction ID provided');
      }

      const { data: transactionData, error: fetchError } = await supabase
        .from('transactions')
        .select(`
          *,
          bdc_agents (
            company_name,
            average_rating,
            total_reviews
          )
        `)
        .eq('id', transactionId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch transaction: ${fetchError.message}`);
      }

      if (!transactionData) {
        throw new Error('Transaction not found');
      }

      setTransaction(transactionData);
      updateStageFromStatus(transactionData.status);

    } catch (err) {
      console.error('Transaction fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transaction status');
    } finally {
      setLoading(false);
    }
  };

  const updateStageFromStatus = (status: string) => {
    switch (status) {
      case 'funds_in_escrow':
        setCurrentStage('escrow');
        // Simulate agent confirmation after 5 seconds for demo
        setTimeout(() => {
          setCurrentStage('agent_confirmed');
          setShowConfirmButton(true);
        }, 5000);
        break;
      case 'fx_transferred_by_agent':
        setCurrentStage('agent_confirmed');
        setShowConfirmButton(true);
        break;
      case 'fx_received_by_customer':
        setCurrentStage('customer_confirmed');
        setShowConfirmButton(false);
        break;
      case 'completed':
        setCurrentStage('completed');
        setShowConfirmButton(false);
        setTimeout(() => {
          onNext();
        }, 2000);
        break;
      default:
        setCurrentStage('escrow');
    }
  };

  const handleConfirmReceipt = async () => {
    if (!transactionId) return;

    setIsConfirming(true);
    setError(null);

    try {
      // Step 1: Update status to fx_received_by_customer and release escrow
      const { error: updateError1 } = await supabase
        .from('transactions')
        .update({
          status: 'fx_received_by_customer',
          escrow_status: 'released_to_agent'
        })
        .eq('id', transactionId);

      if (updateError1) {
        throw new Error(`Failed to confirm receipt: ${updateError1.message}`);
      }

      // Step 2: Update status to completed
      const { error: updateError2 } = await supabase
        .from('transactions')
        .update({
          status: 'completed'
        })
        .eq('id', transactionId);

      if (updateError2) {
        throw new Error(`Failed to complete transaction: ${updateError2.message}`);
      }

      // Update local state
      setCurrentStage('customer_confirmed');
      setShowConfirmButton(false);
      
      setTimeout(() => {
        setCurrentStage('completed');
        setTimeout(() => {
          onNext();
        }, 2000);
      }, 1500);

    } catch (err) {
      console.error('Confirm receipt error:', err);
      setError(err instanceof Error ? err.message : 'Failed to confirm receipt');
    } finally {
      setIsConfirming(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStageStatus = (stageId: string) => {
    const stageIndex = stages.findIndex(s => s.id === stageId);
    const currentIndex = stages.findIndex(s => s.id === currentStage);
    
    if (stageIndex < currentIndex) return 'completed';
    if (stageIndex === currentIndex) return 'active';
    return 'pending';
  };

  const copyTransactionId = () => {
    if (transactionId) {
      navigator.clipboard.writeText(transactionId);
    }
  };

  if (loading) {
    return (
      <div className="container-mobile py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[var(--zone4-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <Typography variant="body" className="text-[var(--zone4-text-muted)]">
              Loading transaction status...
            </Typography>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-mobile py-8">
        <Card padding="large" variant="outlined" className="border-[var(--zone4-error)]/20 bg-[var(--zone4-error)]/5">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-[var(--zone4-error)] mt-0.5" />
            <div>
              <Typography variant="body" className="font-medium mb-1 text-[var(--zone4-error)]">
                Failed to load transaction
              </Typography>
              <Typography variant="caption" className="text-[var(--zone4-error)]">
                {error}
              </Typography>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={fetchTransactionStatus}
              >
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-mobile py-8">
      {/* Transaction Header */}
      <Card padding="large" variant="elevated" className="mb-6">
        <div className="text-center mb-4">
          <Typography variant="h2" className="mb-2">
            Transaction in Progress
          </Typography>
          <div className="flex items-center justify-center space-x-2">
            <Typography variant="caption" className="text-[var(--zone4-text-muted)]">
              ID: {transactionId}
            </Typography>
            <button
              onClick={copyTransactionId}
              className="p-1 hover:bg-gray-100 rounded"
              aria-label="Copy transaction ID"
            >
              <Copy className="w-4 h-4 text-[var(--zone4-text-muted)]" />
            </button>
          </div>
          <Typography variant="caption" className="text-[var(--zone4-text-muted)]">
            Time elapsed: {formatTime(timeElapsed)}
          </Typography>
        </div>

        {/* Progress Timeline */}
        <div className="space-y-4">
          {stages.map((stage, index) => {
            const status = getStageStatus(stage.id);
            return (
              <div key={stage.id} className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  status === 'completed' ? 'bg-[var(--zone4-success)] text-white' :
                  status === 'active' ? 'bg-[var(--zone4-accent)] text-white' :
                  'bg-gray-200 text-gray-400'
                }`}>
                  {status === 'completed' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : status === 'active' ? (
                    <Clock className="w-5 h-5 animate-pulse" />
                  ) : (
                    <span className="text-sm font-bold">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <Typography variant="body" className={`font-medium ${
                    status === 'active' ? 'text-[var(--zone4-accent)]' : ''
                  }`}>
                    {stage.label}
                  </Typography>
                  <Typography variant="caption" className="text-[var(--zone4-text-muted)]">
                    {stage.description}
                  </Typography>
                </div>
                {status === 'active' && (
                  <div className="w-3 h-3 bg-[var(--zone4-accent)] rounded-full animate-pulse"></div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Current Status */}
      <Card padding="large" variant="elevated" className="mb-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-[var(--zone4-accent)]/10 rounded-full flex items-center justify-center">
            {currentStage === 'escrow' && <Shield className="w-6 h-6 text-[var(--zone4-accent)]" />}
            {currentStage === 'agent_confirmed' && <CheckCircle className="w-6 h-6 text-[var(--zone4-success)]" />}
            {currentStage === 'customer_confirmed' && <Clock className="w-6 h-6 text-[var(--zone4-warning)]" />}
            {currentStage === 'completed' && <CheckCircle className="w-6 h-6 text-[var(--zone4-success)]" />}
          </div>
          <div className="flex-1">
            <Typography variant="h3" className="mb-2">
              {currentStage === 'escrow' && 'Funds Secured in Escrow'}
              {currentStage === 'agent_confirmed' && 'Agent Ready for Exchange'}
              {currentStage === 'customer_confirmed' && 'Processing Completion'}
              {currentStage === 'completed' && 'Exchange Completed!'}
            </Typography>
            <Typography variant="body" className="text-[var(--zone4-text-muted)]">
              {currentStage === 'escrow' && 'Your funds are safely held in escrow. Waiting for agent confirmation.'}
              {currentStage === 'agent_confirmed' && 'The agent has confirmed they are ready to complete the exchange. Please confirm once you receive your currency.'}
              {currentStage === 'customer_confirmed' && 'Processing the final steps of your transaction.'}
              {currentStage === 'completed' && 'Your transaction has been completed successfully!'}
            </Typography>
          </div>
        </div>
      </Card>

      {/* Transaction Details */}
      {transaction && (
        <Card padding="large" variant="elevated" className="mb-6">
          <Typography variant="h3" className="mb-4">
            Transaction Details
          </Typography>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <Typography variant="body">Amount:</Typography>
              <Typography variant="body" className="font-semibold">
                {transaction.amount_sent} {transaction.currency_from} → ₦{transaction.amount_received.toLocaleString()}
              </Typography>
            </div>
            <div className="flex justify-between">
              <Typography variant="body">Agent:</Typography>
              <div className="text-right">
                <Typography variant="body" className="font-semibold">
                  {transaction.bdc_agents?.company_name || 'Unknown Agent'}
                </Typography>
                <div className="flex items-center justify-end space-x-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <Typography variant="caption">{transaction.bdc_agents?.average_rating?.toFixed(1) || '0.0'}</Typography>
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <Typography variant="body">Rate:</Typography>
              <Typography variant="body">
                1 {transaction.currency_from} = ₦{transaction.agreed_rate.toLocaleString()}
              </Typography>
            </div>
            <div className="flex justify-between">
              <Typography variant="body">Status:</Typography>
              <Typography variant="body" className="font-semibold capitalize">
                {transaction.status.replace('_', ' ')}
              </Typography>
            </div>
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="space-y-4 mb-6">
        {showConfirmButton && currentStage === 'agent_confirmed' && (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={isConfirming}
            rightIcon={!isConfirming && <CheckCircle className="w-5 h-5" />}
            onClick={handleConfirmReceipt}
          >
            {isConfirming ? 'Confirming...' : 'Confirm Receipt of Currency'}
          </Button>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<MessageCircle className="w-4 h-4" />}
          >
            Chat with Agent
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<AlertTriangle className="w-4 h-4" />}
          >
            Report Issue
          </Button>
        </div>
      </div>

      {/* Security Notice */}
      <Card padding="normal" variant="outlined" className="mb-6 border-[var(--zone4-accent)]/20 bg-[var(--zone4-accent)]/5">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-[var(--zone4-accent)] mt-0.5" />
          <div>
            <Typography variant="body" className="font-medium mb-1">
              Your Transaction is Protected
            </Typography>
            <Typography variant="caption">
              Only confirm receipt after you have physically received your currency. 
              Your funds remain in escrow until confirmation.
            </Typography>
          </div>
        </div>
      </Card>

      <Button
        variant="ghost"
        size="lg"
        fullWidth
        onClick={onBack}
        disabled={currentStage !== 'escrow'}
      >
        Cancel Transaction
      </Button>
    </div>
  );
};