"use client";

import React, { useEffect, useState } from 'react';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';
import { API_BASE_URL } from '@/api/scan';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface AdminStats {
  totalScans: number;
  totalUsers: number;
  registeredUsers: number;
  guestScans: number;
  typeStats: Record<string, number>;
  statusStats: Record<string, number>;
}

interface ChartDay {
  _id: string;
  count: number;
  threats: number;
}

interface AICategoryPerformance {
  category: string;
  accuracy: number;
  totalVerified: number;
}

interface LearningLog {
  date: string;
  topic: string;
  observation: string;
  action: string;
  improvement: string;
}

interface DatasetRecommendation {
  source: string;
  type: string;
  utility: string;
}

interface AIIntelligence {
  categoryPerformance: AICategoryPerformance[];
  learningTrace: LearningLog[];
  recommendations: DatasetRecommendation[];
}

const AdminAnalyticsClient = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [chartData, setChartData] = useState<ChartDay[]>([]);
  const [aiIntelligence, setAiIntelligence] = useState<AIIntelligence | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'ai'>('overview');

  useEffect(() => {
    if (loading) return;

    if (!user || user.email !== 'trustscan.ai@gmail.com') {
        router.replace('/user-dashboard');
        return;
    }

    const fetchData = async () => {
      try {
        const [statsRes, chartRes, aiRes] = await Promise.all([
          fetch(`${API_BASE_URL}/admin/stats`),
          fetch(`${API_BASE_URL}/admin/chart-data`),
          fetch(`${API_BASE_URL}/admin/ai-intelligence`)
        ]);

        const statsData = await statsRes.json();
        const chartData = await chartRes.json();
        const aiData = await aiRes.json();

        setStats(statsData);
        setChartData(chartData);
        setAiIntelligence(aiData);
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
          <polyline fill="url(#areaGradient)" points={areaPoints} />
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
          
          <div className="flex flex-wrap gap-4">
             <div className="bg-card border border-border px-6 py-3 rounded-2xl shadow-sm min-w-[120px]">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Gross Scans</p>
                <p className="text-2xl font-black text-foreground">{stats?.totalScans.toLocaleString()}</p>
             </div>
             <div className="bg-primary/5 border border-primary/20 px-6 py-3 rounded-2xl shadow-sm min-w-[120px]">
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Verified Users</p>
                <p className="text-2xl font-black text-primary">{stats?.registeredUsers.toLocaleString()}</p>
             </div>
             <div className="bg-slate-50 border border-slate-200 px-6 py-3 rounded-2xl shadow-sm min-w-[120px]">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Guest Activities</p>
                <p className="text-2xl font-black text-slate-700">{stats?.guestScans.toLocaleString()}</p>
             </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-4 mb-8 border-b border-border pb-4">
           <button 
             onClick={() => setActiveTab('overview')}
             className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}
           >
             System Overview
           </button>
           <button 
             onClick={() => setActiveTab('ai')}
             className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'ai' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}
           >
             <Icon name="CpuChipIcon" size={16} />
             AI Performance & Learning
           </button>
        </div>

        {activeTab === 'overview' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
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

              <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-3xl p-8">
                 <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                   <Icon name="LightBulbIcon" size={20} className="text-primary" />
                   Executive Intelligence Summary
                 </h3>
                  <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                    <p>
                      The platform is currently witnessing a <span className="text-foreground font-bold">{((stats?.totalScans || 0) > 100) ? 'high' : 'steady'}</span> adoption rate. 
                      Beyond our <span className="text-primary font-bold">{stats?.registeredUsers || 0} verified users</span>, we've enabled <span className="text-slate-700 font-bold">{stats?.guestScans || 0} guest scans</span>, expanding our safety footprint across the global ecosystem.
                    </p>
                    <p>
                      Security analysis shows that <span className="text-red-600 font-bold">{stats?.statusStats['fraud'] || 0} fraudulent attempts</span> have been neutralized. 
                      Currently, {Math.round(((stats?.guestScans || 0) / (stats?.totalScans || 1)) * 100)}% of our database intelligence is powered by anonymous public verifications.
                    </p>
                  </div>
              </div>
            </div>

            <div className="space-y-8">
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
                             <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${(count / (stats?.totalScans || 1)) * 100}%` }} />
                          </div>
                       </div>
                     ))}
                  </div>
               </div>

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
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-card border border-border rounded-3xl p-8">
                   <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <Icon name="CheckBadgeIcon" size={20} className="text-emerald-500" />
                      Category Prediction Accuracy
                   </h3>
                   <div className="space-y-6">
                      {aiIntelligence?.categoryPerformance.map(perf => (
                        <div key={perf.category} className="p-4 bg-muted/30 rounded-2xl border border-border/50">
                           <div className="flex justify-between items-end mb-2">
                              <div>
                                 <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{perf.category}</span>
                                 <h4 className="text-xl font-black">{Math.round(perf.accuracy || 0)}%</h4>
                              </div>
                              <span className="text-[10px] text-muted-foreground font-bold">{perf.totalVerified} Verified Scans</span>
                           </div>
                           <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500" style={{ width: `${perf.accuracy}%` }} />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="bg-card border border-border rounded-3xl p-8">
                   <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <Icon name="LightBulbIcon" size={20} className="text-amber-500" />
                      Dataset Recommendations
                   </h3>
                   <div className="space-y-4">
                      {aiIntelligence?.recommendations.map((rec, i) => (
                        <div key={i} className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                           <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-black text-amber-600 uppercase">{rec.type} Source</span>
                              <Icon name="ArrowTopRightOnSquareIcon" size={14} className="text-amber-400" />
                           </div>
                           <h4 className="font-bold text-foreground">{rec.source}</h4>
                           <p className="text-xs text-muted-foreground mt-1">{rec.utility}</p>
                        </div>
                      ))}
                   </div>
                </div>
             </div>

             <div className="bg-card border border-border rounded-3xl p-8">
                <h3 className="text-lg font-bold mb-8">System Learning Timeline (Indian Fraud Vector)</h3>
                <div className="space-y-12 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
                   {aiIntelligence?.learningTrace.map((log, i) => (
                     <div key={i} className="relative pl-12">
                        <div className="absolute left-0 top-1 w-9 h-9 bg-background border-2 border-primary rounded-full flex items-center justify-center z-10">
                           <Icon name="AcademicCapIcon" size={18} className="text-primary" />
                        </div>
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                           <div className="flex-grow">
                              <div className="flex items-center gap-3 mb-2">
                                 <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase">{log.date}</span>
                                 <h4 className="font-bold text-lg">{log.topic}</h4>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                 <div className="p-4 bg-muted/20 rounded-xl">
                                    <span className="text-[10px] font-bold uppercase text-muted-foreground">The Challenge</span>
                                    <p className="text-sm mt-1">{log.observation}</p>
                                 </div>
                                 <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl">
                                    <span className="text-[10px] font-bold uppercase text-primary">The Response</span>
                                    <p className="text-sm mt-1">{log.action}</p>
                                 </div>
                              </div>
                           </div>
                           <div className="md:w-48 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                              <Icon name="ArrowTrendingUpIcon" size={24} className="text-emerald-500 mx-auto mb-1" />
                              <span className="text-[10px] font-bold uppercase text-emerald-600 block">Impact</span>
                              <p className="text-xs font-bold text-emerald-700">{log.improvement}</p>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminAnalyticsClient;
