import { Metadata } from 'next';
import CompanyReportClient from './CompanyReportClient';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Company Verification Report | TrustScan AI',
  description: 'Verified corporate details from MCA records. Check CIN status, registration date, and official address to verify business legitimacy.',
  alternates: {
    canonical: '/company-report',
  },
  robots: {
    index: false, // Don't index default company report page with no specific data
    follow: true,
  }
};

export default function CompanyReportPage() {
  return (
    <Suspense fallback={<div>Loading Company Details...</div>}>
      <CompanyReportClient />
    </Suspense>
  );
}
