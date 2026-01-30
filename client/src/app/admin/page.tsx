import type { Metadata } from 'next';
import AdminAnalyticsClient from './AdminAnalyticsClient';

export const metadata: Metadata = {
  title: 'Admin Insights - TrustScan',
  description: 'Overall platform growth, scan distribution, and fraud pattern conclusions.'
};

export default function AdminPage() {
  return <AdminAnalyticsClient />;
}
