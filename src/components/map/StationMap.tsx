import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { ChargingStation } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Zap, Navigation, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

interface StationMapProps {
  stations: ChargingStation[];
  selectedStation: ChargingStation | null;
  onSelectStation: (station: ChargingStation) => void;
  onBookStation: (station: ChargingStation) => void;
  userCoords: { lat: number; lng: number } | null;
  center: { lat: number; lng: number };
  zoom: number;
}

export const StationMap: React.FC<StationMapProps> = ({
  stations,
  selectedStation,
  onSelectStation,
  onBookStation,
  userCoords,
  center,
  zoom
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const [mapError, setMapError] = useState(false);

  // Fallback interactive grid map if Google Maps API key has any issues
  if (!apiKey || mapError) {
    return (
      <div className="relative w-full h-full min-h-[450px] bg-slate-100 rounded-lg border border-slate-200 overflow-hidden flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center mx-auto mb-3">
            <Zap className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-[#0F172A] mb-1">Interactive Station View</h4>
          <p className="text-xs text-[#334155] mb-4">
            Showing {stations.length} stations across Maharashtra (Center: {center.lat.toFixed(4)}, {center.lng.toFixed(4)}).
          </p>
          <div className="space-y-2 max-h-60 overflow-y-auto text-left">
            {stations.map(st => (
              <div
                key={st.id}
                onClick={() => onSelectStation(st)}
                className={`p-2.5 rounded border text-xs cursor-pointer transition-colors ${
                  selectedStation?.id === st.id
                    ? 'border-[#2563EB] bg-blue-50/60'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#0F172A]">{st.name}</span>
                  <Badge variant={st.is_chargeos_network ? 'blue' : 'slate'} size="sm">
                    {st.is_chargeos_network ? 'ChargeOS' : 'External'}
                  </Badge>
                </div>
                <p className="text-slate-500 text-[11px] mt-0.5 truncate">{st.address}, {st.city}</p>
                {st.is_chargeos_network && (
                  <div className="mt-2 flex justify-end">
                    <Button size="sm" variant="primary" onClick={(e) => { e.stopPropagation(); onBookStation(st); }}>
                      Book Now
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[480px] rounded-lg overflow-hidden border border-slate-200">
      <APIProvider apiKey={apiKey} onError={() => setMapError(true)}>
        <Map
          center={center}
          zoom={zoom}
          mapId="DEMO_MAP_ID"
          reuseMaps={true}
          style={{ width: '100%', height: '100%' }}
          gestureHandling="greedy"
          disableDefaultUI={false}
          clickableIcons={false}
        >
          {/* User Location Marker */}
          {userCoords && (
            <AdvancedMarker position={userCoords} title="Your Detected Location">
              <div className="relative flex items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-md flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                </div>
              </div>
            </AdvancedMarker>
          )}

          {/* EV Charging Station Markers */}
          {stations.map(station => {
            const isChargeOS = station.is_chargeos_network;
            const isSelected = selectedStation?.id === station.id;

            return (
              <AdvancedMarker
                key={station.id}
                position={{ lat: station.latitude, lng: station.longitude }}
                onClick={() => onSelectStation(station)}
                title={station.name}
              >
                <Pin
                  background={isChargeOS ? (isSelected ? '#F59E0B' : '#2563EB') : '#64748B'}
                  borderColor="#FFFFFF"
                  glyphColor="#FFFFFF"
                  scale={isSelected ? 1.2 : 1.0}
                />
              </AdvancedMarker>
            );
          })}

          {/* Station Preview Card InfoWindow */}
          {selectedStation && (
            <InfoWindow
              position={{ lat: selectedStation.latitude, lng: selectedStation.longitude }}
              onCloseClick={() => onSelectStation(null as unknown as ChargingStation)}
              headerContent={
                <div className="flex items-center gap-2 pr-4">
                  <Badge variant={selectedStation.is_chargeos_network ? 'blue' : 'slate'} size="sm">
                    {selectedStation.is_chargeos_network ? 'ChargeOS Network' : 'External Station'}
                  </Badge>
                  {selectedStation.distance_km !== undefined && (
                    <span className="text-xs font-semibold text-slate-600">
                      {selectedStation.distance_km} km away
                    </span>
                  )}
                </div>
              }
            >
              <div className="p-2 max-w-xs text-left">
                <h3 className="text-sm font-bold text-[#0F172A] leading-tight mb-1">
                  {selectedStation.name}
                </h3>
                <p className="text-xs text-[#334155] mb-2 leading-relaxed">
                  {selectedStation.address}, {selectedStation.city}
                </p>

                {/* Live Charger Details for ChargeOS */}
                {selectedStation.is_chargeos_network ? (
                  <div className="bg-slate-50 p-2.5 rounded border border-slate-200 mb-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[#0F172A]">
                      <span className="text-slate-600">Available Bays:</span>
                      <span className="font-bold text-emerald-600">
                        {selectedStation.chargers?.filter(c => c.status === 'available').length || 0} / {selectedStation.chargers?.length || 0}
                      </span>
                    </div>
                    {selectedStation.chargers && selectedStation.chargers.length > 0 && (
                      <div className="flex items-center justify-between text-[#0F172A]">
                        <span className="text-slate-600">Max Power:</span>
                        <span className="font-semibold text-blue-700">
                          {Math.max(...selectedStation.chargers.map(c => c.power_kw))} kW DC Fast
                        </span>
                      </div>
                    )}
                    {selectedStation.chargers && selectedStation.chargers.length > 0 && (
                      <div className="flex items-center justify-between text-[#0F172A]">
                        <span className="text-slate-600">Tariff:</span>
                        <span className="font-bold text-[#0F172A]">
                          ₹{selectedStation.chargers[0].price_per_kwh_inr.toFixed(2)} / kWh
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-amber-50/70 p-2 rounded border border-amber-200 mb-3 text-[11px] text-amber-900">
                    <span className="font-semibold block mb-0.5">External Station</span>
                    Location verified via Google Maps. Booking unavailable through ChargeOS network.
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedStation.latitude},${selectedStation.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center text-xs font-medium border border-slate-300 rounded px-2.5 py-1.5 text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5 mr-1" />
                    Directions
                  </a>

                  {selectedStation.is_chargeos_network ? (
                    <Button
                      size="sm"
                      variant="primary"
                      className="flex-1 text-xs"
                      onClick={() => onBookStation(selectedStation)}
                    >
                      Book Now
                    </Button>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic py-1.5 flex-1 text-right">
                      Booking Unavailable
                    </span>
                  )}
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );
};
