'use client';

import React, { useState } from 'react';
import { Card } from './shared/Card';
import { Button } from './shared/Button';
import { Typography } from './shared/Typography';
import { Input } from './shared/Input';
import { ShieldCheck, ArrowRight, Users, TrendingUp, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface WelcomeScreenProps {
  onCreateAccount: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onCreateAccount,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const features = [
    {
      icon: <ShieldCheck className="w-8 h-8 text-[var(--zone4-accent)]" />,
      title: "Bank-Level Security",
      description: "Your funds are protected by escrow and regulated by CBN standards"
    },
    {
      icon: <Users className="w-8 h-8 text-[var(--zone4-accent)]" />,
      title: "Verified Partners",
      description: "Trade only with licensed BDC agents verified through NIN and BVN"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-[var(--zone4-accent)]" />,
      title: "Best Rates",
      description: "Compare live rates from multiple agents to get the best deal"
    }
  ];

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      setLoginError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setLoginError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) {
        setLoginError(error.message);
      }
      // Success is handled by the auth state change listener in app/page.tsx
    } catch (error) {
      setLoginError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
    if (loginError) setLoginError('');
  };

  if (showLogin) {
    return (
      <div className="min-h-screen container-mobile flex flex-col justify-center py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-[120px] h-[120px] bg-[var(--zone4-accent)] rounded-3xl mb-6 zone4-shadow-lg">
            <span className="text-4xl font-bold text-white">Z4</span>
          </div>
          
          <Typography variant="h1" className="mb-4">
            Welcome Back
          </Typography>
          
          <Typography variant="subtitle" className="text-balance max-w-sm mx-auto">
            Sign in to your Zone4 account to continue trading safely
          </Typography>
        </div>

        <Card padding="large" variant="elevated" className="mb-6">
          <div className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              value={loginData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              leftIcon={<Mail className="w-5 h-5" />}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={loginData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                leftIcon={<Lock className="w-5 h-5" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 hover:bg-gray-100 rounded"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                }
              />
            </div>

            {loginError && (
              <div className="p-3 bg-[var(--zone4-error)]/10 border border-[var(--zone4-error)]/20 rounded-[var(--zone4-radius)]">
                <Typography variant="caption" className="text-[var(--zone4-error)]">
                  {loginError}
                </Typography>
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-4">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            rightIcon={!isLoading && <ArrowRight className="w-5 h-5" />}
            onClick={handleLogin}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
          
          <button
            onClick={() => setShowLogin(false)}
            className="w-full text-center text-[var(--zone4-text-muted)] hover:text-[var(--zone4-accent)] transition-colors touch-target py-3"
          >
            Don't have an account? <span className="font-medium text-[var(--zone4-accent)]">Create one</span>
          </button>
        </div>

        {/* Legal Footer */}
        <div className="mt-8 text-center">
          <Typography variant="caption" className="text-xs">
            By continuing, you agree to our{' '}
            <button className="underline hover:no-underline">Terms of Service</button>
            {' '}and{' '}
            <button className="underline hover:no-underline">Privacy Policy</button>
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen container-mobile flex flex-col justify-center py-8">
      {/* Logo Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-[120px] h-[120px] bg-[var(--zone4-accent)] rounded-3xl mb-6 zone4-shadow-lg">
          <span className="text-4xl font-bold text-white">Z4</span>
        </div>
        
        <Typography variant="h1" className="mb-4 text-balance">
          Foreign Exchange, Simplified
        </Typography>
        
        <Typography variant="subtitle" className="text-balance max-w-sm mx-auto">
          Trade currencies safely with verified agents. No more risks, no hidden fees, just transparent exchanges.
        </Typography>
      </div>

      {/* Features Carousel */}
      <div className="mb-8">
        <Card padding="large" variant="elevated" className="mb-4">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              {features[currentSlide].icon}
            </div>
            <Typography variant="h3" className="mb-2">
              {features[currentSlide].title}
            </Typography>
            <Typography variant="body" className="text-[var(--zone4-text-muted)]">
              {features[currentSlide].description}
            </Typography>
          </div>
        </Card>

        {/* Dots Indicator */}
        <div className="flex justify-center space-x-2">
          {features.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors touch-target ${
                index === currentSlide 
                  ? 'bg-[var(--zone4-accent)]' 
                  : 'bg-gray-300'
              }`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Trust Indicators */}
      <Card padding="normal" variant="outlined" className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-[var(--zone4-success)]" />
            <Typography variant="caption">CBN Regulated</Typography>
          </div>
          <div className="w-px h-4 bg-[var(--zone4-border)]"></div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-[var(--zone4-success)] rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <Typography variant="caption">SSL Secured</Typography>
          </div>
        </div>
      </Card>

      {/* CTA Buttons */}
      <div className="space-y-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          rightIcon={<ArrowRight className="w-5 h-5" />}
          onClick={onCreateAccount}
        >
          Create Account
        </Button>
        
        <button
          onClick={() => setShowLogin(true)}
          className="w-full text-center text-[var(--zone4-text-muted)] hover:text-[var(--zone4-accent)] transition-colors touch-target py-3"
        >
          Already have an account? <span className="font-medium text-[var(--zone4-accent)]">Log in</span>
        </button>
      </div>

      {/* Legal Footer */}
      <div className="mt-8 text-center">
        <Typography variant="caption" className="text-xs">
          By continuing, you agree to our{' '}
          <button className="underline hover:no-underline">Terms of Service</button>
          {' '}and{' '}
          <button className="underline hover:no-underline">Privacy Policy</button>
        </Typography>
      </div>
    </div>
  );
};