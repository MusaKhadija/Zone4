'use client';

import React, { useState } from 'react';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { Typography } from '../shared/Typography';
import { Input } from '../shared/Input';
import { ArrowRight, MapPin, CreditCard } from 'lucide-react';

interface RecipientDetailsScreenProps {
  onNext: (data: any) => void;
  onBack: () => void;
}

type DeliveryMethod = 'physical' | 'bank';

export const RecipientDetailsScreen: React.FC<RecipientDetailsScreenProps> = ({
  onNext,
  onBack,
}) => {
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('physical');
  const [formData, setFormData] = useState({
    // Physical exchange
    pickupLocation: '',
    preferredTime: '',
    // Bank transfer
    accountName: '',
    accountNumber: '',
    bankName: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    onNext({
      recipientDetails: {
        deliveryMethod,
        formData
      }
    });
  };

  const isFormValid = () => {
    if (deliveryMethod === 'physical') {
      return formData.pickupLocation && formData.preferredTime;
    } else {
      return formData.accountName && formData.accountNumber && formData.bankName;
    }
  };

  return (
    <div className="container-mobile py-8">
      <div className="text-center mb-8">
        <Typography variant="h2" className="mb-4">
          Delivery Details
        </Typography>
        <Typography variant="subtitle" className="text-balance">
          How would you like to receive your currency?
        </Typography>
      </div>

      {/* Delivery Method Selection */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card
          padding="normal"
          variant={deliveryMethod === 'physical' ? "outlined" : "flat"}
          className={`cursor-pointer transition-all ${
            deliveryMethod === 'physical'
              ? 'border-[var(--zone4-accent)] bg-[var(--zone4-accent)]/5'
              : 'hover:bg-gray-50'
          }`}
          onClick={() => setDeliveryMethod('physical')}
        >
          <div className="text-center">
            <MapPin className={`w-8 h-8 mx-auto mb-2 ${
              deliveryMethod === 'physical' ? 'text-[var(--zone4-accent)]' : 'text-gray-400'
            }`} />
            <Typography variant="body" className="font-medium">
              Physical Exchange
            </Typography>
            <Typography variant="caption" className="text-[var(--zone4-text-muted)]">
              Meet agent in person
            </Typography>
          </div>
        </Card>

        <Card
          padding="normal"
          variant={deliveryMethod === 'bank' ? "outlined" : "flat"}
          className={`cursor-pointer transition-all ${
            deliveryMethod === 'bank'
              ? 'border-[var(--zone4-accent)] bg-[var(--zone4-accent)]/5'
              : 'hover:bg-gray-50'
          }`}
          onClick={() => setDeliveryMethod('bank')}
        >
          <div className="text-center">
            <CreditCard className={`w-8 h-8 mx-auto mb-2 ${
              deliveryMethod === 'bank' ? 'text-[var(--zone4-accent)]' : 'text-gray-400'
            }`} />
            <Typography variant="body" className="font-medium">
              Bank Transfer
            </Typography>
            <Typography variant="caption" className="text-[var(--zone4-text-muted)]">
              Direct to your account
            </Typography>
          </div>
        </Card>
      </div>

      {/* Form Fields */}
      <Card padding="large" variant="elevated" className="mb-8">
        {deliveryMethod === 'physical' ? (
          <div className="space-y-6">
            <Typography variant="h3" className="mb-4">
              Physical Exchange Details
            </Typography>
            
            <Input
              label="Preferred Pickup Location"
              placeholder="e.g., Victoria Island, Lagos"
              value={formData.pickupLocation}
              onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
              leftIcon={<MapPin className="w-5 h-5" />}
            />

            <div>
              <Typography variant="caption" className="mb-2 block">
                Preferred Time
              </Typography>
              <select
                value={formData.preferredTime}
                onChange={(e) => handleInputChange('preferredTime', e.target.value)}
                className="w-full px-4 py-3 rounded-[var(--zone4-radius)] border border-[var(--zone4-border)] focus:outline-none focus:ring-2 focus:ring-[var(--zone4-accent)]/30 focus:border-[var(--zone4-accent)]"
              >
                <option value="">Select preferred time</option>
                <option value="morning">Morning (9AM - 12PM)</option>
                <option value="afternoon">Afternoon (12PM - 5PM)</option>
                <option value="evening">Evening (5PM - 8PM)</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <Typography variant="h3" className="mb-4">
              Bank Transfer Details
            </Typography>
            
            <Input
              label="Account Name"
              placeholder="Full name as on bank account"
              value={formData.accountName}
              onChange={(e) => handleInputChange('accountName', e.target.value)}
            />

            <Input
              label="Account Number"
              placeholder="10-digit account number"
              value={formData.accountNumber}
              onChange={(e) => handleInputChange('accountNumber', e.target.value)}
              maxLength={10}
            />

            <div>
              <Typography variant="caption" className="mb-2 block">
                Bank Name
              </Typography>
              <select
                value={formData.bankName}
                onChange={(e) => handleInputChange('bankName', e.target.value)}
                className="w-full px-4 py-3 rounded-[var(--zone4-radius)] border border-[var(--zone4-border)] focus:outline-none focus:ring-2 focus:ring-[var(--zone4-accent)]/30 focus:border-[var(--zone4-accent)]"
              >
                <option value="">Select your bank</option>
                <option value="access">Access Bank</option>
                <option value="gtb">Guaranty Trust Bank</option>
                <option value="firstbank">First Bank of Nigeria</option>
                <option value="zenith">Zenith Bank</option>
                <option value="uba">United Bank for Africa</option>
                <option value="fidelity">Fidelity Bank</option>
              </select>
            </div>
          </div>
        )}
      </Card>

      <div className="space-y-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!isFormValid()}
          rightIcon={<ArrowRight className="w-5 h-5" />}
          onClick={handleNext}
        >
          Continue
        </Button>

        <Button
          variant="ghost"
          size="lg"
          fullWidth
          onClick={onBack}
        >
          Back
        </Button>
      </div>
    </div>
  );
};