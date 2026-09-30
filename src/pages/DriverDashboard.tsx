import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Booking, ChargingSession, ChargingStation } from '../types';
import { getBookings, getChargingSessions, fetchStations, cancelBooking } from '../services/db';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import {
  CalendarCheck,
  Zap,
  Clock,
  IndianRupee,
  MapPin,
  ArrowRight,
  Navigation,
  CheckCircle2,
  XCircle,
  PlusCircle,
  AlertCircle
} from 'lucide-react';

interface DriverDashboardProps {
  onNavigate: (tab: string) => void;
}

export const DriverDashboard: React.FC<DriverDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [sessions, setSessions] = useState<ChargingSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChargingSession | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const [userBookings, userSessions] = await Promise.all([
          getBookings(user.id),
          getChargingSessions(user.id)
        ]);

        setBookings(userBookings);
        setSessions(userSessions);

        const currentActive = userSessions.find(s => s.status === 'active' || s.status === 'paused');
        setActiveSession(currentActive || null);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  // Real Database calculations
  const totalEnergyKwh = sessions.reduce((acc, s) => acc + (s.energy_delivered_kwh || 0), 0);
  const totalCostInr = sessions.reduce((acc, s) => acc + (s.total_cost_inr || 0), 0);

  const upcomingBookings = bookings.filter(b => b.status === 'confirmed');
  const nextBooking = upcomingBookings[0] || null;

  const handleCancelBooking = async (bookingId: string) => {
    if (!user) return;
    const ok = await cancelBooking(bookingId, user.id);
    if (ok) {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Loading driver operational records from database...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome & Region Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
            Welcome, {user?.full_name || 'Driver'}
          </h1>
          <p className="text-xs text-[#334155] mt-1">
            Driver Portal • Real-time charging telemetry & reserved bays across Maharashtra
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('charging')}
            icon={<Zap className="w-4 h-4 text-emerald-600" />}
          >
            {activeSession ? 'Live Session Active' : 'Start Session'}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate('find-chargers')}
            icon={<MapPin className="w-4 h-4" />}
          >
            Find Chargers
          </Button>
        </div>
      </div>

      {/* Database Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Energy */}
        <div className="bg-white p-5 rounded-lg border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Total Energy Consumed</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-[#0F172A]">
              {totalEnergyKwh.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-[#2563EB]">kWh</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-2">Calculated from charging_sessions</span>
        </div>

        {/* Metric 2: Total Spent (INR) */}
        <div className="bg-white p-5 rounded-lg border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Total Charging Cost</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-[#0F172A]">
              ₹{totalCostInr.toFixed(2)}
            </span>
            <span className="text-xs font-semibold text-slate-500">INR</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-2">All rates in Indian Rupees</span>
        </div>

        {/* Metric 3: Total Completed Sessions */}
        <div className="bg-white p-5 rounded-lg border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Completed Sessions</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-[#0F172A]">
              {sessions.filter(s => s.status === 'completed').length}
            </span>
            <span className="text-xs font-semibold text-slate-500">Sessions</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-2">Historical charge logs</span>
        </div>

        {/* Metric 4: Active Upcoming Bookings */}
        <div className="bg-white p-5 rounded-lg border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Upcoming Reservations</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-[#0F172A]">
              {upcomingBookings.length}
            </span>
            <span className="text-xs font-semibold text-emerald-600">Active</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-2">Guaranteed bay reservation</span>
        </div>
      </div>

      {/* Main Split: Left (Upcoming Booking & Active Session) / Right (Recent History) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Session Spotlight */}
          {activeSession ? (
            <div className="bg-[#0F172A] text-white p-6 rounded-lg border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Live Session Active ({activeSession.status})
                  </span>
                </div>
                <Badge variant="blue" size="sm">{activeSession.charger_power_kw} kW Output</Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 border-y border-slate-800 py-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Elapsed Time</span>
                  <span className="font-mono text-base font-bold text-white">
                    {Math.floor(activeSession.duration_seconds / 60)}m {activeSession.duration_seconds % 60}s
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Energy Delivered</span>
                  <span className="font-mono text-base font-bold text-emerald-400">
                    {activeSession.energy_delivered_kwh.toFixed(2)} kWh
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Current Cost</span>
                  <span className="font-mono text-base font-bold text-blue-400">
                    ₹{activeSession.total_cost_inr.toFixed(2)} INR
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button variant="primary" size="sm" onClick={() => onNavigate('charging')}>
                  Open Live Session Telemetry
                </Button>
              </div>
            </div>
          ) : null}

          {/* Next Upcoming Booking Card */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-[#2563EB]" />
                <h2 className="text-sm font-bold text-[#0F172A]">Upcoming Bay Booking</h2>
              </div>
              <button
                onClick={() => onNavigate('bookings')}
                className="text-xs text-[#2563EB] hover:underline font-medium"
              >
                View All
              </button>
            </div>

            {!nextBooking ? (
              <EmptyState
                icon={CalendarCheck}
                title="No Upcoming Bookings"
                description="You do not have any confirmed charging slots reserved. Explore available stations to book your bay."
                actionText="Reserve a Slot"
                onAction={() => onNavigate('find-chargers')}
              />
            ) : (
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A]">{nextBooking.station?.name || 'ChargeOS Station'}</h3>
                    <p className="text-xs text-[#334155]">{nextBooking.station?.address}, {nextBooking.station?.city}</p>
                  </div>
                  <Badge variant="green" size="sm">Confirmed</Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1 border-t border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Date</span>
                    <span className="font-semibold text-[#0F172A]">{nextBooking.booking_date}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Slot</span>
                    <span className="font-semibold text-[#0F172A]">{nextBooking.start_time} - {nextBooking.end_time}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Charger</span>
                    <span className="font-semibold text-[#0F172A]">{nextBooking.charger?.identifier_code || 'Bay 01'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Paid</span>
                    <span className="font-bold text-emerald-700">₹{nextBooking.total_amount_inr.toFixed(2)} INR</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => handleCancelBooking(nextBooking.id)}
                    className="text-xs text-red-600 hover:underline font-medium"
                  >
                    Cancel Booking
                  </button>

                  {nextBooking.station && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${nextBooking.station.latitude},${nextBooking.station.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-[#0F172A]"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Navigate
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols) Recent Charging Activity */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-sm font-bold text-[#0F172A]">Recent Charging Sessions</h2>
              <button
                onClick={() => onNavigate('history')}
                className="text-xs text-[#2563EB] hover:underline font-medium"
              >
                Full History
              </button>
            </div>

            {sessions.length === 0 ? (
              <EmptyState
                icon={Zap}
                title="No Charging Sessions Yet"
                description="Your past charging sessions will appear here once you charge your EV at any ChargeOS hub."
              />
            ) : (
              <div className="space-y-3">
                {sessions.slice(0, 4).map(session => (
                  <div
                    key={session.id}
                    className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 text-xs flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-[#0F172A]">{session.station?.name || 'EV Station'}</p>
                      <p className="text-[11px] text-slate-500">
                        {new Date(session.start_time).toLocaleDateString()} • {Math.round(session.duration_seconds / 60)} mins
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-[#0F172A]">₹{session.total_cost_inr.toFixed(2)}</p>
                      <p className="text-[11px] text-emerald-600 font-semibold">{session.energy_delivered_kwh.toFixed(1)} kWh</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6 text-xs text-[#334155]">
            <p className="font-medium text-[#0F172A]">Live Maharashtra Support</p>
            <p className="text-slate-400 mt-0.5">Helpline: 1800-EV-CHARGE (24x7 roadside assist)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
