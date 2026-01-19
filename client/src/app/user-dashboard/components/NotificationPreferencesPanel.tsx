'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  icon: string;
}

interface NotificationPreferencesPanelProps {
  initialSettings: NotificationSetting[];
}

const NotificationPreferencesPanel = ({ initialSettings }: NotificationPreferencesPanelProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [settings, setSettings] = useState<NotificationSetting[]>(initialSettings);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleToggle = (id: string) => {
    if (!isHydrated) return;
    
    setSettings(prev => 
      prev.map(setting => 
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  if (!isHydrated) {
    return (
      <div className="bg-card rounded-lg p-6 shadow-brand">
        <h2 className="text-xl font-headline font-bold text-foreground mb-6">Notification Preferences</h2>
        <div className="space-y-4">
          {initialSettings.map((setting) => (
            <div key={setting.id} className="flex items-start justify-between py-3 border-b border-border last:border-0">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 bg-primary/10 rounded-lg mt-1">
                  <Icon name={setting.icon as any} size={20} variant="outline" className="text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground mb-1">{setting.label}</h3>
                  <p className="text-xs text-muted-foreground">{setting.description}</p>
                </div>
              </div>
              <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${setting.enabled ? 'bg-primary' : 'bg-muted'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${setting.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-6 shadow-brand">
      <h2 className="text-xl font-headline font-bold text-foreground mb-6">Notification Preferences</h2>
      
      <div className="space-y-4">
        {settings.map((setting) => (
          <div key={setting.id} className="flex items-start justify-between py-3 border-b border-border last:border-0">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 bg-primary/10 rounded-lg mt-1">
                <Icon name={setting.icon as any} size={20} variant="outline" className="text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground mb-1">{setting.label}</h3>
                <p className="text-xs text-muted-foreground">{setting.description}</p>
              </div>
            </div>
            
            <button
              onClick={() => handleToggle(setting.id)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${setting.enabled ? 'bg-primary' : 'bg-muted'}`}
              role="switch"
              aria-checked={setting.enabled}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${setting.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-border">
        <button className="w-full bg-primary text-primary-foreground font-headline font-semibold py-3 rounded-lg hover:bg-trust-blue transition-all duration-300 hover:shadow-brand">
          Save Preferences
        </button>
      </div>
    </div>
  );
};

export default NotificationPreferencesPanel;