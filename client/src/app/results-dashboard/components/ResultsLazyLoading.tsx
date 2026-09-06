'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

export default function ResultsLazyLoading() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      {/* Top Banner Skeleton with Scanning Beam */}
      <div className="relative rounded-3xl bg-card border border-border p-8 overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-scan" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 w-full max-w-xl">
            <div className="flex items-center gap-3">
              <div className="h-6 w-32 bg-muted rounded-full animate-pulse" />
              <div className="h-6 w-24 bg-muted rounded-full animate-pulse" />
            </div>
            <div className="h-9 w-3/4 bg-muted rounded-xl animate-pulse" />
            <div className="h-4 w-full bg-muted/70 rounded-lg animate-pulse" />
            <div className="flex gap-2 pt-2">
              <div className="h-7 w-28 bg-muted rounded-lg animate-pulse" />
              <div className="h-7 w-32 bg-muted rounded-lg animate-pulse" />
              <div className="h-7 w-24 bg-muted rounded-lg animate-pulse" />
            </div>
          </div>

          <div className="w-full sm:w-64 h-28 bg-muted/60 rounded-2xl border border-border/50 p-4 space-y-3 flex flex-col justify-between">
            <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
            <div className="h-3 w-full bg-muted rounded-full animate-pulse" />
            <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Loading Status Indicator */}
      <div className="flex items-center justify-center gap-3 py-3 px-6 rounded-2xl bg-card/60 border border-border/60 max-w-md mx-auto">
        <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          Executing Final Prophet AI Synthesis & Adverse Audit...
        </span>
      </div>

      {/* Side-by-Side Left and Right Skeleton Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column Skeleton */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-5 w-40 bg-muted rounded animate-pulse" />
              <div className="h-5 w-20 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-32 bg-muted/50 rounded-xl animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted/40 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-muted/40 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-muted/40 rounded animate-pulse" />
            </div>
          </div>

          <div className="rounded-2xl bg-card border border-border p-6 space-y-3">
            <div className="h-5 w-48 bg-muted rounded animate-pulse mb-4" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-muted/40 rounded-xl animate-pulse flex items-center px-4 justify-between">
                <div className="h-4 w-1/3 bg-muted rounded" />
                <div className="h-5 w-16 bg-muted rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
            <div className="h-6 w-52 bg-muted rounded animate-pulse" />
            <div className="h-24 bg-muted/60 rounded-xl animate-pulse" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-16 bg-muted/40 rounded-xl animate-pulse" />
              <div className="h-16 bg-muted/40 rounded-xl animate-pulse" />
            </div>
          </div>

          <div className="rounded-2xl bg-card border border-border p-6 space-y-3">
            <div className="h-5 w-36 bg-muted rounded animate-pulse mb-4" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-muted/30 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
