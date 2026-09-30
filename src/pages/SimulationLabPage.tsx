import React, { useState } from 'react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  Cpu,
  Zap,
  Clock,
  Activity,
  Layers,
  Info,
  TrendingUp,
  BarChart2
} from 'lucide-react';

export const SimulationLabPage: React.FC = () => {
  // Inputs
  const [numEvs, setNumEvs] = useState<number>(50);
  const [numChargers, setNumChargers] = useState<number>(8);
  const [chargerPowerKw, setChargerPowerKw] = useState<number>(60);
  const [avgDurationMins, setAvgDurationMins] = useState<number>(45);
  const [simulationHours, setSimulationHours] = useState<number>(12);
  const [demandFactor, setDemandFactor] = useState<number>(1.2); // peak multiplier

  // Results calculation
  const totalChargerCapacityKw = numChargers * chargerPowerKw;
  const estimatedPeakLoadKw = Math.min(
    totalChargerCapacityKw,
    Math.round(totalChargerCapacityKw * Math.min(demandFactor, 1.0))
  );

  // Energy demand: EVs * (avg duration in hrs) * (avg draw ~40kW)
  const totalEnergyDemandKwh = Math.round(numEvs * (avgDurationMins / 60) * Math.min(chargerPowerKw, 45));

  // Max vehicles chargers can process in simulation duration:
  const maxVehicleThroughput = Math.floor((numChargers * simulationHours * 60) / avgDurationMins);
  const estimatedWaitingTimeMins =
    numEvs > maxVehicleThroughput
      ? Math.round(((numEvs - maxVehicleThroughput) * avgDurationMins) / numChargers)
      : 0;

  const chargerUtilizationPercent = Math.min(
    100,
    Math.round(((numEvs * avgDurationMins) / (numChargers * simulationHours * 60)) * 100)
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#0F172A]">Simulation Lab</h1>
            <Badge variant="navy" size="sm">Grid Modeling</Badge>
          </div>
          <p className="text-xs text-[#334155] mt-1">
            Parametric mathematical simulator for modeling charging demand, grid load, and queuing delays.
          </p>
        </div>
      </div>

      {/* Mandatory Simulation Warning Banner */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-start gap-3 text-xs text-amber-900">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-sm block mb-0.5">Simulation Notice</span>
          All projections generated on this page are theoretical simulation results computed mathematically from input parameters. These values are clearly distinguished from ChargeOS database records and never presented as real-world operational statistics.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Inputs (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-lg border border-slate-200 space-y-4">
          <h2 className="text-sm font-bold text-[#0F172A] border-b border-slate-100 pb-2">
            Simulation Parameters
          </h2>

          <div>
            <div className="flex justify-between text-xs font-semibold text-[#0F172A] mb-1">
              <span>Target Fleet / EV Influx</span>
              <span className="text-[#2563EB]">{numEvs} Vehicles</span>
            </div>
            <input
              type="range"
              min={5}
              max={250}
              step={5}
              value={numEvs}
              onChange={e => setNumEvs(Number(e.target.value))}
              className="w-full accent-[#2563EB]"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-[#0F172A] mb-1">
              <span>Dispensing Bays (Chargers)</span>
              <span className="text-[#2563EB]">{numChargers} Bays</span>
            </div>
            <input
              type="range"
              min={1}
              max={32}
              value={numChargers}
              onChange={e => setNumChargers(Number(e.target.value))}
              className="w-full accent-[#2563EB]"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-[#0F172A] mb-1">
              <span>Charger Rating</span>
              <span className="text-[#2563EB]">{chargerPowerKw} kW</span>
            </div>
            <select
              value={chargerPowerKw}
              onChange={e => setChargerPowerKw(Number(e.target.value))}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded font-medium"
            >
              <option value={22}>22 kW (AC Type 2 Fast)</option>
              <option value={50}>50 kW (DC Fast)</option>
              <option value={60}>60 kW (Standard DC Fast)</option>
              <option value={120}>120 kW (High Power CCS2)</option>
              <option value={180}>180 kW (Ultra-Fast Hub)</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-[#0F172A] mb-1">
              <span>Avg Dwell / Charge Duration</span>
              <span className="text-[#2563EB]">{avgDurationMins} Mins</span>
            </div>
            <input
              type="range"
              min={15}
              max={120}
              step={5}
              value={avgDurationMins}
              onChange={e => setAvgDurationMins(Number(e.target.value))}
              className="w-full accent-[#2563EB]"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-[#0F172A] mb-1">
              <span>Simulation Window</span>
              <span className="text-[#2563EB]">{simulationHours} Hours</span>
            </div>
            <input
              type="range"
              min={4}
              max={24}
              value={simulationHours}
              onChange={e => setSimulationHours(Number(e.target.value))}
              className="w-full accent-[#2563EB]"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-[#0F172A] mb-1">
              <span>Demand Surge Multiplier</span>
              <span className="text-[#2563EB]">{demandFactor}x</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={2.0}
              step={0.1}
              value={demandFactor}
              onChange={e => setDemandFactor(Number(e.target.value))}
              className="w-full accent-[#2563EB]"
            />
          </div>
        </div>

        {/* Right Output: SIMULATION RESULT (7 cols) */}
        <div className="lg:col-span-7 bg-[#0F172A] text-white p-6 rounded-lg border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Simulation Result
              </h2>
              <p className="text-[11px] text-slate-400">
                Mathematical modeling output • {numEvs} EVs over {simulationHours}h
              </p>
            </div>
            <Badge variant="blue" size="sm">Parametric Model</Badge>
          </div>

          {/* Grid of Results */}
          <div className="grid grid-cols-2 gap-4">
            {/* Peak Load */}
            <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Estimated Peak Grid Load</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">{estimatedPeakLoadKw}</span>
                <span className="text-xs font-bold text-blue-400">kW</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-2">Max simultaneous transformer draw</span>
            </div>

            {/* Total Energy Demand */}
            <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Estimated Energy Demand</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-emerald-400">{totalEnergyDemandKwh}</span>
                <span className="text-xs font-bold text-emerald-300">kWh</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-2">Aggregate power consumed</span>
            </div>

            {/* Charger Utilization */}
            <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Charger Utilization</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-amber-400">{chargerUtilizationPercent}%</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-2">
                {chargerUtilizationPercent > 90 ? 'Congested / Bottleneck' : 'Healthy operating band'}
              </span>
            </div>

            {/* Estimated Waiting Time */}
            <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Est. Queuing Delay</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">{estimatedWaitingTimeMins}</span>
                <span className="text-xs font-bold text-slate-400">Mins</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-2">Expected queue backlog</span>
            </div>
          </div>

          <div className="bg-slate-900/50 p-4 rounded border border-slate-800 text-xs text-slate-300 space-y-1">
            <span className="font-semibold text-white block">Recommendation for Operators:</span>
            <p>
              {estimatedWaitingTimeMins > 15
                ? `High queue predicted! Expanding from ${numChargers} to ${numChargers + 2} bays would clear waiting times.`
                : 'Bay capacity meets current influx smoothly with negligible queue delays.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
