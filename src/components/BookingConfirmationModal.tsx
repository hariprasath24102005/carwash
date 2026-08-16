import React from 'react';
import { 
  CheckCircle2, 
  X, 
  Calendar, 
  Clock, 
  Car, 
  MapPin, 
  Download, 
  Printer, 
  Share2, 
  ShieldCheck,
  Sparkles,
  QrCode,
  FileText
} from 'lucide-react';
import { BookingAppointment } from '../types';
import { printBookingReceipt, downloadReceiptHTML } from '../utils/printReceipt';

interface BookingConfirmationModalProps {
  booking: BookingAppointment | null;
  onClose: () => void;
  onViewAllBookings: () => void;
}

export const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  booking,
  onClose,
  onViewAllBookings,
}) => {
  if (!booking) return null;

  const formattedDate = new Date(booking.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handleDownloadIcs = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apex Motors & AutoSpa//Detailing Appointment//EN
BEGIN:VEVENT
UID:${booking.id}@apexmotors.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${booking.date.replace(/-/g, '')}T100000Z
SUMMARY:Apex AutoSpa: ${booking.packageName}
DESCRIPTION:Vehicle: ${booking.vehicleMake} ${booking.vehicleModel} (${booking.licensePlate})\\nConfirmation: ${booking.id}\\nTotal: $${booking.totalPrice}
LOCATION:Apex Luxury AutoSpa Studio, Bay #${booking.bayNumber}, 100 Performance Way, Silicon Valley CA
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `Apex_AutoSpa_${booking.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    printBookingReceipt(booking);
  };

  const handleDownloadReceipt = () => {
    downloadReceiptHTML(booking);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div 
        id="booking-confirmation-modal"
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Top Success Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 text-white/80 hover:text-white rounded-full bg-black/10 hover:bg-black/20"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 bg-white text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg mb-3 animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
            Appointment Confirmed
          </span>
          <h2 className="text-2xl font-black mt-2">
            You're All Set, {booking.customerName.split(' ')[0]}!
          </h2>
          <p className="text-emerald-100 text-xs mt-1">
            Confirmation reference #{booking.id} • Bay #{booking.bayNumber} Reserved
          </p>
        </div>

        {/* Printable Ticket Receipt Card */}
        <div className="overflow-y-auto p-6 space-y-6">
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            {/* Top row: details and QR */}
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Service Package
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                  {booking.packageName}
                </h3>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                  {booking.vehicleType} • Tier Price ${booking.packagePrice}
                </p>
              </div>

              {/* Simulated QR Code for bay checkin */}
              <div className="flex flex-col items-center p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
                <div className="w-14 h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center rounded-lg p-1">
                  <QrCode className="w-full h-full" />
                </div>
                <span className="text-[9px] font-mono font-bold text-slate-500 mt-1">
                  BAY CHECK-IN
                </span>
              </div>
            </div>

            {/* Grid with Appointment Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-start gap-2.5 p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <Calendar className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block font-medium">Scheduled Date</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formattedDate}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block font-medium">Arrival Time Slot</span>
                  <span className="font-bold text-slate-900 dark:text-white">{booking.timeSlot}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <Car className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block font-medium">Registered Vehicle</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {booking.vehicleYear} {booking.vehicleMake} {booking.vehicleModel}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono block">Plate: {booking.licensePlate}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block font-medium">Studio Location</span>
                  <span className="font-bold text-slate-900 dark:text-white">Apex Bay #{booking.bayNumber}</span>
                  <span className="text-[11px] text-slate-500 block">100 Performance Way</span>
                </div>
              </div>
            </div>

            {/* Addons List if selected */}
            {booking.addonNames.length > 0 && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Add-on Enhancements:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {booking.addonNames.map((addon, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-lg font-medium border border-blue-200 dark:border-blue-800"
                    >
                      ✓ {addon}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Price Row */}
            <div className="flex items-center justify-between pt-3 border-t-2 border-slate-200 dark:border-slate-800 font-black">
              <span className="text-sm text-slate-700 dark:text-slate-300">Total Due at Checkout:</span>
              <span className="text-2xl text-blue-600 dark:text-blue-400">${booking.totalPrice}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-bold">
            <button
              onClick={handlePrint}
              className="py-3 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={handleDownloadReceipt}
              className="py-3 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl transition-all border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-emerald-500" />
              <span>Save Receipt</span>
            </button>

            <button
              onClick={handleDownloadIcs}
              className="py-3 px-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl transition-all shadow flex items-center justify-center gap-1.5"
            >
              <Calendar className="w-4 h-4 text-blue-400 dark:text-blue-600" />
              <span>Calendar (.ics)</span>
            </button>
          </div>

          {/* Navigation link */}
          <div className="text-center pt-2">
            <button
              onClick={() => {
                onClose();
                onViewAllBookings();
              }}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 underline underline-offset-4"
            >
              View all my saved appointments in "My Bookings"
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
