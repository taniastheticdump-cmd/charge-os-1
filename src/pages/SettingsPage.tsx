import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { getSupabaseConfig, saveSupabaseConfig, testSupabaseConnection } from '../services/supabase';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  User,
  Sliders,
  Shield,
  Database,
  CheckCircle2,
  AlertCircle,
  LogOut,
  IndianRupee,
  MapPin
} from 'lucide-react';

interface SettingsPageProps {
  onNavigate: (tab: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const { user, updateProfile, signOut, isSupabaseActive } = useAuth();
  const { showToast } = useNotifications();

  // Profile Form
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [searchRadius, setSearchRadius] = useState<number>(user?.default_search_radius_km || 15);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Supabase Connection Form
  const existingConfig = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(existingConfig.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(existingConfig.anonKey);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTestingDb, setIsTestingDb] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    await updateProfile({
      full_name: fullName,
      phone,
      default_search_radius_km: searchRadius
    });
    setIsSavingProfile(false);
    showToast('Settings Saved', 'Profile information updated successfully.');
  };

  const handleTestAndSaveDb = async () => {
    setIsTestingDb(true);
    setTestResult(null);

    if (!supabaseUrl || !supabaseAnonKey) {
      saveSupabaseConfig('', '');
      setTestResult({ success: true, message: 'Reverted to local persistent PostgreSQL engine.' });
      setIsTestingDb(false);
      return;
    }

    const res = await testSupabaseConnection(supabaseUrl, supabaseAnonKey);
    setTestResult(res);

    if (res.success) {
      saveSupabaseConfig(supabaseUrl, supabaseAnonKey);
      showToast('Database Connected', 'Supabase credentials saved and active.');
    }
    setIsTestingDb(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-lg border border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A]">Account & Platform Settings</h1>
          <p className="text-xs text-[#334155] mt-1">
            Manage your personal profile, search preferences, and database configurations.
          </p>
        </div>
        <Badge variant={isSupabaseActive ? 'green' : 'blue'} size="md">
          {isSupabaseActive ? 'Supabase Connected' : 'Local Postgres Engine'}
        </Badge>
      </div>

      {/* Profile & Preferences Card */}
      <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-lg border border-slate-200 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <User className="w-4 h-4 text-[#2563EB]" />
          <h2 className="text-sm font-bold text-[#0F172A]">Driver & Operator Profile</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">Email Address</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 text-slate-500 rounded cursor-not-allowed"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">Default Search Radius (km)</label>
            <select
              value={searchRadius}
              onChange={e => setSearchRadius(Number(e.target.value))}
              className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-[#2563EB]"
            >
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={15}>15 km (Recommended)</option>
              <option value={25}>25 km</option>
              <option value={50}>50 km</option>
            </select>
          </div>
        </div>

        {/* Currency Rule: Always default to Indian Rupee INR */}
        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1">Operational Currency</label>
          <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded text-xs text-[#0F172A] font-semibold">
            <IndianRupee className="w-4 h-4 text-[#2563EB]" />
            <span>INR (₹) • Mandatory for all Maharashtra grid transactions</span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="primary" size="sm" type="submit" isLoading={isSavingProfile}>
            Save Changes
          </Button>
        </div>
      </form>

      {/* Supabase Database Connection Card */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#2563EB]" />
            <h2 className="text-sm font-bold text-[#0F172A]">Supabase PostgreSQL Connection</h2>
          </div>
          <span className="text-[11px] text-slate-500">Live or Local Storage</span>
        </div>

        <p className="text-xs text-[#334155]">
          ChargeOS operates with full persistence. You can connect your live Supabase cloud project here, or continue using the built-in PostgreSQL-compliant transactional engine.
        </p>

        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1">Supabase URL</label>
          <input
            type="text"
            placeholder="https://xyzcompany.supabase.co"
            value={supabaseUrl}
            onChange={e => setSupabaseUrl(e.target.value)}
            className="w-full text-xs p-2.5 border border-slate-300 rounded font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1">Supabase Anon Key</label>
          <input
            type="password"
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
            value={supabaseAnonKey}
            onChange={e => setSupabaseAnonKey(e.target.value)}
            className="w-full text-xs p-2.5 border border-slate-300 rounded font-mono"
          />
        </div>

        {testResult && (
          <div
            className={`p-3 rounded text-xs flex items-start gap-2 ${
              testResult.success
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        <div className="flex justify-between items-center pt-2">
          <span className="text-[11px] text-slate-400">
            PostgreSQL schema located at <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">supabase/schema.sql</code>
          </span>
          <Button variant="secondary" size="sm" isLoading={isTestingDb} onClick={handleTestAndSaveDb}>
            Test & Save Supabase
          </Button>
        </div>
      </div>

      {/* Security & Sign Out Card */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#0F172A]">End User Session</h3>
          <p className="text-xs text-slate-500">Sign out of your account on this device</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            signOut();
            onNavigate('landing');
          }}
          icon={<LogOut className="w-4 h-4 text-red-600" />}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
};
