import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AnalyticsMetrics } from '../types';
import { getAnalyticsMetrics } from '../services/db';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  BarChart3,
  Zap,
  Clock,
  IndianRupee,
  Activity,
  Layers,
  Calendar,
  TrendingUp
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      // Fetch analytics calculated directly from database records
      const data = await getAnalyticsMetrics(user?.id);
      setMetrics(data);
      setLoading(false);
    };

    loadAnalytics();
  }, [user]);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-500">
        Aggregating database session records for telemetry analysis...
      </div>
    );
  }

  const hasData = metrics && metrics.total_sessions > 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A]">Charging Analytics</h1>
          <p className="text-xs text-[#334155] mt-1">
            Real metrics calculated strictly from persisted database charging sessions. No simulated vanity data.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="blue" size="sm">Database Verified</Badge>
          <Badge variant="navy" size="sm">Currency: INR (₹)</Badge>
        </div>
      </div>

      {/* Calculated KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Total Delivered Energy</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-[#0F172A]">
              {metrics?.total_energy_kwh.toFixed(1) || '0.0'}
            </span>
            <span className="text-xs font-semibold text-[#2563EB]">kWh</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-2">Sum of charging_sessions</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Total Charging Cost</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-[#0F172A]">
              ₹{metrics?.total_cost_inr.toFixed(2) || '0.00'}
            </span>
            <span className="text-xs font-semibold text-slate-500">INR</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-2">Billed at station tariffs</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Avg Session Duration</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-[#0F172A]">
              {metrics?.avg_duration_minutes || 0}
            </span>
            <span className="text-xs font-semibold text-slate-500">Mins</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-2">Duration mean</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Peak Demand Period</span>
          <span className="text-lg font-bold text-[#0F172A] block truncate">
            {metrics?.peak_charging_period || 'N/A'}
          </span>
          <span className="text-[11px] text-slate-400 block mt-2">Highest concurrency window</span>
        </div>
      </div>

      {/* Main Charts Section or Empty State */}
      {!hasData ? (
        <EmptyState
          icon={BarChart3}
          title="Insufficient Database Records"
          description="Analytics and utilization charts are calculated strictly from database charging sessions. Start a live demo charging session or make a booking to generate data."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Energy Usage Over Time (Area Chart) */}
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#0F172A]">1. Energy Usage Over Time (kWh)</h3>
              <Badge variant="blue" size="sm">kWh Stream</Badge>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.daily_energy_trend}>
                  <defs>
                    <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip
                    formatter={(val: unknown) => [`${val ?? 0} kWh`, 'Energy']}
                    contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '6px', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="energy_kwh" stroke="#2563EB" fillOpacity={1} fill="url(#energyGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Hourly Charging Demand (Bar Chart) */}
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#0F172A]">2. 24-Hour Charging Demand</h3>
              <Badge variant="slate" size="sm">Hourly Concurrency</Badge>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.hourly_demand.filter((_, idx) => idx % 2 === 0)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="hour" stroke="#64748B" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    formatter={(val: unknown) => [`${val ?? 0} sessions`, 'Count']}
                    contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '6px', fontSize: '12px' }}
                  />
                  <Bar dataKey="sessions" fill="#0F172A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Cost Incurred in INR (Line Chart) */}
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#0F172A]">3. Charging Expenditure (₹ INR)</h3>
              <Badge variant="green" size="sm">Indian Rupees</Badge>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.daily_energy_trend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip
                    formatter={(val: unknown) => [`₹${val ?? 0} INR`, 'Billed']}
                    contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '6px', fontSize: '12px' }}
                  />
                  <Line type="monotone" dataKey="cost_inr" stroke="#059669" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Charger Utilization by Current Type (Donut/Pie Chart) */}
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#0F172A]">4. Connector Type Utilization</h3>
              <Badge variant="blue" size="sm">{metrics.charger_utilization_percent}% Bay Load</Badge>
            </div>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.charger_usage_by_type}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    <Cell fill="#2563EB" />
                    <Cell fill="#0F172A" />
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '6px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 text-xs text-[#334155] pt-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-[#2563EB]" />
                <span>DC Fast</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-[#0F172A]" />
                <span>AC Standard</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
