/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { LandingPage } from './pages/LandingPage';
import { FindChargersPage } from './pages/FindChargersPage';
import { DriverDashboard } from './pages/DriverDashboard';
import { OperatorDashboard } from './pages/OperatorDashboard';
import { FleetManagementPage } from './pages/FleetManagementPage';
import { ChargingSessionPage } from './pages/ChargingSessionPage';
import { BookingsPage } from './pages/BookingsPage';
import { HistoryPage } from './pages/HistoryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SimulationLabPage } from './pages/SimulationLabPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPages } from './pages/AuthPages';
import { LegalPages } from './pages/LegalPages';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('landing');

  // Handle URL hash or path state on mount & back/forward
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.hash.replace('#', '') || 'landing';
      setCurrentTab(path);
    };

    if (window.location.hash) {
      handleLocationChange();
    } else if (user) {
      // Direct logged in user to role portal
      if (user.role === 'driver') setCurrentTab('driver');
      else if (user.role === 'operator') setCurrentTab('operator');
      else if (user.role === 'fleet_manager') setCurrentTab('fleet');
    }

    window.addEventListener('hashchange', handleLocationChange);
    return () => window.removeEventListener('hashchange', handleLocationChange);
  }, [user]);

  const handleNavigate = (tab: string) => {
    setCurrentTab(tab);
    window.location.hash = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-[#0F172A] tracking-wider uppercase">Loading ChargeOS Grid...</p>
        </div>
      </div>
    );
  }

  // Legal pages (stand-alone view)
  if (currentTab === 'privacy-policy') {
    return <LegalPages type="privacy" onBack={() => handleNavigate('landing')} />;
  }
  if (currentTab === 'terms-and-conditions') {
    return <LegalPages type="terms" onBack={() => handleNavigate('landing')} />;
  }

  // Authentication screens
  if (['login', 'signup', 'forgot-password', 'reset-password'].includes(currentTab)) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar currentTab={currentTab} onNavigate={handleNavigate} />
        <AuthPages
          mode={currentTab as 'login' | 'signup' | 'forgot-password' | 'reset-password'}
          onNavigate={handleNavigate}
        />
        <ToastContainer />
      </div>
    );
  }

  // Landing Page
  if (currentTab === 'landing') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar currentTab={currentTab} onNavigate={handleNavigate} />
        <LandingPage onNavigate={handleNavigate} />
        <ToastContainer />
      </div>
    );
  }

  // Find Chargers Page (Full Viewport Split Map)
  if (currentTab === 'find-chargers') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 overflow-hidden">
        <Navbar currentTab={currentTab} onNavigate={handleNavigate} />
        <FindChargersPage />
        <ToastContainer />
      </div>
    );
  }

  // Portal screens with Deep Navy Sidebar
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar currentTab={currentTab} onNavigate={handleNavigate} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar currentTab={currentTab} onNavigate={handleNavigate} />
        <main className="flex-1 overflow-y-auto">
          {currentTab === 'driver' && <DriverDashboard onNavigate={handleNavigate} />}
          {currentTab === 'operator' && <OperatorDashboard />}
          {currentTab === 'fleet' && <FleetManagementPage />}
          {currentTab === 'charging' && <ChargingSessionPage />}
          {currentTab === 'bookings' && <BookingsPage onNavigate={handleNavigate} />}
          {currentTab === 'history' && <HistoryPage />}
          {currentTab === 'analytics' && <AnalyticsPage />}
          {currentTab === 'simulation' && <SimulationLabPage />}
          {currentTab === 'settings' && <SettingsPage onNavigate={handleNavigate} />}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}
