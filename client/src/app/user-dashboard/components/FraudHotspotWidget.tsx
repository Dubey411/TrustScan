import React from 'react';
import Icon from '@/components/ui/AppIcon';

const hotspots = [
    { city: "New Delhi", risk: "Critical", trend: "Increasing", alert: "Fake Government Job Letters" },
    { city: "Bengaluru", risk: "High", trend: "Stable", alert: "IT Internship Scams" },
    { city: "Mumbai", risk: "Medium", trend: "Decreasing", alert: "Payment Link Phishing" },
    { city: "Noida", risk: "Critical", trend: "Increasing", alert: "Work from Home Data Entry" }
];

export default function FraudHotspotWidget() {
    return (
        <div className="bg-card rounded-xl shadow-brand p-6 border border-border">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-error/10 rounded-lg">
                        <Icon name="MapPinIcon" size={24} variant="solid" className="text-error" />
                    </div>
                    <div>
                        <h3 className="text-xl font-headline font-bold text-foreground">Fraud Hotspots</h3>
                        <p className="text-sm text-muted-foreground">Real-time geo-intelligence (India)</p>
                    </div>
                </div>
                <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] uppercase font-bold rounded-full">Pro Feature</span>
            </div>

            <div className="space-y-4">
                {hotspots.map((spot, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg group hover:bg-muted/50 transition-all border border-transparent hover:border-error/20">
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${spot.risk === 'Critical' ? 'bg-error animate-pulse' : 'bg-warning'}`} />
                            <div>
                                <h4 className="font-semibold text-foreground">{spot.city}</h4>
                                <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">{spot.alert}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`text-xs font-bold ${spot.risk === 'Critical' ? 'text-error' : 'text-warning'}`}>{spot.risk}</div>
                            <div className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
                                <Icon name={spot.trend === 'Increasing' ? "ArrowTrendingUpIcon" : "ArrowTrendingDownIcon"} size={10} />
                                {spot.trend}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full mt-6 py-3 border-2 border-dashed border-border rounded-lg text-xs font-bold text-muted-foreground hover:text-primary hover:border-primary/50 transition-all">
                View Full Interactive Fraud Map
            </button>
        </div>
    );
}
