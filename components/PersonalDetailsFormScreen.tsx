'use client';

import React, { useState } from 'react';
import { Button } from './shared/Button';
import { Typography } from './shared/Typography';
import { Input } from './shared/Input';
import { ArrowRight, User, Mail, Phone, Calendar, Lock, Eye, EyeOff } from 'lucide-react';

interface PersonalDetailsFormScreenProps {
  onNext: (data: PersonalDetailsData) => void;
  onBack: () => void;
}

interface PersonalDetailsData {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  password: string;
}

export const PersonalDetailsFormScreen: React.FC<PersonalDetailsFormScreenProps> = ({
  onNext,
  onBack,
}) => {
  const [formData, setFormData] = useState<PersonalDetailsData>({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    password: '',
  });

  const [errors, setErrors] = useState<Partial<PersonalDetailsData>>({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors: Partial<PersonalDetailsData> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof PersonalDetailsData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext(formData);
    }
  };

  const isFormValid = Object.values(formData).every(value => value.trim() !== '');

  return (
    <div className="container-mobile flex flex-col justify-center py-8">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <Typography variant="caption">Step 1 of 5</Typography>
          <Typography variant="caption">20%</Typography>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-[var(--zone4-accent)] h-2 rounded-full w-1/5 transition-all duration-300"></div>
        </div>
      </div>

      <div className="text-center mb-8">
        <Typography variant="h2" className="mb-4">
          Personal Details
        </Typography>
        <Typography variant="subtitle" className="text-balance">
          We need some basic information to get started
        </Typography>
      </div>

      <div className="space-y-6 mb-8">
        <Input
          label="Full Name"
          placeholder="Enter your full name"
          value={formData.fullName}
          onChange={(e) => handleInputChange('fullName', e.target.value)}
          error={errors.fullName}
          leftIcon={<User className="w-5 h-5" />}
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          error={errors.email}
          leftIcon={<Mail className="w-5 h-5" />}
        />

        <Input
          label="Phone Number"
          type="tel"
          placeholder="+234 xxx xxx xxxx"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          error={errors.phone}
          leftIcon={<Phone className="w-5 h-5" />}
        />

        <Input
          label="Date of Birth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
          error={errors.dateOfBirth}
          leftIcon={<Calendar className="w-5 h-5" />}
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Create a secure password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          error={errors.password}
          helperText="Must be at least 6 characters"
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

      <div className="space-y-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!isFormValid}
          rightIcon={<ArrowRight className="w-5 h-5" />}
          onClick={handleNext}
        >
          Next
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