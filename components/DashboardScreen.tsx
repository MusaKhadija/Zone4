'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Card } from './shared/Card';
import { Button } from './shared/Button';
import { Typography } from './shared/Typography';
import { 
  TrendingUp, 
  Send, 
  ArrowUpDown, 
  CreditCard, 
  Bell,
  Eye,
  EyeOff,
  Shield,
  CheckCircle,
  Clock,
  ArrowRight,
  AlertTriangle,
  Settings,
  MessageCircle
} from 'lucide-react';
import { supabase, Profile, ExchangeRate, Transaction } from '@/lib/supabase';

interface DashboardScreenProps {
  user: User | null;
  userProfile: Profile | null;
  onStartExchange: () => void;
  onViewHistory: () => void;
  onSecuritySettings?: () => void;
  onDisputeTracking?: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  user,
  userProfile,
  onStartExchange,
  onViewHistory,
  onSecuritySettings,
  onDisputeTracking
}) => {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user && userProfile) {
      fetchDashboardData(user, userProfile);
    }
  }, [user, userProfile]);

  const fetchDashboardData = async (currentUser: User, currentUserProfile: Profile) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch live exchange rates with agent details
      const { data: rates, error: ratesError } = await supabase
        .from('exchange_rates')
        .select(`
          *,
          bdc_agents (
            company_name,
            average_rating,
            total_reviews,
            is_verified_agent
          )
        `)
        .eq('is_active', true)
        .order('rate', { ascending: false })
        .limit(3);

      if (ratesError) {
        console.error('Failed to fetch exchange rates:', ratesError);
        setExchangeRates([]);
      } else {
        setExchangeRates(rates || []);
      }

      // Fetch recent transactions for this user
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select(`
          *,
          bdc_agents (
            company_name,
            average_rating
          )
        `)
        .eq('customer_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (transactionsError) {
        console.error('Failed to fetch transactions:', transactionsError);
        setRecentTransactions([]);
      } else {
        setRecentTransactions(transactions || []);
      }

    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (date: string) => {
    return new Intl.DateTimeFormat('en-NG', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-[var(--zone4-success)]';
      case 'funds_in_escrow': return 'text-[var(--zone4-warning)]';
      case 'pending_agent_offer': return 'text-[var(--zone4-text-muted)]';
      case 'disputed': return 'text-[var(--zone4-error)]';
      default: return 'text-[var(--zone4-text-muted)]';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'funds_in_escrow': return <Shield className="w-4 h-4" />;
      case 'pending_agent_offer': return <Clock className="w-4 h-4" />;
      case 'disputed': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_agent_offer': return 'Pending';
      case 'offer_accepted': return 'Accepted';
      case 'funds_in_escrow': return 'In Escrow';
      case 'fx_transferred_by_agent': return 'Transferred';
      case 'fx_received_by_customer': return 'Received';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'disputed': return 'Disputed';
      default: return status;
    }
  };

  // Mock balance for now - in a real app this would come from a financial system
  const mockBalance = 1250000;

  if (loading) {
    return (
      <div className="container-mobile flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--zone4-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <Typography variant="body" className="text-[var(--zone4-text-muted)]">
            Loading dashboard...
          </Typography>
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
                Failed to load dashboard
              </Typography>
              <Typography variant="caption" className="text-[var(--zone4-error)]">
                {error}
              </Typography>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => user && userProfile && fetchDashboardData(user, userProfile)}
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
    <div className="pb-20">
      {/* Balance Card */}
      <div className="container-mobile pt-6 pb-4">
        <Card padding="large" variant="elevated" className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Typography variant="caption" className="mb-1">
                Welcome back, {userProfile?.full_name?.split(' ')[0] || 'User'}
              </Typography>
              <Typography variant="caption" className="mb-1 block">
                Available Balance
              </Typography>
              <div className="flex items-center space-x-3">
                <Typography variant="h2" className="font-bold">
                  {balanceVisible ? formatCurrency(mockBalance) : "₦***,***"}
                </Typography>
                <button
                  onClick={() => setBalanceVisible(!balanceVisible)}
                  className="p-1 hover:bg-gray-100 rounded touch-target"
                  aria-label={balanceVisible ? "Hide balance" : "Show balance"}
                >
                  {balanceVisible ? (
                    <EyeOff className="w-5 h-5 text-[var(--zone4-text-muted)]" />
                  ) : (
                    <Eye className="w-5 h-5 text-[var(--zone4-text-muted)]" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              {userProfile?.kyc_status === 'verified' && (
                <div className="flex items-center space-x-1 bg-[var(--zone4-success)]/10 px-3 py-1 rounded-full">
                  <CheckCircle className="w-4 h-4 text-[var(--zone4-success)]" />
                  <Typography variant="caption" className="text-[var(--zone4-success)] font-medium">
                    Verified
                  </Typography>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Settings className="w-4 h-4" />}
                onClick={onSecuritySettings}
              >
                Security
              </Button>
            </div>
          </div>
          
          <Typography variant="caption" className="flex items-center space-x-1">
            <span>Last updated:</span>
            <span className="font-medium">{currentTime.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}</span>
          </Typography>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            className="flex-col h-20 space-y-2"
            leftIcon={<Send className="w-5 h-5" />}
          >
            <span className="text-xs">Send</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-col h-20 space-y-2"
            leftIcon={<ArrowUpDown className="w-5 h-5" />}
            onClick={onStartExchange}
          >
            <span className="text-xs">Exchange</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-col h-20 space-y-2"
            leftIcon={<CreditCard className="w-5 h-5" />}
          >
            <span className="text-xs">Fund</span>
          </Button>
        </div>
      </div>

      {/* Exchange Rates */}
      <div className="container-mobile mb-6">
        <div className="flex items-center justify-between mb-4">
          <Typography variant="h3">Live Exchange Rates</Typography>
          <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
            View All
          </Button>
        </div>

        {exchangeRates.length === 0 ? (
          <Card padding="large" variant="elevated">
            <div className="text-center">
              <Typography variant="body" className="text-[var(--zone4-text-muted)]">
                No exchange rates available at the moment
              </Typography>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {exchangeRates.map((rate) => (
              <Card key={rate.id} padding="normal" variant="elevated" className="cursor-pointer hover:scale-[1.01]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[var(--zone4-accent)]/10 rounded-full flex items-center justify-center">
                      <span className="text-[var(--zone4-accent)] font-semibold text-sm">
                        {rate.currency_from}
                      </span>
                    </div>
                    <div>
                      <Typography variant="body" className="font-medium">
                        {rate.currency_from} → {rate.currency_to}
                      </Typography>
                      <div className="flex items-center space-x-2">
                        <Typography variant="caption">
                          {rate.bdc_agents?.company_name || 'Unknown Agent'}
                        </Typography>
                        {rate.bdc_agents?.is_verified_agent && (
                          <div className="flex items-center space-x-1">
                            <span className="text-yellow-500 text-xs">★</span>
                            <Typography variant="caption">{rate.bdc_agents.average_rating?.toFixed(1) || '0.0'}</Typography>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Typography variant="body" className="font-semibold">
                      ₦{rate.rate.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" className="text-[var(--zone4-text-muted)]">
                      Min: {rate.min_amount} {rate.currency_from}
                    </Typography>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="container-mobile mb-6">
        <div className="flex items-center justify-between mb-4">
          <Typography variant="h3">Recent Transactions</Typography>
          <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />} onClick={onViewHistory}>
            View All
          </Button>
        </div>

        {recentTransactions.length === 0 ? (
          <Card padding="large" variant="elevated">
            <div className="text-center">
              <Typography variant="body" className="text-[var(--zone4-text-muted)] mb-2">
                No transactions yet
              </Typography>
              <Typography variant="caption" className="text-[var(--zone4-text-muted)]">
                Start your first exchange to see your transaction history
              </Typography>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <Card key={transaction.id} padding="normal" variant="elevated">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`flex items-center justify-center ${getStatusColor(transaction.status)}`}>
                      {getStatusIcon(transaction.status)}
                    </div>
                    <div>
                      <Typography variant="body" className="font-medium">
                        {transaction.currency_from} to {transaction.currency_to} Exchange
                      </Typography>
                      <Typography variant="caption">
                        {formatTime(transaction.created_at)} • Rate: ₦{transaction.agreed_rate.toLocaleString()}
                      </Typography>
                    </div>
                  </div>
                  <div className="text-right">
                    <Typography variant="body" className={`font-semibold text-[var(--zone4-success)]`}>
                      +{formatCurrency(transaction.amount_received)}
                    </Typography>
                    <div className={`flex items-center justify-end space-x-1 ${getStatusColor(transaction.status)}`}>
                      <Typography variant="caption" className="capitalize">
                        {getStatusLabel(transaction.status)}
                      </Typography>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Support Actions */}
      <div className="container-mobile mb-6">
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<MessageCircle className="w-4 h-4" />}
            onClick={onDisputeTracking}
          >
            My Disputes
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Bell className="w-4 h-4" />}
          >
            Support
          </Button>
        </div>
      </div>

      {/* Notifications */}
      <div className="container-mobile mb-6">
        <Card padding="normal" variant="outlined" className="border-[var(--zone4-accent)]/20 bg-[var(--zone4-accent)]/5">
          <div className="flex items-start space-x-3">
            <Bell className="w-5 h-5 text-[var(--zone4-accent)] mt-0.5" />
            <div className="flex-1">
              <Typography variant="body" className="font-medium mb-1">
                Security Tip
              </Typography>
              <Typography variant="caption">
                Always verify agent credentials before completing exchanges. Look for the verified badge and check ratings.
              </Typography>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};