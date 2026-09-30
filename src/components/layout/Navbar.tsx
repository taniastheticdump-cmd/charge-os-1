import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Zap,
  Bell,
  CheckCheck,
  LogOut,
  Sliders,
  ChevronDown,
  ExternalLink,
  Shield,
  Truck,
  Car
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate }) => {
  const { user, signOut, switchRole, isSupabaseActive } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('landing')}>
            <div className="w-10 h-10 rounded-lg bg-[#0F172A] flex items-center justify-center text-white shadow-sm">
              <Zap className="w-5 h-5 fill-[#2563EB] text-[#2563EB]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-[#0F172A]">CHARGE</span>
                <span className="text-xl font-extrabold text-[#2563EB]">OS</span>
                <span className="text-[10px] tracking-wider uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded ml-1">
                  MH Network
                </span>
              </div>
            </div>
          </div>

          {/* Center Links (Public vs Logged In) */}
          <nav className="hidden md:flex items-center gap-6">
            {!user ? (
              <>
                <button
                  onClick={() => onNavigate('landing')}
                  className={`text-sm font-medium ${currentTab === 'landing' ? 'text-[#2563EB]' : 'text-[#334155] hover:text-[#0F172A]'}`}
                >
                  Home
                </button>
                <button
                  onClick={() => onNavigate('find-chargers')}
                  className={`text-sm font-medium ${currentTab === 'find-chargers' ? 'text-[#2563EB]' : 'text-[#334155] hover:text-[#0F172A]'}`}
                >
                  Find Chargers
                </button>
                <button
                  onClick={() => onNavigate('simulation')}
                  className={`text-sm font-medium ${currentTab === 'simulation' ? 'text-[#2563EB]' : 'text-[#334155] hover:text-[#0F172A]'}`}
                >
                  Simulation Lab
                </button>
                <button
                  onClick={() => onNavigate('privacy-policy')}
                  className={`text-sm font-medium ${currentTab === 'privacy-policy' ? 'text-[#2563EB]' : 'text-[#334155] hover:text-[#0F172A]'}`}
                >
                  Privacy
                </button>
                <button
                  onClick={() => onNavigate('terms-and-conditions')}
                  className={`text-sm font-medium ${currentTab === 'terms-and-conditions' ? 'text-[#2563EB]' : 'text-[#334155] hover:text-[#0F172A]'}`}
                >
                  Terms
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('find-chargers')}
                  className={`text-sm font-medium transition-colors ${currentTab === 'find-chargers' ? 'text-[#2563EB] font-semibold' : 'text-[#334155] hover:text-[#0F172A]'}`}
                >
                  Find Chargers
                </button>
                <button
                  onClick={() => onNavigate('charging')}
                  className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${currentTab === 'charging' ? 'text-[#2563EB] font-semibold' : 'text-[#334155] hover:text-[#0F172A]'}`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Charging
                </button>
                <button
                  onClick={() => onNavigate('simulation')}
                  className={`text-sm font-medium transition-colors ${currentTab === 'simulation' ? 'text-[#2563EB] font-semibold' : 'text-[#334155] hover:text-[#0F172A]'}`}
                >
                  Simulation Lab
                </button>
              </>
            )}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Role Switcher Pills for convenience */}
                <div className="hidden lg:flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200 text-xs">
                  <button
                    onClick={() => {
                      switchRole('driver');
                      onNavigate('driver');
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                      user.role === 'driver'
                        ? 'bg-white text-[#0F172A] font-semibold shadow-xs'
                        : 'text-[#334155] hover:text-[#0F172A]'
                    }`}
                  >
                    <Car className="w-3.5 h-3.5" />
                    Driver
                  </button>
                  <button
                    onClick={() => {
                      switchRole('operator');
                      onNavigate('operator');
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                      user.role === 'operator'
                        ? 'bg-white text-[#0F172A] font-semibold shadow-xs'
                        : 'text-[#334155] hover:text-[#0F172A]'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Operator
                  </button>
                  <button
                    onClick={() => {
                      switchRole('fleet_manager');
                      onNavigate('fleet');
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                      user.role === 'fleet_manager'
                        ? 'bg-white text-[#0F172A] font-semibold shadow-xs'
                        : 'text-[#334155] hover:text-[#0F172A]'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                    Fleet
                  </button>
                </div>

                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-[#334155] hover:text-[#0F172A] hover:bg-slate-100 rounded-md transition-colors"
                    aria-label="View notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-[#2563EB] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Popover */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                        <span className="text-sm font-semibold text-[#0F172A]">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-xs text-[#2563EB] hover:underline flex items-center gap-1"
                          >
                            <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-500">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map(n => (
                            <div
                              key={n.id}
                              onClick={() => markRead(n.id)}
                              className={`p-3 text-left transition-colors cursor-pointer ${
                                !n.is_read ? 'bg-blue-50/40 hover:bg-blue-50/70' : 'hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-[#0F172A]">{n.title}</span>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-xs text-[#334155] mt-1">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs">
                      {user.full_name?.charAt(0) || 'U'}
                    </div>
                    <div className="text-left hidden sm:block">
                      <p className="text-xs font-semibold text-[#0F172A] truncate max-w-[100px]">{user.full_name}</p>
                      <p className="text-[10px] text-[#334155] uppercase font-medium tracking-wide">
                        {user.role.replace('_', ' ')}
                      </p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl border border-slate-200 z-50 py-1 divide-y divide-slate-100">
                      <div className="px-4 py-2">
                        <p className="text-xs font-semibold text-[#0F172A]">{user.full_name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        <div className="mt-1">
                          <Badge variant={isSupabaseActive ? 'green' : 'blue'} size="sm">
                            {isSupabaseActive ? 'Supabase Connected' : 'Local Postgres Engine'}
                          </Badge>
                        </div>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => {
                            onNavigate('settings');
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-[#334155] hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          Account Settings
                        </button>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => {
                            signOut();
                            setShowUserMenu(false);
                            onNavigate('landing');
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => onNavigate('login')}>
                  Sign In
                </Button>
                <Button variant="primary" size="sm" onClick={() => onNavigate('signup')}>
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
