import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/homepage',
        destination: '/',
        permanent: true,
      },
      {
        source: '/fake-offer-letter-check',
        destination: '/offer-letter-verification',
        permanent: true,
      },
      {
        source: '/ai-image-detector',
        destination: '/image-verification',
        permanent: true,
      },
      {
        source: '/fake-upi-check',
        destination: '/payment-verification',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
