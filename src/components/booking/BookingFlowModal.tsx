import React, { useState } from 'react';
import { ChargingStation, Charger, Booking, Payment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { createBooking, checkBookingConflict } from '../../services/db';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  Zap,
  Calendar,
  Clock,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Navigation,
  ShieldCheck,
  Info
} from 'lucide-react';

interface BookingFlowModalProps {
  station: ChargingStation | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess?: (booking: Booking) => void;
}

type Step = 'charger' | 'datetime' | 'review' | 'payment' | 'confirmation';

export const BookingFlowModal: React.FC<BookingFlowModalProps> = ({
  station,
  isOpen,
  onClose,
  onBookingSuccess
}) => {
  const { user } = useAuth();
  const { showToast, refreshNotifications } = useNotifications();

  // Form State
  const [currentStep, setCurrentStep] = useState<Step>('charger');
  const [selectedCharger, setSelectedCharger] = useState<Charger | null>(null);
  const [bookingDate, setBookingDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState<string>('14:00');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Credit/Debit Card' | 'Net Banking' | 'Fleet Wallet'>('UPI');
  const [simulateFailure, setSimulateFailure] = useState<boolean>(false);

  // Submission state
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [paymentResult, setPaymentResult] = useState<Payment | null>(null);

  if (!station) return null;

  // Calculate end time
  const calculateEndTime = (start: string, duration: number): string => {
    const [h, m] = start.split(':').map(Number);
    const totalMinutes = h * 60 + m + duration;
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
  };

  const endTime = calculateEndTime(startTime, durationMinutes);

  // Financial calculations in INR
  const estimatedKwh = selectedCharger
    ? Number(((selectedCharger.power_kw * (durationMinutes / 60)) * 0.85).toFixed(1))
    : 0;
  const totalAmountInr = selectedCharger
    ? Number((estimatedKwh * selectedCharger.price_per_kwh_inr).toFixed(2))
    : 0;

  const handleSelectCharger = (charger: Charger) => {
    setSelectedCharger(charger);
    setErrorMessage(null);
    setCurrentStep('datetime');
  };

  const handleValidateDateTime = async () => {
    if (!selectedCharger) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const conflict = await checkBookingConflict(
        selectedCharger.id,
        bookingDate,
        startTime,
        endTime
      );

      if (conflict.hasConflict) {
        setErrorMessage(
          `Conflict Detected: This bay is reserved from ${conflict.conflictingBooking?.start_time} to ${conflict.conflictingBooking?.end_time}. Please adjust time.`
        );
        setIsProcessing(false);
        return;
      }

      setCurrentStep('review');
    } catch (err) {
      setErrorMessage((err as Error).message || 'Validation error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!user || !selectedCharger || !station) return;
    setIsProcessing(true);
    setErrorMessage(null);

    // Support simulated test payment failure
    if (simulateFailure) {
      setTimeout(() => {
        setIsProcessing(false);
        setErrorMessage('Test Payment Failed: Bank simulator rejected transaction. Please switch to UPI or uncheck simulation failure.');
      }, 800);
      return;
    }

    try {
      const result = await createBooking(
        {
          user_id: user.id,
          charger_id: selectedCharger.id,
          station_id: station.id,
          booking_date: bookingDate,
          start_time: startTime,
          end_time: endTime,
          duration_minutes: durationMinutes,
          estimated_kwh: estimatedKwh,
          total_amount_inr: totalAmountInr
        },
        paymentMethod
      );

      setConfirmedBooking(result.booking);
      setPaymentResult(result.payment);
      setCurrentStep('confirmation');
      showToast('Booking Confirmed', `Reserved slot at ${station.name} for ₹${totalAmountInr.toFixed(2)}.`);
      await refreshNotifications();
      onBookingSuccess?.(result.booking);
    } catch (err) {
      setErrorMessage((err as Error).message || 'Failed to complete booking');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetModal = () => {
    setCurrentStep('charger');
    setSelectedCharger(null);
    setConfirmedBooking(null);
    setPaymentResult(null);
    setErrorMessage(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetModal}
      title={currentStep === 'confirmation' ? 'Booking Confirmed' : `Reserve Slot - ${station.name}`}
      subtitle={`${station.address}, ${station.city}`}
      maxWidth="lg"
    >
      {/* Step Indicators */}
      {currentStep !== 'confirmation' && (
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-200 text-xs">
          <span className={`font-semibold ${currentStep === 'charger' ? 'text-[#2563EB]' : 'text-slate-500'}`}>
            1. Charger
          </span>
          <span className="text-slate-300">→</span>
          <span className={`font-semibold ${currentStep === 'datetime' ? 'text-[#2563EB]' : 'text-slate-500'}`}>
            2. Schedule
          </span>
          <span className="text-slate-300">→</span>
          <span className={`font-semibold ${currentStep === 'review' ? 'text-[#2563EB]' : 'text-slate-500'}`}>
            3. Review
          </span>
          <span className="text-slate-300">→</span>
          <span className={`font-semibold ${currentStep === 'payment' ? 'text-[#2563EB]' : 'text-slate-500'}`}>
            4. Payment
          </span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: SELECT CHARGER */}
      {currentStep === 'charger' && (
        <div className="space-y-4">
          <p className="text-xs text-[#334155]">
            Select an available charger bay at this station:
          </p>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {!station.chargers || station.chargers.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No chargers registered at this station yet.</p>
            ) : (
              station.chargers.map(charger => {
                const isAvail = charger.status === 'available';
                return (
                  <div
                    key={charger.id}
                    onClick={() => isAvail && handleSelectCharger(charger)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      isAvail
                        ? 'border-slate-200 hover:border-[#2563EB] hover:bg-blue-50/30 cursor-pointer'
                        : 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#0F172A]">
                          {charger.identifier_code}
                        </span>
                        <Badge variant={charger.current_type === 'DC Fast' ? 'blue' : 'slate'} size="sm">
                          {charger.current_type}
                        </Badge>
                      </div>
                      <Badge variant={isAvail ? 'green' : 'amber'} size="sm">
                        {charger.status === 'available' ? 'Available' : charger.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs text-[#334155] pt-1">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Connector</span>
                        <span className="font-medium text-[#0F172A]">{charger.connector_type}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Output Power</span>
                        <span className="font-medium text-[#0F172A]">{charger.power_kw} kW</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Price Tariff</span>
                        <span className="font-bold text-[#2563EB]">₹{charger.price_per_kwh_inr.toFixed(2)}/kWh</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* STEP 2: SELECT DATE & TIME */}
      {currentStep === 'datetime' && selectedCharger && (
        <div className="space-y-4">
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs flex items-center justify-between">
            <span className="text-[#334155]">Selected Bay:</span>
            <span className="font-bold text-[#0F172A]">
              {selectedCharger.identifier_code} ({selectedCharger.power_kw} kW {selectedCharger.current_type})
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">Reservation Date</label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={bookingDate}
              onChange={e => setBookingDate(e.target.value)}
              className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">Start Time (24h)</label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">Duration (Mins)</label>
              <select
                value={durationMinutes}
                onChange={e => setDurationMinutes(Number(e.target.value))}
                className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#2563EB]"
              >
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes (Recommended)</option>
                <option value={60}>60 Minutes</option>
                <option value={90}>90 Minutes</option>
                <option value={120}>120 Minutes</option>
              </select>
            </div>
          </div>

          <div className="bg-blue-50/60 p-3 rounded border border-blue-200 text-xs space-y-1">
            <div className="flex justify-between text-[#334155]">
              <span>Calculated Window:</span>
              <span className="font-semibold text-[#0F172A]">{startTime} to {endTime}</span>
            </div>
            <div className="flex justify-between text-[#334155]">
              <span>Estimated Delivery:</span>
              <span className="font-semibold text-[#0F172A]">~{estimatedKwh} kWh</span>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="ghost" size="sm" onClick={() => setCurrentStep('charger')}>
              Back
            </Button>
            <Button variant="primary" size="sm" isLoading={isProcessing} onClick={handleValidateDateTime}>
              Continue to Review
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: REVIEW DETAILS */}
      {currentStep === 'review' && selectedCharger && (
        <div className="space-y-4">
          <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-3 text-xs">
            <div className="flex justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500">Location</span>
              <span className="font-semibold text-[#0F172A]">{station.name}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500">Charger Bay</span>
              <span className="font-semibold text-[#0F172A]">{selectedCharger.identifier_code} ({selectedCharger.connector_type})</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500">Date & Slot</span>
              <span className="font-semibold text-[#0F172A]">{bookingDate} • {startTime} - {endTime} ({durationMinutes} mins)</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500">Unit Tariff</span>
              <span className="font-semibold text-[#0F172A]">₹{selectedCharger.price_per_kwh_inr.toFixed(2)} per kWh</span>
            </div>
            <div className="flex justify-between pt-1 text-sm font-bold text-[#0F172A]">
              <span>Total Estimated Amount</span>
              <span className="text-[#2563EB]">₹{totalAmountInr.toFixed(2)} INR</span>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="ghost" size="sm" onClick={() => setCurrentStep('datetime')}>
              Back
            </Button>
            <Button variant="primary" size="sm" onClick={() => setCurrentStep('payment')}>
              Proceed to Payment
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: TEST PAYMENT MODE */}
      {currentStep === 'payment' && (
        <div className="space-y-4">
          {/* Strict test payment banner */}
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">TEST PAYMENT MODE</span>
              No real bank cards are billed. Transactions are securely simulated with Indian Rupee (₹ INR) records.
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-2">Select Payment Method</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {(['UPI', 'Credit/Debit Card', 'Net Banking', 'Fleet Wallet'] as const).map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`p-2.5 rounded border text-left font-medium transition-all ${
                    paymentMethod === method
                      ? 'border-[#2563EB] bg-blue-50/50 text-[#2563EB]'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <div className="border border-slate-200 rounded p-3 bg-slate-50 text-xs flex justify-between items-center">
            <span className="text-[#334155]">Total Payable (INR):</span>
            <span className="text-base font-extrabold text-[#0F172A]">₹{totalAmountInr.toFixed(2)}</span>
          </div>

          {/* Test failure toggle for reviewers */}
          <label className="flex items-center gap-2 text-[11px] text-slate-500 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={simulateFailure}
              onChange={e => setSimulateFailure(e.target.checked)}
              className="rounded text-red-600 focus:ring-red-500"
            />
            <span>Simulate bank gateway failure (test error handling)</span>
          </label>

          <div className="flex justify-between pt-2">
            <Button variant="ghost" size="sm" onClick={() => setCurrentStep('review')}>
              Back
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isProcessing}
              onClick={handleProcessPayment}
            >
              Pay ₹{totalAmountInr.toFixed(2)} (Test)
            </Button>
          </div>
        </div>
      )}

      {/* STEP 5: CONFIRMATION */}
      {currentStep === 'confirmation' && confirmedBooking && (
        <div className="text-center py-4 space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-base font-bold text-[#0F172A]">Charging Bay Reserved</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Booking Ref: <span className="font-mono font-semibold text-[#0F172A]">{confirmedBooking.id}</span>
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Station:</span>
              <span className="font-semibold text-[#0F172A]">{station.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Charger Bay:</span>
              <span className="font-semibold text-[#0F172A]">{selectedCharger?.identifier_code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Slot:</span>
              <span className="font-semibold text-[#0F172A]">{confirmedBooking.booking_date} ({confirmedBooking.start_time} - {confirmedBooking.end_time})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Amount Paid:</span>
              <span className="font-bold text-emerald-700">₹{confirmedBooking.total_amount_inr.toFixed(2)} INR</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Ref:</span>
              <span className="font-mono text-slate-600">{paymentResult?.transaction_reference}</span>
            </div>
          </div>

          <div className="flex gap-2 justify-center pt-2">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center text-xs font-medium border border-slate-300 rounded px-3 py-2 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 mr-1" />
              Get Directions
            </a>
            <Button variant="secondary" size="sm" onClick={resetModal}>
              Close & View Bookings
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
