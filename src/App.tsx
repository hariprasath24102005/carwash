import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CarCatalog } from './components/CarCatalog';
import { WashBooking } from './components/WashBooking';
import { DealershipTrust } from './components/DealershipTrust';
import { TradeInEstimator } from './components/TradeInEstimator';
import { LocationContactSection } from './components/LocationContactSection';
import { FAQSection } from './components/FAQSection';
import { CarDetailModal } from './components/CarDetailModal';
import { CarCompareModal } from './components/CarCompareModal';
import { BookingConfirmationModal } from './components/BookingConfirmationModal';
import { MyBookingsDrawer } from './components/MyBookingsDrawer';
import { AdminPortal } from './components/AdminPortal';
import { Car, BookingAppointment, BookingSlot } from './types';
import { MOCK_CARS } from './data/mockCars';
import { TIME_SLOTS } from './data/washPackages';
import { 
  Sparkles, 
  ShieldCheck, 
  Car as CarIcon, 
  Clock, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  ArrowRight,
  Flame,
  Lock,
  Award,
  ChevronRight
} from 'lucide-react';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'catalog' | 'booking'>('catalog');

  // Modals & Drawers
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [comparedCars, setComparedCars] = useState<Car[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [activeConfirmedBooking, setActiveConfirmedBooking] = useState<BookingAppointment | null>(null);
  const [isBookingsDrawerOpen, setIsBookingsDrawerOpen] = useState(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);

  // Cross-flow car selection for wash booking
  const [preselectedWashCar, setPreselectedWashCar] = useState<Car | null>(null);

  // Dynamic Cars Inventory State (Persisted)
  const [cars, setCars] = useState<Car[]>(() => {
    try {
      const saved = localStorage.getItem('apex_custom_cars');
      if (saved) return JSON.parse(saved);
    } catch {}
    return MOCK_CARS;
  });

  // Dynamic Service Timings / Time Slots State (Persisted)
  const [timeSlots, setTimeSlots] = useState<BookingSlot[]>(() => {
    try {
      const saved = localStorage.getItem('apex_custom_slots');
      if (saved) return JSON.parse(saved);
    } catch {}
    return TIME_SLOTS;
  });

  // Favorites & Stored Bookings State (Local Storage)
  const [favoriteCarIds, setFavoriteCarIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('apex_favorite_cars');
      return saved ? JSON.parse(saved) : ['car-porsche-taycan-2022', 'car-bmw-m4-2021'];
    } catch {
      return [];
    }
  });

  const [savedBookings, setSavedBookings] = useState<BookingAppointment[]>(() => {
    try {
      const saved = localStorage.getItem('apex_saved_bookings');
      if (saved) return JSON.parse(saved);
    } catch {}
    // Seed initial sample active appointment
    return [
      {
        id: 'APX-74291',
        createdAt: new Date().toISOString(),
        packageId: 'pkg-signature-spa',
        packageName: 'Signature Ceramic Spa',
        packagePrice: 75,
        addonIds: ['addon-rainx-armor'],
        addonNames: ['Ultra Hydrophobic Windshield Coating'],
        addonsTotal: 20,
        totalPrice: 95,
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        timeSlot: '10:00 AM',
        customerName: 'Dharshika P.',
        customerPhone: '(415) 782-9011',
        customerEmail: 'dharshika@example.com',
        vehicleMake: 'Porsche',
        vehicleModel: 'Taycan 4S',
        vehicleYear: 2022,
        vehicleType: 'Sedan / Coupe',
        licensePlate: '7XYZ892',
        vehicleColor: 'Frozen Blue Metallic',
        status: 'Confirmed',
        bayNumber: 2,
      },
      {
        id: 'APX-51820',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        packageId: 'pkg-apex-graphene',
        packageName: 'Apex Graphene Concourse Suite',
        packagePrice: 120,
        addonIds: ['addon-leather-shield', 'addon-engine-detail'],
        addonNames: ['Nappa Leather Ceramic Shield', 'Engine Bay Steam & Dressing'],
        addonsTotal: 65,
        totalPrice: 185,
        date: new Date().toISOString().split('T')[0],
        timeSlot: '02:30 PM',
        customerName: 'Marcus Vance',
        customerPhone: '(408) 332-9981',
        customerEmail: 'marcus.v@apextech.io',
        vehicleMake: 'BMW',
        vehicleModel: 'M4 Competition',
        vehicleYear: 2021,
        vehicleType: 'Sedan / Coupe',
        licensePlate: 'M4-FAST',
        vehicleColor: 'Isle of Man Green Metallic',
        status: 'In Progress',
        bayNumber: 1,
        specialNotes: 'Focus extra on carbon fiber splitter and wheel barrels',
      }
    ];
  });

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Persist cars inventory
  useEffect(() => {
    try {
      localStorage.setItem('apex_custom_cars', JSON.stringify(cars));
    } catch {}
  }, [cars]);

  // Persist time slots
  useEffect(() => {
    try {
      localStorage.setItem('apex_custom_slots', JSON.stringify(timeSlots));
    } catch {}
  }, [timeSlots]);

  // Persist favorites
  useEffect(() => {
    try {
      localStorage.setItem('apex_favorite_cars', JSON.stringify(favoriteCarIds));
    } catch {}
  }, [favoriteCarIds]);

  // Persist bookings
  useEffect(() => {
    try {
      localStorage.setItem('apex_saved_bookings', JSON.stringify(savedBookings));
    } catch {}
  }, [savedBookings]);

  const handleToggleFavorite = (car: Car) => {
    setFavoriteCarIds((prev) =>
      prev.includes(car.id) ? prev.filter((id) => id !== car.id) : [...prev, car.id]
    );
  };

  const handleToggleCompare = (car: Car) => {
    setComparedCars((prev) => {
      const exists = prev.some((c) => c.id === car.id);
      if (exists) {
        return prev.filter((c) => c.id !== car.id);
      }
      if (prev.length >= 3) {
        alert('You can compare up to 3 vehicles simultaneously.');
        return prev;
      }
      return [...prev, car];
    });
  };

  const handleRemoveComparedCar = (carId: string) => {
    setComparedCars((prev) => prev.filter((c) => c.id !== carId));
  };

  const handleBookWashForCar = (car: Car) => {
    setPreselectedWashCar(car);
    setActiveTab('booking');
    // Scroll smoothly to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookingConfirmed = (newBooking: BookingAppointment) => {
    setSavedBookings((prev) => [newBooking, ...prev]);
    setActiveConfirmedBooking(newBooking);
  };

  const handleCancelBooking = (bookingId: string) => {
    if (confirm('Are you sure you want to cancel this appointment reservation?')) {
      setSavedBookings((prev) => prev.filter((b) => b.id !== bookingId));
    }
  };

  const scrollToSection = (sectionId: string) => {
    // If we're on booking tab and user clicks a catalog/trust section, switch back
    if (activeTab !== 'catalog' && (sectionId === 'trust-section' || sectionId === 'trade-in-section' || sectionId === 'location-section')) {
      setActiveTab('catalog');
    }
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Website Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        comparedCarsCount={comparedCars.length}
        onOpenCompareModal={() => setIsCompareModalOpen(true)}
        savedBookingsCount={savedBookings.length}
        onOpenBookingsDrawer={() => setIsBookingsDrawerOpen(true)}
        favoriteCarsCount={favoriteCarIds.length}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onOpenAdmin={() => setIsAdminPortalOpen(true)}
        onNavigateSection={scrollToSection}
      />

      {/* Main Website View Container */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full space-y-12">
        {activeTab === 'catalog' ? (
          <>
            {/* Showroom & Certified Inventory */}
            <CarCatalog
              cars={cars}
              onSelectCar={(car) => setSelectedCar(car)}
              onBookWash={handleBookWashForCar}
              comparedCars={comparedCars}
              onToggleCompare={handleToggleCompare}
              onOpenCompareModal={() => setIsCompareModalOpen(true)}
              favoriteCarIds={favoriteCarIds}
              onToggleFavorite={handleToggleFavorite}
            />

            {/* Instant Trade-In & Appraisal Section */}
            <TradeInEstimator />

            {/* 150-Point Certified Standard & Trust Section */}
            <DealershipTrust />

            {/* Location, Studio Map & VIP Test Drive Inquiry */}
            <LocationContactSection />

            {/* Comprehensive FAQ Section */}
            <FAQSection />
          </>
        ) : (
          <>
            {/* AutoSpa Studio & Concourse Detailing Booking */}
            <WashBooking
              cars={cars}
              timeSlots={timeSlots}
              initialCar={preselectedWashCar}
              onBookingConfirmed={handleBookingConfirmed}
            />

            {/* Location & Studio Hours */}
            <LocationContactSection />

            {/* Detailing & Studio FAQs */}
            <FAQSection />
          </>
        )}
      </main>

      {/* Website Bottom Banner */}
      <section className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-12 px-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Silicon Valley Flagship Facility</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black">
              Ready to experience Apex Motors & Luxury AutoSpa?
            </h2>
            <p className="text-slate-300 text-xs md:text-sm max-w-xl">
              Visit our climate-controlled showroom at 100 Performance Way or book your certified concourse ceramic detailing appointment online today.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            <button
              onClick={() => {
                setActiveTab('booking');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-3.5 bg-white hover:bg-slate-100 text-blue-900 font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <span>Book AutoSpa Detailing</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setActiveTab('catalog');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-5 py-3.5 bg-blue-700/60 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-2xl border border-blue-500/50 transition-all flex items-center gap-2 cursor-pointer"
            >
              <CarIcon className="w-4 h-4" />
              <span>View Inventory</span>
            </button>

            <button
              onClick={() => setIsAdminPortalOpen(true)}
              className="px-5 py-3.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs sm:text-sm rounded-2xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4 text-blue-400" />
              <span>Staff Admin Access</span>
            </button>
          </div>
        </div>
      </section>

      {/* Website Full Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Flame className="w-4 h-4 text-amber-300" />
              </div>
              <span className="font-black text-white text-base">APEX MOTORS</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Silicon Valley's premier destination for certified pre-owned performance vehicles and bespoke automotive detailing.
            </p>
            <div className="pt-2 flex items-center gap-2 text-slate-500 text-[11px]">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Licensed California Motor Vehicle Dealer #89421</span>
            </div>
          </div>

          {/* Location & Hours */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">Showroom & Studio</h4>
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span>100 Performance Way, Silicon Valley, CA 94025</span>
            </p>
            <p className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500 shrink-0" />
              <span>Mon – Sat: 8:00 AM – 7:30 PM • Sun: 9:00 AM – 5:00 PM</span>
            </p>
            <p className="flex items-center gap-2 pt-1 text-slate-300 font-bold">
              <Phone className="w-4 h-4 text-blue-400" />
              <span>Sales: (800) 555-APEX | Spa: (800) 555-WASH</span>
            </p>
          </div>

          {/* Quick Website Links */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">Showroom Navigation</h4>
            <ul className="space-y-1.5">
              <li>
                <button onClick={() => { setActiveTab('catalog'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors cursor-pointer">
                  • Pre-Owned Vehicle Inventory
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('booking'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors cursor-pointer">
                  • AutoSpa & Ceramic Wash Booking
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('trust-section')} className="hover:text-white transition-colors cursor-pointer">
                  • 150-Point Certified Inspection
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('trade-in-section')} className="hover:text-white transition-colors cursor-pointer">
                  • Sell or Trade Your Vehicle
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('location-section')} className="hover:text-white transition-colors cursor-pointer">
                  • Showroom Directions & VIP Test Drive
                </button>
              </li>
              <li>
                <button onClick={() => setIsBookingsDrawerOpen(true)} className="hover:text-white transition-colors cursor-pointer">
                  • View My Active Bookings
                </button>
              </li>
              <li>
                <button onClick={() => setIsAdminPortalOpen(true)} className="text-blue-400 hover:text-blue-300 font-bold transition-colors flex items-center gap-1 cursor-pointer">
                  <Lock className="w-3 h-3" />
                  <span>• Administrator Management Portal</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Guarantees */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">Apex Guarantee</h4>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1.5">
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> 150-Point Certified Inspection
              </span>
              <p className="text-[11px] text-slate-300">
                Every vehicle includes 90-day warranty, 1-year complimentary AutoSpa washes, and clean CARFAX guarantee.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <span>© {new Date().getFullYear()} Apex Motors & Luxury AutoSpa LLC. All rights reserved.</span>
          <div className="flex items-center gap-4 flex-wrap">
            <button onClick={() => setIsAdminPortalOpen(true)} className="text-blue-400 hover:underline cursor-pointer">
              Admin Portal
            </button>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Warranty Disclosure</span>
            <span>California DMV License #89421</span>
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <CarDetailModal
        car={selectedCar}
        onClose={() => setSelectedCar(null)}
        onBookWash={handleBookWashForCar}
      />

      {isCompareModalOpen && (
        <CarCompareModal
          cars={comparedCars}
          onClose={() => setIsCompareModalOpen(false)}
          onRemoveCar={handleRemoveComparedCar}
          onSelectCar={(car) => setSelectedCar(car)}
          onBookWash={handleBookWashForCar}
        />
      )}

      <BookingConfirmationModal
        booking={activeConfirmedBooking}
        onClose={() => setActiveConfirmedBooking(null)}
        onViewAllBookings={() => {
          setActiveConfirmedBooking(null);
          setIsBookingsDrawerOpen(true);
        }}
      />

      <MyBookingsDrawer
        isOpen={isBookingsDrawerOpen}
        onClose={() => setIsBookingsDrawerOpen(false)}
        bookings={savedBookings}
        onCancelBooking={handleCancelBooking}
        onSelectBooking={(b) => {
          setIsBookingsDrawerOpen(false);
          setActiveConfirmedBooking(b);
        }}
      />

      {/* Admin Portal Modal */}
      {isAdminPortalOpen && (
        <AdminPortal
          cars={cars}
          onUpdateCars={setCars}
          timeSlots={timeSlots}
          onUpdateTimeSlots={setTimeSlots}
          bookings={savedBookings}
          onUpdateBookings={setSavedBookings}
          onClose={() => setIsAdminPortalOpen(false)}
        />
      )}
    </div>
  );
}
