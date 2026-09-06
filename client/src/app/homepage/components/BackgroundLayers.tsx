'use daylight';
import React from 'react';

export default function BackgroundLayers() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" aria-hidden="true">
      {/* Layer 1: Three large blurred drifting orbs */}
      <div
        className="absolute -top-24 -left-24 w-[600px] h-[600px] rounded-full bg-[#FF6B4A] opacity-[0.07] dark:opacity-[0.12] blur-[120px] animate-drift-1"
        style={{ willChange: 'transform' }}
      />
      <div
        className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full bg-[#818CF8] opacity-[0.07] dark:opacity-[0.12] blur-[110px] animate-drift-2"
        style={{ willChange: 'transform' }}
      />
      <div
        className="absolute -bottom-32 left-1/4 w-[450px] h-[450px] rounded-full bg-[#4ADE80] opacity-[0.07] dark:opacity-[0.12] blur-[100px] animate-drift-3"
        style={{ willChange: 'transform' }}
      />

      {/* Layer 2: Subtle 60px grid overlay with radial edge fade mask */}
      <div
        className="absolute inset-0 opacity-[0.4] dark:opacity-[0.3]"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          color: 'var(--color-border)',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 35%, black 20%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 35%, black 20%, transparent 85%)',
        }}
      />

      {/* Layer 3: 1.5% SVG Noise Texture for Organic Grain */}
      <div
        className="absolute inset-0 opacity-[0.018] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />
    </div>
  );
}
