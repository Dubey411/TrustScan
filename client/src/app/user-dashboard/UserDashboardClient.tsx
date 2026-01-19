"use client";

import Header from '@/components/common/Header';
import DashboardInteractive from './components/DashboardInteractive';
import GPTDashboardLayout from './components/gpt-layout/GPTDashboardLayout';

  /* eslint-disable @typescript-eslint/no-unused-vars */
  import { useAuth } from '@/context/AuthContext';
  import { useEffect, useState } from 'react';

  interface Scan {
    _id: string;
    type: string;
    content: string;
    riskScore: number;
    status: 'fraud' | 'suspicious' | 'safe';
    createdAt: string;
  }

  export default function UserDashboardClient() {
    const { user } = useAuth();
    const [scans, setScans] = useState<Scan[]>([]);

    useEffect(() => {
        if (user) {
            fetch(`http://localhost:5000/api/history/${user.uid}`)
                .then(res => res.json())
                .then(data => setScans(data))
                .catch(err => console.error("Failed to fetch history:", err));
        }
    }, [user]);

    const userData = {
      name: user?.displayName || "User",
      memberSince: "January 2026",
      safetyScore: 87,
      scansRemaining: 3,
      totalScans: scans.length,
      planName: "Free"
    };

    const statsData = [
    {
      icon: "MagnifyingGlassIcon",
      label: "Total Scans",
      value: scans.length,
      trend: "+12%",
      trendUp: true
    },
    // ... other stats remain mocked for now
    {
      icon: "ShieldCheckIcon",
      label: "Threats Detected",
      value: scans.filter(s => s.status === 'fraud').length,
      trend: "-5%",
      trendUp: false
    },
    {
      icon: "FireIcon",
      label: "Safety Streak",
      value: "15 days",
      trend: "+3 days",
      trendUp: true
    },
    {
      icon: "TrophyIcon",
      label: "Badges Earned",
      value: 5,
      trend: "+2",
      trendUp: true
    }];


    const activitiesData = [
    // Mocked for display as backend doesn't track activities separately yet
    {
      id: 1,
      type: 'scan' as const,
      title: "Job Offer Scanned",
      description: "Software Developer position at TechCorp verified as safe",
      timestamp: "2 hours ago",
      status: 'safe' as const
    }];

    const scansData = scans.map(scan => ({
        id: scan._id,
        scanType: scan.type.charAt(0).toUpperCase() + scan.type.slice(1),
        target: scan.content.substring(0, 30) + (scan.content.length > 30 ? '...' : ''),
        result: scan.status as 'safe' | 'scam' | 'risky',
        confidence: scan.riskScore,
        date: new Date(scan.createdAt).toLocaleDateString(),
        time: new Date(scan.createdAt).toLocaleTimeString(),
        reasons: (scan as any).reasons || [],
        flags: (scan as any).flags || { green: [], red: [] },
        signals: (scan as any).signals || {},
        scanMeta: (scan as any).scanMeta || undefined,
        recommendation: (scan as any).recommendation || []
    }));

    // Mocked shortcuts and notification settings
    const shortcutsData = [
      {
        id: 1,
        name: "Job Offer",
        icon: "BriefcaseIcon",
        description: "Verify job postings instantly",
        color: "bg-gradient-to-br from-primary to-trust-blue"
      },
      {
        id: 2,
        name: "Internship",
        icon: "AcademicCapIcon",
        description: "Check internship authenticity",
        color: "bg-gradient-to-br from-secondary to-success-green"
      },
      {
        id: 3,
        name: "Email Scan",
        icon: "EnvelopeIcon",
        description: "Analyze recruitment emails",
        color: "bg-gradient-to-br from-trust-indigo to-primary"
      },
      {
        id: 4,
        name: "Link Check",
        icon: "LinkIcon",
        description: "Verify suspicious URLs",
        color: "bg-gradient-to-br from-conversion-accent to-warning"
      }];
    
      const notificationSettings = [
      {
        id: "scan-results",
        label: "Scan Results",
        description: "Get notified when your scans are complete",
        enabled: true,
        icon: "BellIcon"
      },
      {
        id: "threat-alerts",
        label: "Threat Alerts",
        description: "Receive alerts about new scam patterns",
        enabled: true,
        icon: "ExclamationTriangleIcon"
      },
      {
        id: "weekly-summary",
        label: "Weekly Summary",
        description: "Get weekly reports of your scanning activity",
        enabled: false,
        icon: "ChartBarIcon"
      },
      {
        id: "promotional",
        label: "Promotional Updates",
        description: "Stay updated about new features and offers",
        enabled: false,
        icon: "SparklesIcon"
      }];
    
      const badgesData = [
      {
        id: 1,
        name: "First Scan",
        description: "Complete your first security scan",
        icon: "CheckBadgeIcon",
        earned: true,
        earnedDate: "Jan 2026"
      },
      {
        id: 2,
        name: "Vigilant Scanner",
        description: "Perform 10 consecutive scans",
        icon: "EyeIcon",
        earned: true,
        earnedDate: "Jan 2026"
      },
      {
        id: 3,
        name: "Threat Hunter",
        description: "Detect 5 scam attempts",
        icon: "ShieldExclamationIcon",
        earned: true,
        earnedDate: "Jan 2026"
      },
      {
        id: 4,
        name: "Safety Streak",
        description: "Maintain 30-day scanning streak",
        icon: "FireIcon",
        earned: false,
        progress: 15,
        total: 30
      },
      {
        id: 5,
        name: "Community Guardian",
        description: "Report 10 new scam patterns",
        icon: "UserGroupIcon",
        earned: false,
        progress: 3,
        total: 10
      },
      {
        id: 6,
        name: "Premium Member",
        description: "Upgrade to premium plan",
        icon: "StarIcon",
        earned: false
      }];


  const profileData = {
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    phone: "+91 98765 43210",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1e14322e7-1763296357021.png",
    avatarAlt: "Professional headshot of young Indian woman with long dark hair wearing blue blazer smiling at camera",
    institution: "Indian Institute of Technology, Delhi",
    graduationYear: "2027"
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-background">
      <Header />
      
      <GPTDashboardLayout 
        userData={userData}
        statsData={statsData}
        activitiesData={activitiesData}
        scansData={scansData}
        shortcutsData={shortcutsData}
        notificationSettings={notificationSettings}
        badgesData={badgesData}
        profileData={profileData}
      />
    </div>);

}
