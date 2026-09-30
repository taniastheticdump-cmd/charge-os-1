import { ChargingStation } from '../types';

export interface ExternalSearchFilters {
  lat: number;
  lng: number;
  radiusMeters: number;
  keyword?: string;
}

/**
 * Searches for real external EV stations using Google Maps JavaScript Places library
 */
export async function searchExternalGooglePlacesStations(
  filters: ExternalSearchFilters
): Promise<ChargingStation[]> {
  const win = typeof window !== 'undefined' ? (window as unknown as { google?: any }) : undefined;
  if (!win?.google?.maps?.places) {
    return [];
  }

  return new Promise((resolve) => {
    try {
      const placesLib = win.google.maps.places;
      const dummyDiv = document.createElement('div');
      const service = new placesLib.PlacesService(dummyDiv);

      const request = {
        location: new win.google.maps.LatLng(filters.lat, filters.lng),
        radius: filters.radiusMeters,
        type: 'charging_station',
        keyword: filters.keyword || 'EV charging station'
      };

      service.nearbySearch(request, (results: any[], status: string) => {
        if (status === placesLib.PlacesServiceStatus.OK && results && results.length > 0) {
          const externalStations: ChargingStation[] = results.map((place: any) => {
            const lat = place.geometry?.location?.lat?.() ?? filters.lat;
            const lng = place.geometry?.location?.lng?.() ?? filters.lng;

            return {
              id: 'ext-' + (place.place_id || Math.random().toString(36).substring(2, 9)),
              name: place.name || 'External EV Charging Point',
              address: place.vicinity || 'Maharashtra, India',
              city: 'Maharashtra',
              state: 'Maharashtra',
              latitude: lat,
              longitude: lng,
              operating_hours: place.opening_hours?.isOpen?.() ? 'Open Now' : 'Operational',
              amenities: ['Public Access', 'External Provider'],
              is_active: true,
              is_chargeos_network: false, // TYPE 2 External station: Booking unavailable
              rating: place.rating,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
          });

          resolve(externalStations);
        } else {
          resolve([]);
        }
      });
    } catch (err) {
      console.warn('Google Places nearbySearch encountered an issue:', err);
      resolve([]);
    }
  });
}
