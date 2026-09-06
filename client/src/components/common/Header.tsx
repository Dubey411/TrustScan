'use client';

import { useState, useEffect } from 'react';
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const isAuthenticated = !!user;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
      if (typeof window !== 'undefined') {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('userPhoto');
      }
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/90 backdrop-blur-xl border-b border-border shadow-md dark:shadow-2xl dark:shadow-black/40 py-3'
          : 'bg-background/70 backdrop-blur-md border-b border-border/60 py-4'
      } ${className}`}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo with Gradient Shield Mark */}
          <Link
            href="/"
            onClick={(e) => {
              if (typeof window !== 'undefined') {
                if (window.location.pathname === '/') {
                  e.preventDefault();
                  window.location.reload();
                } else {
                  window.location.href = '/';
                }
              }
            }}
            className="flex items-center space-x-3 group"
          >
            <div className="relative flex items-center justify-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/25 via-secondary/15 to-transparent p-0.5 border border-border group-hover:border-primary/50 transition-all duration-300">
                <div className="w-full h-full rounded-[10px] bg-card flex items-center justify-center">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="transform group-hover:scale-105 transition-transform duration-300"
                  >
                    <path
                      d="M12 2L4 5.5V11.5C4 16.5 7.5 20.9 12 22C16.5 20.9 20 16.5 20 11.5V5.5L12 2Z"
                      fill="url(#shield-gradient-header)"
                      stroke="url(#shield-border-header)"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 11.8L11.2 14L15.5 9.5"
                      stroke="#FFFFFF"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <defs>
                      <linearGradient id="shield-gradient-header" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#FF6B4A" />
                        <stop offset="100%" stopColor="#818CF8" />
                      </linearGradient>
                      <linearGradient id="shield-border-header" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#FFA085" />
                        <stop offset="100%" stopColor="#A5B4FC" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-headline font-bold tracking-tight text-foreground">
                  TrustScan
                </span>
                <span className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/30">
                  AI
                </span>
              </div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground/80 -mt-0.5">
                Sovereign Defense
              </span>
            </div>
          </Link>

          {/* Centered Desktop Nav Links with Animated Underline */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  if (item.href === '/' && typeof window !== 'undefined') {
                    if (window.location.pathname === '/') {
                      e.preventDefault();
                      window.location.reload();
                    } else {
                      window.location.href = '/';
                    }
                  }
                }}
                className="relative text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 group py-1 flex items-center gap-1.5"
              >
                <Icon name={item.icon as any} size={16} variant="outline" />
                <span>{item.label}</span>
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  href="/user-dashboard"
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs">
                    {user?.displayName ? user.displayName.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || 'U')}
                  </div>
                  <span className="text-xs text-muted-foreground">{user?.displayName || user?.email?.split('@')[0] || 'User'}</span>
                </Link>
                <div className="h-4 w-px bg-border" />
                <button
                  onClick={handleLogout}
                  className="text-xs font-mono text-muted-foreground hover:text-red-400 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-muted transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  className="relative group inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-all duration-300 shadow-[0_0_20px_rgba(255,107,74,0.35)] hover:shadow-[0_0_28px_rgba(255,107,74,0.5)] hover:-translate-y-0.5"
                >
                  <span>Get Started</span>
                  <Icon name="ArrowRightIcon" size={16} className="ml-1.5 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center space-x-2 lg:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle navigation menu"
            >
              <Icon
                name={isMobileMenuOpen ? 'XMarkIcon' : 'Bars3Icon'}
                size={22}
                variant="outline"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden mt-3 px-4">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-2xl backdrop-blur-2xl space-y-4 animate-slide-up">
            <nav className="flex flex-col space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                >
                  <Icon name={item.icon as any} size={18} variant="outline" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="pt-3 border-t border-border flex flex-col gap-3">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/user-dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium text-foreground bg-muted/50"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs">
                      {user?.displayName ? user.displayName.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || 'U')}
                    </div>
                    <span>{user?.displayName || user?.email?.split('@')[0] || 'User'}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-center px-4 py-2.5 rounded-lg text-xs font-mono text-muted-foreground hover:text-red-400 bg-muted/30 border border-border"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground bg-muted border border-border hover:text-foreground"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 shadow-[0_0_16px_rgba(255,107,74,0.35)]"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;