'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { supabase, Profile } from '@/lib/supabase';
import { LogOut, Home, ArrowUpDown, History, User, BarChart3, DollarSign } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  showHeader?: boolean;
  showBottomNav?: boolean;
  userProfile?: Profile | null;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  className,
  showHeader = false,
  showBottomNav = false,
  userProfile = null
}) => {
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Determine navigation items based on user type
  const getNavigationItems = () => {
    if (userProfile?.account_type === 'bdc_agent') {
      return [
        { label: 'Dashboard', icon: <Home className="w-5 h-5" />, active: true },
        { label: 'Rates', icon: <DollarSign className="w-5 h-5" />, active: false },
        { label: 'Transactions', icon: <BarChart3 className="w-5 h-5" />, active: false },
        { label: 'Profile', icon: <User className="w-5 h-5" />, active: false },
      ];
    } else {
      return [
        { label: 'Home', icon: <Home className="w-5 h-5" />, active: true },
        { label: 'Exchange', icon: <ArrowUpDown className="w-5 h-5" />, active: false },
        { label: 'History', icon: <History className="w-5 h-5" />, active: false },
        { label: 'Profile', icon: <User className="w-5 h-5" />, active: false },
      ];
    }
  };

  return (
    <div className="min-h-screen bg-[var(--zone4-background)] antialiased">
      {showHeader && (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-[var(--zone4-border)]">
          <div className="container-mobile py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[var(--zone4-accent)] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">Z4</span>
                </div>
                <div>
                  <span className="font-semibold text-[var(--zone4-text)]">Zone4</span>
                  {userProfile?.account_type === 'bdc_agent' && (
                    <span className="block text-xs text-[var(--zone4-text-muted)]">Agent Portal</span>
                  )}
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center touch-target hover:bg-gray-200 transition-colors"
                aria-label="Logout"
                title="Logout"
              >
                <LogOut className="w-4 h-4 text-[var(--zone4-text-muted)]" />
              </button>
            </div>
          </div>
        </header>
      )}

      <main className={cn("flex-1", className)}>
        {children}
      </main>

      {showBottomNav && (
        <nav className="sticky bottom-0 z-50 bg-white border-t border-[var(--zone4-border)]">
          <div className="container-mobile py-2">
            <div className="flex items-center justify-around">
              {getNavigationItems().map((item) => (
                <button
                  key={item.label}
                  className={cn(
                    "flex flex-col items-center space-y-1 py-2 px-3 rounded-lg touch-target transition-colors",
                    item.active 
                      ? "text-[var(--zone4-accent)] bg-[var(--zone4-accent)]/10" 
                      : "text-[var(--zone4-text-muted)] hover:text-[var(--zone4-text)]"
                  )}
                  aria-label={item.label}
                >
                  {item.icon}
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>
      )}
    </div>
  );
};

export default Layout;