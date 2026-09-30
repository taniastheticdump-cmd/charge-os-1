import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Booking } from '../types';
import { getBookings, cancelBooking } from '../services/db';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import {
  CalendarCheck,
  MapPin,
  Clock,
  IndianRupee,
  Navigation,
  XCircle,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface BookingsPageProps {
  onNavigate: (tab: string) => void;
}

export const BookingsPage: React.FC<BookingsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { showToast, refreshNotifications } = useNotifications();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'completed' | 'cancelled'>('all');

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    // If operator, show station bookings; if driver, show user bookings
    const data = await getBookings(user.role === 'driver' ? user.id : undefined);
    setBookings(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCancel = async (bookingId: string) => {
    if (!user) return;
    const ok = await cancelBooking(bookingId, user.id);
    if (ok) {
      showToast('Booking Cancelled', 'Slot released and refund simulated.');
      await loadData();
      await refreshNotifications();
    }
  };

  const filtered = bookings.filter(b => {
    if (statusFilter === 'all') return true;
    return b.status === statusFilter;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A]">Bay Reservations</h1>
          <p className="text-xs text-[#334155] mt-1">
            Confirmed, active, and past charging slot reservations with guaranteed bay concurrency.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => onNavigate('find-chargers')}
          icon={<Calendar className="w-4 h-4" />}
        >
          Book New Slot
        </Button>
      </div>

      {/* Filter tab bar */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 text-xs">
        {(['all', 'confirmed', 'completed', 'cancelled'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1.5 rounded-md font-semibold capitalize transition-colors ${
              statusFilter === tab
                ? 'bg-[#0F172A] text-white shadow-xs'
                : 'text-[#334155] hover:bg-slate-100 hover:text-[#0F172A]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">
          Loading reservation logs from database...
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No Bookings Found"
          description={
            statusFilter === 'all'
              ? 'You have not booked any charging bays yet. Locate an active station in Maharashtra to reserve.'
              : `No bookings found matching status: ${statusFilter}.`
          }
          actionText="Find Stations"
          onAction={() => onNavigate('find-chargers')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(booking => (
            <div
              key={booking.id}
              className="bg-white rounded-lg border border-slate-200 p-5 space-y-3 shadow-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] font-bold text-slate-400 block mb-0.5">
                    REF: {booking.id}
                  </span>
                  <h3 className="text-sm font-bold text-[#0F172A]">
                    {booking.station?.name || 'ChargeOS Station'}
                  </h3>
                  <p className="text-xs text-[#334155]">
                    {booking.station?.address}, {booking.station?.city}
                  </p>
                </div>

                <Badge
                  variant={
                    booking.status === 'confirmed'
                      ? 'green'
                      : booking.status === 'active'
                      ? 'blue'
                      : booking.status === 'completed'
                      ? 'slate'
                      : 'red'
                  }
                  size="sm"
                >
                  {booking.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2 border-y border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Date</span>
                  <span className="font-semibold text-[#0F172A]">{booking.booking_date}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Slot Window</span>
                  <span className="font-semibold text-[#0F172A]">
                    {booking.start_time} - {booking.end_time}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Bay Output</span>
                  <span className="font-semibold text-[#0F172A]">
                    {booking.charger?.power_kw ? `${booking.charger.power_kw} kW` : 'Fast'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Tariff Billed</span>
                  <span className="font-bold text-[#2563EB]">
                    ₹{booking.total_amount_inr.toFixed(2)} INR
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                {booking.station && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${booking.station.latitude},${booking.station.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-[#0F172A]"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Open Route
                  </a>
                )}

                {booking.status === 'confirmed' && (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleCancel(booking.id)}
                  >
                    Cancel Slot
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
