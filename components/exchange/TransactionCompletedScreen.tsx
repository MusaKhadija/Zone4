'use client';

import React, { useState } from 'react';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { Typography } from '../shared/Typography';
import { 
  CheckCircle, 
  Star, 
  Download, 
  ArrowRight, 
  History,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface TransactionCompletedScreenProps {
  onComplete: () => void;
  onViewHistory: () => void;
  exchangeData: any;
}

export const TransactionCompletedScreen: React.FC<TransactionCompletedScreenProps> = ({
  onComplete,
  onViewHistory,
  exchangeData,
}) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [hasRated, setHasRated] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);

  const { transactionId, amount, fromCurrency, selectedAgent } = exchangeData;
  const finalAmount = amount * selectedAgent.rate * 0.995; // After fees

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
    setRatingError(null);
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      setRatingError('Please select a rating');
      return;
    }

    setIsSubmittingRating(true);
    setRatingError(null);

    try {
      // Get current authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Insert review into Supabase
      const { error: insertError } = await supabase
        .from('reviews')
        .insert({
          agent_id: selectedAgent.agent_id,
          customer_id: user.id,
          transaction_id: transactionId,
          rating: rating,
          comment: feedback.trim() || null
        });

      if (insertError) {
        throw new Error(`Failed to submit rating: ${insertError.message}`);
      }

      setHasRated(true);
      setRatingError(null);
    } catch (error) {
      console.error('Rating submission error:', error);
      setRatingError(error instanceof Error ? error.message : 'Failed to submit rating');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleDownloadReceipt = () => {
    // In a real app, this would generate and download a PDF receipt
    console.log('Downloading receipt for transaction:', transactionId);
  };

  return (
    <div className="container-mobile py-8">
      {/* Success Animation */}
      <div className="text-center mb-8">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="w-24 h-24 bg-[var(--zone4-success)]/10 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-[var(--zone4-success)]" />
          </div>
          <Sparkles className="w-6 h-6 text-[var(--zone4-accent)] absolute -top-2 -right-2 animate-pulse" />
        </div>
        
        <Typography variant="h1" className="mb-4 text-[var(--zone4-success)]">
          Exchange Completed!
        </Typography>
        
        <Typography variant="subtitle" className="text-balance">
          Your transaction was successful
        </Typography>
      </div>

      {/* Transaction Summary */}
      <Card padding="large" variant="elevated" className="mb-6">
        <Typography variant="h3" className="mb-4">
          Transaction Summary
        </Typography>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <Typography variant="body">Transaction ID:</Typography>
            <Typography variant="body" className="font-mono text-sm">
              {transactionId}
            </Typography>
          </div>
          <div className="flex justify-between">
            <Typography variant="body">You sent:</Typography>
            <Typography variant="body" className="font-semibold">
              {amount} {fromCurrency}
            </Typography>
          </div>
          <div className="flex justify-between">
            <Typography variant="body">You received:</Typography>
            <Typography variant="body" className="font-semibold text-[var(--zone4-success)]">
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
            <Typography variant="body">Completed at:</Typography>
            <Typography variant="body">
              {new Date().toLocaleString('en-NG', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Typography>
          </div>
        </div>
      </Card>

      {/* Agent Rating */}
      {!hasRated ? (
        <Card padding="large" variant="elevated" className="mb-6">
          <Typography variant="h3" className="mb-4">
            Rate Your Experience
          </Typography>
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-[var(--zone4-accent)]/10 rounded-full flex items-center justify-center">
              <span className="text-[var(--zone4-accent)] font-bold">
                {selectedAgent.bdc_agents?.company_name?.charAt(0) || 'A'}
              </span>
            </div>
            <div>
              <Typography variant="body" className="font-semibold">
                {selectedAgent.bdc_agents?.company_name || 'Unknown Agent'}
              </Typography>
              <Typography variant="caption" className="text-[var(--zone4-text-muted)]">
                How was your experience?
              </Typography>
            </div>
          </div>

          {/* Star Rating */}
          <div className="flex items-center space-x-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleStarClick(star)}
                className="p-1 hover:scale-110 transition-transform"
                aria-label={`Rate ${star} stars`}
                disabled={isSubmittingRating}
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= rating
                      ? 'text-yellow-500 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Feedback Textarea */}
          <textarea
            placeholder="Share your experience (optional)"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            disabled={isSubmittingRating}
            className="w-full px-4 py-3 rounded-[var(--zone4-radius)] border border-[var(--zone4-border)] focus:outline-none focus:ring-2 focus:ring-[var(--zone4-accent)]/30 focus:border-[var(--zone4-accent)] resize-none disabled:opacity-50"
            rows={3}
          />

          {/* Rating Error */}
          {ratingError && (
            <div className="mt-3 p-3 bg-[var(--zone4-error)]/10 border border-[var(--zone4-error)]/20 rounded-[var(--zone4-radius)]">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-[var(--zone4-error)] mt-0.5" />
                <Typography variant="caption" className="text-[var(--zone4-error)]">
                  {ratingError}
                </Typography>
              </div>
            </div>
          )}

          <Button
            variant="primary"
            size="sm"
            className="mt-4"
            loading={isSubmittingRating}
            onClick={handleSubmitRating}
          >
            {isSubmittingRating ? 'Submitting...' : 'Submit Rating'}
          </Button>
        </Card>
      ) : (
        <Card padding="normal" variant="outlined" className="mb-6 border-[var(--zone4-success)]/20 bg-[var(--zone4-success)]/5">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-[var(--zone4-success)]" />
            <Typography variant="body" className="text-[var(--zone4-success)] font-medium">
              Thank you for rating {selectedAgent.bdc_agents?.company_name || 'the agent'}!
            </Typography>
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="space-y-4">
        <Button
          variant="outline"
          size="lg"
          fullWidth
          leftIcon={<Download className="w-5 h-5" />}
          onClick={handleDownloadReceipt}
        >
          Download Receipt
        </Button>

        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<History className="w-4 h-4" />}
            onClick={onViewHistory}
          >
            View History
          </Button>
          <Button
            variant="primary"
            size="sm"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={onComplete}
          >
            Dashboard
          </Button>
        </div>
      </div>

      {/* Success Tips */}
      <Card padding="normal" variant="outlined" className="mt-6 border-[var(--zone4-accent)]/20 bg-[var(--zone4-accent)]/5">
        <Typography variant="body" className="font-medium mb-2">
          💡 What's Next?
        </Typography>
        <div className="space-y-1">
          <Typography variant="caption">• Your receipt has been emailed to you</Typography>
          <Typography variant="caption">• Rate more agents to help the community</Typography>
          <Typography variant="caption">• Set up rate alerts for future exchanges</Typography>
        </div>
      </Card>
    </div>
  );
};