import type { Metadata } from 'next';
import UserDashboardClient from './UserDashboardClient';

export const metadata: Metadata = {
  title: 'User Dashboard - TrustScan',
  description: 'Manage your scan history, view usage analytics, and access personalized safety insights on your TrustScan dashboard.',
  alternates: {
    canonical: '/user-dashboard',
  },
};

export default function UserDashboardPage() {
  return <UserDashboardClient />;
}