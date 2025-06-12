'use client';

import React, { useState } from 'react';
import Layout from './Layout';
import { AccountTypeSelectionScreen } from './AccountTypeSelectionScreen';
import { PersonalDetailsFormScreen } from './PersonalDetailsFormScreen';
import { NINBVNVerificationScreen } from './NINBVNVerificationScreen';
import { FacialBiometricsScreen } from './FacialBiometricsScreen';
import { DocumentUploadScreen } from './DocumentUploadScreen';
import { OnboardingSuccessScreen } from './OnboardingSuccessScreen';
import { supabase } from '@/lib/supabase';

type OnboardingStep = 
  | 'account-type'
  | 'personal-details'
  | 'verification'
  | 'biometrics'
  | 'documents'
  | 'success';

interface OnboardingData {
  accountType?: 'customer' | 'bdc_agent';
  personalDetails?: {
    fullName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    password: string;
  };
  verification?: {
    nin: string;
    bvn: string;
  };
}

interface OnboardingFlowProps {
  onComplete: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('account-type');
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [signUpError, setSignUpError] = useState('');

  const handleAccountTypeNext = (accountType: 'customer' | 'bdc_agent') => {
    setOnboardingData(prev => ({ ...prev, accountType }));
    setCurrentStep('personal-details');
  };

  const handlePersonalDetailsNext = (personalDetails: OnboardingData['personalDetails']) => {
    setOnboardingData(prev => ({ ...prev, personalDetails }));
    setCurrentStep('verification');
  };

  const handleVerificationNext = async (verification: OnboardingData['verification']) => {
    setOnboardingData(prev => ({ ...prev, verification }));
    
    // Ensure all required data is present before creating account
    if (onboardingData.accountType && onboardingData.personalDetails && verification) {
      const completeData: Required<OnboardingData> = {
        accountType: onboardingData.accountType,
        personalDetails: onboardingData.personalDetails,
        verification: verification
      };
      
      await createUserAccount(completeData);
    } else {
      setSignUpError('Missing required information. Please complete all previous steps.');
    }
  };

  const createUserAccount = async (completeData: Required<OnboardingData>) => {
    setIsCreatingAccount(true);
    setSignUpError('');

    try {
      // Step 1: Create Supabase Auth user with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: completeData.personalDetails.email,
        password: completeData.personalDetails.password,
        options: {
          data: {
            full_name: completeData.personalDetails.fullName,
            phone_number: completeData.personalDetails.phone,
            date_of_birth: completeData.personalDetails.dateOfBirth,
            account_type: completeData.accountType,
            nin: completeData.verification.nin,
            bvn: completeData.verification.bvn,
          }
        }
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Step 2: Wait a moment for the trigger to create the basic profile
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 3: Update the profile with complete details
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: completeData.personalDetails.fullName,
          email: completeData.personalDetails.email,
          phone_number: completeData.personalDetails.phone,
          date_of_birth: completeData.personalDetails.dateOfBirth,
          account_type: completeData.accountType,
          nin: completeData.verification.nin,
          bvn: completeData.verification.bvn,
          kyc_status: 'pending',
          liveness_check_status: 'pending',
          address_proof_status: 'pending',
          is_active: true,
        })
        .eq('id', authData.user.id);

      if (profileError) {
        console.error('Profile update failed:', profileError);
        throw new Error('Failed to update user profile');
      }

      // Step 4: If user is a BDC agent, we would create the bdc_agents record
      // For now, we'll skip this as it requires additional information

      // Success - proceed to next step
      setCurrentStep('biometrics');
    } catch (error) {
      console.error('Account creation error:', error);
      setSignUpError(error instanceof Error ? error.message : 'Failed to create account');
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const handleBiometricsNext = () => {
    setCurrentStep('documents');
  };

  const handleDocumentsNext = () => {
    setCurrentStep('success');
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'personal-details':
        setCurrentStep('account-type');
        break;
      case 'verification':
        setCurrentStep('personal-details');
        break;
      case 'biometrics':
        setCurrentStep('verification');
        break;
      case 'documents':
        setCurrentStep('biometrics');
        break;
      default:
        break;
    }
  };

  const renderCurrentStep = () => {
    // Show loading state during account creation
    if (isCreatingAccount) {
      return (
        <div className="container-mobile flex flex-col justify-center py-8">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[var(--zone4-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-semibold mb-4">Creating Your Account</h2>
            <p className="text-[var(--zone4-text-muted)]">
              Please wait while we set up your Zone4 account...
            </p>
          </div>
        </div>
      );
    }

    // Show error state if account creation failed
    if (signUpError) {
      return (
        <div className="container-mobile flex flex-col justify-center py-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-[var(--zone4-error)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-[var(--zone4-error)] text-2xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-semibold mb-4">Account Creation Failed</h2>
            <p className="text-[var(--zone4-error)] mb-6">{signUpError}</p>
            <button
              onClick={() => {
                setSignUpError('');
                setCurrentStep('verification');
              }}
              className="px-6 py-3 bg-[var(--zone4-accent)] text-white rounded-[var(--zone4-radius)] hover:bg-[var(--zone4-accent)]/90"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    switch (currentStep) {
      case 'account-type':
        return (
          <AccountTypeSelectionScreen 
            onNext={handleAccountTypeNext}
          />
        );
      
      case 'personal-details':
        return (
          <PersonalDetailsFormScreen 
            onNext={handlePersonalDetailsNext}
            onBack={handleBack}
          />
        );
      
      case 'verification':
        return (
          <NINBVNVerificationScreen 
            onNext={handleVerificationNext}
            onBack={handleBack}
          />
        );
      
      case 'biometrics':
        return (
          <FacialBiometricsScreen 
            onNext={handleBiometricsNext}
            onBack={handleBack}
          />
        );
      
      case 'documents':
        return (
          <DocumentUploadScreen 
            onNext={handleDocumentsNext}
            onBack={handleBack}
          />
        );
      
      case 'success':
        return (
          <OnboardingSuccessScreen 
            onComplete={onComplete}
            accountStatus="pending" // In real app, this would be determined by backend
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