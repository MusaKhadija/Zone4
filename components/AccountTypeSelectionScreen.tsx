'use client';

import React, { useState } from 'react';
import { Card } from './shared/Card';
import { Button } from './shared/Button';
import { Typography } from './shared/Typography';
import { User, Building2, ArrowRight } from 'lucide-react';

interface AccountTypeSelectionScreenProps {
  onNext: (accountType: 'customer' | 'bdc_agent') => void;
}

export const AccountTypeSelectionScreen: React.FC<AccountTypeSelectionScreenProps> = ({
  onNext,
}) => {
  const [selectedType, setSelectedType] = useState<'customer' | 'bdc_agent' | null>(null);

  const accountTypes = [
    {
      type: 'customer' as const,
      title: 'I want to exchange currency',
      subtitle: 'Customer',
      description: 'Trade currencies safely with verified agents',
      icon: <User className="w-8 h-8" />,
    },
    {
      type: 'bdc_agent' as const,
      title: 'I am a licensed BDC Agent',
      subtitle: 'BDC Agent',
      description: 'Provide currency exchange services to customers',
      icon: <Building2 className="w-8 h-8" />,
    },
  ];

  const handleNext = () => {
    if (selectedType) {
      onNext(selectedType);
    }
  };

  return (
    <div className="container-mobile flex flex-col justify-center py-8">
      <div className="text-center mb-8">
        <Typography variant="h2" className="mb-4">
          Tell us about yourself
        </Typography>
        <Typography variant="subtitle" className="text-balance">
          This helps us customize your Zone4 experience
        </Typography>
      </div>

      <div className="space-y-4 mb-8">
        {accountTypes.map((type) => (
          <Card
            key={type.type}
            padding="large"
            variant={selectedType === type.type ? "outlined" : "elevated"}
            className={`cursor-pointer transition-all duration-200 ${
              selectedType === type.type
                ? 'border-[var(--zone4-accent)] bg-[var(--zone4-accent)]/5 scale-[1.02]'
                : 'hover:scale-[1.01] hover:zone4-shadow-lg'
            }`}
            onClick={() => setSelectedType(type.type)}
            role="button"
            tabIndex={0}
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-full transition-colors ${
                selectedType === type.type
                  ? 'bg-[var(--zone4-accent)] text-white'
                  : 'bg-[var(--zone4-accent)]/10 text-[var(--zone4-accent)]'
              }`}>
                {type.icon}
              </div>
              <div className="flex-1">
                <Typography variant="h3" className="mb-1">
                  {type.title}
                </Typography>
                <Typography variant="caption" className="text-[var(--zone4-accent)] font-medium mb-2">
                  {type.subtitle}
                </Typography>
                <Typography variant="body" className="text-[var(--zone4-text-muted)]">
                  {type.description}
                </Typography>
              </div>
              {selectedType === type.type && (
                <div className="w-6 h-6 bg-[var(--zone4-accent)] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Button
        variant="primary"
        size="lg"
        fullWidth
        disabled={!selectedType}
        rightIcon={<ArrowRight className="w-5 h-5" />}
        onClick={handleNext}
      >
        Continue
      </Button>
    </div>
  );
};