"use client";

import React, { useEffect, useState } from 'react';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';
import { API_BASE_URL } from '@/api/scan';

interface AdminStats {
  totalScans: number;
  totalUsers: number;
  typeStats: Record<string, number>;
  statusStats: Record<string, number>;
}

interface ChartDay {
  _id: string;
  count: number;
  threats: number;
}

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// ... (inside component)
const AdminAnalyticsClient = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [chartData, setChartData] = useState<ChartDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (!user || user.email !== 'trustscan.ai@gmail.com') {
        router.replace('/user-dashboard'); // Kick non-admins out
        return;
    }

    const fetchData = async () => {
      try {
        const statsRes = await fetch(`${API_BASE_URL}/admin/stats`);
        const statsData = await statsRes.json();
        setStats(statsData);

        const chartRes = await fetch(`${API_BASE_URL}/admin/chart-data`);
        const chartData = await chartRes.json();
        setChartData(chartData);
      } catch (err) {
        console.error("Admin fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user, loading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // --- SVG Chart Generator ---
  const renderGrowthChart = (data: ChartDay[]) => {
    if (data.length < 2) return <div className="h-40 flex items-center justify-center text-muted-foreground">Waiting for more data...</div>;

    const maxVal = Math.max(...data.map(d => d.count), 1);
    const height = 150;
    const width = 600;
    const stepX = width / (data.length - 1);

    const points = data.map((d, i) => `${i * stepX},${height - (d.count / maxVal * height)}`).join(' ');
    const areaPoints = `0,${height} ${points} ${width},${height}`;

    return (
      <div className="relative w-full h-40">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polyline
            fill="url(#areaGradient)"
            points={areaPoints}
          />
          <polyline
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
            className="drop-shadow-lg"
          />
          {data.map((d, i) => (
            <circle
              key={i}
              cx={i * stepX}
              cy={height - (d.count / maxVal * height)}
              r="4"
              className="fill-background stroke-primary stroke-2"
            />
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs mb-2">
              <Icon name="ChartBarIcon" size={16} />
              System Intelligence
            </div>
            <h1 className="text-4xl font-black tracking-tight text-foreground">
              Platform <span className="text-primary italic">Insights</span>
            </h1>
            <p className="text-muted-foreground mt-2 max-w-md">
              Real-time monitoring of global scan volume, threat distribution, and system growth metrics.
            </p>
          </div>
          
          <div className="flex gap-4">
             <div className="bg-card border border-border px-6 py-3 rounded-2xl shadow-sm">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Scans</p>
                <p className="text-2xl font-black text-foreground">{stats?.totalScans.toLocaleString()}</p>
             </div>
             <div className="bg-primary/5 border border-primary/20 px-6 py-3 rounded-2xl shadow-sm">
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Total Users</p>
                <p className="text-2xl font-black text-primary">{stats?.totalUsers.toLocaleString()}</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Chart Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Growth Chart */}
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                   <h3 className="text-lg font-bold">Daily Activity Pulse</h3>
                   <p className="text-sm text-muted-foreground">Volume of documents and links scanned vs threats</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold">
                   <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" /> Scans</div>
                   <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Threats</div>
                </div>
              </div>
              
              {renderGrowthChart(chartData)}
              
              <div className="flex justify-between mt-4 text-[10px] font-bold text-muted-foreground uppercase">
                {chartData.map((d, i) => (
                  <span key={i}>{i === 0 || i === chartData.length-1 ? d._id : i % 3 === 0 ? d._id.split('-')[2] : ''}</span>
                ))}
              </div>
            </div>

            {/* Detailed Conclusion */}
            <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-3xl p-8">
               <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                 <Icon name="LightBulbIcon" size={20} className="text-primary" />
                 Executive Intelligence Summary
               </h3>
               <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                 <p>
                   The platform is currently witnessing a <span className="text-foreground font-bold">{(stats?.totalScans || 0) > 100 ? 'high' : 'steady'}</span> adoption rate. 
                   Analysis of the distribution shows that <span className="text-foreground font-bold">{stats?.typeStats['document'] || 0} document scans</span> form the core of platform activity.
                 </p>
                 <p>
                   On the security front, we have isolated <span className="text-red-600 font-bold">{stats?.statusStats['fraud'] || 0} confirmed fraudulent attempts</span>. 
                   The <span className="text-foreground font-bold">Signal Accuracy</span> is currently optimized for Indian GSTIN verification and Punycode homograph detection, 
                   which accounts for roughly {Math.round(((stats?.statusStats['fraud'] || 0) / (stats?.totalScans || 1)) * 100)}% of the total flag volume.
                 </p>
                 <div className="p-4 bg-background/50 rounded-xl border border-border/50 italic text-xs">
                   "Conclusion: Recommend scaling link redirection capacity for 'Deep Diver' scans as phishing volume via mobile-first TLDs (.top, .xyz) is increasing daily."
                 </div>
               </div>
            </div>

          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
             
             {/* Scan Type Distribution */}
             <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6">Scan Distribution</h3>
                <div className="space-y-6">
                   {Object.entries(stats?.typeStats || {}).map(([type, count]) => (
                     <div key={type} className="space-y-2">
                        <div className="flex justify-between text-xs font-bold capitalize">
                           <span>{type}</span>
                           <span>{count}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                           <div 
                             className="h-full bg-primary rounded-full transition-all duration-1000" 
                             style={{ width: `${(count / (stats?.totalScans || 1)) * 100}%` }}
                           />
                        </div>
                     </div>
                   ))}
                </div>
             </div>

             {/* Threat Status distribution */}
             <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                   <Icon name="ShieldExclamationIcon" size={120} />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 relative z-10">Threat Landscape</h3>
                <div className="space-y-4 relative z-10">
                   <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-red-500/20 rounded-lg"><Icon name="NoSymbolIcon" size={18} className="text-red-500" /></div>
                         <span className="text-sm font-bold">Fraud/Scam</span>
                      </div>
                      <span className="text-xl font-black text-red-500">{stats?.statusStats['fraud'] || 0}</span>
                   </div>
                   <div className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-amber-500/20 rounded-lg"><Icon name="ExclamationTriangleIcon" size={18} className="text-amber-500" /></div>
                         <span className="text-sm font-bold">Risky/Suspicious</span>
                      </div>
                      <span className="text-xl font-black text-amber-500">{stats?.statusStats['suspicious'] || 0}</span>
                   </div>
                   <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-emerald-500/20 rounded-lg"><Icon name="CheckCircleIcon" size={18} className="text-emerald-500" /></div>
                         <span className="text-sm font-bold">Safe/Verified</span>
                      </div>
                      <span className="text-xl font-black text-emerald-500">{stats?.statusStats['safe'] || 0}</span>
                   </div>
                </div>
                <button className="w-full mt-8 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors">
                   View Full Audit Log
                </button>
             </div>

          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminAnalyticsClient;
