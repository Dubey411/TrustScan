'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MainContent from './MainContent';

// Define types for the rich dashboard data
interface DashboardDataProps {
  userData: any;
  statsData: any[];
  activitiesData: any[];
  scansData: any[]; // Note: this might overlap with the specific format we used for history, we'll need to reconcile
  shortcutsData: any[];
  notificationSettings: any[];
  badgesData: any[];
  profileData: any;
}

interface GPTDashboardLayoutProps extends DashboardDataProps {
  // We can treat the incoming scansData as the initial history
}

const GPTDashboardLayout = ({ 
  userData,
  statsData,
  activitiesData,
  scansData, // This comes from props, we'll use it to init our local history
  shortcutsData,
  notificationSettings,
  badgesData,
  profileData
}: GPTDashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'overview' | 'new' | 'result'>('overview'); 
  const [activeScanId, setActiveScanId] = useState<number | string | undefined>(undefined);
  
  // Transform initial scansData to match our internal history format if needed
  // For simplicity, let's assume they are compatible or we map them.
  // The 'scansData' from page.tsx has: id, scanType, target, result, confidence, date, time.
  // Our internal state needs: id, target, result, date, time, scanType, confidence.
  // It looks compatible enough.
  const [scans, setScans] = useState(scansData);

  const handleNewScan = () => {
    setCurrentView('new');
    setActiveScanId(undefined);
  };

  const handleGoHome = () => {
    setCurrentView('overview');
    setActiveScanId(undefined);
  };

  const handleSelectScan = (id: number | string) => {
    setActiveScanId(id);
    setCurrentView('result');
  };

  const handleScanComplete = (data: { id: string | number; type: string; target: string; apiResult?: any }) => {
      console.log('🎯 handleScanComplete raw data:', data);

      // Create a new scan entry from API result
      let resultStatus = data.apiResult?.status || 'safe';
      
      // Map backend status to frontend types
      if (resultStatus === 'fraud') resultStatus = 'scam';
      if (resultStatus === 'suspicious') resultStatus = 'risky';
      
      // Log full data for debugging to catch mapping issues
      console.log('🎯 handleScanComplete Full Data:', data);
      
      // Robust ID extraction: Check data.id, data._id, apiResult.id, and apiResult._id
      const scanId = data.id || (data as any)._id || data.apiResult?.id || data.apiResult?._id;
      
      if (!scanId) {
          console.error('❌ CRITICAL: No Scan ID found in API response!', data);
      }

      const newScan = {
          id: scanId || `temp-${Date.now()}`, // Still use a temp but mark it so it fails validation gracefully
          target: data.target,
          result: resultStatus as 'safe' | 'risky' | 'scam',
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          scanType: data.type,
          confidence: data.apiResult?.riskScore || 0,
          reasons: data.apiResult?.reasons || [],
          flags: data.apiResult?.flags || { green: [], red: [] },
          signals: data.apiResult?.signals || {},
          scanMeta: data.apiResult?.scanMeta || undefined,
          recommendation: data.apiResult?.recommendation || []
      };

      // Add to history
      setScans([newScan, ...scans]);
      
      // Select the new scan and show results
      setActiveScanId(newScan.id);
      setCurrentView('result');
  };

  const formattedScans = scans.map(scan => ({
      id: scan.id,
      target: scan.target,
      date: scan.date,
      result: scan.result
  }));

  const activeScan = scans.find(scan => scan.id === activeScanId);


  return (
    <div className="flex h-screen bg-background overflow-hidden relative pt-16">
      <MainContent
        currentView={currentView}
        onScanComplete={handleScanComplete}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        activeScan={activeScan}
        // Pass all dashboard data to MainContent
        dashboardProps={{
            userData,
            statsData,
            activitiesData,
            scansData: scans, // Pass the live updated scans list
            shortcutsData,
            notificationSettings,
            badgesData,
            profileData
        }}
        onGoHome={handleGoHome}
        onNewScan={handleNewScan}
        onSelectScan={handleSelectScan}
      />
    </div>
  );
};

export default GPTDashboardLayout;
