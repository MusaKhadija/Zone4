'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { Typography } from '../shared/Typography';
import { Star, Filter, AlertTriangle } from 'lucide-react';
import { supabase, ExchangeRate } from '@/lib/supabase';

interface RateComparisonScreenProps {
  onNext: (data: any) => void;
  onBack: () => void;
  exchangeData: any;
}

export const RateComparisonScreen: React.FC<RateComparisonScreenProps> = ({
  onNext,
  onBack,
  exchangeData,
}) => {
  const [sortBy, setSortBy] = useState('rate');
  const [availableAgents, setAvailableAgents] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExchangeRates();
  }, [exchangeData.fromCurrency, exchangeData.toCurrency]);

  const fetchExchangeRates = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!exchangeData.fromCurrency || !exchangeData.toCurrency) {
        throw new Error('Currency pair not specified');
      }

      // Fetch exchange rates with agent details
      const { data: rates, error: ratesError } = await supabase
        .from('exchange_rates')
        .select(`
          *,
          bdc_agents (
            company_name,
            average_rating,
            total_reviews,
            is_verified_agent,
            company_address
          )
        `)
        .eq('currency_from', exchangeData.fromCurrency)
        .eq('currency_to', exchangeData.toCurrency)
        .eq('is_active', true)
        .gte('max_amount', exchangeData.amount || 0)
        .lte('min_amount', exchangeData.amount || 0);

      if (ratesError) {
        throw new Error(`Failed to fetch rates: ${ratesError.message}`);
      }

      if (!rates || rates.length === 0) {
        setError(`No agents available for ${exchangeData.fromCurrency} to ${exchangeData.toCurrency} exchange of ${exchangeData.amount}`);
        setAvailableAgents([]);
      } else {
        setAvailableAgents(rates);
      }
    } catch (err) {
      console.error('Rate comparison fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch exchange rates');
      setAvailableAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const sortedAgents = [...availableAgents].sort((a, b) => {
    if (sortBy === 'rate') return b.rate - a.rate;
    if (sortBy === 'rating') return (b.bdc_agents?.average_rating || 0) - (a.bdc_agents?.average_rating || 0);
    return 0;
  });

  const handleSelectAgent = (agent: ExchangeRate) => {
    onNext({ selectedAgent: agent });
  };

  if (loading) {
    return (
      <div className="container-mobile py-8">
        <div className="text-center mb-6">
          <Typography variant="h2" className="mb-2">
            Finding Best Rates
          </Typography>
          <Typography variant="subtitle">
            {exchangeData.amount} {exchangeData.fromCurrency} → {exchangeData.toCurrency}
          </Typography>
        </div>

        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[var(--zone4-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <Typography variant="body" className="text-[var(--zone4-text-muted)]">
              Searching for available agents...
            </Typography>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-mobile py-8">
        <div className="text-center mb-6">
          <Typography variant="h2" className="mb-2">
            Compare Rates
          </Typography>
          <Typography variant="subtitle">
            {exchangeData.amount} {exchangeData.fromCurrency} → {exchangeData.toCurrency}
          </Typography>
        </div>

        <Card padding="large" variant="outlined" className="mb-6 border-[var(--zone4-error)]/20 bg-[var(--zone4-error)]/5">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-[var(--zone4-error)] mt-0.5" />
            <div>
              <Typography variant="body" className="font-medium mb-1 text-[var(--zone4-error)]">
                No Rates Available
              </Typography>
              <Typography variant="caption" className="text-[var(--zone4-error)]">
                {error}
              </Typography>
              <div className="mt-4 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchExchangeRates}
                >
                  Try Again
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                >
                  Change Amount
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-mobile py-8">
      <div className="text-center mb-6">
        <Typography variant="h2" className="mb-2">
          Compare Rates
        </Typography>
        <Typography variant="subtitle">
          {exchangeData.amount} {exchangeData.fromCurrency} → {exchangeData.toCurrency}
        </Typography>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-[var(--zone4-text-muted)]" />
          <Typography variant="caption">Sort by:</Typography>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 rounded border border-[var(--zone4-border)] text-sm"
          >
            <option value="rate">Best Rate</option>
            <option value="rating">Highest Rating</option>
          </select>
        </div>
        <Typography variant="caption" className="text-[var(--zone4-accent)]">
          {sortedAgents.length} agents available
        </Typography>
      </div>

      {/* Agent List */}
      <div className="space-y-4 mb-8">
        {sortedAgents.map((agent) => (
          <Card
            key={agent.id}
            padding="large"
            variant="elevated"
            className="cursor-pointer hover:scale-[1.01] transition-transform"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <Typography variant="h3" className="text-lg">
                    {agent.bdc_agents?.company_name || 'Unknown Agent'}
                  </Typography>
                  {agent.bdc_agents?.is_verified_agent && (
                    <div className="w-5 h-5 bg-[var(--zone4-success)] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
                <Typography variant="caption" className="text-[var(--zone4-text-muted)]">
                  {agent.bdc_agents?.company_address || 'Location not specified'}
                </Typography>
              </div>
              <div className="text-right">
                <Typography variant="h3" className="text-[var(--zone4-accent)]">
                  ₦{agent.rate.toLocaleString()}
                </Typography>
                <Typography variant="caption">per {exchangeData.fromCurrency}</Typography>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <Typography variant="caption">
                    {agent.bdc_agents?.average_rating?.toFixed(1) || '0.0'} ({agent.bdc_agents?.total_reviews || 0})
                  </Typography>
                </div>
                <Typography variant="caption" className="text-[var(--zone4-text-muted)]">
                  Range: {agent.min_amount} - {agent.max_amount} {exchangeData.fromCurrency}
                </Typography>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Typography variant="caption" className="text-[var(--zone4-success)]">
                You'll receive: ₦{(exchangeData.amount * agent.rate).toLocaleString()}
              </Typography>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSelectAgent(agent)}
              >
                Select
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Button
        variant="ghost"
        size="lg"
        fullWidth
        onClick={onBack}
      >
        Back
      </Button>
    </div>
  );
};