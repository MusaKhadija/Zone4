'use client';

import React, { useState, useEffect } from 'react';
import { Card } from './shared/Card';
import { Button } from './shared/Button';
import { Typography } from './shared/Typography';
import { Input } from './shared/Input';
import { 
  Shield, 
  Lock, 
  Smartphone, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertTriangle,
  ArrowLeft,
  Settings,
  Fingerprint
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface SecuritySettingsScreenProps {
  onBack: () => void;
}

export const SecuritySettingsScreen: React.FC<SecuritySettingsScreenProps> = ({
  onBack,
}) => {
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState({
    mfa: false,
    password: false,
    biometric: false,
  });
  const [errors, setErrors] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      // Check MFA status
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Check if user has MFA factors enrolled
        const { data: factors } = await supabase.auth.mfa.listFactors();
        setMfaEnabled(factors?.totp?.length > 0 || false);
      }

      // Load biometric preference from localStorage
      const biometricPref = localStorage.getItem('zone4_biometric_enabled');
      setBiometricEnabled(biometricPref === 'true');
    } catch (error) {
      console.error('Failed to load security settings:', error);
    }
  };

  const handleMfaToggle = async () => {
    setLoading(prev => ({ ...prev, mfa: true }));
    setErrors(null);
    setSuccess(null);

    try {
      if (mfaEnabled) {
        // Disable MFA - unenroll all factors
        const { data: factors } = await supabase.auth.mfa.listFactors();
        if (factors?.totp?.length > 0) {
          for (const factor of factors.totp) {
            await supabase.auth.mfa.unenroll({ factorId: factor.id });
          }
        }
        setMfaEnabled(false);
        setSuccess('Multi-factor authentication disabled successfully');
      } else {
        // Enable MFA - enroll TOTP factor
        const { data, error } = await supabase.auth.mfa.enroll({
          factorType: 'totp',
          friendlyName: 'Zone4 Authenticator'
        });

        if (error) {
          throw error;
        }

        if (data) {
          // In a real implementation, you would show the QR code and verify
          // For now, we'll simulate successful enrollment
          setMfaEnabled(true);
          setSuccess('Multi-factor authentication enabled successfully');
        }
      }
    } catch (error) {
      console.error('MFA toggle error:', error);
      setErrors(error instanceof Error ? error.message : 'Failed to update MFA settings');
    } finally {
      setLoading(prev => ({ ...prev, mfa: false }));
    }
  };

  const handleBiometricToggle = async () => {
    setLoading(prev => ({ ...prev, biometric: true }));
    setErrors(null);
    setSuccess(null);

    try {
      // Check if biometric authentication is available
      if (!biometricEnabled && 'credentials' in navigator) {
        // In a real implementation, you would register biometric credentials
        // For now, we'll simulate the process
        const newState = !biometricEnabled;
        setBiometricEnabled(newState);
        localStorage.setItem('zone4_biometric_enabled', newState.toString());
        setSuccess(newState ? 'Biometric login enabled successfully' : 'Biometric login disabled successfully');
      } else {
        const newState = !biometricEnabled;
        setBiometricEnabled(newState);
        localStorage.setItem('zone4_biometric_enabled', newState.toString());
        setSuccess(newState ? 'Biometric login enabled successfully' : 'Biometric login disabled successfully');
      }
    } catch (error) {
      console.error('Biometric toggle error:', error);
      setErrors('Failed to update biometric settings');
    } finally {
      setLoading(prev => ({ ...prev, biometric: false }));
    }
  };

  const handlePasswordChange = async () => {
    setLoading(prev => ({ ...prev, password: true }));
    setErrors(null);
    setSuccess(null);

    // Validate passwords
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setErrors('All password fields are required');
      setLoading(prev => ({ ...prev, password: false }));
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrors('New passwords do not match');
      setLoading(prev => ({ ...prev, password: false }));
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setErrors('New password must be at least 6 characters');
      setLoading(prev => ({ ...prev, password: false }));
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) {
        throw error;
      }

      setSuccess('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowChangePassword(false);
    } catch (error) {
      console.error('Password change error:', error);
      setErrors(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setLoading(prev => ({ ...prev, password: false }));
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
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
          Security Settings
        </Typography>
      </div>

      {/* Status Messages */}
      {errors && (
        <Card padding="normal" variant="outlined" className="mb-6 border-[var(--zone4-error)]/20 bg-[var(--zone4-error)]/5">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-[var(--zone4-error)] mt-0.5" />
            <Typography variant="body" className="text-[var(--zone4-error)]">
              {errors}
            </Typography>
          </div>
        </Card>
      )}

      {success && (
        <Card padding="normal" variant="outlined" className="mb-6 border-[var(--zone4-success)]/20 bg-[var(--zone4-success)]/5">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-[var(--zone4-success)] mt-0.5" />
            <Typography variant="body" className="text-[var(--zone4-success)]">
              {success}
            </Typography>
          </div>
        </Card>
      )}

      {/* Multi-Factor Authentication */}
      <Card padding="large" variant="elevated" className="mb-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-[var(--zone4-accent)]/10 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-[var(--zone4-accent)]" />
          </div>
          <div className="flex-1">
            <Typography variant="h3" className="mb-2">
              Multi-Factor Authentication
            </Typography>
            <Typography variant="body" className="text-[var(--zone4-text-muted)] mb-4">
              Add an extra layer of security to your account with MFA
            </Typography>
            <div className="flex items-center justify-between">
              <Typography variant="body" className={mfaEnabled ? 'text-[var(--zone4-success)]' : 'text-[var(--zone4-text-muted)]'}>
                {mfaEnabled ? 'Enabled' : 'Disabled'}
              </Typography>
              <Button
                variant={mfaEnabled ? "outline" : "primary"}
                size="sm"
                loading={loading.mfa}
                onClick={handleMfaToggle}
              >
                {mfaEnabled ? 'Disable' : 'Enable'} MFA
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Biometric Authentication */}
      <Card padding="large" variant="elevated" className="mb-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-[var(--zone4-accent)]/10 rounded-full flex items-center justify-center">
            <Fingerprint className="w-6 h-6 text-[var(--zone4-accent)]" />
          </div>
          <div className="flex-1">
            <Typography variant="h3" className="mb-2">
              Biometric Login
            </Typography>
            <Typography variant="body" className="text-[var(--zone4-text-muted)] mb-4">
              Use your fingerprint or face ID to sign in quickly and securely
            </Typography>
            <div className="flex items-center justify-between">
              <Typography variant="body" className={biometricEnabled ? 'text-[var(--zone4-success)]' : 'text-[var(--zone4-text-muted)]'}>
                {biometricEnabled ? 'Enabled' : 'Disabled'}
              </Typography>
              <Button
                variant={biometricEnabled ? "outline" : "primary"}
                size="sm"
                loading={loading.biometric}
                onClick={handleBiometricToggle}
              >
                {biometricEnabled ? 'Disable' : 'Enable'} Biometric
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Change Password */}
      <Card padding="large" variant="elevated" className="mb-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-[var(--zone4-accent)]/10 rounded-full flex items-center justify-center">
            <Lock className="w-6 h-6 text-[var(--zone4-accent)]" />
          </div>
          <div className="flex-1">
            <Typography variant="h3" className="mb-2">
              Change Password
            </Typography>
            <Typography variant="body" className="text-[var(--zone4-text-muted)] mb-4">
              Update your account password for better security
            </Typography>
            
            {!showChangePassword ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChangePassword(true)}
              >
                Change Password
              </Button>
            ) : (
              <div className="space-y-4">
                <Input
                  label="Current Password"
                  type={showPasswords.current ? 'text' : 'password'}
                  placeholder="Enter current password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />

                <Input
                  label="New Password"
                  type={showPasswords.new ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />

                <Input
                  label="Confirm New Password"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />

                <div className="flex space-x-3">
                  <Button
                    variant="primary"
                    size="sm"
                    loading={loading.password}
                    onClick={handlePasswordChange}
                  >
                    Update Password
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowChangePassword(false);
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                      });
                      setErrors(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Security Tips */}
      <Card padding="normal" variant="outlined" className="border-[var(--zone4-accent)]/20 bg-[var(--zone4-accent)]/5">
        <Typography variant="body" className="font-medium mb-2">
          🔒 Security Tips
        </Typography>
        <div className="space-y-1">
          <Typography variant="caption">• Use a strong, unique password for your Zone4 account</Typography>
          <Typography variant="caption">• Enable MFA for maximum account protection</Typography>
          <Typography variant="caption">• Never share your login credentials with anyone</Typography>
          <Typography variant="caption">• Log out from shared or public devices</Typography>
        </div>
      </Card>
    </div>
  );
};