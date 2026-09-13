import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/login',
        '/forgot-password',
        '/results-dashboard',
        '/user-dashboard',
        '/results/',
      ],
    },
    sitemap: 'https://www.trustscanai.in/sitemap.xml',
  };
}
