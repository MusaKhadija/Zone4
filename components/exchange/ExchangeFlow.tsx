'use client';

import React, { useState } from 'react';
import Layout from '../Layout';
import { InitiateExchangeScreen } from './InitiateExchangeScreen';
import { RateComparisonScreen } from './RateComparisonScreen';
import { TransactionDetailsScreen } from './TransactionDetailsScreen';
import { RecipientDetailsScreen } from './RecipientDetailsScreen';
import { TransactionConfirmationScreen } from './TransactionConfirmationScreen';
import { TransactionProgressScreen } from './TransactionProgressScreen';
import { TransactionCompletedScreen } from './TransactionCompletedScreen';
import { ExchangeRate } from '@/lib/supabase';

type ExchangeStep = 
  | 'initiate'
  | 'rates'
  | 'details'
  | 'recipient'
  | 'confirmation'
  | 'progress'
  | 'completed';

interface ExchangeData {
  fromCurrency?: string;
  toCurrency?: string;
  amount?: number;
  estimatedRate?: number;
  selectedAgent?: ExchangeRate;
  recipientDetails?: {
    deliveryMethod: 'physical' | 'bank';
    formData: any;
  };
  transactionId?: string;
}

interface ExchangeFlowProps {
  onComplete: () => void;
  onBack: () => void;
}

export const ExchangeFlow: React.FC<ExchangeFlowProps> = ({ onComplete, onBack }) => {
  const [currentStep, setCurrentStep] = useState<ExchangeStep>('initiate');
  const [exchangeData, setExchangeData] = useState<ExchangeData>({});

  const handleNext = (data?: any) => {
    if (data) {
      setExchangeData(prev => ({ ...prev, ...data }));
    }

    switch (currentStep) {
      case 'initiate':
        setCurrentStep('rates');
        break;
      case 'rates':
        setCurrentStep('details');
        break;
      case 'details':
        setCurrentStep('recipient');
        break;
      case 'recipient':
        setCurrentStep('confirmation');
        break;
      case 'confirmation':
        setCurrentStep('progress');
        break;
      case 'progress':
        setCurrentStep('completed');
        break;
      case 'completed':
        onComplete();
        break;
    }
  };

  const handleBackStep = () => {
    switch (currentStep) {
      case 'rates':
        setCurrentStep('initiate');
        break;
      case 'details':
        setCurrentStep('rates');
        break;
      case 'recipient':
        setCurrentStep('details');
        break;
      case 'confirmation':
        setCurrentStep('recipient');
        break;
      case 'progress':
        setCurrentStep('confirmation');
        break;
      case 'completed':
        setCurrentStep('progress');
        break;
      default:
        onBack();
        break;
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'initiate':
        return (
          <InitiateExchangeScreen 
            onNext={handleNext}
            onBack={onBack}
          />
        );
      case 'rates':
        return (
          <RateComparisonScreen 
            onNext={handleNext}
            onBack={handleBackStep}
            exchangeData={exchangeData}
          />
        );
      case 'details':
        return (
          <TransactionDetailsScreen 
            onNext={handleNext}
            onBack={handleBackStep}
            exchangeData={exchangeData}
          />
        );
      case 'recipient':
        return (
          <RecipientDetailsScreen 
            onNext={handleNext}
            onBack={handleBackStep}
          />
        );
      case 'confirmation':
        return (
          <TransactionConfirmationScreen 
            onNext={handleNext}
            onBack={handleBackStep}
            exchangeData={exchangeData}
          />
        );
      case 'progress':
        return (
          <TransactionProgressScreen 
            onNext={handleNext}
            onBack={handleBackStep}
            exchangeData={exchangeData}
          />
        );
      case 'completed':
        return (
          <TransactionCompletedScreen 
            onComplete={onComplete}
            onViewHistory={() => {}}
            exchangeData={exchangeData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      {renderCurrentStep()}
    </Layout>
  );
};