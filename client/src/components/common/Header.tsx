'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const { user } = useAuth();
  const isAuthenticated = !!user;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

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

  const isLinkActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/85 backdrop-blur-xl border-b border-border/80 shadow-xs dark:shadow-black/20 py-2.5'
          : 'bg-background/60 backdrop-blur-md border-b border-border/40 py-3.5'
      } ${className}`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo & Brand Identity */}
          <Link
            href="/"
            onClick={(e) => {
              if (pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-3 group select-none"
          >
            <div className="relative flex items-center justify-center">
              <Image
                src="/Logo-mark.png"
                alt="TrustScan Logo"
                width={36}
                height={36}
                className="w-9 h-9 object-contain drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-headline font-bold tracking-tight text-foreground group-hover:text-primary transition-colors duration-200">
                TrustScan
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 tracking-wider">
                AI
              </span>
            </div>
          </Link>

          {/* Centered Desktop Navigation Pill */}
          <nav className="hidden lg:flex items-center gap-1 bg-card/60 dark:bg-card/40 border border-border/60 backdrop-blur-md p-1 rounded-full shadow-xs">
            {navigationItems.map((item) => {
              const active = isLinkActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-1.5 text-sm rounded-full transition-all duration-200 select-none ${
                    active
                      ? 'bg-background text-foreground font-semibold shadow-xs border border-border/50'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="flex items-center gap-2 bg-card/60 dark:bg-card/40 border border-border/60 p-1 pl-1.5 pr-2 rounded-full shadow-xs">
                <Link
                  href="/user-dashboard"
                  className="flex items-center gap-2 pr-2 hover:opacity-80 transition-opacity"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary/30 to-secondary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-xs">
                    {user?.displayName ? user.displayName.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || 'U')}
                  </div>
                  <span className="text-xs font-medium text-foreground max-w-[120px] truncate">
                    {user?.displayName || user?.email?.split('@')[0] || 'Account'}
                  </span>
                </Link>
                <div className="h-4 w-px bg-border" />
                <button
                  onClick={handleLogout}
                  className="text-xs font-medium text-muted-foreground hover:text-destructive px-2 py-1 rounded-full hover:bg-destructive/10 transition-colors cursor-pointer"
                  title="Sign out of account"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground px-3.5 py-1.5 rounded-full hover:bg-muted/50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-all duration-200 shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30 active:scale-95"
                >
                  <span>Get Started</span>
                  <Icon name="ArrowRightIcon" size={14} />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-card border border-border text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle navigation menu"
            >
              <Icon
                name={isMobileMenuOpen ? 'XMarkIcon' : 'Bars3Icon'}
                size={20}
                variant="outline"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden mt-2 px-4">
          <div className="bg-card/95 backdrop-blur-2xl border border-border/80 rounded-2xl p-4 shadow-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-1">
              {navigationItems.map((item) => {
                const active = isLinkActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'bg-primary/10 text-primary font-semibold border border-primary/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Icon name={item.icon as any} size={18} variant="outline" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-border flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/user-dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium text-foreground bg-muted/40 hover:bg-muted/70 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-xs">
                      {user?.displayName ? user.displayName.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || 'U')}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-xs leading-tight">{user?.displayName || 'User Account'}</span>
                      <span className="text-[11px] text-muted-foreground leading-tight">{user?.email}</span>
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-center px-4 py-2 rounded-xl text-xs font-medium text-destructive hover:bg-destructive/10 border border-destructive/20 transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium text-foreground bg-muted hover:bg-muted/80 border border-border transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors shadow-sm shadow-primary/25"
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