import React, { useState, useEffect, useCallback } from 'react';
import { ChargingStation, CurrentType, StationFilterOptions } from '../types';
import { fetchStations } from '../services/db';
import { MAHARASHTRA_CITIES } from '../services/maharashtraData';
import { StationMap } from '../components/map/StationMap';
import { BookingFlowModal } from '../components/booking/BookingFlowModal';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import {
  MapPin,
  Search,
  Filter,
  Navigation,
  Compass,
  AlertTriangle,
  Zap,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  Map as MapIcon,
  List as ListIcon,
  ArrowUpDown
} from 'lucide-react';

export const FindChargersPage: React.FC = () => {
  // Geolocation & Map State
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: 19.0760, // Default: Mumbai / Thane metropolitan region
    lng: 72.8777
  });
  const [mapZoom, setMapZoom] = useState<number>(11);

  // Data & Selection State
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const [bookingStation, setBookingStation] = useState<ChargingStation | null>(null);

  // Mobile view toggle (Map vs List)
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All Maharashtra');
  const [radiusKm, setRadiusKm] = useState<number>(25);
  const [selectedTypes, setSelectedTypes] = useState<CurrentType[]>([]);
  const [minPowerKw, setMinPowerKw] = useState<number>(0);
  const [availabilityOnly, setAvailabilityOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'distance' | 'price_asc' | 'price_desc' | 'power_desc'>('distance');
  const [networkType, setNetworkType] = useState<'all' | 'chargeos' | 'external'>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Request browser geolocation
  const requestGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationPermission('denied');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        setLocationPermission('granted');
        setMapCenter(coords);
        setMapZoom(13);
      },
      (err) => {
        console.warn('Geolocation permission error or denied:', err.message);
        setLocationPermission('denied');
        // Keep default Mumbai / Thane center
        setMapCenter({ lat: 19.0760, lng: 72.8777 });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, []);

  // Request on initial load
  useEffect(() => {
    requestGeolocation();
  }, [requestGeolocation]);

  // Load stations based on active filters
  const loadStations = useCallback(async () => {
    setLoading(true);
    const filterOptions: Partial<StationFilterOptions> = {
      searchQuery,
      selectedCity,
      radiusKm: userCoords ? radiusKm : undefined,
      chargerTypes: selectedTypes.length > 0 ? selectedTypes : undefined,
      minPowerKw: minPowerKw > 0 ? minPowerKw : undefined,
      availabilityOnly,
      sortBy,
      networkType
    };

    const data = await fetchStations(filterOptions, userCoords || undefined);
    setStations(data);
    setLoading(false);
  }, [searchQuery, selectedCity, radiusKm, selectedTypes, minPowerKw, availabilityOnly, sortBy, networkType, userCoords]);

  useEffect(() => {
    loadStations();
  }, [loadStations]);

  // Handle city selection jump
  const handleSelectCity = (cityName: string) => {
    setSelectedCity(cityName);
    if (cityName === 'All Maharashtra') {
      setMapCenter({ lat: 19.0760, lng: 72.8777 });
      setMapZoom(10);
      return;
    }
    const city = MAHARASHTRA_CITIES.find(c => c.name === cityName);
    if (city) {
      setMapCenter({ lat: city.lat, lng: city.lng });
      setMapZoom(12);
    }
  };

  const toggleTypeFilter = (type: CurrentType) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50">
      {/* Top Filter and Search Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input & City Dropdown */}
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search station, landmark, or street in Maharashtra..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:bg-white"
              />
            </div>

            <select
              value={selectedCity}
              onChange={e => handleSelectCity(e.target.value)}
              className="text-xs py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-md font-medium text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            >
              <option value="All Maharashtra">All Maharashtra</option>
              {MAHARASHTRA_CITIES.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Quick Filters & Toggle Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {/* Radius (if user location active) */}
            <select
              value={radiusKm}
              onChange={e => setRadiusKm(Number(e.target.value))}
              className="text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-300 rounded-md font-medium text-[#334155]"
            >
              <option value={5}>5 km radius</option>
              <option value={10}>10 km radius</option>
              <option value={25}>25 km radius</option>
              <option value={50}>50 km radius</option>
            </select>

            {/* Quick Type pills */}
            <button
              onClick={() => toggleTypeFilter('DC Fast')}
              className={`text-xs px-2.5 py-1.5 rounded-md border font-medium transition-colors ${
                selectedTypes.includes('DC Fast')
                  ? 'bg-blue-50 border-[#2563EB] text-[#2563EB]'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              DC Fast
            </button>
            <button
              onClick={() => toggleTypeFilter('AC')}
              className={`text-xs px-2.5 py-1.5 rounded-md border font-medium transition-colors ${
                selectedTypes.includes('AC')
                  ? 'bg-blue-50 border-[#2563EB] text-[#2563EB]'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              AC
            </button>

            {/* Availability toggle */}
            <button
              onClick={() => setAvailabilityOnly(!availabilityOnly)}
              className={`text-xs px-2.5 py-1.5 rounded-md border font-medium transition-colors ${
                availabilityOnly
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Available Now
            </button>

            {/* Network Type Filter */}
            <select
              value={networkType}
              onChange={e => setNetworkType(e.target.value as 'all' | 'chargeos' | 'external')}
              className="text-xs py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-md font-medium text-[#334155]"
            >
              <option value="all">All Stations</option>
              <option value="chargeos">ChargeOS Bookable</option>
              <option value="external">External Stations</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'distance' | 'price_asc' | 'price_desc' | 'power_desc')}
              className="text-xs py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-md font-medium text-[#334155]"
            >
              <option value="distance">Nearest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="power_desc">Power: Highest kW</option>
            </select>

            {/* Mobile View Switcher */}
            <div className="flex md:hidden border border-slate-300 rounded-md overflow-hidden">
              <button
                onClick={() => setMobileView('list')}
                className={`p-1.5 text-xs ${mobileView === 'list' ? 'bg-[#0F172A] text-white' : 'bg-white text-slate-700'}`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMobileView('map')}
                className={`p-1.5 text-xs ${mobileView === 'map' ? 'bg-[#0F172A] text-white' : 'bg-white text-slate-700'}`}
              >
                <MapIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Location Permission Notification Banner */}
        {locationPermission === 'denied' && (
          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Location access is disabled. Defaulting to Mumbai/Thane view. Use city search or manual map navigation.</span>
            </div>
            <button
              onClick={requestGeolocation}
              className="text-xs font-semibold text-[#2563EB] hover:underline shrink-0 ml-2"
            >
              Retry GPS
            </button>
          </div>
        )}
      </div>

      {/* Main Split Content: Left Station List / Right Map */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: Station List */}
        <div
          className={`w-full md:w-5/12 lg:w-4/12 border-r border-slate-200 bg-white overflow-y-auto flex flex-col ${
            mobileView === 'map' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header count summary */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-[#334155] bg-slate-50/50">
            <span>
              Found <strong className="text-[#0F172A]">{stations.length}</strong> stations in {selectedCity}
            </span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] text-blue-700">
                <span className="w-2 h-2 rounded-full bg-[#2563EB]" /> ChargeOS Bookable
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-500">
                <span className="w-2 h-2 rounded-full bg-slate-400" /> External
              </span>
            </div>
          </div>

          {/* List items */}
          <div className="flex-1 divide-y divide-slate-100 p-3 space-y-3">
            {loading ? (
              <div className="p-12 text-center text-xs text-slate-500">
                Loading verified stations across Maharashtra...
              </div>
            ) : stations.length === 0 ? (
              <EmptyState
                icon={MapPin}
                title="No Stations Found"
                description={`No EV charging stations match your current filters in ${selectedCity}. Try expanding radius or resetting filters.`}
                actionText="Reset Filters"
                onAction={() => {
                  setSearchQuery('');
                  setSelectedCity('All Maharashtra');
                  setSelectedTypes([]);
                  setAvailabilityOnly(false);
                  setNetworkType('all');
                }}
              />
            ) : (
              stations.map(station => {
                const isSelected = selectedStation?.id === station.id;
                const isChargeOS = station.is_chargeos_network;
                const availableCount = station.chargers?.filter(c => c.status === 'available').length ?? 0;
                const totalChargers = station.chargers?.length ?? 0;

                return (
                  <div
                    key={station.id}
                    onClick={() => {
                      setSelectedStation(station);
                      setMapCenter({ lat: station.latitude, lng: station.longitude });
                      setMapZoom(14);
                    }}
                    className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#2563EB] bg-blue-50/40 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <h3 className="text-sm font-bold text-[#0F172A] leading-snug">
                          {station.name}
                        </h3>
                        <p className="text-xs text-[#334155] mt-0.5 line-clamp-1">
                          {station.address}, {station.city}
                        </p>
                      </div>
                      <Badge variant={isChargeOS ? 'blue' : 'slate'} size="sm">
                        {isChargeOS ? 'ChargeOS' : 'External'}
                      </Badge>
                    </div>

                    {/* Live Specs & Metrics */}
                    <div className="grid grid-cols-3 gap-2 py-2 my-2 border-y border-slate-100 text-xs text-[#334155]">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Distance</span>
                        <span className="font-semibold text-[#0F172A]">
                          {station.distance_km !== undefined ? `${station.distance_km} km away` : 'Maharashtra'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Chargers</span>
                        {isChargeOS ? (
                          <span className="font-semibold text-emerald-600">
                            {availableCount} / {totalChargers} Available
                          </span>
                        ) : (
                          <span className="font-medium text-slate-500">Unmanaged</span>
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Tariff</span>
                        {isChargeOS && station.chargers && station.chargers.length > 0 ? (
                          <span className="font-bold text-[#2563EB]">
                            ₹{station.chargers[0].price_per_kwh_inr.toFixed(2)}/kWh
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Varies</span>
                        )}
                      </div>
                    </div>

                    {/* Charger Types Preview */}
                    {isChargeOS && station.chargers && station.chargers.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {station.chargers.map(c => (
                          <span
                            key={c.id}
                            className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200"
                          >
                            {c.power_kw}kW {c.connector_type}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-1 gap-2">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="text-xs font-medium text-slate-600 hover:text-[#0F172A] inline-flex items-center gap-1"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        Directions
                      </a>

                      {isChargeOS ? (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setBookingStation(station);
                          }}
                        >
                          Book Now
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          Booking Unavailable
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Google Map */}
        <div className={`w-full md:w-7/12 lg:w-8/12 h-full ${mobileView === 'list' ? 'hidden md:block' : 'block'}`}>
          <StationMap
            stations={stations}
            selectedStation={selectedStation}
            onSelectStation={st => setSelectedStation(st)}
            onBookStation={st => setBookingStation(st)}
            userCoords={userCoords}
            center={mapCenter}
            zoom={mapZoom}
          />
        </div>
      </div>

      {/* Booking Flow Modal */}
      <BookingFlowModal
        station={bookingStation}
        isOpen={Boolean(bookingStation)}
        onClose={() => setBookingStation(null)}
        onBookingSuccess={() => loadStations()}
      />
    </div>
  );
};
