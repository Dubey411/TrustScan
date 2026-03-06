"use client";

import Header from '@/components/common/Header';
import DashboardInteractive from './components/DashboardInteractive';
import GPTDashboardLayout from './components/gpt-layout/GPTDashboardLayout';

  /* eslint-disable @typescript-eslint/no-unused-vars */
  import { useAuth } from '@/context/AuthContext';
  import { useEffect, useState } from 'react';
  import { API_BASE_URL } from '@/api/scan';

  interface Scan {
    _id: string;
    type: string;
    content: string;
    fileName?: string;
    fileMimeType?: string;
    riskScore: number;
    status: 'fraud' | 'suspicious' | 'safe' | 'scam' | 'risky' | 'action_required';
    createdAt: string;
  }



  export default function UserDashboardClient() {
    const { user, loading: authLoading } = useAuth();
    const [scans, setScans] = useState<Scan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<any>(null);

    useEffect(() => {
        if (!authLoading && user) {
            console.log(`🔄 [Dashboard] Fetching data for UID: ${user.uid}`);
            
            // Fetch History
            fetch(`${API_BASE_URL}/history/${user.uid}`)
                .then(res => res.json())
                .then(data => {
                    setScans(data);
                    setIsLoading(false);
                })
                .catch(err => console.error("History fetch error:", err));

            // Fetch User Profile (Credits/Plan)
            fetch(`${API_BASE_URL}/me/${user.uid}`)
                .then(res => res.json())
                .then(data => setUserProfile(data))
                .catch(err => console.error("Profile fetch error:", err));
        } else if (!authLoading && !user) {
            setIsLoading(false);
        }
    }, [user, authLoading]);



    // --- Dynamic User Safety Calculation (Truth-Centric) ---
    const calculateSafetyScore = (scanList: Scan[]) => {
      if (scanList.length === 0) return 100;
      
      const totalSafety = scanList.reduce((acc, s) => {
          let coreRisk = s.riskScore || 0;
          
          // OVERRIDE: User Feedback is the "Ground Truth"
          const feedback = (s as any).userFeedback;
          if (feedback === 'incorrect_safe') {
              coreRisk = 0; // It was actually safe!
          } else if (feedback === 'incorrect_fraud') {
              coreRisk = 100; // It was actually a scam!
          } else if ((s as any).userRating >= 4) {
              // High rating implies ML was helpful/accurate
          }

          return acc + (100 - coreRisk);
      }, 0);

      const avgSafety = totalSafety / scanList.length;
      return Math.max(0, Math.min(100, Math.round(avgSafety)));
    };



    const userData = {
      name: user?.displayName || "User",
      memberSince: "January 2026",
      safetyScore: scans.length > 0 ? calculateSafetyScore(scans) : (userProfile?.overallSafetyScore || 100),
      scansRemaining: userProfile?.credits ?? 0, // Deep Scan Credits remaining
      totalScans: Math.max(userProfile?.totalScans || 0, scans.length),
      totalThreats: Math.max(userProfile?.totalThreats || 0, scans.filter(s => {
          const feedback = (s as any).userFeedback;
          if (feedback === 'incorrect_safe') return false; // Not a threat anymore
          return s.status === 'fraud' || s.status === 'scam' || s.riskScore > 70;
      }).length),
      planName: (userProfile?.plan || "Free").charAt(0).toUpperCase() + (userProfile?.plan || "Free").slice(1)
    };



    const statsData = [
    {
      icon: "MagnifyingGlassIcon",
      label: "Total Scans",
      value: userData.totalScans,
      trend: userData.totalScans > 0 ? `+${userData.totalScans}` : "0",
      trendUp: true
    },
    {
      icon: "ShieldCheckIcon",
      label: "Threats Detected",
      value: userData.totalThreats,
      trend: userData.totalThreats > 0 ? "High Alert" : "Stable",
      trendUp: false
    },
    {
      icon: "FireIcon",
      label: "Safety Streak",
      value: scans.length > 0 ? "15 days" : "0 days",
      trend: scans.length > 0 ? "+3 days" : "Start today",
      trendUp: true
    },
    {
      icon: "TrophyIcon",
      label: "Safety Rank",
      value: userData.planName === 'Pro' ? (userData.safetyScore > 80 ? "Gold" : "Silver") : "Trial",
      trend: userData.planName === 'Pro' ? "Top 10%" : "Upgrade for Rank",
      trendUp: true
    }];



    const activitiesData = scans.slice(0, 5).map(scan => {
      const feedback = (scan as any).userFeedback;
      let displayStatus: 'safe' | 'risky' | 'scam' = scan.status === 'fraud' || scan.status === 'scam' ? 'scam' : scan.status === 'suspicious' || scan.status === 'risky' ? 'risky' : 'safe';
      let description = scan.status === 'safe' ? "Verified as safe and legitimate." : `Flagged as ${scan.status} with ${scan.riskScore}% risk.`;

      if (feedback === 'incorrect_safe') {
        displayStatus = 'safe';
        description = "Verified as safe (User Corrected)";
      } else if (feedback === 'incorrect_fraud') {
        displayStatus = 'scam';
        description = "Confirmed as scam (User Corrected)";
      }

      return {
        id: scan._id,
        type: 'scan' as const,
        title: `${scan.type.charAt(0).toUpperCase() + scan.type.slice(1)} Scan`,
        description,
        timestamp: new Date(scan.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: displayStatus
      };
    });



    const scansData = scans.map(scan => {
        // Map backend status to frontend table results
        let mappedResult: 'safe' | 'risky' | 'scam' = 'safe';
        const feedback = (scan as any).userFeedback;

        if (feedback === 'incorrect_safe') {
            mappedResult = 'safe';
        } else if (feedback === 'incorrect_fraud') {
            mappedResult = 'scam';
        } else {
            if (scan.status === 'fraud' || scan.status === 'scam') mappedResult = 'scam';
            else if (scan.status === 'suspicious' || scan.status === 'risky' || scan.status === 'action_required') mappedResult = 'risky';
        }

        return {
            ...scan, // Spread all DB fields first
            id: scan._id,
            scanType: scan.type.charAt(0).toUpperCase() + scan.type.slice(1),
            target: scan.fileName || (scan.content.substring(0, 30) + (scan.content.length > 30 ? '...' : '')),
            result: mappedResult,
            confidence: feedback === 'incorrect_safe' ? 0 : scan.riskScore,

            date: new Date(scan.createdAt).toLocaleDateString(),
            time: new Date(scan.createdAt).toLocaleTimeString(),
        };
    });



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
        earned: userData.totalScans >= 1,
        earnedDate: userData.totalScans >= 1 ? "Unlocked" : null
      },
      {
        id: 2,
        name: "Vigilant Scanner",
        description: "Perform 10 active scans",
        icon: "EyeIcon",
        earned: userData.totalScans >= 10,
        progress: userData.totalScans < 10 ? userData.totalScans : undefined,
        total: 10,
        earnedDate: userData.totalScans >= 10 ? "Unlocked" : null
      },
      {
        id: 3,
        name: "Threat Hunter",
        description: "Detect 3 scam attempts",
        icon: "ShieldExclamationIcon",
        earned: userData.totalThreats >= 3,
        progress: userData.totalThreats < 3 ? userData.totalThreats : undefined,
        total: 3,
        earnedDate: userData.totalThreats >= 3 ? "Unlocked" : null
      },
      {
        id: 4,
        name: "Clean Record",
        description: "Analyze 5 safe documents",
        icon: "ShieldCheckIcon",
        earned: (userData.totalScans - userData.totalThreats) >= 5,
        progress: (userData.totalScans - userData.totalThreats) < 5 ? (userData.totalScans - userData.totalThreats) : undefined,
        total: 5,
      },
      {
        id: 5,
        name: "Premium Member",
        description: "Unlock all Pro features",
        icon: "StarIcon",
        earned: userData.planName !== 'Free',
        earnedDate: userData.planName !== 'Free' ? "Active" : null
      }];


  const profileData = {
    name: user?.displayName || "TrustScan User",
    email: user?.email || "user@trustscan.ai",
    phone: user?.phoneNumber || "+91 (Verified Account)",
    avatar: user?.photoURL || "https://img.rocket.new/generatedImages/rocket_gen_img_1e14322e7-1763296357021.png",
    avatarAlt: "User profile avatar",
    institution: "Academic/Professional Account",
    graduationYear: "Active"
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
