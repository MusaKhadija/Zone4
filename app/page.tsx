'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import Layout from '@/components/Layout';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { DashboardScreen } from '@/components/DashboardScreen';
import { AgentDashboardScreen } from '@/components/AgentDashboardScreen';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { ExchangeFlow } from '@/components/exchange/ExchangeFlow';
import { TransactionHistoryScreen } from '@/components/exchange/TransactionHistoryScreen';
import { SecuritySettingsScreen } from '@/components/SecuritySettingsScreen';
import { DisputeInitiationScreen } from '@/components/DisputeInitiationScreen';
import { DisputeTrackingScreen } from '@/components/DisputeTrackingScreen';
import { supabase, Profile } from '@/lib/supabase';

type AppMode = 
  | 'loading' 
  | 'welcome' 
  | 'onboarding' 
  | 'dashboard' 
  | 'agent_dashboard' 
  | 'exchange' 
  | 'history'
  | 'security_settings'
  | 'dispute_initiation'
  | 'dispute_tracking';

export default function Home() {
  const [appMode, setAppMode] = useState<AppMode>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setAppMode('welcome');
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUserProfile(null);
          setAppMode('welcome');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Failed to fetch user profile:', error);
        setAppMode('welcome');
        return;
      }

      setUserProfile(profile);
      
      // Determine which dashboard to show based on account type
      if (profile.account_type === 'bdc_agent') {
        setAppMode('agent_dashboard');
      } else {
        setAppMode('dashboard');
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      setAppMode('welcome');
    }
  };

  const handleCreateAccount = () => {
    setAppMode('onboarding');
  };

  const handleOnboardingComplete = () => {
    // Refetch user profile to determine correct dashboard
    if (user) {
      fetchUserProfile(user.id);
    } else {
      setAppMode('dashboard');
    }
  };

  const startExchangeFlow = () => {
    setAppMode('exchange');
  };

  const viewTransactionHistory = () => {
    setAppMode('history');
  };

  const openSecuritySettings = () => {
    setAppMode('security_settings');
  };

  const openDisputeTracking = () => {
    setAppMode('dispute_tracking');
  };

  const initiateDispute = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setAppMode('dispute_initiation');
  };

  const returnToDashboard = () => {
    setSelectedTransactionId(null);
    if (userProfile?.account_type === 'bdc_agent') {
      setAppMode('agent_dashboard');
    } else {
      setAppMode('dashboard');
    }
  };

  const handleDisputeSuccess = (disputeId: string) => {
    console.log('Dispute created successfully:', disputeId);
    setAppMode('dispute_tracking');
  };

  // Show loading state while checking authentication
  if (appMode === 'loading') {
    return (
      <Layout>
        <div className="container-mobile flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[var(--zone4-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[var(--zone4-text-muted)]">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (appMode === 'welcome') {
    return (
      <Layout>
        <WelcomeScreen 
          onCreateAccount={handleCreateAccount}
        />
      </Layout>
    );
  }

  if (appMode === 'onboarding') {
    return (
      <OnboardingFlow onComplete={handleOnboardingComplete} />
    );
  }

  if (appMode === 'exchange') {
    return (
      <ExchangeFlow 
        onComplete={returnToDashboard}
        onBack={returnToDashboard}
      />
    );
  }

  if (appMode === 'history') {
    return (
      <Layout>
        <TransactionHistoryScreen onBack={returnToDashboard} />
      </Layout>
    );
  }

  if (appMode === 'security_settings') {
    return (
      <Layout>
        <SecuritySettingsScreen onBack={returnToDashboard} />
      </Layout>
    );
  }

  if (appMode === 'dispute_initiation' && selectedTransactionId) {
    return (
      <Layout>
        <DisputeInitiationScreen 
          transactionId={selectedTransactionId}
          onBack={returnToDashboard}
          onSuccess={handleDisputeSuccess}
        />
      </Layout>
    );
  }

  if (appMode === 'dispute_tracking') {
    return (
      <Layout>
        <DisputeTrackingScreen onBack={returnToDashboard} />
      </Layout>
    );
  }

  if (appMode === 'agent_dashboard') {
    return (
      <Layout showHeader showBottomNav userProfile={userProfile}>
        <AgentDashboardScreen 
          user={user}
          userProfile={userProfile}
          onViewOffer={(transactionId) => {
            // TODO: Navigate to agent offer screen
            console.log('View offer for transaction:', transactionId);
          }}
          onManageRates={() => {
            // TODO: Navigate to rate management screen
            console.log('Manage rates');
          }}
          onViewTransactions={viewTransactionHistory}
        />
      </Layout>
    );
  }

  return (
    <Layout showHeader showBottomNav userProfile={userProfile}>
      <DashboardScreen 
        user={user}
        userProfile={userProfile}
        onStartExchange={startExchangeFlow}
        onViewHistory={viewTransactionHistory}
        onSecuritySettings={openSecuritySettings}
        onDisputeTracking={openDisputeTracking}
      />
    </Layout>
  );
}