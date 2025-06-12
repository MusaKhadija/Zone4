'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { Typography } from '../shared/Typography';
import { Input } from '../shared/Input';
import { ArrowRight, ArrowUpDown, AlertTriangle } from 'lucide-react';
import { supabase, ExchangeRate } from '@/lib/supabase';

interface InitiateExchangeScreenProps {
  onNext: (data: any) => void;
  onBack: () => void;
}

const currencies = [
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬' },
];

export const InitiateExchangeScreen: React.FC<InitiateExchangeScreenProps> = ({
  onNext,
  onBack,
}) => {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('NGN');
  const [amount, setAmount] = useState('');
  const [liveRate, setLiveRate] = useState<number | null>(null);
  const [loadingRates, setLoadingRates] = useState(false);
  const [rateError, setRateError] = useState<string | null>(null);

  useEffect(() => {
    if (fromCurrency && toCurrency && fromCurrency !== toCurrency) {
      fetchExchangeRate();
    }
  }, [fromCurrency, toCurrency]);

  const fetchExchangeRate = async () => {
    try {
      setLoadingRates(true);
      setRateError(null);

      // Fetch the best available rate for this currency pair
      const { data: rates, error } = await supabase
        .from('exchange_rates')
        .select('rate, min_amount, max_amount')
        .eq('currency_from', fromCurrency)
        .eq('currency_to', toCurrency)
        .eq('is_active', true)
        .order('rate', { ascending: false })
        .limit(1);

      if (error) {
        throw new Error(`Failed to fetch rates: ${error.message}`);
      }

      if (!rates || rates.length === 0) {
        setLiveRate(null);
        setRateError(`No rates available for ${fromCurrency} to ${toCurrency}`);
      } else {
        setLiveRate(rates[0].rate);
        setRateError(null);
      }
    } catch (err) {
      console.error('Rate fetch error:', err);
      setRateError(err instanceof Error ? err.message : 'Failed to fetch exchange rate');
      setLiveRate(null);
    } finally {
      setLoadingRates(false);
    }
  };

  const handleSwapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const calculateApproximate = () => {
    if (!liveRate || !amount || parseFloat(amount) <= 0) {
      return '0.00';
    }
    return (parseFloat(amount) * liveRate).toFixed(2);
  };

  const handleNext = () => {
    onNext({
      fromCurrency,
      toCurrency,
      amount: parseFloat(amount),
      estimatedRate: liveRate,
    });
  };

  const isValid = amount && parseFloat(amount) > 0 && liveRate !== null && !loadingRates;

  return (
    <div className="container-mobile py-8">
      <div className="text-center mb-8">
        <Typography variant="h2" className="mb-4">
          Start Your Exchange
        </Typography>
        <Typography variant="subtitle" className="text-balance">
          Tell us what you want to exchange
        </Typography>
      </div>

      <Card padding="large" variant="elevated" className="mb-6">
        <div className="space-y-6">
          {/* From Currency */}
          <div>
            <Typography variant="caption" className="mb-2 block">
              I want to send
            </Typography>
            <div className="flex space-x-3">
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="flex-1 px-4 py-3 rounded-[var(--zone4-radius)] border border-[var(--zone4-border)] focus:outline-none focus:ring-2 focus:ring-[var(--zone4-accent)]/30 focus:border-[var(--zone4-accent)]"
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.flag} {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleSwapCurrencies}
                className="p-3 bg-[var(--zone4-accent)]/10 text-[var(--zone4-accent)] rounded-[var(--zone4-radius)] hover:bg-[var(--zone4-accent)]/20 transition-colors"
                aria-label="Swap currencies"
              >
                <ArrowUpDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Amount */}
          <Input
            label="Amount"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          {/* To Currency */}
          <div>
            <Typography variant="caption" className="mb-2 block">
              I want to receive
            </Typography>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full px-4 py-3 rounded-[var(--zone4-radius)] border border-[var(--zone4-border)] focus:outline-none focus:ring-2 focus:ring-[var(--zone4-accent)]/30 focus:border-[var(--zone4-accent)]"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.flag} {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>

          {/* Rate Loading State */}
          {loadingRates && (
            <Card padding="normal" variant="outlined" className="border-[var(--zone4-accent)]/20 bg-[var(--zone4-accent)]/5">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-2 border-[var(--zone4-accent)] border-t-transparent rounded-full animate-spin"></div>
                <Typography variant="caption">
                  Fetching live exchange rates...
                </Typography>
              </div>
            </Card>
          )}

          {/* Rate Error */}
          {rateError && (
            <Card padding="normal" variant="outlined" className="border-[var(--zone4-error)]/20 bg-[var(--zone4-error)]/5">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-[var(--zone4-error)] mt-0.5" />
                <div>
                  <Typography variant="body" className="font-medium mb-1 text-[var(--zone4-error)]">
                    Rate Unavailable
                  </Typography>
                  <Typography variant="caption" className="text-[var(--zone4-error)]">
                    {rateError}
                  </Typography>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={fetchExchangeRate}
                  >
                    Retry
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Approximate Amount */}
          {amount && parseFloat(amount) > 0 && liveRate && !loadingRates && (
            <Card padding="normal" variant="outlined" className="border-[var(--zone4-accent)]/20 bg-[var(--zone4-accent)]/5">
              <Typography variant="caption" className="mb-1 block">
                Approximate amount you'll receive
              </Typography>
              <Typography variant="h3" className="text-[var(--zone4-accent)]">
                {calculateApproximate()} {toCurrency}
              </Typography>
              <Typography variant="caption" className="text-[var(--zone4-text-muted)] mt-1">
                Rate: 1 {fromCurrency} = ₦{liveRate.toLocaleString()}
              </Typography>
            </Card>
          )}
        </div>
      </Card>

      <div className="space-y-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!isValid}
          loading={loadingRates}
          rightIcon={!loadingRates && <ArrowRight className="w-5 h-5" />}
          onClick={handleNext}
        >
          {loadingRates ? 'Loading Rates...' : 'Find Best Rates'}
        </Button>

        <Button
          variant="ghost"
          size="lg"
          fullWidth
          onClick={onBack}
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};