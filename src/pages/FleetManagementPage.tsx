import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Vehicle, FleetDriver, ChargingSession } from '../types';
import {
  getVehicles,
  addVehicle,
  updateVehicle,
  getFleetDrivers,
  addFleetDriver,
  getChargingSessions
} from '../services/db';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import {
  Truck,
  Users,
  Plus,
  BatteryCharging,
  Zap,
  IndianRupee,
  Activity,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export const FleetManagementPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<FleetDriver[]>([]);
  const [sessions, setSessions] = useState<ChargingSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);

  // New vehicle form
  const [make, setMake] = useState('Tata');
  const [model, setModel] = useState('Nexon EV');
  const [year, setYear] = useState(2024);
  const [licensePlate, setLicensePlate] = useState('');
  const [batteryKwh, setBatteryKwh] = useState(40.5);
  const [vin, setVin] = useState('');
  const [assignedDriverId, setAssignedDriverId] = useState('');

  // New driver form
  const [driverName, setDriverName] = useState('');
  const [driverEmail, setDriverEmail] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  const loadFleetData = async () => {
    setLoading(true);
    const [vehData, drvData, sesData] = await Promise.all([
      getVehicles(),
      getFleetDrivers(),
      getChargingSessions()
    ]);
    setVehicles(vehData);
    setDrivers(drvData);
    setSessions(sesData);
    setLoading(false);
  };

  useEffect(() => {
    loadFleetData();
  }, []);

  const totalEnergyFleet = sessions.reduce((acc, s) => acc + (s.energy_delivered_kwh || 0), 0);
  const totalCostFleet = sessions.reduce((acc, s) => acc + (s.total_cost_inr || 0), 0);

  const handleCreateVehicle = async () => {
    if (!licensePlate || !vin) return;
    await addVehicle({
      fleet_manager_id: user?.id || 'usr-fleet-mgr',
      make,
      model,
      year,
      license_plate: licensePlate.toUpperCase(),
      battery_capacity_kwh: batteryKwh,
      vin: vin.toUpperCase(),
      status: 'active',
      assigned_driver_id: assignedDriverId || undefined
    });

    showToast('Vehicle Added', `${make} ${model} (${licensePlate.toUpperCase()}) registered.`);
    setIsAddVehicleOpen(false);
    setLicensePlate('');
    setVin('');
    await loadFleetData();
  };

  const handleCreateDriver = async () => {
    if (!driverName || !licenseNumber) return;
    await addFleetDriver({
      fleet_manager_id: user?.id || 'usr-fleet-mgr',
      name: driverName,
      email: driverEmail || `${driverName.toLowerCase().replace(/\s+/g, '.')}@fleet.in`,
      phone: driverPhone || '+91 98000 00000',
      license_number: licenseNumber.toUpperCase(),
      is_active: true
    });

    showToast('Driver Enrolled', `${driverName} added to fleet team.`);
    setIsAddDriverOpen(false);
    setDriverName('');
    setLicenseNumber('');
    await loadFleetData();
  };

  const handleAssignDriver = async (vehicleId: string, newDriverId: string) => {
    await updateVehicle(vehicleId, { assigned_driver_id: newDriverId || undefined });
    showToast('Driver Assigned', 'Vehicle roster updated.');
    await loadFleetData();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A]">Commercial Fleet Operations</h1>
          <p className="text-xs text-[#334155] mt-1">
            Fleet vehicle telemetry, assigned drivers, and total cost of ownership across Maharashtra routes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddDriverOpen(true)}
            icon={<Users className="w-4 h-4" />}
          >
            Add Driver
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddVehicleOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Register EV
          </Button>
        </div>
      </div>

      {/* Fleet KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Active Fleet Vehicles</span>
          <span className="text-2xl font-extrabold text-[#0F172A]">{vehicles.length}</span>
          <span className="text-[11px] text-slate-400 block mt-2">Commercial electric vehicles</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Enrolled Drivers</span>
          <span className="text-2xl font-extrabold text-[#0F172A]">{drivers.length}</span>
          <span className="text-[11px] text-slate-400 block mt-2">Licensed operators</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Fleet Energy Billed</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-[#2563EB]">{totalEnergyFleet.toFixed(1)}</span>
            <span className="text-xs font-semibold text-slate-500">kWh</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-2">Total energy drawn</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Total Fleet Charge Cost</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-[#0F172A]">₹{totalCostFleet.toFixed(2)}</span>
            <span className="text-xs font-semibold text-slate-500">INR</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-2">Itemized operational expense</span>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#0F172A]">Fleet Vehicle Roster</h2>
          <Badge variant="blue" size="sm">{vehicles.length} Units</Badge>
        </div>

        {vehicles.length === 0 ? (
          <EmptyState
            icon={Truck}
            title="No Vehicles Registered"
            description="Add your commercial electric cars, vans, and delivery vehicles to manage charging."
            actionText="Add Vehicle"
            onAction={() => setIsAddVehicleOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#334155]">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Vehicle Model</th>
                  <th className="py-3 px-4">License Plate</th>
                  <th className="py-3 px-4">Battery Capacity</th>
                  <th className="py-3 px-4">VIN</th>
                  <th className="py-3 px-4">Assigned Driver</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vehicles.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#0F172A] block">{v.make} {v.model}</span>
                      <span className="text-[11px] text-slate-400">Year {v.year}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#0F172A]">
                      {v.license_plate}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#0F172A]">
                      {v.battery_capacity_kwh} kWh
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {v.vin}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={v.assigned_driver_id || ''}
                        onChange={e => handleAssignDriver(v.id, e.target.value)}
                        className="p-1 border border-slate-300 rounded text-xs bg-white text-[#0F172A]"
                      >
                        <option value="">Unassigned</option>
                        {drivers.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={v.status === 'active' ? 'green' : 'amber'} size="sm">
                        {v.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Enrolled Drivers Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#0F172A]">Enrolled Commercial Drivers</h2>
          <Badge variant="slate" size="sm">{drivers.length} Drivers</Badge>
        </div>

        {drivers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Drivers Registered"
            description="Enroll drivers with valid licenses to assign them to EV units."
            actionText="Add Driver"
            onAction={() => setIsAddDriverOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#334155]">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Driver Name</th>
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">License Number</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {drivers.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-[#0F172A]">
                      {d.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {d.phone}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {d.email}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {d.license_number}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={d.is_active ? 'green' : 'slate'} size="sm">
                        {d.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Add Vehicle */}
      <Modal
        isOpen={isAddVehicleOpen}
        onClose={() => setIsAddVehicleOpen(false)}
        title="Register Commercial EV"
        subtitle="Add a vehicle to your fleet registry"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">Make</label>
              <input
                type="text"
                value={make}
                onChange={e => setMake(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">Model</label>
              <input
                type="text"
                value={model}
                onChange={e => setModel(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">License Plate</label>
              <input
                type="text"
                placeholder="MH-01-AB-1234"
                value={licensePlate}
                onChange={e => setLicensePlate(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">Battery Pack (kWh)</label>
              <input
                type="number"
                value={batteryKwh}
                onChange={e => setBatteryKwh(Number(e.target.value))}
                className="w-full text-xs p-2.5 border border-slate-300 rounded font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">VIN Number</label>
            <input
              type="text"
              placeholder="MAT1234567890ABC"
              value={vin}
              onChange={e => setVin(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">Assign Driver (Optional)</label>
            <select
              value={assignedDriverId}
              onChange={e => setAssignedDriverId(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded"
            >
              <option value="">Unassigned</option>
              {drivers.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="ghost" size="sm" onClick={() => setIsAddVehicleOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateVehicle}>
              Save Vehicle
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Add Driver */}
      <Modal
        isOpen={isAddDriverOpen}
        onClose={() => setIsAddDriverOpen(false)}
        title="Enroll Fleet Driver"
        subtitle="Add a licensed driver to your operations"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">Driver Full Name</label>
            <input
              type="text"
              placeholder="e.g. Ramesh Patil"
              value={driverName}
              onChange={e => setDriverName(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="+91 98200 00000"
                value={driverPhone}
                onChange={e => setDriverPhone(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">Driving License No.</label>
              <input
                type="text"
                placeholder="MH01 20190012345"
                value={licenseNumber}
                onChange={e => setLicenseNumber(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="ghost" size="sm" onClick={() => setIsAddDriverOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateDriver}>
              Enroll Driver
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
