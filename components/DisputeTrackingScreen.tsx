'use client';

import React, { useState, useEffect } from 'react';
import { Card } from './shared/Card';
import { Button } from './shared/Button';
import { Typography } from './shared/Typography';
import { 
  ArrowLeft, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Eye, 
  FileText, 
  Image,
  ExternalLink,
  Filter,
  Search
} from 'lucide-react';
import { Input } from './shared/Input';
import { supabase } from '@/lib/supabase';

interface DisputeTrackingScreenProps {
  onBack: () => void;
  onViewDispute?: (disputeId: string) => void;
}

interface Dispute {
  id: string;
  transaction_id: string;
  issue_type: string;
  description: string;
  evidence_urls: string[];
  status: 'open' | 'under_review' | 'resolved' | 'escalated';
  resolution?: string;
  created_at: string;
  updated_at: string;
  transactions?: {
    currency_from: string;
    currency_to: string;
    amount_sent: number;
    bdc_agents?: {
      company_name: string;
    };
  };
}

export const DisputeTrackingScreen: React.FC<DisputeTrackingScreenProps> = ({
  onBack,
  onViewDispute,
}) => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Fetch disputes with transaction details
      const { data: disputesData, error: disputesError } = await supabase
        .from('disputes')
        .select(`
          *,
          transactions (
            currency_from,
            currency_to,
            amount_sent,
            bdc_agents (
              company_name
            )
          )
        `)
        .eq('reported_by_user_id', user.id)
        .order('created_at', { ascending: false });

      if (disputesError) {
        throw new Error(`Failed to fetch disputes: ${disputesError.message}`);
      }

      setDisputes(disputesData || []);

    } catch (err) {
      console.error('Disputes fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load disputes');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="w-4 h-4 text-[var(--zone4-warning)]" />;
      case 'under_review':
        return <Eye className="w-4 h-4 text-[var(--zone4-accent)]" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-[var(--zone4-success)]" />;
      case 'escalated':
        return <AlertTriangle className="w-4 h-4 text-[var(--zone4-error)]" />;
      default:
        return <Clock className="w-4 h-4 text-[var(--zone4-text-muted)]" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-[var(--zone4-warning)]/10 text-[var(--zone4-warning)]';
      case 'under_review':
        return 'bg-[var(--zone4-accent)]/10 text-[var(--zone4-accent)]';
      case 'resolved':
        return 'bg-[var(--zone4-success)]/10 text-[var(--zone4-success)]';
      case 'escalated':
        return 'bg-[var(--zone4-error)]/10 text-[var(--zone4-error)]';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'Open';
      case 'under_review':
        return 'Under Review';
      case 'resolved':
        return 'Resolved';
      case 'escalated':
        return 'Escalated';
      default:
        return status;
    }
  };

  const getIssueTypeLabel = (issueType: string) => {
    const labels: Record<string, string> = {
      'rate_discrepancy': 'Rate Discrepancy',
      'payment_not_received': 'Payment Not Received',
      'incorrect_amount': 'Incorrect Amount',
      'agent_unresponsive': 'Agent Unresponsive',
      'fraudulent_activity': 'Fraudulent Activity',
      'other': 'Other Issue',
    };
    return labels[issueType] || issueType;
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

  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch = searchTerm === '' || 
      dispute.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getIssueTypeLabel(dispute.issue_type).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || dispute.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (dispute: Dispute) => {
    setSelectedDispute(dispute);
  };

  const handleCloseDetails = () => {
    setSelectedDispute(null);
  };

  if (selectedDispute) {
    return (
      <div className="container-mobile py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={handleCloseDetails}
          >
            Back to Disputes
          </Button>
          <Typography variant="h2">
            Dispute Details
          </Typography>
        </div>

        {/* Dispute Info */}
        <Card padding="large" variant="elevated" className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Typography variant="h3" className="mb-1">
                {getIssueTypeLabel(selectedDispute.issue_type)}
              </Typography>
              <Typography variant="caption" className="text-[var(--zone4-text-muted)]">
                Dispute ID: {selectedDispute.id.slice(0, 8)}...
              </Typography>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedDispute.status)}`}>
              {getStatusLabel(selectedDispute.status)}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <Typography variant="caption" className="text-[var(--zone4-text-muted)]">
                Transaction ID
              </Typography>
              <Typography variant="body" className="font-mono text-sm">
                {selectedDispute.transaction_id}
              </Typography>
            </div>

            {selectedDispute.transactions && (
              <div>
                <Typography variant="caption" className="text-[var(--zone4-text-muted)]">
                  Transaction Details
                </Typography>
                <Typography variant="body">
                  {selectedDispute.transactions.amount_sent} {selectedDispute.transactions.currency_from} → {selectedDispute.transactions.currency_to}
                </Typography>
                <Typography variant="caption" className="text-[var(--zone4-text-muted)]">
                  Agent: {selectedDispute.transactions.bdc_agents?.company_name || 'Unknown'}
                </Typography>
              </div>
            )}

            <div>
              <Typography variant="caption" className="text-[var(--zone4-text-muted)]">
                Reported
              </Typography>
              <Typography variant="body">
                {formatDate(selectedDispute.created_at)}
              </Typography>
            </div>

            <div>
              <Typography variant="caption" className="text-[var(--zone4-text-muted)]">
                Last Updated
              </Typography>
              <Typography variant="body">
                {formatDate(selectedDispute.updated_at)}
              </Typography>
            </div>
          </div>
        </Card>

        {/* Description */}
        <Card padding="large" variant="elevated" className="mb-6">
          <Typography variant="h3" className="mb-3">
            Issue Description
          </Typography>
          <Typography variant="body" className="whitespace-pre-wrap">
            {selectedDispute.description}
          </Typography>
        </Card>

        {/* Evidence */}
        {selectedDispute.evidence_urls && selectedDispute.evidence_urls.length > 0 && (
          <Card padding="large" variant="elevated" className="mb-6">
            <Typography variant="h3" className="mb-3">
              Evidence ({selectedDispute.evidence_urls.length})
            </Typography>
            <div className="grid grid-cols-2 gap-3">
              {selectedDispute.evidence_urls.map((url, index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 p-3 border border-[var(--zone4-border)] rounded-[var(--zone4-radius)] hover:border-[var(--zone4-accent)] transition-colors"
                >
                  {url.includes('.pdf') ? (
                    <FileText className="w-5 h-5 text-[var(--zone4-accent)]" />
                  ) : (
                    <Image className="w-5 h-5 text-[var(--zone4-accent)]" />
                  )}
                  <Typography variant="caption" className="flex-1 truncate">
                    Evidence {index + 1}
                  </Typography>
                  <ExternalLink className="w-4 h-4 text-[var(--zone4-text-muted)]" />
                </a>
              ))}
            </div>
          </Card>
        )}

        {/* Resolution */}
        {selectedDispute.resolution && (
          <Card padding="large" variant="elevated" className="mb-6">
            <Typography variant="h3" className="mb-3">
              Resolution
            </Typography>
            <Typography variant="body" className="whitespace-pre-wrap">
              {selectedDispute.resolution}
            </Typography>
          </Card>
        )}

        {/* Status Timeline */}
        <Card padding="large" variant="elevated">
          <Typography variant="h3" className="mb-3">
            Status Timeline
          </Typography>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[var(--zone4-success)] rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <Typography variant="body" className="font-medium">
                  Dispute Created
                </Typography>
                <Typography variant="caption" className="text-[var(--zone4-text-muted)]">
                  {formatDate(selectedDispute.created_at)}
                </Typography>
              </div>
            </div>

            {selectedDispute.status !== 'open' && (
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  selectedDispute.status === 'under_review' ? 'bg-[var(--zone4-accent)]' : 'bg-[var(--zone4-success)]'
                }`}>
                  {selectedDispute.status === 'under_review' ? (
                    <Eye className="w-4 h-4 text-white" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-white" />
                  )}
                </div>
                <div>
                  <Typography variant="body" className="font-medium">
                    Under Review
                  </Typography>
                  <Typography variant="caption" className="text-[var(--zone4-text-muted)]">
                    Our team is investigating your case
                  </Typography>
                </div>
              </div>
            )}

            {selectedDispute.status === 'resolved' && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[var(--zone4-success)] rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <Typography variant="body" className="font-medium">
                    Resolved
                  </Typography>
                  <Typography variant="caption" className="text-[var(--zone4-text-muted)]">
                    {formatDate(selectedDispute.updated_at)}
                  </Typography>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

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
          My Disputes
        </Typography>
      </div>

      {/* Search and Filter */}
      <Card padding="large" variant="elevated" className="mb-6">
        <div className="space-y-4">
          <Input
            placeholder="Search by dispute ID, transaction ID, or issue type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-5 h-5" />}
          />

          <div className="flex items-center space-x-3">
            <Filter className="w-4 h-4 text-[var(--zone4-text-muted)]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded border border-[var(--zone4-border)] text-sm"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="under_review">Under Review</option>
              <option value="resolved">Resolved</option>
              <option value="escalated">Escalated</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[var(--zone4-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <Typography variant="body" className="text-[var(--zone4-text-muted)]">
              Loading disputes...
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
                Failed to load disputes
              </Typography>
              <Typography variant="caption" className="text-[var(--zone4-error)]">
                {error}
              </Typography>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={fetchDisputes}
              >
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Disputes List */}
      {!loading && !error && (
        <>
          {filteredDisputes.length === 0 ? (
            <Card padding="large" variant="elevated" className="text-center">
              <AlertTriangle className="w-12 h-12 text-[var(--zone4-text-muted)] mx-auto mb-4" />
              <Typography variant="h3" className="mb-2 text-[var(--zone4-text-muted)]">
                {disputes.length === 0 ? 'No disputes found' : 'No matching disputes'}
              </Typography>
              <Typography variant="body" className="text-[var(--zone4-text-muted)]">
                {disputes.length === 0 
                  ? "You haven't reported any issues yet"
                  : "Try adjusting your search or filter criteria"
                }
              </Typography>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredDisputes.map((dispute) => (
                <Card
                  key={dispute.id}
                  padding="large"
                  variant="elevated"
                  className="cursor-pointer hover:scale-[1.01] transition-transform"
                  onClick={() => handleViewDetails(dispute)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(dispute.status)}
                      <div>
                        <Typography variant="body" className="font-semibold">
                          {getIssueTypeLabel(dispute.issue_type)}
                        </Typography>
                        <Typography variant="caption" className="text-[var(--zone4-text-muted)]">
                          {formatDate(dispute.created_at)}
                        </Typography>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(dispute.status)}`}>
                      {getStatusLabel(dispute.status)}
                    </span>
                  </div>

                  <Typography variant="body" className="text-[var(--zone4-text-muted)] mb-3 line-clamp-2">
                    {dispute.description}
                  </Typography>

                  <div className="flex items-center justify-between">
                    <div>
                      <Typography variant="caption" className="text-[var(--zone4-text-muted)]">
                        Transaction: {dispute.transaction_id.slice(0, 8)}...
                      </Typography>
                      {dispute.evidence_urls && dispute.evidence_urls.length > 0 && (
                        <Typography variant="caption" className="block text-[var(--zone4-accent)]">
                          {dispute.evidence_urls.length} evidence file(s)
                        </Typography>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Eye className="w-3 h-3" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(dispute);
                      }}
                    >
                      View
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};