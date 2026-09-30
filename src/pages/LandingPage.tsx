import React from 'react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  MapPin,
  Clock,
  Calendar,
  Zap,
  CreditCard,
  BarChart3,
  Shield,
  Truck,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Server,
  Layers
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-md text-xs font-semibold text-[#2563EB]">
                <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                Maharashtra EV Infrastructure Operating System
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#0F172A] leading-tight">
                Enterprise EV Charging Infrastructure, Reservations & Fleet Management
              </h1>

              <p className="text-base sm:text-lg text-[#334155] leading-relaxed max-w-2xl">
                ChargeOS connects electric vehicle drivers, high-power station operators, and commercial fleets across Mumbai, Thane, Pune, and Maharashtra on a unified transactional platform with real-time bay availability and slot reservations.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  size="lg"
                  variant="primary"
                  onClick={() => onNavigate('find-chargers')}
                  icon={<MapPin className="w-5 h-5" />}
                >
                  Find a Charger
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    const el = document.getElementById('how-it-works');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  How It Works
                </Button>
              </div>

              {/* Functional guarantees */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 text-xs text-[#334155]">
                <div>
                  <span className="font-bold text-[#0F172A] block text-sm">PostgreSQL RLS</span>
                  Concurrency-safe slot reservation
                </div>
                <div>
                  <span className="font-bold text-[#0F172A] block text-sm">₹ INR Telemetry</span>
                  Accurate per-kWh billing & accounting
                </div>
                <div>
                  <span className="font-bold text-[#0F172A] block text-sm">Google Maps</span>
                  Geo-spatial station navigation
                </div>
              </div>
            </div>

            {/* Right Product Visual Architecture */}
            <div className="lg:col-span-5">
              <div className="bg-[#0F172A] rounded-xl p-6 shadow-xl border border-slate-800 text-white space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="font-mono text-xs font-semibold tracking-wide">ChargeOS Node: BKC-HUB-01</span>
                  </div>
                  <Badge variant="blue" size="sm">Online</Badge>
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 text-xs">
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Active Charger Output</span>
                      <span className="text-emerald-400 font-mono">120 kW DC Fast</span>
                    </div>
                    <div className="flex justify-between text-slate-200 font-semibold">
                      <span>Connector CCS2</span>
                      <span className="text-blue-400">₹18.50 / kWh</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 text-xs space-y-2">
                    <div className="flex justify-between text-slate-400">
                      <span>Bay Concurrency Check</span>
                      <span className="text-emerald-400">0 Overlaps</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#2563EB] h-full w-2/3" />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                      <span>Station Utilization</span>
                      <span>67% Active</span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center text-xs">
                    <span className="text-slate-400">Primary Hub: Mumbai Bandra-Kurla Complex</span>
                    <button
                      onClick={() => onNavigate('find-chargers')}
                      className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
                    >
                      View Live Map <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Landing Page Features Grid (Sections 1-6) */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
            Core EV Charging Platform Modules
          </h2>
          <p className="text-sm text-[#334155] mt-2">
            Built from the ground up for high reliability across Maharashtra's growing electric mobility network.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. Find Nearby Chargers */}
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs hover:border-[#2563EB] transition-colors">
            <div className="w-10 h-10 rounded-md bg-blue-50 text-[#2563EB] flex items-center justify-center mb-4">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#0F172A] mb-1">1. Find Nearby Chargers</h3>
            <p className="text-xs text-[#334155] leading-relaxed">
              Locate verified charging stations across Mumbai, Thane, Navi Mumbai, Pune, Nashik, and Nagpur using browser Geolocation or city filters with 5km, 10km, and 25km radius thresholds.
            </p>
          </div>

          {/* 2. Real-Time Availability */}
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs hover:border-[#2563EB] transition-colors">
            <div className="w-10 h-10 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#0F172A] mb-1">2. Real-Time Bay Status</h3>
            <p className="text-xs text-[#334155] leading-relaxed">
              Database-backed bay statuses (Available, In Use, Reserved, Offline). Distinguishes native ChargeOS bookable bays from third-party external stations.
            </p>
          </div>

          {/* 3. Reserve a Charging Slot */}
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs hover:border-[#2563EB] transition-colors">
            <div className="w-10 h-10 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#0F172A] mb-1">3. Reserve a Slot</h3>
            <p className="text-xs text-[#334155] leading-relaxed">
              Select your connector, target date, and time slot. Strict transactional conflict checking guarantees no double-booked charger bays.
            </p>
          </div>

          {/* 4. Track Charging Sessions */}
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs hover:border-[#2563EB] transition-colors">
            <div className="w-10 h-10 rounded-md bg-blue-50 text-[#2563EB] flex items-center justify-center mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#0F172A] mb-1">4. Live Session Telemetry</h3>
            <p className="text-xs text-[#334155] leading-relaxed">
              Control your charging cycle with start, pause, resume, and stop commands. Automatically computes elapsed duration, delivered kWh, and total cost in INR.
            </p>
          </div>

          {/* 5. Manage Payments */}
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs hover:border-[#2563EB] transition-colors">
            <div className="w-10 h-10 rounded-md bg-slate-100 text-[#0F172A] flex items-center justify-center mb-4">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#0F172A] mb-1">5. Indian Rupee (₹) Billing</h3>
            <p className="text-xs text-[#334155] leading-relaxed">
              Transparent per-unit pricing in INR. Test payment simulator records transaction references for UPI, cards, and fleet accounts without storing sensitive card data.
            </p>
          </div>

          {/* 6. Charging Analytics */}
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs hover:border-[#2563EB] transition-colors">
            <div className="w-10 h-10 rounded-md bg-blue-50 text-[#2563EB] flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#0F172A] mb-1">6. Fleet & Station Analytics</h3>
            <p className="text-xs text-[#334155] leading-relaxed">
              Visualizes energy consumption curves, peak charging periods, and station utilization calculated strictly from stored database session rows.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
              How ChargeOS Works
            </h2>
            <p className="text-sm text-[#334155] mt-2">
              From station search to fully charged battery in five clear steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { step: '01', title: 'Find a Station', desc: 'Search on the live interactive map or choose your city in Maharashtra.' },
              { step: '02', title: 'Select a Charger', desc: 'Choose between CCS2, Type 2, or Bharat AC-001 with real power ratings.' },
              { step: '03', title: 'Reserve a Slot', desc: 'Pick your preferred date and time. Concurrency rules lock your bay.' },
              { step: '04', title: 'Plug & Charge', desc: 'Initiate demo charging session to monitor voltage, kWh, and duration.' },
              { step: '05', title: 'Track Session', desc: 'Receive your itemized INR tax summary and review historical logs.' }
            ].map(item => (
              <div key={item.step} className="bg-slate-50 p-5 rounded-lg border border-slate-200">
                <span className="font-mono text-xs font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Step {item.step}
                </span>
                <h4 className="text-sm font-bold text-[#0F172A] mt-3 mb-1">{item.title}</h4>
                <p className="text-xs text-[#334155] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Personas Section: Drivers, Operators, Fleets */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="w-10 h-10 rounded-md bg-blue-50 text-[#2563EB] flex items-center justify-center mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#0F172A] mb-2">For EV Drivers</h3>
            <p className="text-xs text-[#334155] mb-4">
              Real-time map navigation, reserved charging bays with zero wait time, and clear INR billing.
            </p>
            <Button size="sm" variant="outline" onClick={() => onNavigate('find-chargers')}>
              Launch Driver Map
            </Button>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="w-10 h-10 rounded-md bg-slate-100 text-[#0F172A] flex items-center justify-center mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#0F172A] mb-2">For Station Operators</h3>
            <p className="text-xs text-[#334155] mb-4">
              Add charging hubs, monitor live connector load, manage reservations, and track revenue in INR.
            </p>
            <Button size="sm" variant="secondary" onClick={() => onNavigate('operator')}>
              Operator Portal
            </Button>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="w-10 h-10 rounded-md bg-blue-50 text-[#2563EB] flex items-center justify-center mb-3">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#0F172A] mb-2">For Fleet Managers</h3>
            <p className="text-xs text-[#334155] mb-4">
              Assign vehicles to drivers, audit fleet energy consumption, and manage commercial depots.
            </p>
            <Button size="sm" variant="primary" onClick={() => onNavigate('fleet')}>
              Fleet Portal
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-base font-bold text-white tracking-tight">CHARGEOS</span>
              </div>
              <p className="text-slate-400 max-w-sm text-xs leading-relaxed">
                Enterprise electric vehicle infrastructure management operating across Maharashtra, India. Database-backed slot reservation, station telemetry, and fleet operations.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3">Product</h4>
              <ul className="space-y-2">
                <li><button onClick={() => onNavigate('find-chargers')} className="hover:text-white">Find Chargers</button></li>
                <li><button onClick={() => onNavigate('simulation')} className="hover:text-white">Simulation Lab</button></li>
                <li><button onClick={() => onNavigate('charging')} className="hover:text-white">Live Telemetry</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3">Portals</h4>
              <ul className="space-y-2">
                <li><button onClick={() => onNavigate('driver')} className="hover:text-white">Driver Dashboard</button></li>
                <li><button onClick={() => onNavigate('operator')} className="hover:text-white">Station Operators</button></li>
                <li><button onClick={() => onNavigate('fleet')} className="hover:text-white">Fleet Managers</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3">Legal & Support</h4>
              <ul className="space-y-2">
                <li><button onClick={() => onNavigate('privacy-policy')} className="hover:text-white">Privacy Policy</button></li>
                <li><button onClick={() => onNavigate('terms-and-conditions')} className="hover:text-white">Terms & Conditions</button></li>
                <li><span className="text-slate-500">support@chargeos.in</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500">
            <p>© {new Date().getFullYear()} ChargeOS Technologies. All rights reserved.</p>
            <p>Maharashtra EV Charging Network • Mumbai • Thane • Pune • Nashik • Nagpur</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
