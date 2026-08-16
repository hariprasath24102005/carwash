import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Crown, 
  Gem, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Car as CarIcon, 
  Check, 
  Plus, 
  Info,
  ChevronRight,
  ArrowRight,
  Flame,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WashPackage, WashAddon, Car, BookingAppointment, BookingSlot } from '../types';
import { WASH_PACKAGES, WASH_ADDONS, TIME_SLOTS } from '../data/washPackages';
import { MOCK_CARS } from '../data/mockCars';
import { playWaterSpraySound, playSuccessChime } from '../utils/audio';

interface WashBookingProps {
  initialCar?: Car | null;
  cars?: Car[];
  timeSlots?: BookingSlot[];
  onBookingConfirmed: (booking: BookingAppointment) => void;
}

export const WashBooking: React.FC<WashBookingProps> = ({
  initialCar,
  cars = MOCK_CARS,
  timeSlots = TIME_SLOTS,
  onBookingConfirmed,
}) => {
  // Booking Form State
  const [selectedPackageId, setSelectedPackageId] = useState<string>(WASH_PACKAGES[1].id); // Default to Signature Ceramic
  const [isSuvOrTruck, setIsSuvOrTruck] = useState<boolean>(false);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  
  // Date & Time Picker State
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(timeSlots[0]?.time || '10:00 AM');

  // Vehicle Source (Custom vs Catalog)
  const [vehicleSource, setVehicleSource] = useState<'custom' | 'catalog'>(initialCar ? 'catalog' : 'custom');
  const [selectedCatalogCarId, setSelectedCatalogCarId] = useState<string>(initialCar?.id || cars[0]?.id || 'car-1');

  // Vehicle Custom Details
  const [vehicleMake, setVehicleMake] = useState<string>(initialCar ? initialCar.make : 'Porsche');
  const [vehicleModel, setVehicleModel] = useState<string>(initialCar ? initialCar.model : '911 Carrera');
  const [vehicleYear, setVehicleYear] = useState<string>(initialCar ? String(initialCar.year) : '2023');
  const [vehicleColor, setVehicleColor] = useState<string>(initialCar ? initialCar.exteriorColor : 'Guards Red');
  const [licensePlate, setLicensePlate] = useState<string>('7XYZ892');

  // Customer Contact Info
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [specialNotes, setSpecialNotes] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Auto-sync initial car when passed from catalog
  useEffect(() => {
    if (initialCar) {
      setVehicleSource('catalog');
      setSelectedCatalogCarId(initialCar.id);
      setVehicleMake(initialCar.make);
      setVehicleModel(initialCar.model);
      setVehicleYear(String(initialCar.year));
      setVehicleColor(initialCar.exteriorColor);
      setIsSuvOrTruck(initialCar.vehicleType === 'SUV');
    }
  }, [initialCar]);

  // Handle Catalog Selection
  const handleCatalogCarChange = (carId: string) => {
    const car = MOCK_CARS.find((c) => c.id === carId);
    if (car) {
      setSelectedCatalogCarId(carId);
      setVehicleMake(car.make);
      setVehicleModel(car.model);
      setVehicleYear(String(car.year));
      setVehicleColor(car.exteriorColor);
      setIsSuvOrTruck(car.vehicleType === 'SUV');
    }
  };

  const selectedPackage = WASH_PACKAGES.find((p) => p.id === selectedPackageId) || WASH_PACKAGES[0];
  const packagePrice = selectedPackage.price + (isSuvOrTruck ? selectedPackage.suvPriceAddon : 0);
  
  const selectedAddons = WASH_ADDONS.filter((a) => selectedAddonIds.includes(a.id));
  const addonsTotal = selectedAddons.reduce((sum, item) => sum + item.price, 0);
  const totalDuration = selectedPackage.durationMinutes + selectedAddons.reduce((sum, item) => sum + item.durationMinutes, 0);
  const grandTotal = packagePrice + addonsTotal;

  const toggleAddon = (addonId: string) => {
    playWaterSpraySound();
    setSelectedAddonIds((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  };

  const handleSelectPackage = (pkgId: string) => {
    playWaterSpraySound();
    setSelectedPackageId(pkgId);
  };

  // Generate the next 10 dates for interactive date-strip
  const availableDates = Array.from({ length: 10 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1); // Starting tomorrow
    const iso = d.toISOString().split('T')[0];
    const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
    const day = d.toLocaleDateString('en-US', { day: 'numeric' });
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    return { iso, weekday, day, month };
  });

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!customerName.trim()) errors.customerName = 'Please enter your full name.';
    if (!customerPhone.trim()) errors.customerPhone = 'Please enter your phone number for SMS status.';
    if (!customerEmail.trim() || !customerEmail.includes('@')) errors.customerEmail = 'Please provide a valid email address.';
    if (!vehicleMake.trim()) errors.vehicleMake = 'Make is required.';
    if (!vehicleModel.trim()) errors.vehicleModel = 'Model is required.';
    if (!licensePlate.trim()) errors.licensePlate = 'License plate is required for technician bay check-in.';
    if (!selectedTimeSlot) errors.timeSlot = 'Please select an appointment time slot.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      // Scroll to first error
      const firstError = Object.keys(formErrors)[0];
      const el = document.getElementById(`input-${firstError}`);
      el?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newBooking: BookingAppointment = {
        id: `APX-${Math.floor(10000 + Math.random() * 90000)}`,
        createdAt: new Date().toISOString(),
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        packagePrice: packagePrice,
        addonIds: selectedAddonIds,
        addonNames: selectedAddons.map((a) => a.name),
        addonsTotal: addonsTotal,
        totalPrice: grandTotal,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        customerName,
        customerPhone,
        customerEmail,
        vehicleMake,
        vehicleModel,
        vehicleYear,
        vehicleType: isSuvOrTruck ? 'SUV / Truck' : 'Sedan / Coupe',
        licensePlate: licensePlate.toUpperCase(),
        vehicleColor,
        specialNotes,
        status: 'Confirmed',
        bayNumber: Math.floor(Math.random() * 4) + 1,
      };

      // Play success chime & confetti blast
      playSuccessChime();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setIsSubmitting(false);
      onBookingConfirmed(newBooking);
    }, 450);
  };

  const getPackageIcon = (icon: string) => {
    switch (icon) {
      case 'Sparkles': return <Sparkles className="w-5 h-5" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5" />;
      case 'Crown': return <Crown className="w-5 h-5" />;
      case 'Gem': return <Gem className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-4 space-y-8 animate-fadeIn">
      {/* Intro Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-8 md:p-12 border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Precision Hand Wash & Ceramic Studio</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
            Schedule Your AutoSpa Experience
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Reserve dedicated bay time with master certified detailers. Utilizing de-ionized spot-free water, pH-neutral luxury foam, and graphene paint protection.
          </p>
        </div>

        {/* Ambient background glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Cols: Step by Step Selections */}
        <div className="lg:col-span-8 space-y-8">
          {/* STEP 1: Select Spa Package */}
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Step 1 of 3</span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Select Detailing Package
                </h2>
              </div>

              {/* Vehicle Size Switcher (Sedan vs SUV) */}
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setIsSuvOrTruck(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    !isSuvOrTruck
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Sedan / Coupe / Sports
                </button>
                <button
                  type="button"
                  onClick={() => setIsSuvOrTruck(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isSuvOrTruck
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  SUV / Truck / Van (+Addon)
                </button>
              </div>
            </div>

            {/* Package Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {WASH_PACKAGES.map((pkg) => {
                const isSelected = selectedPackageId === pkg.id;
                const price = pkg.price + (isSuvOrTruck ? pkg.suvPriceAddon : 0);

                return (
                  <div
                    key={pkg.id}
                    id={`package-${pkg.id}`}
                    onClick={() => handleSelectPackage(pkg.id)}
                    className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 shadow-md ring-2 ring-blue-600/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-3 right-4 px-3 py-0.5 text-[11px] font-extrabold bg-blue-600 text-white rounded-full shadow-sm">
                        Client Favorite
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between">
                        <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                          {getPackageIcon(pkg.icon)}
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-black text-slate-900 dark:text-white">
                            ${price}
                          </span>
                          <span className="text-xs text-slate-400 block font-medium">
                            ~{pkg.durationMinutes} mins
                          </span>
                        </div>
                      </div>

                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-3">
                        {pkg.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {pkg.tagline}
                      </p>

                      {/* Included Steps Checklist */}
                      <div className="mt-4 space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                        {pkg.includedSteps.slice(0, 4).map((step, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-slate-600 dark:text-slate-300">
                            <Check className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{step}</span>
                          </div>
                        ))}
                        {pkg.includedSteps.length > 4 && (
                          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 block pt-1">
                            + {pkg.includedSteps.length - 4} more specialized steps included
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs font-bold">
                      <span className={isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}>
                        {isSelected ? '✓ Selected Package' : 'Click to Select'}
                      </span>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'}`}>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Detail Add-ons */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  Optional Specialized Enhancements
                </h3>
                <span className="text-xs text-slate-400">Select any to add</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {WASH_ADDONS.map((addon) => {
                  const isChecked = selectedAddonIds.includes(addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between text-xs ${
                        isChecked
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-slate-900 dark:text-white'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold">{addon.name}</span>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'}`}>
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{addon.description}</p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 font-bold text-slate-900 dark:text-white">
                        <span>+${addon.price}</span>
                        <span className="text-[11px] text-slate-400 font-normal">+{addon.durationMinutes}m</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* STEP 2: Appointment Date & Time Slot */}
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Step 2 of 3</span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Choose Date & Live Time Slot
              </h2>
            </div>

            {/* Interactive 10-day Strip */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                Available Appointment Dates
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {availableDates.map((item) => {
                  const isSelected = selectedDate === item.iso;
                  return (
                    <button
                      key={item.iso}
                      type="button"
                      onClick={() => setSelectedDate(item.iso)}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-102 font-bold'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-[11px] block uppercase opacity-80">{item.weekday}</span>
                      <span className="text-lg font-black">{item.day}</span>
                      <span className="text-[11px] block opacity-80">{item.month}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slot Grid grouped by Period */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
                Select Arrival Time Slot ({selectedTimeSlot ? `Selected: ${selectedTimeSlot}` : 'None'})
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {timeSlots.map((slot) => {
                  const isSelected = selectedTimeSlot === slot.time;
                  const isUnavailable = !slot.available;

                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={isUnavailable}
                      onClick={() => setSelectedTimeSlot(slot.time)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isUnavailable
                          ? 'bg-slate-100 dark:bg-slate-800/20 text-slate-400 border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-50'
                          : isSelected
                          ? 'bg-slate-900 dark:bg-blue-600 text-white border-slate-900 dark:border-blue-600 shadow-md font-bold'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-blue-500'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold">{slot.time}</span>
                        <Clock className="w-3 h-3 opacity-60" />
                      </div>
                      <span className="text-[10px] block mt-1 opacity-75">
                        {isUnavailable ? 'Fully Booked' : `${slot.remainingCapacity} slots open`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* STEP 3: Vehicle & Customer Information */}
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Step 3 of 3</span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Vehicle & Contact Details
                </h2>
              </div>

              {/* Source toggle */}
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setVehicleSource('custom')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    vehicleSource === 'custom'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  My Own Vehicle
                </button>
                <button
                  type="button"
                  onClick={() => setVehicleSource('catalog')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    vehicleSource === 'catalog'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  Showroom Vehicle ({cars.length})
                </button>
              </div>
            </div>

            {/* If Showroom Vehicle selected */}
            {vehicleSource === 'catalog' && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800/60 space-y-2">
                <label className="block text-xs font-bold text-blue-900 dark:text-blue-300">
                  Select Catalog Vehicle to Prep & Detail
                </label>
                <select
                  value={selectedCatalogCarId}
                  onChange={(e) => handleCatalogCarChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {cars.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.year} {c.make} {c.model} (${c.price.toLocaleString()} • {c.exteriorColor})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Vehicle Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Make *</label>
                <input
                  id="input-vehicleMake"
                  type="text"
                  placeholder="e.g. Porsche / BMW"
                  value={vehicleMake}
                  onChange={(e) => setVehicleMake(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {formErrors.vehicleMake && (
                  <span className="text-[11px] text-rose-500 mt-1 block">{formErrors.vehicleMake}</span>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Model *</label>
                <input
                  id="input-vehicleModel"
                  type="text"
                  placeholder="e.g. 911 / M4 / Cayenne"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {formErrors.vehicleModel && (
                  <span className="text-[11px] text-rose-500 mt-1 block">{formErrors.vehicleModel}</span>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">License Plate *</label>
                <input
                  id="input-licensePlate"
                  type="text"
                  placeholder="e.g. 8ABC123"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono uppercase focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {formErrors.licensePlate && (
                  <span className="text-[11px] text-rose-500 mt-1 block">{formErrors.licensePlate}</span>
                )}
              </div>
            </div>

            {/* Customer Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Your Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="input-customerName"
                    type="text"
                    placeholder="Marcus Vance"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                {formErrors.customerName && (
                  <span className="text-[11px] text-rose-500 mt-1 block">{formErrors.customerName}</span>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number (SMS Ready) *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="input-customerPhone"
                    type="tel"
                    placeholder="(415) 890-2341"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                {formErrors.customerPhone && (
                  <span className="text-[11px] text-rose-500 mt-1 block">{formErrors.customerPhone}</span>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email for Receipt *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="input-customerEmail"
                    type="email"
                    placeholder="marcus@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                {formErrors.customerEmail && (
                  <span className="text-[11px] text-rose-500 mt-1 block">{formErrors.customerEmail}</span>
                )}
              </div>
            </div>

            {/* Special Instructions */}
            <div className="text-xs">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Special Care Instructions or Requests (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Extra attention to rear diffuser and brake dust; please avoid chemical spray on matte interior carbon trim."
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Live Dynamic Order Summary Sticky Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-24 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-slate-900 dark:text-white text-base">
                Appointment Summary
              </h3>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                Live Quote
              </span>
            </div>

            {/* Package details */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {selectedPackage.name}
                  </span>
                  <span className="text-slate-400">
                    {isSuvOrTruck ? 'SUV / Truck Tier' : 'Standard Coupe / Sedan Tier'}
                  </span>
                </div>
                <span className="font-extrabold text-slate-900 dark:text-white">
                  ${packagePrice}
                </span>
              </div>

              {/* Addons if any */}
              {selectedAddons.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Selected Add-ons</span>
                  {selectedAddons.map((addon) => (
                    <div key={addon.id} className="flex justify-between text-slate-700 dark:text-slate-300">
                      <span>• {addon.name}</span>
                      <span className="font-semibold">+${addon.price}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Scheduled Time & Location info */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                  <CalendarIcon className="w-4 h-4 text-blue-600" />
                  <span>{new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>{selectedTimeSlot} (~{totalDuration} mins service time)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                  <CarIcon className="w-4 h-4 text-blue-600" />
                  <span>{vehicleMake} {vehicleModel} {licensePlate ? `(${licensePlate})` : ''}</span>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="pt-3 border-t-2 border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Eco Disposal & Water Recycling</span>
                  <span className="text-emerald-600 font-semibold">$0.00 (Included)</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 text-base font-black text-slate-900 dark:text-white border-t border-slate-100 dark:border-slate-800">
                  <span>Estimated Total</span>
                  <span className="text-2xl text-blue-600 dark:text-blue-400">${grandTotal}</span>
                </div>
              </div>
            </div>

            {/* Confirm CTA */}
            <button
              id="btn-submit-booking"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-2xl shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Reserving Bay Slot...</span>
                </div>
              ) : (
                <>
                  <span>Confirm Appointment</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="text-[11px] text-center text-slate-400 space-y-1">
              <p>🔒 Pay upon completion • 100% Satisfaction Guarantee</p>
              <p>Free cancellation or rescheduling up to 2 hours before</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
