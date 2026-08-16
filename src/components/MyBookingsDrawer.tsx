import React from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Car, 
  MapPin, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck,
  ChevronRight,
  Printer,
  FileText
} from 'lucide-react';
import { BookingAppointment } from '../types';
import { printBookingReceipt } from '../utils/printReceipt';

interface MyBookingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: BookingAppointment[];
  onCancelBooking: (bookingId: string) => void;
  onSelectBooking: (booking: BookingAppointment) => void;
}

export const MyBookingsDrawer: React.FC<MyBookingsDrawerProps> = ({
  isOpen,
  onClose,
  bookings,
  onCancelBooking,
  onSelectBooking,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div 
        id="my-bookings-drawer"
        className="w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 dark:border-slate-800"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/90">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                My AutoSpa Appointments
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {bookings.length} {bookings.length === 1 ? 'Active Reservation' : 'Active Reservations'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {bookings.length > 0 ? (
            bookings.map((booking) => {
              const formattedDate = new Date(booking.date + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={booking.id}
                  className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 relative group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 rounded-md">
                          #{booking.id}
                        </span>
                        <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {booking.status}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                        {booking.packageName}
                      </h4>
                    </div>

                    <button
                      title="Cancel appointment"
                      onClick={() => onCancelBooking(booking.id)}
                      className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Booking Metadata Strip */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      <span>{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      <span>{booking.timeSlot}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-blue-500" />
                      <span className="truncate">{booking.vehicleMake} {booking.vehicleModel}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      <span>Bay #{booking.bayNumber}</span>
                    </div>
                  </div>

                  {/* Add-ons if present */}
                  {booking.addonNames && booking.addonNames.length > 0 && (
                    <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-700">
                      Add-ons: {booking.addonNames.join(', ')}
                    </div>
                  )}

                  {/* Actions & Price */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                      ${booking.totalPrice} <span className="text-[11px] font-normal text-slate-400">Total</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        title="Print or Save PDF Receipt"
                        onClick={(e) => {
                          e.stopPropagation();
                          printBookingReceipt(booking);
                        }}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg transition-all flex items-center gap-1 border border-slate-200 dark:border-slate-700"
                      >
                        <Printer className="w-3.5 h-3.5 text-blue-500" />
                        <span>Print</span>
                      </button>

                      <button
                        onClick={() => onSelectBooking(booking)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-lg transition-all flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 space-y-3">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                No Active Appointments
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Book a precision hand wash or detailing spa session anytime through our booking studio.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 text-center">
          <p className="text-xs text-slate-400">
            Apex AutoSpa Concierge Hotline: (800) 555-APEX
          </p>
        </div>
      </div>
    </div>
  );
};
