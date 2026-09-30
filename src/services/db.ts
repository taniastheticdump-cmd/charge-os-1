import {
  ChargingStation,
  Charger,
  Booking,
  ChargingSession,
  Payment,
  Vehicle,
  FleetDriver,
  AppNotification,
  AnalyticsMetrics,
  StationFilterOptions,
  ChargerStatus,
  BookingStatus,
  SessionStatus
} from '../types';
import { INITIAL_STATIONS, INITIAL_CHARGERS } from './maharashtraData';
import { getSupabaseClient } from './supabase';

const STORAGE_KEYS = {
  STATIONS: 'chargeos_db_stations',
  CHARGERS: 'chargeos_db_chargers',
  BOOKINGS: 'chargeos_db_bookings',
  SESSIONS: 'chargeos_db_charging_sessions',
  PAYMENTS: 'chargeos_db_payments',
  VEHICLES: 'chargeos_db_vehicles',
  FLEET_DRIVERS: 'chargeos_db_fleet_drivers',
  NOTIFICATIONS: 'chargeos_db_notifications',
  FAVORITES: 'chargeos_db_favorites'
};

// Initialize default seed tables in local storage if not already seeded
function initLocalStorageDb(): void {
  if (!localStorage.getItem(STORAGE_KEYS.STATIONS)) {
    localStorage.setItem(STORAGE_KEYS.STATIONS, JSON.stringify(INITIAL_STATIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CHARGERS)) {
    localStorage.setItem(STORAGE_KEYS.CHARGERS, JSON.stringify(INITIAL_CHARGERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SESSIONS)) {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.VEHICLES)) {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify([
      {
        id: 'veh-01',
        fleet_manager_id: 'usr-fleet-mgr',
        make: 'Tata',
        model: 'Nexon EV Empowered',
        year: 2024,
        license_plate: 'MH-02-EE-8899',
        battery_capacity_kwh: 40.5,
        vin: 'MAT654321EV00129',
        status: 'active',
        assigned_driver_id: 'drv-01',
        created_at: new Date(Date.now() - 20 * 86400000).toISOString()
      },
      {
        id: 'veh-02',
        fleet_manager_id: 'usr-fleet-mgr',
        make: 'Mahindra',
        model: 'XUV400 EL Pro',
        year: 2024,
        license_plate: 'MH-12-EV-4412',
        battery_capacity_kwh: 39.4,
        vin: 'MAH987654EV00214',
        status: 'active',
        assigned_driver_id: 'drv-02',
        created_at: new Date(Date.now() - 15 * 86400000).toISOString()
      }
    ]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.FLEET_DRIVERS)) {
    localStorage.setItem(STORAGE_KEYS.FLEET_DRIVERS, JSON.stringify([
      {
        id: 'drv-01',
        fleet_manager_id: 'usr-fleet-mgr',
        name: 'Ramesh Patil',
        email: 'ramesh.patil@chargeos-fleet.in',
        phone: '+91 98201 12345',
        license_number: 'MH02 20180041234',
        is_active: true,
        created_at: new Date(Date.now() - 20 * 86400000).toISOString()
      },
      {
        id: 'drv-02',
        fleet_manager_id: 'usr-fleet-mgr',
        name: 'Sachin Kadam',
        email: 'sachin.kadam@chargeos-fleet.in',
        phone: '+91 98202 54321',
        license_number: 'MH12 20190089123',
        is_active: true,
        created_at: new Date(Date.now() - 15 * 86400000).toISOString()
      }
    ]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.FAVORITES)) {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify([]));
  }
}

// Call once at module load
initLocalStorageDb();

// Helper to calculate distance in km using Haversine formula
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

// Helper to convert HH:MM to minutes from midnight
function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

// ================= STATIONS & CHARGERS =================

export async function fetchStations(
  options?: Partial<StationFilterOptions>,
  userCoords?: { lat: number; lng: number }
): Promise<ChargingStation[]> {
  const supabase = getSupabaseClient();

  let stations: ChargingStation[] = [];
  let chargers: Charger[] = [];

  if (supabase) {
    try {
      const { data: stData, error: stErr } = await supabase
        .from('charging_stations')
        .select('*')
        .eq('is_active', true);
      if (!stErr && stData && stData.length > 0) {
        stations = stData;
        const { data: chData } = await supabase.from('chargers').select('*');
        chargers = chData || [];
      } else {
        // Fallback to local
        stations = JSON.parse(localStorage.getItem(STORAGE_KEYS.STATIONS) || '[]');
        chargers = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHARGERS) || '[]');
      }
    } catch {
      stations = JSON.parse(localStorage.getItem(STORAGE_KEYS.STATIONS) || '[]');
      chargers = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHARGERS) || '[]');
    }
  } else {
    stations = JSON.parse(localStorage.getItem(STORAGE_KEYS.STATIONS) || '[]');
    chargers = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHARGERS) || '[]');
  }

  // Attach chargers to stations
  const stationsWithChargers = stations.map(s => {
    const stationChargers = chargers.filter(c => c.station_id === s.id);
    let distance_km: number | undefined;
    if (userCoords) {
      distance_km = calculateDistanceKm(userCoords.lat, userCoords.lng, s.latitude, s.longitude);
    }
    return {
      ...s,
      chargers: stationChargers,
      distance_km
    };
  });

  // Apply filters if provided
  let filtered = stationsWithChargers;

  if (options) {
    if (options.selectedCity && options.selectedCity !== 'All Maharashtra') {
      filtered = filtered.filter(s =>
        s.city.toLowerCase().includes(options.selectedCity!.toLowerCase()) ||
        s.address.toLowerCase().includes(options.selectedCity!.toLowerCase())
      );
    }

    if (options.searchQuery && options.searchQuery.trim()) {
      const q = options.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q)
      );
    }

    if (options.networkType && options.networkType !== 'all') {
      if (options.networkType === 'chargeos') {
        filtered = filtered.filter(s => s.is_chargeos_network);
      } else if (options.networkType === 'external') {
        filtered = filtered.filter(s => !s.is_chargeos_network);
      }
    }

    if (options.chargerTypes && options.chargerTypes.length > 0) {
      filtered = filtered.filter(s => {
        if (!s.is_chargeos_network) return true; // external stations might not have granular charger rows
        return s.chargers?.some(c => options.chargerTypes!.includes(c.current_type));
      });
    }

    if (options.minPowerKw && options.minPowerKw > 0) {
      filtered = filtered.filter(s => {
        if (!s.is_chargeos_network) return true;
        return s.chargers?.some(c => c.power_kw >= options.minPowerKw!);
      });
    }

    if (options.availabilityOnly) {
      filtered = filtered.filter(s => {
        if (!s.is_chargeos_network) return true;
        return s.chargers?.some(c => c.status === 'available');
      });
    }

    if (options.radiusKm && userCoords) {
      filtered = filtered.filter(s => (s.distance_km ?? 9999) <= options.radiusKm!);
    }

    // Sort
    if (options.sortBy === 'distance' && userCoords) {
      filtered.sort((a, b) => (a.distance_km ?? 9999) - (b.distance_km ?? 9999));
    } else if (options.sortBy === 'price_asc') {
      filtered.sort((a, b) => {
        const minA = Math.min(...(a.chargers?.map(c => c.price_per_kwh_inr) || [999]));
        const minB = Math.min(...(b.chargers?.map(c => c.price_per_kwh_inr) || [999]));
        return minA - minB;
      });
    } else if (options.sortBy === 'price_desc') {
      filtered.sort((a, b) => {
        const maxA = Math.max(...(a.chargers?.map(c => c.price_per_kwh_inr) || [0]));
        const maxB = Math.max(...(b.chargers?.map(c => c.price_per_kwh_inr) || [0]));
        return maxB - maxA;
      });
    } else if (options.sortBy === 'power_desc') {
      filtered.sort((a, b) => {
        const maxA = Math.max(...(a.chargers?.map(c => c.power_kw) || [0]));
        const maxB = Math.max(...(b.chargers?.map(c => c.power_kw) || [0]));
        return maxB - maxA;
      });
    }
  }

  return filtered;
}

export async function getStationById(id: string): Promise<ChargingStation | null> {
  const stations = await fetchStations();
  return stations.find(s => s.id === id) || null;
}

export async function addStation(station: Omit<ChargingStation, 'id' | 'created_at' | 'updated_at'>): Promise<ChargingStation> {
  const supabase = getSupabaseClient();
  const newStation: ChargingStation = {
    ...station,
    id: 'station-' + Math.random().toString(36).substring(2, 9),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (supabase) {
    try {
      const { data, error } = await supabase.from('charging_stations').insert([newStation]).select().single();
      if (!error && data) return data;
    } catch (err) {
      console.warn('Supabase insert failed, saving locally:', err);
    }
  }

  const list: ChargingStation[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.STATIONS) || '[]');
  list.unshift(newStation);
  localStorage.setItem(STORAGE_KEYS.STATIONS, JSON.stringify(list));
  return newStation;
}

export async function updateStation(id: string, updates: Partial<ChargingStation>): Promise<ChargingStation | null> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('charging_stations')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data;
    } catch {
      // fallback
    }
  }

  const list: ChargingStation[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.STATIONS) || '[]');
  const idx = list.findIndex(s => s.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEYS.STATIONS, JSON.stringify(list));
  return list[idx];
}

export async function addCharger(charger: Omit<Charger, 'id' | 'created_at' | 'updated_at'>): Promise<Charger> {
  const supabase = getSupabaseClient();
  const newCharger: Charger = {
    ...charger,
    id: 'chg-' + Math.random().toString(36).substring(2, 9),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (supabase) {
    try {
      const { data, error } = await supabase.from('chargers').insert([newCharger]).select().single();
      if (!error && data) return data;
    } catch {
      // fallback
    }
  }

  const list: Charger[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHARGERS) || '[]');
  list.push(newCharger);
  localStorage.setItem(STORAGE_KEYS.CHARGERS, JSON.stringify(list));
  return newCharger;
}

export async function updateChargerStatus(chargerId: string, status: ChargerStatus): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase
        .from('chargers')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', chargerId);
      if (!error) return true;
    } catch {
      // fallback
    }
  }

  const list: Charger[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHARGERS) || '[]');
  const idx = list.findIndex(c => c.id === chargerId);
  if (idx === -1) return false;
  list[idx].status = status;
  list[idx].updated_at = new Date().toISOString();
  localStorage.setItem(STORAGE_KEYS.CHARGERS, JSON.stringify(list));
  return true;
}

// ================= BOOKINGS & DOUBLE BOOKING PREVENTION =================

/**
 * Checks at the database level if a charger already has an overlapping active or confirmed booking
 */
export async function checkBookingConflict(
  chargerId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeBookingId?: string
): Promise<{ hasConflict: boolean; conflictingBooking?: Booking }> {
  const supabase = getSupabaseClient();
  const newStartMin = timeToMinutes(startTime);
  const newEndMin = timeToMinutes(endTime);

  let bookings: Booking[] = [];

  if (supabase) {
    try {
      let query = supabase
        .from('bookings')
        .select('*')
        .eq('charger_id', chargerId)
        .eq('booking_date', date)
        .in('status', ['confirmed', 'active']);

      if (excludeBookingId) {
        query = query.neq('id', excludeBookingId);
      }

      const { data, error } = await query;
      if (!error && data) bookings = data;
      else bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
    } catch {
      bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
    }
  } else {
    bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
  }

  const conflicting = bookings.find(b => {
    if (b.charger_id !== chargerId || b.booking_date !== date) return false;
    if (b.status === 'cancelled' || b.status === 'completed') return false;
    if (excludeBookingId && b.id === excludeBookingId) return false;

    const bStartMin = timeToMinutes(b.start_time);
    const bEndMin = timeToMinutes(b.end_time);

    // Overlap condition: start < otherEnd AND end > otherStart
    return newStartMin < bEndMin && newEndMin > bStartMin;
  });

  return {
    hasConflict: Boolean(conflicting),
    conflictingBooking: conflicting
  };
}

export async function createBooking(
  params: Omit<Booking, 'id' | 'status' | 'created_at' | 'updated_at'>,
  testPaymentMethod: 'UPI' | 'Credit/Debit Card' | 'Net Banking' | 'Fleet Wallet' = 'UPI'
): Promise<{ booking: Booking; payment: Payment }> {
  // 1. Strict Database-level concurrency conflict check
  const conflict = await checkBookingConflict(
    params.charger_id,
    params.booking_date,
    params.start_time,
    params.end_time
  );

  if (conflict.hasConflict) {
    throw new Error(
      `Slot Conflict: This charger is already reserved on ${params.booking_date} from ${conflict.conflictingBooking?.start_time} to ${conflict.conflictingBooking?.end_time}. Please select an alternate time or charger.`
    );
  }

  const bookingId = 'bk-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  const newBooking: Booking = {
    ...params,
    id: bookingId,
    status: 'confirmed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // 2. Process TEST PAYMENT in INR
  const paymentId = 'pay-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  const newPayment: Payment = {
    id: paymentId,
    user_id: params.user_id,
    booking_id: bookingId,
    amount_inr: params.total_amount_inr,
    currency: 'INR',
    payment_method: testPaymentMethod,
    status: 'succeeded',
    mode: 'TEST PAYMENT',
    transaction_reference: `TXN-IN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    created_at: new Date().toISOString()
  };

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('bookings').insert([newBooking]);
      await supabase.from('payments').insert([newPayment]);
      // Update charger status to reserved
      await supabase.from('chargers').update({ status: 'reserved' }).eq('id', params.charger_id);
    } catch (err) {
      console.warn('Supabase booking insert error, committing locally:', err);
    }
  }

  // Update local storage
  const bookings: Booking[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
  bookings.unshift(newBooking);
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

  const payments: Payment[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENTS) || '[]');
  payments.unshift(newPayment);
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));

  // Update local charger status
  await updateChargerStatus(params.charger_id, 'reserved');

  // Create notification
  await createNotification({
    user_id: params.user_id,
    title: 'Booking Confirmed',
    message: `Your EV slot is confirmed for ₹${params.total_amount_inr.toFixed(2)} on ${params.booking_date} at ${params.start_time}. Booking ID: ${bookingId}`,
    type: 'booking'
  });

  return { booking: newBooking, payment: newPayment };
}

export async function getBookings(userId?: string, operatorId?: string): Promise<Booking[]> {
  const supabase = getSupabaseClient();
  let list: Booking[] = [];

  if (supabase) {
    try {
      let query = supabase.from('bookings').select('*');
      if (userId) query = query.eq('user_id', userId);
      const { data } = await query.order('created_at', { ascending: false });
      if (data && data.length > 0) list = data;
      else list = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
    } catch {
      list = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
    }
  } else {
    list = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
  }

  if (userId) {
    list = list.filter(b => b.user_id === userId);
  }

  // Enrich with station and charger
  const stations = await fetchStations();
  const chargers: Charger[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHARGERS) || '[]');

  const enriched = list.map(b => ({
    ...b,
    station: stations.find(s => s.id === b.station_id),
    charger: chargers.find(c => c.id === b.charger_id)
  }));

  if (operatorId) {
    return enriched.filter(b => b.station?.operator_id === operatorId);
  }

  return enriched;
}

export async function cancelBooking(bookingId: string, userId: string): Promise<boolean> {
  const bookings: Booking[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
  const idx = bookings.findIndex(b => b.id === bookingId && b.user_id === userId);
  if (idx === -1) return false;

  const b = bookings[idx];
  b.status = 'cancelled';
  b.updated_at = new Date().toISOString();
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

  // Release charger
  await updateChargerStatus(b.charger_id, 'available');

  await createNotification({
    user_id: userId,
    title: 'Booking Cancelled',
    message: `Your booking #${bookingId} has been cancelled. Test payment refund initiated.`,
    type: 'alert'
  });

  return true;
}

// ================= CHARGING SESSIONS (DEMO CHARGING MODE) =================

export async function startChargingSession(params: {
  user_id: string;
  charger_id: string;
  station_id: string;
  booking_id?: string;
  vehicle_id?: string;
  charger_power_kw: number;
}): Promise<ChargingSession> {
  const sessionId = 'ses-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  const newSession: ChargingSession = {
    id: sessionId,
    user_id: params.user_id,
    charger_id: params.charger_id,
    station_id: params.station_id,
    booking_id: params.booking_id,
    vehicle_id: params.vehicle_id,
    start_time: new Date().toISOString(),
    duration_seconds: 0,
    energy_delivered_kwh: 0,
    total_cost_inr: 0,
    status: 'active',
    charger_power_kw: params.charger_power_kw,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const sessions: ChargingSession[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSIONS) || '[]');
  sessions.unshift(newSession);
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));

  // Update charger status to in_use
  await updateChargerStatus(params.charger_id, 'in_use');

  // Notification
  await createNotification({
    user_id: params.user_id,
    title: 'Charging Session Started',
    message: `DEMO CHARGING MODE: Session #${sessionId} initiated at ${params.charger_power_kw} kW.`,
    type: 'charging'
  });

  return newSession;
}

export async function updateChargingSession(
  sessionId: string,
  updates: {
    duration_seconds?: number;
    energy_delivered_kwh?: number;
    total_cost_inr?: number;
    status?: SessionStatus;
  }
): Promise<ChargingSession | null> {
  const sessions: ChargingSession[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSIONS) || '[]');
  const idx = sessions.findIndex(s => s.id === sessionId);
  if (idx === -1) return null;

  sessions[idx] = {
    ...sessions[idx],
    ...updates,
    updated_at: new Date().toISOString()
  };

  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  return sessions[idx];
}

export async function stopChargingSession(sessionId: string): Promise<ChargingSession | null> {
  const sessions: ChargingSession[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSIONS) || '[]');
  const idx = sessions.findIndex(s => s.id === sessionId);
  if (idx === -1) return null;

  const session = sessions[idx];
  session.status = 'completed';
  session.end_time = new Date().toISOString();
  session.updated_at = new Date().toISOString();
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));

  // Free up charger
  await updateChargerStatus(session.charger_id, 'available');

  // Record completed session test payment if total_cost_inr > 0
  if (session.total_cost_inr > 0) {
    const paymentId = 'pay-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const payments: Payment[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENTS) || '[]');
    payments.unshift({
      id: paymentId,
      user_id: session.user_id,
      session_id: session.id,
      amount_inr: session.total_cost_inr,
      currency: 'INR',
      payment_method: 'UPI',
      status: 'succeeded',
      mode: 'TEST PAYMENT',
      transaction_reference: `SES-TXN-${Date.now()}`,
      created_at: new Date().toISOString()
    });
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  }

  await createNotification({
    user_id: session.user_id,
    title: 'Charging Session Completed',
    message: `Charged ${session.energy_delivered_kwh.toFixed(2)} kWh in ${Math.round(session.duration_seconds / 60)} mins. Total cost: ₹${session.total_cost_inr.toFixed(2)}.`,
    type: 'charging'
  });

  return session;
}

export async function getChargingSessions(userId?: string): Promise<ChargingSession[]> {
  const sessions: ChargingSession[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSIONS) || '[]');
  const filtered = userId ? sessions.filter(s => s.user_id === userId) : sessions;

  const stations = await fetchStations();
  const chargers: Charger[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHARGERS) || '[]');

  return filtered.map(s => ({
    ...s,
    station: stations.find(st => st.id === s.station_id),
    charger: chargers.find(ch => ch.id === s.charger_id)
  }));
}

// ================= ANALYTICS (CALCULATED FROM DB ONLY) =================

export async function getAnalyticsMetrics(userId?: string, operatorId?: string): Promise<AnalyticsMetrics> {
  const sessions = await getChargingSessions(userId);
  const relevantSessions = operatorId
    ? sessions.filter(s => s.station?.operator_id === operatorId)
    : sessions;

  const totalSessions = relevantSessions.length;
  const totalEnergy = relevantSessions.reduce((acc, s) => acc + (s.energy_delivered_kwh || 0), 0);
  const totalCost = relevantSessions.reduce((acc, s) => acc + (s.total_cost_inr || 0), 0);
  const totalDuration = relevantSessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);

  const avgDurationMins = totalSessions > 0 ? Math.round(totalDuration / totalSessions / 60) : 0;
  const avgEnergyKwh = totalSessions > 0 ? Number((totalEnergy / totalSessions).toFixed(1)) : 0;

  // Group by date for Daily Trend
  const dateMap: { [dateStr: string]: { energy: number; cost: number } } = {};
  // Group by hour for hourly demand
  const hourMap: { [hour: string]: number } = {};
  for (let i = 0; i < 24; i++) {
    const hr = (i < 10 ? '0' : '') + i + ':00';
    hourMap[hr] = 0;
  }

  // Charger usage by type
  const typeMap: { [type: string]: number } = { 'DC Fast': 0, 'AC': 0 };

  relevantSessions.forEach(s => {
    const dateKey = s.start_time.split('T')[0];
    if (!dateMap[dateKey]) dateMap[dateKey] = { energy: 0, cost: 0 };
    dateMap[dateKey].energy += s.energy_delivered_kwh;
    dateMap[dateKey].cost += s.total_cost_inr;

    const hour = s.start_time.substring(11, 13) + ':00';
    if (hourMap[hour] !== undefined) hourMap[hour]++;

    const cType = s.charger?.current_type || 'DC Fast';
    typeMap[cType] = (typeMap[cType] || 0) + 1;
  });

  const dailyTrend = Object.keys(dateMap).sort().map(d => ({
    date: d,
    energy_kwh: Number(dateMap[d].energy.toFixed(1)),
    cost_inr: Math.round(dateMap[d].cost)
  }));

  const hourlyDemand = Object.keys(hourMap).map(h => ({
    hour: h,
    sessions: hourMap[h]
  }));

  // Find peak hour
  let peakHour = '14:00 - 16:00';
  let maxCount = -1;
  Object.keys(hourMap).forEach(h => {
    if (hourMap[h] > maxCount && hourMap[h] > 0) {
      maxCount = hourMap[h];
      peakHour = `${h} - ${(parseInt(h.split(':')[0]) + 1).toString().padStart(2, '0')}:00`;
    }
  });

  const chargers: Charger[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHARGERS) || '[]');
  const inUseCount = chargers.filter(c => c.status === 'in_use' || c.status === 'reserved').length;
  const utilization = chargers.length > 0 ? Math.round((inUseCount / chargers.length) * 100) : 0;

  return {
    total_energy_kwh: Number(totalEnergy.toFixed(1)),
    total_sessions: totalSessions,
    total_cost_inr: Math.round(totalCost),
    avg_duration_minutes: avgDurationMins,
    avg_energy_kwh: avgEnergyKwh,
    charger_utilization_percent: utilization,
    peak_charging_period: peakHour,
    daily_energy_trend: dailyTrend,
    hourly_demand: hourlyDemand,
    monthly_data: [
      { month: 'Current Period', sessions: totalSessions, cost_inr: Math.round(totalCost) }
    ],
    charger_usage_by_type: [
      { name: 'DC Fast', value: typeMap['DC Fast'] || 0 },
      { name: 'AC Standard', value: typeMap['AC'] || 0 }
    ]
  };
}

// ================= VEHICLES & FLEET DRIVERS =================

export async function getVehicles(fleetManagerId?: string): Promise<Vehicle[]> {
  const list: Vehicle[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.VEHICLES) || '[]');
  const drivers: FleetDriver[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.FLEET_DRIVERS) || '[]');

  const filtered = fleetManagerId ? list.filter(v => v.fleet_manager_id === fleetManagerId) : list;
  return filtered.map(v => ({
    ...v,
    assigned_driver_name: drivers.find(d => d.id === v.assigned_driver_id)?.name
  }));
}

export async function addVehicle(vehicle: Omit<Vehicle, 'id' | 'created_at'>): Promise<Vehicle> {
  const newVeh: Vehicle = {
    ...vehicle,
    id: 'veh-' + Math.random().toString(36).substring(2, 9),
    created_at: new Date().toISOString()
  };
  const list: Vehicle[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.VEHICLES) || '[]');
  list.unshift(newVeh);
  localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(list));
  return newVeh;
}

export async function updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle | null> {
  const list: Vehicle[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.VEHICLES) || '[]');
  const idx = list.findIndex(v => v.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...updates };
  localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(list));
  return list[idx];
}

export async function getFleetDrivers(fleetManagerId?: string): Promise<FleetDriver[]> {
  const list: FleetDriver[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.FLEET_DRIVERS) || '[]');
  return fleetManagerId ? list.filter(d => d.fleet_manager_id === fleetManagerId) : list;
}

export async function addFleetDriver(driver: Omit<FleetDriver, 'id' | 'created_at'>): Promise<FleetDriver> {
  const newDriver: FleetDriver = {
    ...driver,
    id: 'drv-' + Math.random().toString(36).substring(2, 9),
    created_at: new Date().toISOString()
  };
  const list: FleetDriver[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.FLEET_DRIVERS) || '[]');
  list.unshift(newDriver);
  localStorage.setItem(STORAGE_KEYS.FLEET_DRIVERS, JSON.stringify(list));
  return newDriver;
}

// ================= NOTIFICATIONS =================

export async function getNotifications(userId: string): Promise<AppNotification[]> {
  const list: AppNotification[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
  return list.filter(n => n.user_id === userId);
}

export async function createNotification(params: Omit<AppNotification, 'id' | 'is_read' | 'created_at'>): Promise<AppNotification> {
  const newNotification: AppNotification = {
    ...params,
    id: 'notif-' + Math.random().toString(36).substring(2, 9),
    is_read: false,
    created_at: new Date().toISOString()
  };
  const list: AppNotification[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
  list.unshift(newNotification);
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
  return newNotification;
}

export async function markNotificationRead(id: string): Promise<void> {
  const list: AppNotification[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
  const item = list.find(n => n.id === id);
  if (item) {
    item.is_read = true;
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
  }
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const list: AppNotification[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
  list.forEach(n => {
    if (n.user_id === userId) n.is_read = true;
  });
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
}

// ================= FAVORITES =================

export async function toggleFavoriteStation(userId: string, stationId: string): Promise<boolean> {
  const list: { id: string; user_id: string; station_id: string }[] =
    JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES) || '[]');
  const idx = list.findIndex(f => f.user_id === userId && f.station_id === stationId);
  if (idx !== -1) {
    list.splice(idx, 1);
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(list));
    return false; // Removed
  } else {
    list.push({ id: 'fav-' + Math.random().toString(36).substring(2, 7), user_id: userId, station_id: stationId });
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(list));
    return true; // Added
  }
}

export async function getFavoriteStationIds(userId: string): Promise<string[]> {
  const list: { id: string; user_id: string; station_id: string }[] =
    JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES) || '[]');
  return list.filter(f => f.user_id === userId).map(f => f.station_id);
}
