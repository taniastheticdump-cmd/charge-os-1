export type UserRole = 'driver' | 'operator' | 'fleet_manager';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  default_search_radius_km: number;
  currency: 'INR';
  created_at: string;
  updated_at: string;
}

export type ChargerStatus = 'available' | 'in_use' | 'reserved' | 'offline';
export type ConnectorType = 'CCS2' | 'Type 2' | 'CHAdeMO' | 'GB/T' | 'Bharat AC-001';
export type CurrentType = 'AC' | 'DC Fast';

export interface Charger {
  id: string;
  station_id: string;
  identifier_code: string;
  connector_type: ConnectorType;
  power_kw: number;
  current_type: CurrentType;
  price_per_kwh_inr: number;
  status: ChargerStatus;
  created_at: string;
  updated_at: string;
}

export interface ChargingStation {
  id: string;
  operator_id?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postal_code?: string;
  latitude: number;
  longitude: number;
  operating_hours: string;
  amenities: string[];
  is_active: boolean;
  is_chargeos_network: boolean; // TYPE 1 (true) = ChargeOS bookable, TYPE 2 (false) = External map/place
  chargers?: Charger[];
  rating?: number;
  distance_km?: number;
  created_at: string;
  updated_at: string;
}

export type BookingStatus = 'confirmed' | 'active' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  user_id: string;
  charger_id: string;
  station_id: string;
  booking_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM (24h)
  end_time: string; // HH:MM (24h)
  duration_minutes: number;
  estimated_kwh: number;
  total_amount_inr: number;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
  // Join extensions
  station?: ChargingStation;
  charger?: Charger;
}

export type SessionStatus = 'active' | 'paused' | 'completed';

export interface ChargingSession {
  id: string;
  user_id: string;
  charger_id: string;
  station_id: string;
  booking_id?: string;
  vehicle_id?: string;
  start_time: string;
  end_time?: string;
  duration_seconds: number;
  energy_delivered_kwh: number;
  total_cost_inr: number;
  status: SessionStatus;
  charger_power_kw: number;
  created_at: string;
  updated_at: string;
  // Join extensions
  station?: ChargingStation;
  charger?: Charger;
}

export type PaymentStatus = 'succeeded' | 'failed' | 'pending';

export interface Payment {
  id: string;
  user_id: string;
  booking_id?: string;
  session_id?: string;
  amount_inr: number;
  currency: 'INR';
  payment_method: 'UPI' | 'Credit/Debit Card' | 'Net Banking' | 'Fleet Wallet';
  status: PaymentStatus;
  mode: 'TEST PAYMENT';
  transaction_reference: string;
  created_at: string;
}

export interface FavoriteStation {
  id: string;
  user_id: string;
  station_id: string;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'charging' | 'alert';
  is_read: boolean;
  created_at: string;
}

export interface Vehicle {
  id: string;
  fleet_manager_id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  battery_capacity_kwh: number;
  vin: string;
  status: 'active' | 'charging' | 'maintenance';
  assigned_driver_id?: string;
  created_at: string;
  // join extension
  assigned_driver_name?: string;
}

export interface FleetDriver {
  id: string;
  fleet_manager_id: string;
  name: string;
  email: string;
  phone: string;
  license_number: string;
  is_active: boolean;
  created_at: string;
}

export interface AnalyticsMetrics {
  total_energy_kwh: number;
  total_sessions: number;
  total_cost_inr: number;
  avg_duration_minutes: number;
  avg_energy_kwh: number;
  charger_utilization_percent: number;
  peak_charging_period: string;
  daily_energy_trend: { date: string; energy_kwh: number; cost_inr: number }[];
  hourly_demand: { hour: string; sessions: number }[];
  monthly_data: { month: string; sessions: number; cost_inr: number }[];
  charger_usage_by_type: { name: string; value: number }[];
}

export interface StationFilterOptions {
  searchQuery: string;
  selectedCity: string;
  radiusKm: number;
  chargerTypes: CurrentType[];
  minPowerKw: number;
  availabilityOnly: boolean;
  sortBy: 'distance' | 'price_asc' | 'price_desc' | 'power_desc';
  networkType: 'all' | 'chargeos' | 'external';
}
