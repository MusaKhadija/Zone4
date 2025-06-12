'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { Typography } from '../shared/Typography';
import { Input } from '../shared/Input';
import { 
  Search, 
  Filter, 
  Calendar, 
  ChevronDown, 
  MoreVertical,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Eye,
  ArrowLeft,
  Shield
} from 'lucide-react';
import { supabase, Transaction } from '@/lib/supabase';

interface TransactionHistoryScreenProps {
  onBack: () => void;
}

export const TransactionHistoryScreen: React.FC<TransactionHistoryScreenProps> = ({
  onBack,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currencyFilter, setCurrencyFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const itemsPerPage = 5;

  useEffect(() => {
    fetchTransactions();
  }, [searchTerm, statusFilter, currencyFilter, dateFilter, currentPage]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Build the query
      let query = supabase
        .from('transactions')
        .select(`
          *,
          bdc_agents (
            company_name,
            average_rating
          )
        `, { count: 'exact' })
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      // Apply search filter
      if (searchTerm.trim()) {
        query = query.or(`id.ilike.%${searchTerm}%,currency_from.ilike.%${searchTerm}%,currency_to.ilike.%${searchTerm}%`);
      }

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      // Apply currency filter
      if (currencyFilter !== 'all') {
        query = query.or(`currency_from.eq.${currencyFilter},currency_to.eq.${currencyFilter}`);
      }

      // Apply date filter
      if (dateFilter !== 'all') {
        const now = new Date();
        let startDate: Date;

        switch (dateFilter) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
          default:
            startDate = new Date(0);
        }

        query = query.gte('created_at', startDate.toISOString());
      }

      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error: fetchError, count } = await query;

      if (fetchError) {
        throw new Error(`Failed to fetch transactions: ${fetchError.message}`);
      }

      setTransactions(data || []);
      setTotalCount(count || 0);

    } catch (err) {
      console.error('Transaction history fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transaction history');
      setTransactions([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-[var(--zone4-success)]" />;
      case 'funds_in_escrow':
        return <Shield className="w-4 h-4 text-[var(--zone4-warning)]" />;
      case 'cancelled':
      case 'disputed':
        return <AlertTriangle className="w-4 h-4 text-[var(--zone4-error)]" />;
      default:
        return <Clock className="w-4 h-4 text-[var(--zone4-text-muted)]" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-[var(--zone4-success)]/10 text-[var(--zone4-success)]';
      case 'funds_in_escrow':
        return 'bg-[var(--zone4-warning)]/10 text-[var(--zone4-warning)]';
      case 'cancelled':
      case 'disputed':
        return 'bg-[var(--zone4-error)]/10 text-[var(--zone4-error)]';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handleViewDetails = (transactionId: string) => {
    console.log('View details for:', transactionId);
  };

  const handleDownloadReceipt = (transactionId: string) => {
    console.log('Download receipt for:', transactionId);
  };

  return (
    <div className="container-mobile py-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={onBack}
        >
          Back
        </Button>
        <Typography variant="h2">
          Transaction History
        </Typography>
      </div>

      {/* Search and Filters */}
      <Card padding="large" variant="elevated" className="mb-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <Input
            placeholder="Search by ID, agent, or currency..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-5 h-5" />}
          />

          {/* Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Filter className="w-4 h-4" />}
            rightIcon={<ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[var(--zone4-border)]">
              <div>
                <Typography variant="caption" className="mb-2 block">
                  Status
                </Typography>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-[var(--zone4-border)] text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="funds_in_escrow">In Escrow</option>
                  <option value="pending_agent_offer">Pending</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="disputed">Disputed</option>
                </select>
              </div>

              <div>
                <Typography variant="caption" className="mb-2 block">
                  Currency
                </Typography>
                <select
                  value={currencyFilter}
                  onChange={(e) => setCurrencyFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-[var(--zone4-border)] text-sm"
                >
                  <option value="all">All Currencies</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                  <option value="EUR">EUR</option>
                  <option value="NGN">NGN</option>
                </select>
              </div>

              <div>
                <Typography variant="caption" className="mb-2 block">
                  Date Range
                </Typography>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-[var(--zone4-border)] text-sm"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between mb-4">
        <Typography variant="caption" className="text-[var(--zone4-text-muted)]">
          Showing {transactions.length} of {totalCount} transactions
        </Typography>
        {totalPages > 1 && (
          <Typography variant="caption" className="text-[var(--zone4-accent)]">
            Page {currentPage} of {totalPages}
          </Typography>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[var(--zone4-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <Typography variant="body" className="text-[var(--zone4-text-muted)]">
              Loading transactions...
            </Typography>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card padding="large" variant="outlined" className="border-[var(--zone4-error)]/20 bg-[var(--zone4-error)]/5">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-[var(--zone4-error)] mt-0.5" />
            <div>
              <Typography variant="body" className="font-medium mb-1 text-[var(--zone4-error)]">
                Failed to load transactions
              </Typography>
              <Typography variant="caption" className="text-[var(--zone4-error)]">
                {error}
              </Typography>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={fetchTransactions}
              >
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Transaction List */}
      {!loading && !error && (
        <>
          {transactions.length === 0 ? (
            <Card padding="large" variant="elevated" className="text-center">
              <Typography variant="h3" className="mb-2 text-[var(--zone4-text-muted)]">
                No transactions found
              </Typography>
              <Typography variant="body" className="text-[var(--zone4-text-muted)]">
                Try adjusting your search or filter criteria
              </Typography>
            </Card>
          ) : (
            <div className="space-y-4 mb-6">
              {transactions.map((transaction) => (
                <Card
                  key={transaction.id}
                  padding="large"
                  variant="elevated"
                  className="hover:scale-[1.01] transition-transform cursor-pointer"
                  onClick={() => handleViewDetails(transaction.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(transaction.status)}
                      <div>
                        <Typography variant="body" className="font-semibold">
                          {transaction.currency_from} → {transaction.currency_to}
                        </Typography>
                        <Typography variant="caption" className="text-[var(--zone4-text-muted)]">
                          {formatDate(transaction.created_at)}
                        </Typography>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {getStatusLabel(transaction.status)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Show action menu
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                        aria-label="More actions"
                      >
                        <MoreVertical className="w-4 h-4 text-[var(--zone4-text-muted)]" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <Typography variant="caption" className="text-[var(--zone4-text-muted)]">
                        Amount Sent
                      </Typography>
                      <Typography variant="body" className="font-semibold">
                        {transaction.amount_sent} {transaction.currency_from}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="caption" className="text-[var(--zone4-text-muted)]">
                        Amount Received
                      </Typography>
                      <Typography variant="body" className="font-semibold">
                        {transaction.status === 'completed' 
                          ? `₦${transaction.amount_received.toLocaleString()}`
                          : transaction.status === 'funds_in_escrow'
                          ? 'In Escrow'
                          : 'Pending'
                        }
                      </Typography>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Typography variant="caption" className="text-[var(--zone4-text-muted)]">
                        Agent: {transaction.bdc_agents?.company_name || 'Unknown Agent'}
                      </Typography>
                      <Typography variant="caption" className="block text-[var(--zone4-text-muted)]">
                        ID: {transaction.id.slice(0, 8)}...
                      </Typography>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Eye className="w-3 h-3" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(transaction.id);
                        }}
                      >
                        View
                      </Button>
                      {transaction.status === 'completed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Download className="w-3 h-3" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadReceipt(transaction.id);
                          }}
                        >
                          Receipt
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                Previous
              </Button>
              
              <div className="flex items-center space-x-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-[var(--zone4-accent)] text-white'
                          : 'hover:bg-gray-100 text-[var(--zone4-text-muted)]'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};