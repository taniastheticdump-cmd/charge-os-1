import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { ChargingSession, ChargingStation, Charger } from '../types';
import {
  fetchStations,
  startChargingSession,
  updateChargingSession,
  stopChargingSession,
  getChargingSessions
} from '../services/db';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import {
  Zap,
  Play,
  Pause,
  Square,
  Clock,
  BatteryCharging,
  IndianRupee,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Server
} from 'lucide-react';

export const ChargingSessionPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast, refreshNotifications } = useNotifications();

  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string>('');
  const [selectedChargerId, setSelectedChargerId] = useState<string>('');
  const [activeSession, setActiveSession] = useState<ChargingSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Live timer interval ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load user's current session or available stations
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const stList = await fetchStations();
      const chargeosStations = stList.filter(s => s.is_chargeos_network && s.chargers && s.chargers.length > 0);
      setStations(chargeosStations);

      if (chargeosStations.length > 0) {
        setSelectedStationId(chargeosStations[0].id);
        if (chargeosStations[0].chargers && chargeosStations[0].chargers.length > 0) {
          setSelectedChargerId(chargeosStations[0].chargers[0].id);
        }
      }

      if (user) {
        const sessions = await getChargingSessions(user.id);
        const live = sessions.find(s => s.status === 'active' || s.status === 'paused');
        if (live) {
          setActiveSession(live);
        }
      }
      setLoading(false);
    };

    init();
  }, [user]);

  // Real-time ticking simulation when session is active
  useEffect(() => {
    if (activeSession && activeSession.status === 'active') {
      timerRef.current = setInterval(async () => {
        setActiveSession(prev => {
          if (!prev || prev.status !== 'active') return prev;

          const newDuration = prev.duration_seconds + 1;
          // Energy delivered: (Power in kW * (time in hours)) * 0.92 efficiency factor
          const hours = newDuration / 3600;
          const newEnergy = Number((prev.charger_power_kw * hours * 0.92).toFixed(2));
          // Rate ~ ₹17.50 / kWh
          const unitRate = 17.5;
          const newCost = Number((newEnergy * unitRate).toFixed(2));

          const updated = {
            ...prev,
            duration_seconds: newDuration,
            energy_delivered_kwh: newEnergy,
            total_cost_inr: newCost
          };

          // Periodically sync to database every 5 seconds
          if (newDuration % 5 === 0) {
            updateChargingSession(prev.id, {
              duration_seconds: newDuration,
              energy_delivered_kwh: newEnergy,
              total_cost_inr: newCost
            });
          }

          return updated;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeSession?.status, activeSession?.id]);

  const handleStartSession = async () => {
    if (!user) return;
    const currentStation = stations.find(s => s.id === selectedStationId);
    const currentCharger = currentStation?.chargers?.find(c => c.id === selectedChargerId);
    const power = currentCharger?.power_kw || 60;

    const newSession = await startChargingSession({
      user_id: user.id,
      charger_id: selectedChargerId || 'chg-bkc-01',
      station_id: selectedStationId || 'station-bkc',
      charger_power_kw: power
    });

    setActiveSession(newSession);
    showToast('Session Initiated', `DEMO CHARGING MODE: Initiated at ${power} kW output.`);
    await refreshNotifications();
  };

  const handlePauseResume = async () => {
    if (!activeSession) return;
    const newStatus = activeSession.status === 'active' ? 'paused' : 'active';
    const updated = await updateChargingSession(activeSession.id, { status: newStatus });
    if (updated) {
      setActiveSession(updated);
      showToast(newStatus === 'paused' ? 'Session Paused' : 'Session Resumed', `Current state: ${newStatus}`);
    }
  };

  const handleStopSession = async () => {
    if (!activeSession) return;
    const completed = await stopChargingSession(activeSession.id);
    if (completed) {
      showToast('Charging Complete', `Saved to database: ₹${completed.total_cost_inr.toFixed(2)} INR (${completed.energy_delivered_kwh} kWh).`);
      setActiveSession(null);
      await refreshNotifications();
    }
  };

  const selectedStation = stations.find(s => s.id === selectedStationId);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#0F172A]">Live Charging Console</h1>
            <Badge variant="amber" size="sm">DEMO CHARGING MODE</Badge>
          </div>
          <p className="text-xs text-[#334155] mt-1">
            Real-time telemetry and energy calculation stored in PostgreSQL. Prepared for OCPP 2.0.1 IoT hardware integration.
          </p>
        </div>
      </div>

      {/* Mandatory Demo Label Banner */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-start gap-3 text-xs text-amber-900">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-sm block mb-0.5">DEMO CHARGING MODE</span>
          Physical charger hardware and IoT telemetry relays are in simulated test mode. All energy increments, durations, and costs in Indian Rupees (₹ INR) are calculated and persisted to PostgreSQL records.
        </div>
      </div>

      {/* Session Active Console or Initiation Form */}
      {activeSession ? (
        <div className="bg-[#0F172A] text-white rounded-xl p-8 border border-slate-800 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <BatteryCharging className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Session ID: {activeSession.id}</p>
                <h3 className="text-lg font-bold text-white">
                  Active Energy Stream: {activeSession.charger_power_kw} kW
                </h3>
              </div>
            </div>

            <Badge variant={activeSession.status === 'active' ? 'green' : 'amber'} size="md">
              {activeSession.status === 'active' ? 'CHARGING ACTIVE' : 'CHARGING PAUSED'}
            </Badge>
          </div>

          {/* Large Live Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-4">
            {/* Elapsed Time */}
            <div className="bg-slate-900/80 p-5 rounded-lg border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block mb-1">Elapsed Time</span>
              <span className="text-3xl sm:text-4xl font-mono font-extrabold text-white">
                {Math.floor(activeSession.duration_seconds / 60).toString().padStart(2, '0')}:
                {(activeSession.duration_seconds % 60).toString().padStart(2, '0')}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">Minutes : Seconds</span>
            </div>

            {/* Energy Delivered */}
            <div className="bg-slate-900/80 p-5 rounded-lg border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block mb-1">Energy Delivered</span>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl sm:text-4xl font-mono font-extrabold text-emerald-400">
                  {activeSession.energy_delivered_kwh.toFixed(2)}
                </span>
                <span className="text-sm font-bold text-emerald-300">kWh</span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">Calculated from rate</span>
            </div>

            {/* Total Cost in INR */}
            <div className="bg-slate-900/80 p-5 rounded-lg border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block mb-1">Cost Incurred</span>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl sm:text-4xl font-mono font-extrabold text-blue-400">
                  ₹{activeSession.total_cost_inr.toFixed(2)}
                </span>
                <span className="text-sm font-bold text-slate-400">INR</span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">All currency in ₹ INR</span>
            </div>
          </div>

          {/* Interactive Controls */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              variant="outline"
              size="md"
              onClick={handlePauseResume}
              icon={activeSession.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            >
              {activeSession.status === 'active' ? 'Pause Telemetry' : 'Resume Telemetry'}
            </Button>

            <Button
              variant="danger"
              size="md"
              onClick={handleStopSession}
              icon={<Square className="w-4 h-4" />}
            >
              Stop & Finalize Session
            </Button>
          </div>
        </div>
      ) : (
        /* Initiation Card */
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
          <h2 className="text-base font-bold text-[#0F172A] border-b border-slate-100 pb-3">
            Initiate a Demo Charging Session
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Select ChargeOS Station
              </label>
              <select
                value={selectedStationId}
                onChange={e => {
                  setSelectedStationId(e.target.value);
                  const st = stations.find(s => s.id === e.target.value);
                  if (st?.chargers?.[0]) setSelectedChargerId(st.chargers[0].id);
                }}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded focus:ring-1 focus:ring-[#2563EB]"
              >
                {stations.map(st => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Select Charger Bay
              </label>
              <select
                value={selectedChargerId}
                onChange={e => setSelectedChargerId(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded focus:ring-1 focus:ring-[#2563EB]"
              >
                {selectedStation?.chargers?.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.identifier_code} • {c.power_kw} kW {c.current_type} ({c.connector_type}) - ₹{c.price_per_kwh_inr}/kWh
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded border border-slate-200 text-xs text-[#334155] space-y-2">
            <span className="font-semibold text-[#0F172A] block">Session Parameters</span>
            <p>
              Initiating this session will mark the selected charger bay as <strong>in_use</strong> across the network, calculate energy at high-precision rates, and store the resulting billing entry in PostgreSQL.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={handleStartSession}
              icon={<Zap className="w-4 h-4" />}
            >
              Start Demo Charging
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
