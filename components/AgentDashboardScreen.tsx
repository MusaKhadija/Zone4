'use client';

import React, { useState, useEffect } from 'react';
import { Card } from './shared/Card';
import { Button } from './shared/Button';
import { Typography } from './shared/Typography';
import { 
  TrendingUp, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  Star,
  Shield,
  Eye,
  EyeOff,
  Bell,
  DollarSign,
  Activity
} from 'lucide-react';
import { supabase, Profile, ExchangeRate, Transaction } from '@/lib/supabase';

interface AgentDashboardScreenProps {
  onViewOffer?: (transactionId: string) => void;
  onManageRates?: () => void;
  onViewTransactions?: () => void;
}

interface BDCAgent {
  id: string;
  company_name: string;
  cbn_license_number: string;
  company_address: string;
  average_rating: number;
  total_reviews: number;
  transactions_completed: number;
  is_verified_agent: boolean;
  created_at: string;
  updated_at: string;
}

export const AgentDashboardScreen: React.FC<AgentDashboardScreenProps> = ({
  onViewOffer,
  onManageRates,
  onViewTransactions
}) => {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [agentProfile, setAgentProfile] = useState<BDCAgent | null>(null);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [newRequests, setNewRequests] = useState<Transaction[]>([]);
  const [activeTransactions, setActiveTransactions] = useState<Transaction[]>([]);
  const [completedTransactions, setCompletedTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchAgentDashboardData();
  }, []);

  const fetchAgentDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw new Error(`Failed to fetch profile: ${profileError.message}`);
      }

      if (profile.account_type !== 'bdc_agent') {
        throw new Error('Access denied: User is not a BDC agent');
      }

      setUserProfile(profile);

      // Fetch BDC agent details
      const { data: agent, error: agentError } = await supabase
        .from('bdc_agents')
        .select('*')
        .eq('id', user.id)
        .single();

      if (agentError) {
        console.error('Failed to fetch agent details:', agentError);
        // Agent profile might not exist yet, continue without it
      } else {
        setAgentProfile(agent);
      }

      // Fetch agent's exchange rates
      const { data: rates, error: ratesError } = await supabase
        .from('exchange_rates')
        .select('*')
        .eq('agent_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (ratesError) {
        console.error('Failed to fetch exchange rates:', ratesError);
        setExchangeRates([]);
      } else {
        setExchangeRates(rates || []);
      }

      // Fetch new exchange requests (pending agent offer)
      const { data: requests, error: requestsError } = await supabase
        .from('transactions')
        .select(`
          *,
          profiles!transactions_customer_id_fkey (
            full_name,
            kyc_status
          )
        `)
        .eq('agent_id', user.id)
        .eq('status', 'pending_agent_offer')
        .order('created_at', { ascending: false })
        .limit(5);

      if (requestsError) {
        console.error('Failed to fetch new requests:', requestsError);
        setNewRequests([]);
      } else {
        setNewRequests(requests || []);
      }

      // Fetch active transactions (not completed, cancelled, or disputed)
      const { data: active, error: activeError } = await supabase
        .from('transactions')
        .select(`
          *,
          profiles!transactions_customer_id_fkey (
            full_name
          )
        `)
        .eq('agent_id', user.id)
        .not('status', 'in', '(completed,cancelled,disputed)')
        .neq('status', 'pending_agent_offer')
        .order('created_at', { ascending: false })
        .limit(5);

      if (activeError) {
        console.error('Failed to fetch active transactions:', activeError);
        setActiveTransactions([]);
      } else {
        setActiveTransactions(active || []);
      }

      // Fetch completed transactions
      const { data: completed, error: completedError } = await supabase
        .from('transactions')
        .select(`
          *,
          profiles!transactions_customer_id_fkey (
            full_name
          )
        `)
        .eq('agent_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(3);

      if (completedError) {
        console.error('Failed to fetch completed transactions:', completedError);
        setCompletedTransactions([]);
      } else {
        setCompletedTransactions(completed || []);
      }

    } catch (err) {
      console.error('Agent dashboard data fetch error:', err);
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
      case 'offer_accepted': return 'text-[var(--zone4-accent)]';
      default: return 'text-[var(--zone4-text-muted)]';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'funds_in_escrow': return <Shield className="w-4 h-4" />;
      case 'offer_accepted': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_agent_offer': return 'Pending Offer';
      case 'offer_accepted': return 'Offer Accepted';
      case 'funds_in_escrow': return 'In Escrow';
      case 'fx_transferred_by_agent': return 'Transferred';
      case 'fx_received_by_customer': return 'Received';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'disputed': return 'Disputed';
      default: return status;
    }
  };

  // Mock earnings for now - in a real app this would come from financial calculations
  const mockEarnings = 125000;

  if (loading) {
    return (
      <div className="container-mobile flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--zone4-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <Typography variant="body" className="text-[var(--zone4-text-muted)]">
            Loading agent dashboard...
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
                Failed to load agent dashboard
              </Typography>
              <Typography variant="caption" className="text-[var(--zone4-error)]">
                {error}
              </Typography>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={fetchAgentDashboardData}
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
      {/* Agent Profile Card */}
      <div className="container-mobile pt-6 pb-4">
        <Card padding="large" variant="elevated" className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Typography variant="caption" className="mb-1">
                Welcome back, {userProfile?.full_name?.split(' ')[0] || 'Agent'}
              </Typography>
              <Typography variant="h3" className="font-bold mb-1">
                {agentProfile?.company_name || 'BDC Agent'}
              </Typography>
              <div className="flex items-center space-x-3">
                <Typography variant="caption" className="mb-1 block">
                  Monthly Earnings
                </Typography>
                <button
                  onClick={() => setBalanceVisible(!balanceVisible)}
                  className="p-1 hover:bg-gray-100 rounded touch-target"
                  aria-label={balanceVisible ? "Hide earnings" : "Show earnings"}
                >
                  {balanceVisible ? (
                    <EyeOff className="w-4 h-4 text-[var(--zone4-text-muted)]" />
                  ) : (
                    <Eye className="w-4 h-4 text-[var(--zone4-text-muted)]" />
                  )}
                </button>
              </div>
              <Typography variant="h2" className="font-bold">
                {balanceVisible ? formatCurrency(mockEarnings) : "₦***,***"}
              </Typography>
            </div>
            <div className="text-right">
              {agentProfile?.is_verified_agent && (
                <div className="flex items-center space-x-1 bg-[var(--zone4-success)]/10 px-3 py-1 rounded-full mb-2">
                  <CheckCircle className="w-4 h-4 text-[var(--zone4-success)]" />
                  <Typography variant="caption" className="text-[var(--zone4-success)] font-medium">
                    Verified Agent
                  </Typography>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <Typography variant="caption">
                  {agentProfile?.average_rating?.toFixed(1) || '0.0'} ({agentProfile?.total_reviews || 0})
                </Typography>
              </div>
            </div>
          </div>
          
          <Typography variant="caption" className="flex items-center space-x-1">
            <span>Last updated:</span>
            <span className="font-medium">{currentTime.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}</span>
          </Typography>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card padding="normal" variant="elevated" className="text-center">
            <Users className="w-6 h-6 text-[var(--zone4-accent)] mx-auto mb-2" />
            <Typography variant="h3" className="font-bold">
              {newRequests.length}
            </Typography>
            <Typography variant="caption" className="text-[var(--zone4-text-muted)]">
              New Requests
            </Typography>
          </Card>
          
          <Card padding="normal" variant="elevated" className="text-center">
            <Activity className="w-6 h-6 text-[var(--zone4-warning)] mx-auto mb-2" />
            <Typography variant="h3" className="font-bold">
              {activeTransactions.length}
            </Typography>
            <Typography variant="caption" className="text-[var(--zone4-text-muted)]">
              Active
            </Typography>
          </Card>
          
          <Card padding="normal" variant="elevated" className="text-center">
            <CheckCircle className="w-6 h-6 text-[var(--zone4-success)] mx-auto mb-2" />
            <Typography variant="h3" className="font-bold">
              {agentProfile?.transactions_completed || 0}
            </Typography>
            <Typography variant="caption" className="text-[var(--zone4-text-muted)]">
              Completed
            </Typography>
          </Card>
        </div>
      </div>

      {/* Current Exchange Rates */}
      <div className="container-mobile mb-6">
        <div className="flex items-center justify-between mb-4">
          <Typography variant="h3">Your Exchange Rates</Typography>
          <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />} onClick={onManageRates}>
            Manage
          </Button>
        </div>

        {exchangeRates.length === 0 ? (
          <Card padding="large" variant="elevated">
            <div className="text-center">
              <DollarSign className="w-12 h-12 text-[var(--zone4-text-muted)] mx-auto mb-4" />
              <Typography variant="body" className="text-[var(--zone4-text-muted)] mb-2">
                No active exchange rates
              </Typography>
              <Typography variant="caption" className="text-[var(--zone4-text-muted)]">
                Set up your rates to start receiving exchange requests
              </Typography>
              <Button variant="primary" size="sm" className="mt-4" onClick={onManageRates}>
                Add Exchange Rates
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {exchangeRates.slice(0, 3).map((rate) => (
              <Card key={rate.id} padding="normal" variant="elevated">
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
                      <Typography variant="caption" className="text-[var(--zone4-text-muted)]">
                        Range: {rate.min_amount} - {rate.max_amount} {rate.currency_from}
                      </Typography>
                    </div>
                  </div>
                  <div className="text-right">
                    <Typography variant="body" className="font-semibold">
                      ₦{rate.rate.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" className="text-[var(--zone4-success)]">
                      Active
                    </Typography>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* New Exchange Requests */}
      <div className="container-mobile mb-6">
        <div className="flex items-center justify-between mb-4">
          <Typography variant="h3">New Exchange Requests</Typography>
          <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />} onClick={onViewTransactions}>
            View All
          </Button>
        </div>

        {newRequests.length === 0 ? (
          <Card padding="large" variant="elevated">
            <div className="text-center">
              <Typography variant="body" className="text-[var(--zone4-text-muted)] mb-2">
                No new requests
              </Typography>
              <Typography variant="caption" className="text-[var(--zone4-text-muted)]">
                New exchange requests will appear here
              </Typography>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {newRequests.map((request) => (
              <Card key={request.id} padding="normal" variant="elevated" className="cursor-pointer hover:scale-[1.01]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[var(--zone4-warning)]/10 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-[var(--zone4-warning)]" />
                    </div>
                    <div>
                      <Typography variant="body" className="font-medium">
                        {request.currency_from} to {request.currency_to}
                      </Typography>
                      <Typography variant="caption" className="text-[var(--zone4-text-muted)]">
                        {(request as any).profiles?.full_name || 'Customer'} • {formatTime(request.created_at)}
                      </Typography>
                    </div>
                  </div>
                  <div className="text-right">
                    <Typography variant="body" className="font-semibold">
                      {request.amount_sent} {request.currency_from}
                    </Typography>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onViewOffer?.(request.id)}
                    >
                      Make Offer
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Active Transactions */}
      <div className="container-mobile mb-6">
        <div className="flex items-center justify-between mb-4">
          <Typography variant="h3">Active Transactions</Typography>
          <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />} onClick={onViewTransactions}>
            View All
          </Button>
        </div>

        {activeTransactions.length === 0 ? (
          <Card padding="large" variant="elevated">
            <div className="text-center">
              <Typography variant="body" className="text-[var(--zone4-text-muted)]">
                No active transactions
              </Typography>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {activeTransactions.map((transaction) => (
              <Card key={transaction.id} padding="normal" variant="elevated">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`flex items-center justify-center ${getStatusColor(transaction.status)}`}>
                      {getStatusIcon(transaction.status)}
                    </div>
                    <div>
                      <Typography variant="body" className="font-medium">
                        {transaction.currency_from} to {transaction.currency_to}
                      </Typography>
                      <Typography variant="caption">
                        {(transaction as any).profiles?.full_name || 'Customer'} • {formatTime(transaction.created_at)}
                      </Typography>
                    </div>
                  </div>
                  <div className="text-right">
                    <Typography variant="body" className="font-semibold">
                      {formatCurrency(transaction.amount_received)}
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

      {/* Recent Completed Transactions */}
      <div className="container-mobile mb-6">
        <div className="flex items-center justify-between mb-4">
          <Typography variant="h3">Recent Completed</Typography>
          <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />} onClick={onViewTransactions}>
            View All
          </Button>
        </div>

        {completedTransactions.length === 0 ? (
          <Card padding="large" variant="elevated">
            <div className="text-center">
              <Typography variant="body" className="text-[var(--zone4-text-muted)]">
                No completed transactions yet
              </Typography>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {completedTransactions.map((transaction) => (
              <Card key={transaction.id} padding="normal" variant="elevated">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-[var(--zone4-success)]" />
                    <div>
                      <Typography variant="body" className="font-medium">
                        {transaction.currency_from} to {transaction.currency_to}
                      </Typography>
                      <Typography variant="caption">
                        {(transaction as any).profiles?.full_name || 'Customer'} • {formatTime(transaction.created_at)}
                      </Typography>
                    </div>
                  </div>
                  <div className="text-right">
                    <Typography variant="body" className="font-semibold text-[var(--zone4-success)]">
                      +{formatCurrency(transaction.zone4_fee)}
                    </Typography>
                    <Typography variant="caption" className="text-[var(--zone4-success)]">
                      Commission
                    </Typography>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Agent Tips */}
      <div className="container-mobile mb-6">
        <Card padding="normal" variant="outlined" className="border-[var(--zone4-accent)]/20 bg-[var(--zone4-accent)]/5">
          <div className="flex items-start space-x-3">
            <Bell className="w-5 h-5 text-[var(--zone4-accent)] mt-0.5" />
            <div className="flex-1">
              <Typography variant="body" className="font-medium mb-1">
                Agent Tip
              </Typography>
              <Typography variant="caption">
                Respond to exchange requests quickly to improve your rating. Customers prefer agents with fast response times.
              </Typography>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};