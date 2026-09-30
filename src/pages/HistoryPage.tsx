import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChargingSession } from '../types';
import { getChargingSessions } from '../services/db';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import {
  History as HistoryIcon,
  Search,
  Filter,
  Download,
  Calendar,
  Zap,
  IndianRupee,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChargingSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'active' | 'paused'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const loadHistory = async () => {
      if (!user) return;
      setLoading(true);
      const data = await getChargingSessions(user.id);
      setSessions(data);
      setLoading(false);
    };

    loadHistory();
  }, [user]);

  // Filter logic
  const filtered = sessions.filter(s => {
    const matchesSearch =
      (s.station?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.charger?.identifier_code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalCostAll = filtered.reduce((acc, s) => acc + (s.total_cost_inr || 0), 0);
  const totalEnergyAll = filtered.reduce((acc, s) => acc + (s.energy_delivered_kwh || 0), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A]">Charging History</h1>
          <p className="text-xs text-[#334155] mt-1">
            Complete database audit of completed and active sessions with itemized INR tariffs.
          </p>
        </div>

        {/* Aggregated Totals Banner */}
        <div className="flex items-center gap-6 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">Total Consumed</span>
            <span className="font-bold text-[#0F172A]">{totalEnergyAll.toFixed(1)} kWh</span>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <span className="text-slate-400 block text-[10px]">Total Billed</span>
            <span className="font-bold text-[#2563EB]">₹{totalCostAll.toFixed(2)} INR</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by station, charger, session ID..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:ring-1 focus:ring-[#2563EB]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value as 'all' | 'completed' | 'active' | 'paused');
              setCurrentPage(1);
            }}
            className="text-xs py-1.5 px-3 bg-slate-50 border border-slate-300 rounded font-medium text-[#334155]"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed Only</option>
            <option value="active">Active Only</option>
            <option value="paused">Paused Only</option>
          </select>
        </div>
      </div>

      {/* Table or Empty State */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            Querying charging history from database...
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={HistoryIcon}
            title="No Charging Sessions Yet"
            description={
              searchQuery
                ? 'No charging records match your search criteria.'
                : 'You have not conducted any charging sessions yet. Sessions will record here automatically after charging.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#334155]">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Station Location</th>
                  <th className="py-3 px-4">Charger Bay</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Energy</th>
                  <th className="py-3 px-4">Total Cost</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map(session => (
                  <tr key={session.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-[#0F172A] block">
                        {new Date(session.start_time).toLocaleDateString()}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-[#0F172A] block">
                        {session.station?.name || 'EV Station'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {session.station?.city || 'Maharashtra'}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono text-[#0F172A]">
                        {session.charger?.identifier_code || 'Bay-01'}
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        {session.charger_power_kw} kW {session.charger?.current_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono">
                      {Math.floor(session.duration_seconds / 60)}m {session.duration_seconds % 60}s
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-bold text-emerald-600">
                        {session.energy_delivered_kwh.toFixed(2)} kWh
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-bold text-[#0F172A]">
                        ₹{session.total_cost_inr.toFixed(2)} INR
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge
                        variant={
                          session.status === 'completed'
                            ? 'green'
                            : session.status === 'active'
                            ? 'blue'
                            : 'amber'
                        }
                        size="sm"
                      >
                        {session.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {filtered.length > itemsPerPage && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50 text-xs text-[#334155]">
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1 rounded border border-slate-300 disabled:opacity-40 hover:bg-slate-100"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-medium text-[#0F172A]">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1 rounded border border-slate-300 disabled:opacity-40 hover:bg-slate-100"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
