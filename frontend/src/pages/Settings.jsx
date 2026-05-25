import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Bell, Shield, Zap } from 'lucide-react';
import { useState } from 'react';

function Settings() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [settings, setSettings] = useState({
    autoGenCoverLetter: true,
    autoFillForms: true,
    matchScoreThreshold: 70,
    notifications: {
      emailNotifications: true,
      applicationUpdates: true,
      newJobMatches: true,
    },
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    // Add API call to save settings
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <section className="rounded-[2rem] border border-slate-800/80 bg-slate-950/90 p-8 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.34em] text-sky-400/80">Preferences</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Settings</h2>
            <p className="mt-2 max-w-2xl text-slate-400">Customize your automation preferences and notification settings.</p>
          </div>
          <SettingsIcon className="h-12 w-12 text-sky-400/40" />
        </div>

        {saved && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400"
          >
            ✓ Settings saved successfully!
          </motion.div>
        )}
      </section>

      {/* Automation Settings */}
      <motion.section className="rounded-[2rem] border border-slate-800/80 bg-slate-950/90 p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Zap className="h-6 w-6 text-amber-400" />
          <h3 className="text-xl font-semibold text-white">Automation</h3>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/40 p-4">
            <div>
              <p className="font-semibold text-white">Auto-generate Cover Letters</p>
              <p className="mt-1 text-sm text-slate-400">Automatically generate cover letters when applying to jobs</p>
            </div>
            <input
              type="checkbox"
              checked={settings.autoGenCoverLetter}
              onChange={(e) => setSettings({ ...settings, autoGenCoverLetter: e.target.checked })}
              className="h-5 w-5 rounded border-slate-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/40 p-4">
            <div>
              <p className="font-semibold text-white">Auto-fill Forms</p>
              <p className="mt-1 text-sm text-slate-400">Automatically fill application forms with your resume data</p>
            </div>
            <input
              type="checkbox"
              checked={settings.autoFillForms}
              onChange={(e) => setSettings({ ...settings, autoFillForms: e.target.checked })}
              className="h-5 w-5 rounded border-slate-600 cursor-pointer"
            />
          </div>

          <div className="rounded-lg border border-slate-700/50 bg-slate-900/40 p-4">
            <label className="block font-semibold text-white mb-3">
              Match Score Threshold
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={settings.matchScoreThreshold}
                onChange={(e) => setSettings({ ...settings, matchScoreThreshold: parseInt(e.target.value) })}
                className="flex-1 h-2 bg-slate-700 rounded-full cursor-pointer"
              />
              <span className="text-lg font-bold text-sky-400 w-12">{settings.matchScoreThreshold}%</span>
            </div>
            <p className="mt-2 text-sm text-slate-400">Only apply to jobs with a match score above this threshold</p>
          </div>
        </div>
      </motion.section>

      {/* Notification Settings */}
      <motion.section className="rounded-[2rem] border border-slate-800/80 bg-slate-950/90 p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="h-6 w-6 text-sky-400" />
          <h3 className="text-xl font-semibold text-white">Notifications</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/40 p-4">
            <div>
              <p className="font-semibold text-white">Email Notifications</p>
              <p className="mt-1 text-sm text-slate-400">Receive email updates about your applications</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.emailNotifications}
              onChange={(e) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, emailNotifications: e.target.checked }
              })}
              className="h-5 w-5 rounded border-slate-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/40 p-4">
            <div>
              <p className="font-semibold text-white">Application Updates</p>
              <p className="mt-1 text-sm text-slate-400">Get notified when application status changes</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.applicationUpdates}
              onChange={(e) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, applicationUpdates: e.target.checked }
              })}
              className="h-5 w-5 rounded border-slate-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/40 p-4">
            <div>
              <p className="font-semibold text-white">New Job Matches</p>
              <p className="mt-1 text-sm text-slate-400">Get notified about new jobs matching your criteria</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.newJobMatches}
              onChange={(e) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, newJobMatches: e.target.checked }
              })}
              className="h-5 w-5 rounded border-slate-600 cursor-pointer"
            />
          </div>
        </div>
      </motion.section>

      {/* Privacy Settings */}
      <motion.section className="rounded-[2rem] border border-slate-800/80 bg-slate-950/90 p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-6 w-6 text-emerald-400" />
          <h3 className="text-xl font-semibold text-white">Privacy & Security</h3>
        </div>

        <div className="rounded-lg border border-slate-700/50 bg-slate-900/40 p-4">
          <p className="font-semibold text-white mb-4">Account Information</p>
          <div className="space-y-3 text-sm text-slate-400">
            <div className="flex justify-between">
              <span>Email:</span>
              <span className="text-white">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span>Name:</span>
              <span className="text-white">{user.fullName}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700">
              <button className="text-red-400 hover:text-red-300 text-sm font-semibold">
                Change Password
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-8 py-3 font-semibold text-white transition hover:shadow-lg hover:shadow-sky-500/30"
        >
          Save Settings
        </button>
      </div>
    </motion.div>
  );
}

export default Settings;
