import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { ChargingStation, Charger, Booking, ChargerStatus } from '../types';
import {
  fetchStations,
  addStation,
  updateStation,
  addCharger,
  updateChargerStatus,
  getBookings
} from '../services/db';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import {
  Shield,
  Plus,
  Zap,
  Edit,
  Power,
  CalendarCheck,
  IndianRupee,
  Layers,
  MapPin,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const OperatorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Station Modal state
  const [isAddStationOpen, setIsAddStationOpen] = useState(false);
  const [newStationName, setNewStationName] = useState('');
  const [newStationAddress, setNewStationAddress] = useState('');
  const [newStationCity, setNewStationCity] = useState('Mumbai');
  const [newStationLat, setNewStationLat] = useState('19.0760');
  const [newStationLng, setNewStationLng] = useState('72.8777');
  const [newStationHours, setNewStationHours] = useState('24 Hours Open');

  // Add Charger Modal state
  const [isAddChargerOpen, setIsAddChargerOpen] = useState(false);
  const [targetStationId, setTargetStationId] = useState<string>('');
  const [chargerCode, setChargerCode] = useState('');
  const [connectorType, setConnectorType] = useState<'CCS2' | 'Type 2' | 'CHAdeMO' | 'GB/T' | 'Bharat AC-001'>('CCS2');
  const [powerKw, setPowerKw] = useState<number>(60);
  const [currentType, setCurrentType] = useState<'AC' | 'DC Fast'>('DC Fast');
  const [pricePerKwh, setPricePerKwh] = useState<number>(17.5);

  const loadOperatorData = async () => {
    setLoading(true);
    const [allStations, allBookings] = await Promise.all([
      fetchStations(),
      getBookings()
    ]);
    const chargeosStations = allStations.filter(s => s.is_chargeos_network);
    setStations(chargeosStations);
    setBookings(allBookings);
    setLoading(false);
  };

  useEffect(() => {
    loadOperatorData();
  }, []);

  // Database calculations
  const totalStations = stations.length;
  const allChargers = stations.flatMap(s => s.chargers || []);
  const totalChargers = allChargers.length;
  const availableChargers = allChargers.filter(c => c.status === 'available').length;
  const inUseChargers = allChargers.filter(c => c.status === 'in_use' || c.status === 'reserved').length;
  const totalRevenueInr = bookings.filter(b => b.status !== 'cancelled').reduce((acc, b) => acc + (b.total_amount_inr || 0), 0);

  const handleCreateStation = async () => {
    if (!newStationName || !newStationAddress) return;
    await addStation({
      operator_id: user?.id,
      name: newStationName,
      address: newStationAddress,
      city: newStationCity,
      state: 'Maharashtra',
      latitude: parseFloat(newStationLat) || 19.0760,
      longitude: parseFloat(newStationLng) || 72.8777,
      operating_hours: newStationHours,
      amenities: ['CCTV Security', 'EV Bay Access'],
      is_active: true,
      is_chargeos_network: true
    });

    showToast('Station Added', `${newStationName} added to the ChargeOS network.`);
    setIsAddStationOpen(false);
    setNewStationName('');
    setNewStationAddress('');
    await loadOperatorData();
  };

  const handleCreateCharger = async () => {
    if (!targetStationId || !chargerCode) return;
    await addCharger({
      station_id: targetStationId,
      identifier_code: chargerCode.toUpperCase(),
      connector_type: connectorType,
      power_kw: powerKw,
      current_type: currentType,
      price_per_kwh_inr: pricePerKwh,
      status: 'available'
    });

    showToast('Charger Added', `Bay ${chargerCode.toUpperCase()} created.`);
    setIsAddChargerOpen(false);
    setChargerCode('');
    await loadOperatorData();
  };

  const handleToggleChargerStatus = async (chargerId: string, currentStatus: ChargerStatus) => {
    const nextStatus: ChargerStatus = currentStatus === 'available' ? 'offline' : 'available';
    await updateChargerStatus(chargerId, nextStatus);
    showToast('Status Updated', `Charger is now ${nextStatus}.`);
    await loadOperatorData();
  };

  const handleDeactivateStation = async (stationId: string, currentActive: boolean) => {
    await updateStation(stationId, { is_active: !currentActive });
    showToast('Station Updated', `Station status toggled.`);
    await loadOperatorData();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A]">Station Operator Console</h1>
          <p className="text-xs text-[#334155] mt-1">
            Enterprise hub administration, charger health diagnostics, and network revenue across Maharashtra.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddStationOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Station Hub
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Managed Stations</span>
          <span className="text-2xl font-extrabold text-[#0F172A]">{totalStations}</span>
          <span className="text-[11px] text-slate-400 block mt-2">Active Maharashtra hubs</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Total Charger Bays</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#0F172A]">{totalChargers}</span>
            <span className="text-xs font-semibold text-emerald-600">({availableChargers} Available)</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-2">{inUseChargers} currently occupied</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Total Network Revenue</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-[#2563EB]">₹{totalRevenueInr.toFixed(2)}</span>
            <span className="text-xs font-semibold text-slate-500">INR</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-2">Calculated from bookings</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Total Reservations</span>
          <span className="text-2xl font-extrabold text-[#0F172A]">{bookings.length}</span>
          <span className="text-[11px] text-slate-400 block mt-2">Database reservation rows</span>
        </div>
      </div>

      {/* Stations and Chargers Management Cards */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-[#0F172A]">Active Stations & Bay Inventory</h2>

        {stations.map(station => (
          <div key={station.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
            {/* Station Header */}
            <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#0F172A]">{station.name}</h3>
                  <Badge variant={station.is_active ? 'green' : 'slate'} size="sm">
                    {station.is_active ? 'Active Hub' : 'Deactivated'}
                  </Badge>
                </div>
                <p className="text-xs text-[#334155] mt-0.5">{station.address}, {station.city}, Maharashtra</p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setTargetStationId(station.id);
                    setChargerCode(`COS-${station.city.substring(0, 3).toUpperCase()}-B${(station.chargers?.length || 0) + 1}`);
                    setIsAddChargerOpen(true);
                  }}
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Bay
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeactivateStation(station.id, station.is_active)}
                >
                  {station.is_active ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </div>

            {/* Chargers Table */}
            <div className="p-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Connected Chargers ({station.chargers?.length || 0})
              </h4>

              {!station.chargers || station.chargers.length === 0 ? (
                <p className="text-xs text-slate-400 py-3">No chargers configured for this station yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {station.chargers.map(charger => (
                    <div
                      key={charger.id}
                      className="p-3 rounded-lg border border-slate-200 bg-white space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[#0F172A]">{charger.identifier_code}</span>
                        <Badge
                          variant={
                            charger.status === 'available'
                              ? 'green'
                              : charger.status === 'in_use' || charger.status === 'reserved'
                              ? 'blue'
                              : 'slate'
                          }
                          size="sm"
                        >
                          {charger.status}
                        </Badge>
                      </div>

                      <div className="text-[#334155] space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Power Rating:</span>
                          <span className="font-semibold text-[#0F172A]">{charger.power_kw} kW {charger.current_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Connector:</span>
                          <span className="font-semibold text-[#0F172A]">{charger.connector_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Tariff:</span>
                          <span className="font-bold text-[#2563EB]">₹{charger.price_per_kwh_inr.toFixed(2)}/kWh</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex justify-end">
                        <button
                          onClick={() => handleToggleChargerStatus(charger.id, charger.status)}
                          className="text-[11px] font-medium text-slate-600 hover:text-[#0F172A] flex items-center gap-1"
                        >
                          <Power className="w-3 h-3" />
                          Toggle Online/Offline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add Station */}
      <Modal
        isOpen={isAddStationOpen}
        onClose={() => setIsAddStationOpen(false)}
        title="Add Charging Station Hub"
        subtitle="Register a new commercial EV charging hub to the Maharashtra grid"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">Station Name</label>
            <input
              type="text"
              placeholder="e.g. ChargeOS Thane Majiwada Express Hub"
              value={newStationName}
              onChange={e => setNewStationName(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">Address</label>
            <input
              type="text"
              placeholder="e.g. Near Majiwada Flyover, Eastern Express Highway"
              value={newStationAddress}
              onChange={e => setNewStationAddress(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">City (Maharashtra)</label>
              <select
                value={newStationCity}
                onChange={e => setNewStationCity(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-[#2563EB]"
              >
                <option value="Mumbai">Mumbai</option>
                <option value="Thane">Thane</option>
                <option value="Navi Mumbai">Navi Mumbai</option>
                <option value="Pune">Pune</option>
                <option value="Nashik">Nashik</option>
                <option value="Nagpur">Nagpur</option>
                <option value="Chhatrapati Sambhajinagar">Chhatrapati Sambhajinagar</option>
                <option value="Kolhapur">Kolhapur</option>
                <option value="Panvel">Panvel</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">Operating Hours</label>
              <input
                type="text"
                value={newStationHours}
                onChange={e => setNewStationHours(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">Latitude</label>
              <input
                type="text"
                value={newStationLat}
                onChange={e => setNewStationLat(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">Longitude</label>
              <input
                type="text"
                value={newStationLng}
                onChange={e => setNewStationLng(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="ghost" size="sm" onClick={() => setIsAddStationOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateStation}>
              Save Station
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Add Charger */}
      <Modal
        isOpen={isAddChargerOpen}
        onClose={() => setIsAddChargerOpen(false)}
        title="Add Charger Bay"
        subtitle="Provision a high-power dispensing bay"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">Identifier Code</label>
            <input
              type="text"
              value={chargerCode}
              onChange={e => setChargerCode(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded font-mono"
              placeholder="e.g. COS-MUM-DC03"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">Connector</label>
              <select
                value={connectorType}
                onChange={e => setConnectorType(e.target.value as any)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded"
              >
                <option value="CCS2">CCS2</option>
                <option value="Type 2">Type 2</option>
                <option value="CHAdeMO">CHAdeMO</option>
                <option value="Bharat AC-001">Bharat AC-001</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">Current Type</label>
              <select
                value={currentType}
                onChange={e => setCurrentType(e.target.value as any)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded"
              >
                <option value="DC Fast">DC Fast</option>
                <option value="AC">AC Standard</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">Power Output (kW)</label>
              <input
                type="number"
                value={powerKw}
                onChange={e => setPowerKw(Number(e.target.value))}
                className="w-full text-xs p-2.5 border border-slate-300 rounded font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">Tariff (₹ INR / kWh)</label>
              <input
                type="number"
                step="0.5"
                value={pricePerKwh}
                onChange={e => setPricePerKwh(Number(e.target.value))}
                className="w-full text-xs p-2.5 border border-slate-300 rounded font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="ghost" size="sm" onClick={() => setIsAddChargerOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateCharger}>
              Create Bay
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
