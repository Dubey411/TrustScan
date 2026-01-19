'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  avatarAlt: string;
  institution: string;
  graduationYear: string;
}

interface ProfileManagementSectionProps {
  profile: UserProfile;
}

const ProfileManagementSection = ({ profile }: ProfileManagementSectionProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>(profile);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    if (!isHydrated) return;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!isHydrated) return;
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (!isHydrated) return;
    setFormData(profile);
    setIsEditing(false);
  };

  if (!isHydrated) {
    return (
      <div className="bg-card rounded-lg p-6 shadow-brand">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-headline font-bold text-foreground">Profile Settings</h2>
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex flex-col items-center lg:items-start">
            <div className="relative">
              <AppImage
                src={profile.avatar}
                alt={profile.avatarAlt}
                className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
              />
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                <div className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground">
                  {profile.name}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                <div className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground">
                  {profile.email}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                <div className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground">
                  {profile.phone}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Institution</label>
                <div className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground">
                  {profile.institution}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Expected Graduation</label>
                <div className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground">
                  {profile.graduationYear}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-6 shadow-brand">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-headline font-bold text-foreground">Profile Settings</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:text-trust-blue transition-colors duration-300"
          >
            <Icon name="PencilIcon" size={16} variant="outline" />
            Edit Profile
          </button>
        )}
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex flex-col items-center lg:items-start">
          <div className="relative">
            <AppImage
              src={formData.avatar}
              alt={formData.avatarAlt}
              className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
            />
            {isEditing && (
              <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full hover:bg-trust-blue transition-colors duration-300 shadow-brand">
                <Icon name="CameraIcon" size={16} variant="solid" />
              </button>
            )}
          </div>
          {isEditing && (
            <button className="mt-3 text-sm text-primary hover:text-trust-blue font-medium transition-colors duration-300">
              Change Photo
            </button>
          )}
        </div>
        
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                <div className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground">
                  {formData.name}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                <div className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground">
                  {formData.email}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                <div className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground">
                  {formData.phone}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Institution</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => handleInputChange('institution', e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                <div className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground">
                  {formData.institution}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Expected Graduation</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.graduationYear}
                  onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                <div className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground">
                  {formData.graduationYear}
                </div>
              )}
            </div>
          </div>
          
          {isEditing && (
            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={handleSave}
                className="flex-1 bg-primary text-primary-foreground font-headline font-semibold py-3 rounded-lg hover:bg-trust-blue transition-all duration-300 hover:shadow-brand"
              >
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-muted text-foreground font-headline font-semibold py-3 rounded-lg hover:bg-muted/80 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileManagementSection;