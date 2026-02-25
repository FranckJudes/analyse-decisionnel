import React, { useState } from 'react';
import { User, Bell, Shield, Palette, Globe, Key, Save } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Input, Select, Toggle, Tabs } from '../components/ui';
import { useTheme } from '../context/theme-context';

const settingsSections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'language', label: 'Language', icon: Globe },
];

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile');
  const { theme, toggleTheme } = useTheme();

  const [profile, setProfile] = useState({
    firstName: 'Musharof',
    lastName: 'Chy',
    email: 'musharof@example.com',
    phone: '+1 (555) 123-4567',
    bio: 'Passionate UX designer',
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: true,
    security: true,
  });

  const [language, setLanguage] = useState('en');

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'French' },
    { value: 'es', label: 'Spanish' },
    { value: 'de', label: 'German' },
    { value: 'zh', label: 'Chinese' },
  ];

  const timezoneOptions = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
  ];

  const [timezone, setTimezone] = useState('America/New_York');

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account settings and preferences</p>
          </div>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <Card className="lg:col-span-1 h-fit">
            <CardContent className="p-2">
              <nav className="space-y-1">
                {settingsSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === section.id
                        ? 'bg-[#3c50e0] text-white'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <section.icon className="w-5 h-5" />
                    {section.label}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>

          {/* Content */}
          <div className="lg:col-span-3 space-y-6">
            {activeSection === 'profile' && (
              <>
                <Card>
                  <CardHeader>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Profile Information</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Update your personal information</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="First Name"
                        value={profile.firstName}
                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      />
                      <Input
                        label="Last Name"
                        value={profile.lastName}
                        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                      />
                    </div>
                    <Input
                      label="Email Address"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                    <Input
                      label="Phone Number"
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">Bio</label>
                      <textarea
                        rows={4}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3c50e0] focus:border-transparent"
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Change Password</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Update your password</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input label="Current Password" type="password" placeholder="Enter current password" />
                    <Input label="New Password" type="password" placeholder="Enter new password" />
                    <Input label="Confirm New Password" type="password" placeholder="Confirm new password" />
                  </CardContent>
                </Card>
              </>
            )}

            {activeSection === 'notifications' && (
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Notification Preferences</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Choose how you want to be notified</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Toggle
                      checked={notifications.email}
                      onChange={(checked) => setNotifications({ ...notifications, email: checked })}
                      label="Email Notifications"
                    />
                    <Toggle
                      checked={notifications.push}
                      onChange={(checked) => setNotifications({ ...notifications, push: checked })}
                      label="Push Notifications"
                    />
                    <Toggle
                      checked={notifications.sms}
                      onChange={(checked) => setNotifications({ ...notifications, sms: checked })}
                      label="SMS Notifications"
                    />
                  </div>
                  <hr className="border-slate-200 dark:border-slate-700" />
                  <div className="space-y-4">
                    <Toggle
                      checked={notifications.marketing}
                      onChange={(checked) => setNotifications({ ...notifications, marketing: checked })}
                      label="Marketing Emails"
                    />
                    <Toggle
                      checked={notifications.security}
                      onChange={(checked) => setNotifications({ ...notifications, security: checked })}
                      label="Security Alerts"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'security' && (
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Security Settings</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Manage your account security</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Key className="w-5 h-5 text-slate-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Two-Factor Authentication</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Add an extra layer of security</p>
                      </div>
                    </div>
                    <Toggle checked={false} onChange={() => {}} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-3">Active Sessions</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Chrome on MacOS</p>
                          <p className="text-xs text-slate-500">San Francisco, CA • Current session</p>
                        </div>
                        <Badge variant="success">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Safari on iPhone</p>
                          <p className="text-xs text-slate-500">San Francisco, CA • 2 hours ago</p>
                        </div>
                        <Button variant="ghost" size="sm">Revoke</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'appearance' && (
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Appearance</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Customize how the application looks</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-3">Theme</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => theme === 'dark' && toggleTheme()}
                        className={`p-4 border-2 rounded-lg transition-colors ${
                          theme === 'light'
                            ? 'border-[#3c50e0] bg-blue-50 dark:bg-blue-900/20'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="w-full h-16 bg-white border border-slate-200 rounded-md mb-2" />
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Light</p>
                      </button>
                      <button
                        onClick={() => theme === 'light' && toggleTheme()}
                        className={`p-4 border-2 rounded-lg transition-colors ${
                          theme === 'dark'
                            ? 'border-[#3c50e0] bg-blue-50 dark:bg-blue-900/20'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="w-full h-16 bg-slate-800 border border-slate-700 rounded-md mb-2" />
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Dark</p>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'language' && (
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Language & Region</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Set your language and timezone preferences</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Select
                    label="Language"
                    options={languageOptions}
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  />
                  <Select
                    label="Timezone"
                    options={timezoneOptions}
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
