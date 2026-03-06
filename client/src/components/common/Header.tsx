'use client';

import { useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface HeaderProps {
  className?: string;
}

const Header = ({ className = '' }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const handleLogout = async () => {
    try {
        if (auth) {
          await signOut(auth);
        }
        
        // Clear all auth-related local storage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userName');
          localStorage.removeItem('userPhoto');
          // Optional: localStorage.clear(); if you want to be absolute
        }

        window.location.href = '/';
    } catch (error) {
        console.error("Logout failed:", error);
        // Fallback: even if Firebase fails, clear local state and redirect
        localStorage.removeItem('isAuthenticated');
        window.location.href = '/';
    }
  };

  const baseNavigationItems = [
    { label: 'Home', href: '/', icon: 'HomeIcon' },
    { label: 'Pricing', href: '/pricing-page', icon: 'CurrencyRupeeIcon' },
    { label: 'About', href: '/about-page', icon: 'InformationCircleIcon' },
  ];

  const authNavigationItems = [
    { label: 'Dashboard', href: '/user-dashboard', icon: 'UserCircleIcon' },
  ];

  if (user?.email === 'trustscan.ai@gmail.com') {
    authNavigationItems.push({ label: 'Admin', href: '/admin', icon: 'ChartBarIcon' });
  }

  const navigationItems = isAuthenticated
    ? [baseNavigationItems[0], ...authNavigationItems, ...baseNavigationItems.slice(1)]
    : baseNavigationItems;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-card shadow-md ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="animate-shield-morph"
              >
                <path
                  d="M20 2L4 10V18C4 27.941 10.84 36.436 20 38C29.16 36.436 36 27.941 36 18V10L20 2Z"
                  fill="url(#shield-gradient)"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-primary"
                />
                <path
                  d="M20 12L14 16V22C14 25.866 16.686 29.109 20 30C23.314 29.109 26 25.866 26 22V16L20 12Z"
                  fill="currentColor"
                  className="text-secondary"
                />
                <defs>
                  <linearGradient id="shield-gradient" x1="4" y1="2" x2="36" y2="38">
                    <stop offset="0%" stopColor="#1E3A8A" />
                    <stop offset="100%" stopColor="#0F766E" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-headline font-bold text-primary group-hover:text-trust-blue transition-colors duration-300">
                TrustScan
              </span>
              <span className="text-xs font-body text-muted-foreground">Digital Guardian</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link
                key={item.href}

                href={item.href}
                className="flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium text-foreground hover:bg-muted hover:text-primary transition-all duration-300 hover:-translate-y-0.5"
              >
                <Icon name={item.icon as any} size={18} variant="outline" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center space-x-3">
             <ThemeToggle />
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                 <Link 
                    href="/user-dashboard"
                    className="flex items-center space-x-2 text-foreground font-medium hover:text-primary transition-colors"
                 >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                       {user?.displayName ? user.displayName.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || 'U')}
                    </div>
                    <span>{user?.displayName || user?.email?.split('@')[0] || 'User'}</span>
                 </Link>
                 <div className="h-4 w-px bg-border"></div>
                 <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-muted-foreground hover:text-error transition-colors"
                  >
                    Logout
                  </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-md font-headline font-semibold text-sm hover:bg-trust-blue hover:-translate-y-0.5 hover:shadow-brand transition-all duration-300"
              >
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors duration-300"
            aria-label="Toggle mobile menu"
          >
            <Icon
              name={isMobileMenuOpen ? 'XMarkIcon' : 'Bars3Icon'}
              size={24}
              variant="outline"
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-card border-t border-border animate-slide-in-right">
          <nav className="container mx-auto px-4 py-4 space-y-2">
            <div className="flex justify-end px-4 mb-2">
                <ThemeToggle />
            </div>
            {navigationItems.map((item) => (
              <Link
                key={item.href}

                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium text-foreground hover:bg-muted hover:text-primary transition-all duration-300"
              >
                <Icon name={item.icon as any} size={20} variant="outline" />
                <span>{item.label}</span>
              </Link>
            ))}
            <div className="pt-4 border-t border-border">
              {isAuthenticated ? (
                <div className="space-y-3 px-4">
                    <Link 
                        href="/user-dashboard"
                         onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-3 text-foreground font-medium"
                    >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || 'U')}
                        </div>
                        <span>{user?.displayName || user?.email?.split('@')[0] || 'User'}</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center w-full px-6 py-3 bg-muted text-foreground border border-border rounded-md font-headline font-semibold text-sm hover:bg-muted/80 transition-all duration-300"
                    >
                        Logout
                    </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full px-6 py-3 bg-primary text-primary-foreground rounded-md font-headline font-semibold text-sm hover:bg-trust-blue transition-all duration-300"
                >
                  Get Started
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;