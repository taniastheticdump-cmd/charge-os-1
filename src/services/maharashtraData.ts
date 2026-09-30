import { ChargingStation, Charger } from '../types';

export interface MaharashtraCityInfo {
  name: string;
  lat: number;
  lng: number;
  description: string;
}

export const MAHARASHTRA_CITIES: MaharashtraCityInfo[] = [
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777, description: 'Financial Capital - High Density Network' },
  { name: 'Thane', lat: 19.2183, lng: 72.9781, description: 'Metropolitan Gateway & Expressway Hub' },
  { name: 'Navi Mumbai', lat: 19.0330, lng: 73.0297, description: 'Planned Tech Corridors & Trans-Harbour' },
  { name: 'Pune', lat: 18.5204, lng: 73.8567, description: 'Automotive & IT Hub - Fast Charger Corridors' },
  { name: 'Nagpur', lat: 21.1458, lng: 79.0882, description: 'Zero Mile Logistics & Cargo Hub' },
  { name: 'Nashik', lat: 19.9975, lng: 73.7898, description: 'Northern Industrial & Vineyard Belt' },
  { name: 'Chhatrapati Sambhajinagar', lat: 19.8762, lng: 75.3433, description: 'Marathwada Industrial Region' },
  { name: 'Kolhapur', lat: 16.7050, lng: 74.2433, description: 'Southern Transit & Commercial Hub' },
  { name: 'Vasai-Virar', lat: 19.3919, lng: 72.8397, description: 'Northern Mumbai Suburban Hub' },
  { name: 'Panvel', lat: 18.9894, lng: 73.1175, description: 'Mumbai-Pune Expressway Starting Point' },
  { name: 'Kalyan-Dombivli', lat: 19.2403, lng: 73.1305, description: 'East Metropolitan Corridor' },
  { name: 'Mira-Bhayandar', lat: 19.2952, lng: 72.8544, description: 'Western Coastal Transit Corridor' }
];

export const INITIAL_CHARGERS: Charger[] = [
  // BKC Fast Charge Plaza (station-bkc)
  {
    id: 'chg-bkc-01',
    station_id: 'station-bkc',
    identifier_code: 'COS-BKC-DC1',
    connector_type: 'CCS2',
    power_kw: 120,
    current_type: 'DC Fast',
    price_per_kwh_inr: 18.5,
    status: 'available',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'chg-bkc-02',
    station_id: 'station-bkc',
    identifier_code: 'COS-BKC-DC2',
    connector_type: 'CCS2',
    power_kw: 60,
    current_type: 'DC Fast',
    price_per_kwh_inr: 17.0,
    status: 'available',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'chg-bkc-03',
    station_id: 'station-bkc',
    identifier_code: 'COS-BKC-AC1',
    connector_type: 'Type 2',
    power_kw: 22,
    current_type: 'AC',
    price_per_kwh_inr: 13.5,
    status: 'available',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },

  // Viviana Mall HyperCharge, Thane (station-thane-viviana)
  {
    id: 'chg-thn-01',
    station_id: 'station-thane-viviana',
    identifier_code: 'COS-THN-DC1',
    connector_type: 'CCS2',
    power_kw: 60,
    current_type: 'DC Fast',
    price_per_kwh_inr: 16.5,
    status: 'available',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'chg-thn-02',
    station_id: 'station-thane-viviana',
    identifier_code: 'COS-THN-DC2',
    connector_type: 'CHAdeMO',
    power_kw: 50,
    current_type: 'DC Fast',
    price_per_kwh_inr: 16.5,
    status: 'available',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'chg-thn-03',
    station_id: 'station-thane-viviana',
    identifier_code: 'COS-THN-AC1',
    connector_type: 'Type 2',
    power_kw: 22,
    current_type: 'AC',
    price_per_kwh_inr: 13.0,
    status: 'available',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },

  // Seawoods Grand Central, Navi Mumbai (station-navi-seawoods)
  {
    id: 'chg-nav-01',
    station_id: 'station-navi-seawoods',
    identifier_code: 'COS-NVI-DC1',
    connector_type: 'CCS2',
    power_kw: 90,
    current_type: 'DC Fast',
    price_per_kwh_inr: 17.5,
    status: 'available',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'chg-nav-02',
    station_id: 'station-navi-seawoods',
    identifier_code: 'COS-NVI-AC1',
    connector_type: 'Type 2',
    power_kw: 22,
    current_type: 'AC',
    price_per_kwh_inr: 13.5,
    status: 'available',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },

  // Hinjewadi Tech Park Station, Pune (station-pune-hinjewadi)
  {
    id: 'chg-pun-01',
    station_id: 'station-pune-hinjewadi',
    identifier_code: 'COS-PUN-DC1',
    connector_type: 'CCS2',
    power_kw: 150,
    current_type: 'DC Fast',
    price_per_kwh_inr: 18.0,
    status: 'available',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'chg-pun-02',
    station_id: 'station-pune-hinjewadi',
    identifier_code: 'COS-PUN-DC2',
    connector_type: 'CCS2',
    power_kw: 60,
    current_type: 'DC Fast',
    price_per_kwh_inr: 16.0,
    status: 'available',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'chg-pun-03',
    station_id: 'station-pune-hinjewadi',
    identifier_code: 'COS-PUN-AC1',
    connector_type: 'Bharat AC-001',
    power_kw: 10,
    current_type: 'AC',
    price_per_kwh_inr: 12.0,
    status: 'available',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },

  // Koregaon Park Mobility Hub, Pune (station-pune-kp)
  {
    id: 'chg-pkp-01',
    station_id: 'station-pune-kp',
    identifier_code: 'COS-PKP-DC1',
    connector_type: 'CCS2',
    power_kw: 60,
    current_type: 'DC Fast',
    price_per_kwh_inr: 17.0,
    status: 'available',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },

  // Orion Mall Expressway Terminal, Panvel (station-panvel-orion)
  {
    id: 'chg-pnv-01',
    station_id: 'station-panvel-orion',
    identifier_code: 'COS-PNV-DC1',
    connector_type: 'CCS2',
    power_kw: 120,
    current_type: 'DC Fast',
    price_per_kwh_inr: 18.0,
    status: 'available',
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },

  // City Centre Terminal, Nashik (station-nashik-cc)
  {
    id: 'chg-nsk-01',
    station_id: 'station-nashik-cc',
    identifier_code: 'COS-NSK-DC1',
    connector_type: 'CCS2',
    power_kw: 60,
    current_type: 'DC Fast',
    price_per_kwh_inr: 15.5,
    status: 'available',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },

  // Civil Lines EcoHub, Nagpur (station-nagpur-cl)
  {
    id: 'chg-ngp-01',
    station_id: 'station-nagpur-cl',
    identifier_code: 'COS-NGP-DC1',
    connector_type: 'CCS2',
    power_kw: 60,
    current_type: 'DC Fast',
    price_per_kwh_inr: 16.0,
    status: 'available',
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },

  // DYP City Mall, Kolhapur (station-kolhapur-dyp)
  {
    id: 'chg-kop-01',
    station_id: 'station-kolhapur-dyp',
    identifier_code: 'COS-KOP-DC1',
    connector_type: 'CCS2',
    power_kw: 50,
    current_type: 'DC Fast',
    price_per_kwh_inr: 15.0,
    status: 'available',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },

  // Prozone Expressway Hub, Chhatrapati Sambhajinagar (station-aurangabad-prz)
  {
    id: 'chg-abg-01',
    station_id: 'station-aurangabad-prz',
    identifier_code: 'COS-CSN-DC1',
    connector_type: 'CCS2',
    power_kw: 60,
    current_type: 'DC Fast',
    price_per_kwh_inr: 16.0,
    status: 'available',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const INITIAL_STATIONS: ChargingStation[] = [
  // TYPE 1: ChargeOS Network Stations (Bookable, real charger inventory)
  {
    id: 'station-bkc',
    operator_id: 'op-01',
    name: 'ChargeOS BKC SuperCharger Hub',
    address: 'G Block, Bandra Kurla Complex, Bandra East',
    city: 'Mumbai',
    state: 'Maharashtra',
    postal_code: '400051',
    latitude: 19.0657,
    longitude: 72.8687,
    operating_hours: '24 Hours Open',
    amenities: ['24/7 Security', 'Restrooms', 'Café & Lounge', 'Wi-Fi', 'EV Tyre Pressure Check'],
    is_active: true,
    is_chargeos_network: true,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'station-thane-viviana',
    operator_id: 'op-01',
    name: 'ChargeOS Viviana Mall HyperStation',
    address: 'Eastern Express Highway, Service Rd, Laxmi Nagar',
    city: 'Thane',
    state: 'Maharashtra',
    postal_code: '400606',
    latitude: 19.2084,
    longitude: 72.9712,
    operating_hours: '06:00 - 23:30',
    amenities: ['Mall Parking', 'Food Court', 'Washrooms', 'Valet EV Parking', 'Covered Bay'],
    is_active: true,
    is_chargeos_network: true,
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'station-navi-seawoods',
    operator_id: 'op-01',
    name: 'ChargeOS Grand Central Station',
    address: 'Sector 40, Seawoods Railway Station Complex',
    city: 'Navi Mumbai',
    state: 'Maharashtra',
    postal_code: '400706',
    latitude: 19.0219,
    longitude: 73.0185,
    operating_hours: '24 Hours Open',
    amenities: ['Transit Access', 'Shopping', 'Elevator', '24/7 Surveillance'],
    is_active: true,
    is_chargeos_network: true,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'station-pune-hinjewadi',
    operator_id: 'op-02',
    name: 'ChargeOS Hinjewadi Phase 1 UltraHub',
    address: 'Opposite Infosys Circle, Rajiv Gandhi Infotech Park',
    city: 'Pune',
    state: 'Maharashtra',
    postal_code: '411057',
    latitude: 18.5912,
    longitude: 73.7389,
    operating_hours: '24 Hours Open',
    amenities: ['Café', 'Fleet Bay', 'High Speed Wi-Fi', 'EV Fleet Staging Area'],
    is_active: true,
    is_chargeos_network: true,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'station-pune-kp',
    operator_id: 'op-02',
    name: 'ChargeOS Koregaon Park Green Hub',
    address: 'North Main Road, Near Lane 5',
    city: 'Pune',
    state: 'Maharashtra',
    postal_code: '411001',
    latitude: 18.5362,
    longitude: 73.8940,
    operating_hours: '07:00 - 23:00',
    amenities: ['Coffee Shop', 'EV Lounge', 'Restrooms'],
    is_active: true,
    is_chargeos_network: true,
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'station-panvel-orion',
    operator_id: 'op-01',
    name: 'ChargeOS Panvel Expressway Terminal',
    address: 'Near Orion Mall, Old Mumbai-Pune Highway, Panvel',
    city: 'Panvel',
    state: 'Maharashtra',
    postal_code: '410206',
    latitude: 18.9922,
    longitude: 73.1189,
    operating_hours: '24 Hours Open',
    amenities: ['Highway Rest Stop', 'Diner', 'Restrooms', 'Expressway Rapid Charging'],
    is_active: true,
    is_chargeos_network: true,
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'station-nashik-cc',
    operator_id: 'op-03',
    name: 'ChargeOS Nashik City Centre Station',
    address: 'Untwadi Road, Lavate Nagar, Parijat Nagar',
    city: 'Nashik',
    state: 'Maharashtra',
    postal_code: '422002',
    latitude: 19.9754,
    longitude: 73.7667,
    operating_hours: '08:00 - 22:30',
    amenities: ['Mall Access', 'Restrooms', 'ATM'],
    is_active: true,
    is_chargeos_network: true,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'station-nagpur-cl',
    operator_id: 'op-03',
    name: 'ChargeOS Zero Mile Hub, Nagpur',
    address: 'Wardha Road, Near Civil Lines Metro Station',
    city: 'Nagpur',
    state: 'Maharashtra',
    postal_code: '440001',
    latitude: 21.1498,
    longitude: 79.0806,
    operating_hours: '24 Hours Open',
    amenities: ['Metro Connection', 'Covered Canopy', '24/7 Security'],
    is_active: true,
    is_chargeos_network: true,
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'station-kolhapur-dyp',
    operator_id: 'op-03',
    name: 'ChargeOS DYP Mall Kolhapur',
    address: 'Old Pune-Bangalore Highway, Kawala Naka',
    city: 'Kolhapur',
    state: 'Maharashtra',
    postal_code: '416005',
    latitude: 16.7102,
    longitude: 74.2492,
    operating_hours: '07:00 - 23:00',
    amenities: ['Highway Access', 'Dining', 'Restrooms'],
    is_active: true,
    is_chargeos_network: true,
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'station-aurangabad-prz',
    operator_id: 'op-03',
    name: 'ChargeOS Prozone Hub, Chhatrapati Sambhajinagar',
    address: 'API Corner, MIDC Industrial Area, Chikalthana',
    city: 'Chhatrapati Sambhajinagar',
    state: 'Maharashtra',
    postal_code: '431006',
    latitude: 19.8735,
    longitude: 75.3789,
    operating_hours: '08:00 - 23:00',
    amenities: ['Mall Parking', 'Food Outlets', 'Security'],
    is_active: true,
    is_chargeos_network: true,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },

  // TYPE 2: External EV Stations (Discovered via map / third party - NON-BOOKABLE)
  {
    id: 'ext-mumbai-hpcl-dadar',
    name: 'HPCL EV Charging Point - Dadar TT Circle',
    address: 'Dr Baba Saheb Ambedkar Rd, Dadar East',
    city: 'Mumbai',
    state: 'Maharashtra',
    postal_code: '400014',
    latitude: 19.0178,
    longitude: 72.8478,
    operating_hours: '24 Hours Open',
    amenities: ['Fuel Station', 'Air & Water'],
    is_active: true,
    is_chargeos_network: false, // External: Booking unavailable
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'ext-thane-ghodbunder-ioc',
    name: 'IndianOil EV Charger - Ghodbunder Road',
    address: 'Ghodbunder Rd, Kasarvadavali',
    city: 'Thane',
    state: 'Maharashtra',
    postal_code: '400615',
    latitude: 19.2711,
    longitude: 72.9654,
    operating_hours: '24 Hours Open',
    amenities: ['Convenience Store'],
    is_active: true,
    is_chargeos_network: false, // External: Booking unavailable
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'ext-pune-viman-bpcl',
    name: 'BPCL Pulse EV Station - Viman Nagar',
    address: 'Pune-Nagar Highway, Sakore Nagar',
    city: 'Pune',
    state: 'Maharashtra',
    postal_code: '411014',
    latitude: 18.5679,
    longitude: 73.9143,
    operating_hours: '24 Hours Open',
    amenities: ['Fuel Station', 'Air'],
    is_active: true,
    is_chargeos_network: false, // External: Booking unavailable
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'ext-mumbai-juhu-tata',
    name: 'Tata Power EZ Charge - Juhu Tara Road',
    address: 'Near Sea Princess Hotel, Juhu',
    city: 'Mumbai',
    state: 'Maharashtra',
    postal_code: '400049',
    latitude: 19.0984,
    longitude: 72.8267,
    operating_hours: '07:00 - 22:00',
    amenities: ['Hotel Parking'],
    is_active: true,
    is_chargeos_network: false, // External: Booking unavailable
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  }
];
