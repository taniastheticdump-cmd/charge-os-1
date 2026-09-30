import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  MapPin,
  CalendarCheck,
  Zap,
  History,
  BarChart3,
  Cpu,
  Settings,
  Shield,
  Layers,
  Truck,
  Users,
  Compass
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onNavigate }) => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const driverLinks = [
    { id: 'driver', label: 'Dashboard', icon: Home },
    { id: 'find-chargers', label: 'Find Chargers', icon: MapPin },
    { id: 'bookings', label: 'My Bookings', icon: CalendarCheck },
    { id: 'charging', label: 'Live Session', icon: Zap },
    { id: 'history', label: 'Charging History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'simulation', label: 'Simulation Lab', icon: Cpu },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const operatorLinks = [
    { id: 'operator', label: 'Station Management', icon: Shield },
    { id: 'find-chargers', label: 'Live Network Map', icon: Compass },
    { id: 'bookings', label: 'Station Reservations', icon: CalendarCheck },
    { id: 'history', label: 'Delivered Energy Log', icon: History },
    { id: 'analytics', label: 'Operator Analytics', icon: BarChart3 },
    { id: 'simulation', label: 'Grid Load Lab', icon: Cpu },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const fleetLinks = [
    { id: 'fleet', label: 'Fleet Overview', icon: Truck },
    { id: 'find-chargers', label: 'Route & Stations', icon: MapPin },
    { id: 'bookings', label: 'Fleet Reservations', icon: CalendarCheck },
    { id: 'history', label: 'Fleet Charging Log', icon: History },
    { id: 'analytics', label: 'TCO & Energy Stats', icon: BarChart3 },
    { id: 'simulation', label: 'Fleet EV Lab', icon: Cpu },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const navLinks = role === 'operator' ? operatorLinks : role === 'fleet_manager' ? fleetLinks : driverLinks;

  return (
    <aside className="w-64 bg-[#0F172A] text-slate-300 min-h-[calc(100vh-4rem)] flex flex-col justify-between shrink-0 border-r border-slate-800 hidden md:flex">
      <div className="py-6 px-4">
        {/* Role Header Badge */}
        <div className="mb-6 px-3 py-2 bg-slate-900/80 rounded-md border border-slate-800">
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Active Portal</p>
          <p className="text-sm font-bold text-white capitalize mt-0.5">
            {role.replace('_', ' ')} Workspace
          </p>
          <p className="text-[11px] text-blue-400 font-mono mt-0.5">Region: Maharashtra (MH)</p>
        </div>

        {/* Nav Links */}
        <nav className="space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#2563EB] text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Network Stat */}
      <div className="p-4 border-t border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center justify-between mb-1 text-[11px]">
          <span className="text-slate-500">System Status</span>
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active Online
          </span>
        </div>
        <p className="text-[11px] text-slate-500">Currency: Indian Rupee (₹ INR)</p>
      </div>
    </aside>
  );
};
