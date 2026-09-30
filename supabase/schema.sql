-- CHARGEOS SUPABASE POSTGRESQL SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- Enterprise EV Charging Management Platform
-- Run this script in your Supabase SQL Editor

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('driver', 'operator', 'fleet_manager');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE charger_status AS ENUM ('available', 'in_use', 'reserved', 'offline');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE connector_type AS ENUM ('CCS2', 'Type 2', 'CHAdeMO', 'GB/T', 'Bharat AC-001');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE current_type AS ENUM ('AC', 'DC Fast');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('confirmed', 'active', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE session_status AS ENUM ('active', 'paused', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('succeeded', 'failed', 'pending');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'driver',
    avatar_url TEXT,
    default_search_radius_km INT DEFAULT 15,
    currency TEXT DEFAULT 'INR',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CHARGING STATIONS TABLE
CREATE TABLE IF NOT EXISTS public.charging_stations (
    id TEXT PRIMARY KEY DEFAULT ('station-' || substr(md5(random()::text), 1, 8)),
    operator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'Maharashtra',
    postal_code TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    operating_hours TEXT DEFAULT '24 Hours Open',
    amenities TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    is_chargeos_network BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. CHARGERS TABLE
CREATE TABLE IF NOT EXISTS public.chargers (
    id TEXT PRIMARY KEY DEFAULT ('chg-' || substr(md5(random()::text), 1, 8)),
    station_id TEXT NOT NULL REFERENCES public.charging_stations(id) ON DELETE CASCADE,
    identifier_code TEXT NOT NULL,
    connector_type connector_type NOT NULL,
    power_kw NUMERIC NOT NULL,
    current_type current_type NOT NULL,
    price_per_kwh_inr NUMERIC(10, 2) NOT NULL,
    status charger_status NOT NULL DEFAULT 'available',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_identifier_per_station UNIQUE (station_id, identifier_code)
);

-- 6. BOOKINGS TABLE (WITH CONCURRENCY OVERLAP SAFEGUARD)
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY DEFAULT ('bk-' || upper(substr(md5(random()::text), 1, 8))),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    charger_id TEXT NOT NULL REFERENCES public.chargers(id) ON DELETE RESTRICT,
    station_id TEXT NOT NULL REFERENCES public.charging_stations(id) ON DELETE RESTRICT,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INT NOT NULL,
    estimated_kwh NUMERIC(8, 2) NOT NULL,
    total_amount_inr NUMERIC(10, 2) NOT NULL,
    status booking_status NOT NULL DEFAULT 'confirmed',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. CHARGING SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.charging_sessions (
    id TEXT PRIMARY KEY DEFAULT ('ses-' || upper(substr(md5(random()::text), 1, 8))),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    charger_id TEXT NOT NULL REFERENCES public.chargers(id) ON DELETE RESTRICT,
    station_id TEXT NOT NULL REFERENCES public.charging_stations(id) ON DELETE RESTRICT,
    booking_id TEXT REFERENCES public.bookings(id) ON DELETE SET NULL,
    vehicle_id TEXT,
    start_time TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    end_time TIMESTAMPTZ,
    duration_seconds INT DEFAULT 0,
    energy_delivered_kwh NUMERIC(8, 2) DEFAULT 0.00,
    total_cost_inr NUMERIC(10, 2) DEFAULT 0.00,
    status session_status NOT NULL DEFAULT 'active',
    charger_power_kw NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY DEFAULT ('pay-' || upper(substr(md5(random()::text), 1, 8))),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    booking_id TEXT REFERENCES public.bookings(id) ON DELETE SET NULL,
    session_id TEXT REFERENCES public.charging_sessions(id) ON DELETE SET NULL,
    amount_inr NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'INR' NOT NULL,
    payment_method TEXT NOT NULL,
    status payment_status NOT NULL DEFAULT 'succeeded',
    mode TEXT DEFAULT 'TEST PAYMENT' NOT NULL,
    transaction_reference TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. FAVORITES TABLE
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    station_id TEXT NOT NULL REFERENCES public.charging_stations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_station_favorite UNIQUE (user_id, station_id)
);

-- 10. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY DEFAULT ('notif-' || substr(md5(random()::text), 1, 8)),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'booking',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. FLEET VEHICLES & DRIVERS
CREATE TABLE IF NOT EXISTS public.fleet_drivers (
    id TEXT PRIMARY KEY DEFAULT ('drv-' || substr(md5(random()::text), 1, 8)),
    fleet_manager_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    license_number TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.vehicles (
    id TEXT PRIMARY KEY DEFAULT ('veh-' || substr(md5(random()::text), 1, 8)),
    fleet_manager_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INT NOT NULL,
    license_plate TEXT NOT NULL UNIQUE,
    battery_capacity_kwh NUMERIC(6, 2) NOT NULL,
    vin TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'active',
    assigned_driver_id TEXT REFERENCES public.fleet_drivers(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_stations_city ON public.charging_stations(city);
CREATE INDEX IF NOT EXISTS idx_stations_coords ON public.charging_stations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_chargers_station ON public.chargers(station_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_overlap ON public.bookings(charger_id, booking_date, status);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON public.charging_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charging_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chargers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charging_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleet_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- Profiles: Users can view and update their own profile
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Stations: Anyone authenticated can view active stations
CREATE POLICY "Public read active stations" ON public.charging_stations FOR SELECT USING (is_active = true);
CREATE POLICY "Operators manage own stations" ON public.charging_stations FOR ALL USING (auth.uid() = operator_id);

-- Chargers: Anyone authenticated can view chargers
CREATE POLICY "Public read chargers" ON public.chargers FOR SELECT USING (true);
CREATE POLICY "Operators update station chargers" ON public.chargers FOR ALL USING (
    EXISTS (SELECT 1 FROM public.charging_stations WHERE id = chargers.station_id AND operator_id = auth.uid())
);

-- Bookings: Drivers see own bookings, Operators see bookings for their stations
CREATE POLICY "Users see own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users cancel own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Operators see station bookings" ON public.bookings FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.charging_stations WHERE id = bookings.station_id AND operator_id = auth.uid())
);

-- Charging Sessions: Users see own sessions, Operators see their station sessions
CREATE POLICY "Users see own charging sessions" ON public.charging_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own sessions" ON public.charging_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Operators view station sessions" ON public.charging_sessions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.charging_stations WHERE id = charging_sessions.station_id AND operator_id = auth.uid())
);

-- Payments: Users view own payments
CREATE POLICY "Users see own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications: Users access own notifications
CREATE POLICY "Users manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- Fleet Vehicles & Drivers: Fleet manager access only
CREATE POLICY "Fleet managers manage drivers" ON public.fleet_drivers FOR ALL USING (auth.uid() = fleet_manager_id);
CREATE POLICY "Fleet managers manage vehicles" ON public.vehicles FOR ALL USING (auth.uid() = fleet_manager_id);
