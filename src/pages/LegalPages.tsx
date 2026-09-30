import React from 'react';
import { Shield, FileText, ArrowLeft, MapPin, CreditCard, Lock } from 'lucide-react';
import { Button } from '../components/common/Button';

interface LegalPagesProps {
  type: 'privacy' | 'terms';
  onBack: () => void;
}

export const LegalPages: React.FC<LegalPagesProps> = ({ type, onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xs border border-slate-200 p-8 sm:p-12 space-y-8">
        <Button variant="ghost" size="sm" onClick={onBack} icon={<ArrowLeft className="w-4 h-4" />}>
          Back to ChargeOS
        </Button>

        {type === 'privacy' ? (
          <div className="space-y-6 text-[#334155] text-sm leading-relaxed">
            <div className="border-b border-slate-200 pb-4">
              <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">Privacy Policy</h1>
              <p className="text-xs text-slate-500 mt-1">Effective Date: October 2026 • Region: Maharashtra, India</p>
            </div>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#0F172A]">1. Overview</h2>
              <p>
                ChargeOS Technologies operates an enterprise electric vehicle charging infrastructure platform. We are committed to maintaining data privacy and handling all user, fleet, and geolocation telemetry in accordance with applicable Indian digital data protection standards.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#2563EB]" /> 2. Location Permissions & Transparency
              </h2>
              <p>
                ChargeOS requests browser Geolocation permissions exclusively to detect nearby charging stations, measure route distances, and provide turn-by-turn navigation. If location permission is declined by the user, the platform remains 100% operational with manual Maharashtra city selections (Mumbai, Thane, Pune, etc.). We do not permanently log background user GPS traces.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#0F172A]">3. Account & Profile Information</h2>
              <p>
                We collect your name, email address, phone number, and designated platform role (EV Driver, Station Operator, or Fleet Manager) to authenticate access, issue booking confirmations, and enforce database Row Level Security (RLS).
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#2563EB]" /> 4. Payment Information
              </h2>
              <p>
                ChargeOS currently operates in test payment simulation mode for demonstration and integration testing in Indian Rupees (₹ INR). Sensitive credit card numbers, CVVs, and banking credentials are never requested or stored on our servers.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#0F172A]">5. Charging Telemetry & Analytics</h2>
              <p>
                Charging session statistics, including delivered kilowatt-hours (kWh), duration in minutes, and tariff cost calculations, are stored in PostgreSQL to provide itemized historical receipts, fleet auditing, and grid utilization modeling.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#0F172A]">6. User Rights & Contact</h2>
              <p>
                Users retain the right to review, update, or request deletion of their account records at any time via the Settings console or by writing to <strong>privacy@chargeos.in</strong>.
              </p>
            </section>
          </div>
        ) : (
          <div className="space-y-6 text-[#334155] text-sm leading-relaxed">
            <div className="border-b border-slate-200 pb-4">
              <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">Terms and Conditions</h1>
              <p className="text-xs text-slate-500 mt-1">Effective Date: October 2026 • Governing Law: Maharashtra, India</p>
            </div>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#0F172A]">1. Agreement to Terms</h2>
              <p>
                By accessing ChargeOS, including the web portal, mobile navigation, and charging consoles, you agree to comply with these terms governing bay reservation, station operation, and fleet fleet billing.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#0F172A]">2. Bay Reservations & Overlap Prevention</h2>
              <p>
                ChargeOS employs PostgreSQL transaction safeguards to prevent duplicate or conflicting bookings. Drivers are requested to arrive within 15 minutes of their reserved start time. Reserved bays not claimed within the grace window may be released to prevent station grid congestion.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#0F172A]">3. Currency and Tariffs</h2>
              <p>
                All tariffs, charging session billings, operator revenues, and deposits are denominated and transacted exclusively in Indian Rupees (₹ / INR). Station operators establish transparent per-kWh tariffs displayed prior to reservation.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#0F172A]">4. Station Operator Responsibilities</h2>
              <p>
                Station operators warrant that chargers connected to the ChargeOS network comply with Central Electricity Authority (CEA) guidelines, provide accurate electrical grounding, and maintain functional emergency stops.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#0F172A]">5. External Station Data Disclaimer</h2>
              <p>
                Stations marked as "External Station" are populated via third-party location feeds (e.g. Google Places). ChargeOS does not guarantee connector functionality or provide slot reservations for unmanaged external infrastructure.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#0F172A]">6. Contact & Grievance Redressal</h2>
              <p>
                For network disputes or technical support, contact the ChargeOS Maharashtra Operations Desk at <strong>legal@chargeos.in</strong>.
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
