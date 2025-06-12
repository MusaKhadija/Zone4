'use client';

import React, { useState } from 'react';
import { Card } from './shared/Card';
import { Button } from './shared/Button';
import { Typography } from './shared/Typography';
import { Input } from './shared/Input';
import { 
  AlertTriangle, 
  Upload, 
  X, 
  FileText, 
  Image, 
  ArrowLeft,
  CheckCircle,
  Camera
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface DisputeInitiationScreenProps {
  transactionId: string;
  onBack: () => void;
  onSuccess: (disputeId: string) => void;
}

interface EvidenceFile {
  id: string;
  file: File;
  preview?: string;
  uploading?: boolean;
  uploaded?: boolean;
  url?: string;
}

export const DisputeInitiationScreen: React.FC<DisputeInitiationScreenProps> = ({
  transactionId,
  onBack,
  onSuccess,
}) => {
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const issueTypes = [
    { value: 'rate_discrepancy', label: 'Rate Discrepancy' },
    { value: 'payment_not_received', label: 'Payment Not Received' },
    { value: 'incorrect_amount', label: 'Incorrect Amount' },
    { value: 'agent_unresponsive', label: 'Agent Unresponsive' },
    { value: 'fraudulent_activity', label: 'Fraudulent Activity' },
    { value: 'other', label: 'Other Issue' },
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      // Validate file type and size
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        setError('Only images and PDF files are allowed');
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size must be less than 5MB');
        return;
      }

      const newFile: EvidenceFile = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        uploading: false,
        uploaded: false,
      };

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setEvidenceFiles(prev => 
            prev.map(f => f.id === newFile.id ? { ...f, preview: e.target?.result as string } : f)
          );
        };
        reader.readAsDataURL(file);
      }

      setEvidenceFiles(prev => [...prev, newFile]);
    });

    // Reset input
    event.target.value = '';
  };

  const removeFile = (fileId: string) => {
    setEvidenceFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = `dispute-evidence/${fileName}`;

    const { data, error } = await supabase.storage
      .from('evidence')
      .upload(filePath, file);

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('evidence')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async () => {
    setError(null);

    // Validation
    if (!issueType) {
      setError('Please select an issue type');
      return;
    }

    if (!description.trim()) {
      setError('Please provide a description of the issue');
      return;
    }

    if (description.trim().length < 10) {
      setError('Description must be at least 10 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Upload evidence files
      const evidenceUrls: string[] = [];
      
      for (const evidenceFile of evidenceFiles) {
        try {
          // Update file status to uploading
          setEvidenceFiles(prev => 
            prev.map(f => f.id === evidenceFile.id ? { ...f, uploading: true } : f)
          );

          const url = await uploadFile(evidenceFile.file);
          evidenceUrls.push(url);

          // Update file status to uploaded
          setEvidenceFiles(prev => 
            prev.map(f => f.id === evidenceFile.id ? { ...f, uploading: false, uploaded: true, url } : f)
          );
        } catch (uploadError) {
          console.error('File upload error:', uploadError);
          setEvidenceFiles(prev => 
            prev.map(f => f.id === evidenceFile.id ? { ...f, uploading: false } : f)
          );
          throw new Error(`Failed to upload ${evidenceFile.file.name}`);
        }
      }

      // Create dispute record
      const { data: dispute, error: disputeError } = await supabase
        .from('disputes')
        .insert({
          transaction_id: transactionId,
          reported_by_user_id: user.id,
          issue_type: issueType,
          description: description.trim(),
          evidence_urls: evidenceUrls,
          status: 'open'
        })
        .select()
        .single();

      if (disputeError) {
        throw new Error(`Failed to create dispute: ${disputeError.message}`);
      }

      if (!dispute) {
        throw new Error('Dispute creation failed');
      }

      // Update transaction with dispute reference
      const { error: transactionError } = await supabase
        .from('transactions')
        .update({
          dispute_id: dispute.id,
          status: 'disputed'
        })
        .eq('id', transactionId);

      if (transactionError) {
        console.error('Failed to update transaction:', transactionError);
        // Don't throw here as dispute was created successfully
      }

      onSuccess(dispute.id);

    } catch (err) {
      console.error('Dispute submission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit dispute');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = issueType && description.trim().length >= 10;

  return (
    <div className="container-mobile py-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={onBack}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Typography variant="h2">
          Report an Issue
        </Typography>
      </div>

      {/* Error Message */}
      {error && (
        <Card padding="normal" variant="outlined" className="mb-6 border-[var(--zone4-error)]/20 bg-[var(--zone4-error)]/5">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-[var(--zone4-error)] mt-0.5" />
            <Typography variant="body" className="text-[var(--zone4-error)]">
              {error}
            </Typography>
          </div>
        </Card>
      )}

      {/* Transaction Info */}
      <Card padding="normal" variant="outlined" className="mb-6 border-[var(--zone4-accent)]/20 bg-[var(--zone4-accent)]/5">
        <Typography variant="body" className="font-medium mb-1">
          Transaction ID: {transactionId.slice(0, 8)}...
        </Typography>
        <Typography variant="caption">
          Reporting an issue with this transaction will pause all related activities until resolved.
        </Typography>
      </Card>

      {/* Issue Type Selection */}
      <Card padding="large" variant="elevated" className="mb-6">
        <Typography variant="h3" className="mb-4">
          What's the issue?
        </Typography>
        
        <div className="space-y-3">
          {issueTypes.map((type) => (
            <label
              key={type.value}
              className={`flex items-center space-x-3 p-3 rounded-[var(--zone4-radius)] border cursor-pointer transition-all ${
                issueType === type.value
                  ? 'border-[var(--zone4-accent)] bg-[var(--zone4-accent)]/5'
                  : 'border-[var(--zone4-border)] hover:border-[var(--zone4-accent)]/50'
              }`}
            >
              <input
                type="radio"
                name="issueType"
                value={type.value}
                checked={issueType === type.value}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-4 h-4 text-[var(--zone4-accent)] border-gray-300 focus:ring-[var(--zone4-accent)]"
                disabled={isSubmitting}
              />
              <Typography variant="body">
                {type.label}
              </Typography>
            </label>
          ))}
        </div>
      </Card>

      {/* Description */}
      <Card padding="large" variant="elevated" className="mb-6">
        <Typography variant="h3" className="mb-4">
          Describe the issue
        </Typography>
        
        <textarea
          placeholder="Please provide detailed information about the issue you're experiencing..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSubmitting}
          className="w-full px-4 py-3 rounded-[var(--zone4-radius)] border border-[var(--zone4-border)] focus:outline-none focus:ring-2 focus:ring-[var(--zone4-accent)]/30 focus:border-[var(--zone4-accent)] resize-none disabled:opacity-50"
          rows={4}
        />
        
        <Typography variant="caption" className="text-[var(--zone4-text-muted)] mt-2 block">
          {description.length}/500 characters (minimum 10 required)
        </Typography>
      </Card>

      {/* Evidence Upload */}
      <Card padding="large" variant="elevated" className="mb-6">
        <Typography variant="h3" className="mb-4">
          Upload Evidence (Optional)
        </Typography>
        
        <Typography variant="body" className="text-[var(--zone4-text-muted)] mb-4">
          Upload screenshots, photos, or documents that support your case
        </Typography>

        {/* File Upload Area */}
        <div className="border-2 border-dashed border-[var(--zone4-border)] rounded-[var(--zone4-radius)] p-6 text-center mb-4">
          <Upload className="w-8 h-8 text-[var(--zone4-text-muted)] mx-auto mb-2" />
          <Typography variant="body" className="mb-2">
            Drag and drop files here, or click to select
          </Typography>
          <Typography variant="caption" className="text-[var(--zone4-text-muted)] mb-4">
            Supports: Images (JPG, PNG) and PDF files up to 5MB each
          </Typography>
          
          <input
            type="file"
            multiple
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            disabled={isSubmitting}
            className="hidden"
            id="evidence-upload"
          />
          
          <label htmlFor="evidence-upload">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Camera className="w-4 h-4" />}
              disabled={isSubmitting}
            >
              Select Files
            </Button>
          </label>
        </div>

        {/* File List */}
        {evidenceFiles.length > 0 && (
          <div className="space-y-3">
            {evidenceFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-[var(--zone4-radius)]"
              >
                <div className="w-10 h-10 bg-[var(--zone4-accent)]/10 rounded flex items-center justify-center">
                  {file.file.type.startsWith('image/') ? (
                    <Image className="w-5 h-5 text-[var(--zone4-accent)]" />
                  ) : (
                    <FileText className="w-5 h-5 text-[var(--zone4-accent)]" />
                  )}
                </div>
                
                <div className="flex-1">
                  <Typography variant="body" className="font-medium">
                    {file.file.name}
                  </Typography>
                  <Typography variant="caption" className="text-[var(--zone4-text-muted)]">
                    {(file.file.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                </div>

                <div className="flex items-center space-x-2">
                  {file.uploading && (
                    <div className="w-4 h-4 border-2 border-[var(--zone4-accent)] border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {file.uploaded && (
                    <CheckCircle className="w-4 h-4 text-[var(--zone4-success)]" />
                  )}
                  {!isSubmitting && (
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1 hover:bg-gray-200 rounded"
                      aria-label="Remove file"
                    >
                      <X className="w-4 h-4 text-[var(--zone4-text-muted)]" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Submit Button */}
      <div className="space-y-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!isFormValid || isSubmitting}
          loading={isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? 'Submitting Dispute...' : 'Submit Dispute'}
        </Button>

        <Typography variant="caption" className="text-center text-[var(--zone4-text-muted)] block">
          By submitting this dispute, you agree that all information provided is accurate and truthful.
        </Typography>
      </div>
    </div>
  );
};