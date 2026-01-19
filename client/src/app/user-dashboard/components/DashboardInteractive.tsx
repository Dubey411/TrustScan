'use client';

import React from 'react';
import WelcomeSection from './WelcomeSection';
import QuickStatsWidget from './QuickStatsWidget';
import RecentActivityTimeline from './RecentActivityTimeline';
import ScanHistoryTable from './ScanHistoryTable';
import FavoriteScanShortcuts from './FavoriteScanShortcuts';
import UpgradePromptCard from './UpgradePromptCard';
import NotificationPreferencesPanel from './NotificationPreferencesPanel';
import SafetyBadgesPanel from './SafetyBadgesPanel';
import ProfileManagementSection from './ProfileManagementSection';

interface DashboardInteractiveProps {
  userData: {
    name: string;
    memberSince: string;
    safetyScore: number;
    scansRemaining: number;
    totalScans: number;
    planName: string;
  };
  statsData: Array<{
    icon: string;
    label: string;
    value: string | number;
    trend?: string;
    trendUp?: boolean;
  }>;
  activitiesData: Array<{
    id: number;
    type: 'scan' | 'threat' | 'upgrade' | 'achievement';
    title: string;
    description: string;
    timestamp: string;
    status: 'safe' | 'risky' | 'scam' | 'info';
  }>;
  scansData: Array<{
    id: string | number;
    scanType: string;
    target: string;
    result: 'safe' | 'risky' | 'scam';
    confidence: number;
    date: string;
    time: string;
  }>;
  shortcutsData: Array<{
    id: number;
    name: string;
    icon: string;
    description: string;
    color: string;
  }>;
  notificationSettings: Array<{
    id: string;
    label: string;
    description: string;
    enabled: boolean;
    icon: string;
  }>;
  badgesData: Array<{
    id: number;
    name: string;
    description: string;
    icon: string;
    earned: boolean;
    earnedDate?: string;
    progress?: number;
    total?: number;
  }>;
  profileData: {
    name: string;
    email: string;
    phone: string;
    avatar: string;
    avatarAlt: string;
    institution: string;
    graduationYear: string;
  };
  onNewScan?: () => void;
  onSelectScan?: (id: string | number) => void;
}

const DashboardInteractive = ({
  userData,
  statsData,
  activitiesData,
  scansData,
  shortcutsData,
  notificationSettings,
  badgesData,
  profileData,
  onNewScan,
  onSelectScan
}: DashboardInteractiveProps) => {
  return (
    <div className="space-y-8">
      <WelcomeSection
        userName={userData.name}
        memberSince={userData.memberSince}
        safetyScore={userData.safetyScore}
      />
      
      <QuickStatsWidget stats={statsData} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <RecentActivityTimeline activities={activitiesData} />
          <ScanHistoryTable scans={scansData} onSelectScan={onSelectScan} />
          <SafetyBadgesPanel badges={badgesData} />
        </div>
        
        <div className="space-y-8">
          <FavoriteScanShortcuts shortcuts={shortcutsData} onNewScan={onNewScan} />
          <UpgradePromptCard
            scansRemaining={userData.scansRemaining}
            totalScans={userData.totalScans}
            planName={userData.planName}
          />
          <NotificationPreferencesPanel initialSettings={notificationSettings} />
        </div>
      </div>
      
      {/* <ProfileManagementSection profile={profileData} /> */}
    </div>
  );
};

export default DashboardInteractive;