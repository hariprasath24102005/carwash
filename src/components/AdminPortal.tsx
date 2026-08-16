import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShieldCheck, 
  Car as CarIcon, 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Search, 
  Printer, 
  Download, 
  FileText, 
  User, 
  Phone, 
  Mail, 
  DollarSign, 
  Sparkles, 
  RotateCcw, 
  Lock, 
  LogOut, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  Settings, 
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Flame,
  KeyRound,
  Layers,
  MapPin,
  Send,
  Inbox,
  RefreshCw,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Car, BookingAppointment, BookingSlot, VehicleType, VehicleCondition, FuelType } from '../types';
import { WASH_PACKAGES, WASH_ADDONS } from '../data/washPackages';
import { printBookingReceipt, downloadReceiptHTML } from '../utils/printReceipt';
import { googleSignIn, googleLogout, getAccessToken, initAuth } from '../services/gmailAuth';
import { 
  sendAdminLoginVerificationCode, 
  sendCustomerBookingEmail, 
  sendGmailMessage, 
  listRecentGmailMessages, 
  getGmailProfile, 
  GmailMessageItem, 
  GmailUserProfile 
} from '../services/gmailService';
import { AdminLoginModal } from './AdminLoginModal';
import { GmailHubSection } from './GmailHubSection';

interface AdminPortalProps {
  cars: Car[];
  onUpdateCars: (cars: Car[]) => void;
  timeSlots: BookingSlot[];
  onUpdateTimeSlots: (slots: BookingSlot[]) => void;
  bookings: BookingAppointment[];
  onUpdateBookings: (bookings: BookingAppointment[]) => void;
  onClose: () => void;
}

// Preset vehicle images for quick selection in admin form
const SAMPLE_CAR_IMAGES = [
  'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=80'
];

export const AdminPortal: React.FC<AdminPortalProps> = ({
  cars,
  onUpdateCars,
  timeSlots,
  onUpdateTimeSlots,
  bookings,
  onUpdateBookings,
  onClose,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('apex_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [loginEmail, setLoginEmail] = useState('hari');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Gmail 2-Factor / Verification State
  const [isVerifyingWithGmail, setIsVerifyingWithGmail] = useState(false);
  const [generatedPin, setGeneratedPin] = useState('749204');
  const [enteredPin, setEnteredPin] = useState('');
  const [recipientGmail, setRecipientGmail] = useState('dharshikapharma@gmail.com');
  const [isSendingPin, setIsSendingPin] = useState(false);
  const [pinSendStatus, setPinSendStatus] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [adminProfileName, setAdminProfileName] = useState<string>(() => {
    try {
      return localStorage.getItem('apex_admin_user') || 'hari';
    } catch {
      return 'hari';
    }
  });
  const [connectedGmail, setConnectedGmail] = useState<string | null>(() => {
    try {
      return localStorage.getItem('apex_admin_gmail') || 'dharshikapharma@gmail.com';
    } catch {
      return 'dharshikapharma@gmail.com';
    }
  });

  // Active Admin Section Tab
  const [activeSection, setActiveSection] = useState<'timings' | 'cars' | 'appointments' | 'gmail' | 'overview'>('appointments');

  // Gmail Hub Tab State
  const [gmailMessages, setGmailMessages] = useState<GmailMessageItem[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [customEmailTo, setCustomEmailTo] = useState('');
  const [customEmailSubject, setCustomEmailSubject] = useState('');
  const [customEmailBody, setCustomEmailBody] = useState('');
  const [isSendingCustomEmail, setIsSendingCustomEmail] = useState(false);
  const [gmailHubNotification, setGmailHubNotification] = useState<string | null>(null);
  const [dispatchSuccessToast, setDispatchSuccessToast] = useState<string | null>(null);

  // --- Appointments State ---
  const [appointmentSearch, setAppointmentSearch] = useState('');
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState<string>('All');
  const [editingBooking, setEditingBooking] = useState<BookingAppointment | null>(null);
  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);

  // Manual Booking Form State
  const [manualForm, setManualForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '2023',
    vehicleType: 'Sedan / Coupe',
    vehicleColor: '',
    licensePlate: '',
    packageId: WASH_PACKAGES[0].id,
    date: new Date().toISOString().split('T')[0],
    timeSlot: timeSlots[0]?.time || '10:00 AM',
    bayNumber: 1,
    status: 'Confirmed' as BookingAppointment['status'],
    specialNotes: '',
  });

  // --- Cars Inventory State ---
  const [carSearch, setCarSearch] = useState('');
  const [carTypeFilter, setCarTypeFilter] = useState('All');
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [isAddCarOpen, setIsAddCarOpen] = useState(false);

  // Add / Edit Car Form State
  const [carForm, setCarForm] = useState<Partial<Car>>({
    make: '',
    model: '',
    year: 2023,
    price: 49900,
    originalMsrp: 65000,
    mileage: 12500,
    condition: 'Pristine',
    vehicleType: 'Sedan',
    fuelType: 'Gasoline',
    transmission: '8-Speed Dual-Clutch Automatic',
    drivetrain: 'All-Wheel Drive (AWD)',
    horsepower: 382,
    zeroToSixty: '4.1s',
    exteriorColor: 'Alpine White',
    interiorColor: 'Black Vernasca Leather',
    vin: 'WBA5R1C56M' + Math.floor(100000 + Math.random() * 900000),
    available: true,
    featured: false,
    images: [SAMPLE_CAR_IMAGES[0]],
    features: ['150-Point Certified', 'Apple CarPlay & Android Auto', 'Panoramic Glass Sunroof', 'Navigation Pro', 'Heated Sport Seats'],
    inspectionScore: 150,
    previousOwners: 1,
    carfaxClean: true,
    topSpeed: 155,
    mpgOrRange: '25 City / 34 Hwy',
  });
  const [featureInput, setFeatureInput] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');

  // --- Service Timings State ---
  const [newSlotTime, setNewSlotTime] = useState('08:30 AM');
  const [newSlotPeriod, setNewSlotPeriod] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [newSlotCapacity, setNewSlotCapacity] = useState(3);
  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
  const [operatingHours, setOperatingHours] = useState(() => {
    try {
      const saved = localStorage.getItem('apex_operating_hours');
      return saved ? JSON.parse(saved) : {
        weekday: '8:00 AM – 7:30 PM',
        weekend: '9:00 AM – 5:00 PM',
        totalBays: 4,
        shopStatus: 'Open for Business',
      };
    } catch {
      return {
        weekday: '8:00 AM – 7:30 PM',
        weekend: '9:00 AM – 5:00 PM',
        totalBays: 4,
        shopStatus: 'Open for Business',
      };
    }
  });

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail === 'admin@apexmotors.com' && loginPassword === 'apex2026') {
      setIsAuthenticated(true);
      setLoginError('');
      try {
        localStorage.setItem('apex_admin_auth', 'true');
      } catch {}
    } else {
      setLoginError('Invalid administrator credentials. Try demo credentials.');
    }
  };

  const handleQuickDemoLogin = () => {
    setLoginEmail('admin@apexmotors.com');
    setLoginPassword('apex2026');
    setIsAuthenticated(true);
    setLoginError('');
    try {
      localStorage.setItem('apex_admin_auth', 'true');
    } catch {}
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('apex_admin_auth');
    } catch {}
  };

  // --- Appointments Handlers ---
  const handleUpdateBookingStatus = (bookingId: string, newStatus: BookingAppointment['status']) => {
    const updated = bookings.map((b) => b.id === bookingId ? { ...b, status: newStatus } : b);
    onUpdateBookings(updated);
  };

  const handleUpdateBookingBay = (bookingId: string, bayNumber: number) => {
    const updated = bookings.map((b) => b.id === bookingId ? { ...b, bayNumber } : b);
    onUpdateBookings(updated);
  };

  const handleDeleteBooking = (bookingId: string) => {
    if (confirm(`Are you sure you want to delete appointment #${bookingId}?`)) {
      const updated = bookings.filter((b) => b.id !== bookingId);
      onUpdateBookings(updated);
    }
  };

  const handleSaveEditedBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;
    const updated = bookings.map((b) => b.id === editingBooking.id ? editingBooking : b);
    onUpdateBookings(updated);
    setEditingBooking(null);
  };

  const handleCreateManualBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const pkg = WASH_PACKAGES.find((p) => p.id === manualForm.packageId) || WASH_PACKAGES[0];
    const newBooking: BookingAppointment = {
      id: `APX-${Math.floor(10000 + Math.random() * 90000)}`,
      createdAt: new Date().toISOString(),
      packageId: pkg.id,
      packageName: pkg.name,
      packagePrice: pkg.price,
      addonIds: [],
      addonNames: [],
      addonsTotal: 0,
      totalPrice: pkg.price,
      date: manualForm.date,
      timeSlot: manualForm.timeSlot,
      customerName: manualForm.customerName || 'Walk-in Client',
      customerPhone: manualForm.customerPhone || '(555) 000-0000',
      customerEmail: manualForm.customerEmail || 'client@apexmotors.com',
      vehicleMake: manualForm.vehicleMake || 'Vehicle',
      vehicleModel: manualForm.vehicleModel || 'Model',
      vehicleYear: manualForm.vehicleYear || '2023',
      vehicleType: manualForm.vehicleType || 'Sedan',
      licensePlate: manualForm.licensePlate || 'WALK-IN',
      vehicleColor: manualForm.vehicleColor || 'Custom',
      specialNotes: manualForm.specialNotes,
      status: manualForm.status,
      bayNumber: manualForm.bayNumber,
    };

    onUpdateBookings([newBooking, ...bookings]);
    setIsManualBookingOpen(false);
    // Reset form
    setManualForm({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      vehicleMake: '',
      vehicleModel: '',
      vehicleYear: '2023',
      vehicleType: 'Sedan / Coupe',
      vehicleColor: '',
      licensePlate: '',
      packageId: WASH_PACKAGES[0].id,
      date: new Date().toISOString().split('T')[0],
      timeSlot: timeSlots[0]?.time || '10:00 AM',
      bayNumber: 1,
      status: 'Confirmed',
      specialNotes: '',
    });
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Time', 'Customer', 'Phone', 'Email', 'Vehicle', 'Plate', 'Package', 'Total', 'Bay', 'Status'];
    const rows = bookings.map((b) => [
      b.id,
      b.date,
      b.timeSlot,
      `"${b.customerName}"`,
      b.customerPhone,
      b.customerEmail,
      `"${b.vehicleYear} ${b.vehicleMake} ${b.vehicleModel}"`,
      b.licensePlate,
      `"${b.packageName}"`,
      `$${b.totalPrice}`,
      `Bay #${b.bayNumber}`,
      b.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Apex_AutoSpa_Appointments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Cars Inventory Handlers ---
  const handleToggleCarAvailability = (carId: string) => {
    const updated = cars.map((c) => c.id === carId ? { ...c, available: !c.available } : c);
    onUpdateCars(updated);
  };

  const handleDeleteCar = (carId: string) => {
    if (confirm('Are you sure you want to permanently delete this vehicle from showroom inventory?')) {
      const updated = cars.filter((c) => c.id !== carId);
      onUpdateCars(updated);
    }
  };

  const handleOpenAddCar = () => {
    setCarForm({
      make: '',
      model: '',
      year: 2023,
      price: 52900,
      originalMsrp: 68000,
      mileage: 14200,
      condition: 'Pristine',
      vehicleType: 'Sedan',
      fuelType: 'Gasoline',
      transmission: '8-Speed Automatic Sport',
      drivetrain: 'All-Wheel Drive (AWD)',
      horsepower: 350,
      zeroToSixty: '4.4s',
      exteriorColor: 'Metallic Black',
      interiorColor: 'Cognac Nappa Leather',
      vin: '1G1YB2D47L' + Math.floor(100000 + Math.random() * 900000),
      available: true,
      featured: false,
      images: [SAMPLE_CAR_IMAGES[Math.floor(Math.random() * SAMPLE_CAR_IMAGES.length)]],
      features: ['150-Point Certified Inspection', 'Heated & Ventilated Seats', 'Navigation Pro', 'Premium Surround Audio', 'Clean CARFAX'],
      inspectionScore: 150,
      previousOwners: 1,
      carfaxClean: true,
      topSpeed: 155,
      mpgOrRange: '24 City / 33 Hwy',
    });
    setEditingCar(null);
    setIsAddCarOpen(true);
  };

  const handleOpenEditCar = (car: Car) => {
    setEditingCar(car);
    setCarForm({ ...car });
    setIsAddCarOpen(true);
  };

  const handleSaveCar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!carForm.make || !carForm.model) {
      alert('Please provide Vehicle Make and Model.');
      return;
    }

    if (editingCar) {
      // Update existing
      const updated = cars.map((c) => c.id === editingCar.id ? { ...editingCar, ...carForm } as Car : c);
      onUpdateCars(updated);
    } else {
      // Add new
      const newCar: Car = {
        id: `car-${carForm.make?.toLowerCase().replace(/\s+/g, '-')}-${carForm.model?.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        make: carForm.make || 'Custom',
        model: carForm.model || 'Model',
        year: Number(carForm.year) || 2023,
        price: Number(carForm.price) || 45000,
        originalMsrp: Number(carForm.originalMsrp) || 55000,
        mileage: Number(carForm.mileage) || 10000,
        condition: (carForm.condition as VehicleCondition) || 'Pristine',
        vehicleType: (carForm.vehicleType as VehicleType) || 'Sedan',
        fuelType: (carForm.fuelType as FuelType) || 'Gasoline',
        transmission: carForm.transmission || 'Automatic',
        drivetrain: carForm.drivetrain || 'All-Wheel Drive',
        horsepower: Number(carForm.horsepower) || 300,
        zeroToSixty: carForm.zeroToSixty || '4.5s',
        exteriorColor: carForm.exteriorColor || 'Black',
        interiorColor: carForm.interiorColor || 'Black Leather',
        vin: carForm.vin || ('VIN' + Math.floor(1000000000 + Math.random() * 9000000000)),
        available: carForm.available !== undefined ? carForm.available : true,
        featured: carForm.featured || false,
        images: carForm.images && carForm.images.length > 0 ? carForm.images : [SAMPLE_CAR_IMAGES[0]],
        features: carForm.features && carForm.features.length > 0 ? carForm.features : ['150-Point Certified'],
        inspectionScore: Number(carForm.inspectionScore) || 150,
        previousOwners: Number(carForm.previousOwners) || 1,
        carfaxClean: carForm.carfaxClean !== undefined ? carForm.carfaxClean : true,
        topSpeed: Number(carForm.topSpeed) || 155,
        mpgOrRange: carForm.mpgOrRange || '28 MPG',
      };
      onUpdateCars([newCar, ...cars]);
    }

    setIsAddCarOpen(false);
    setEditingCar(null);
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setCarForm((prev) => ({
        ...prev,
        features: [...(prev.features || []), featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setCarForm((prev) => ({
      ...prev,
      features: (prev.features || []).filter((_, i) => i !== index)
    }));
  };

  const handleAddImage = () => {
    if (imageUrlInput.trim()) {
      setCarForm((prev) => ({
        ...prev,
        images: [...(prev.images || []), imageUrlInput.trim()]
      }));
      setImageUrlInput('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setCarForm((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
  };

  // --- Timings Handlers ---
  const handleToggleSlotAvailability = (time: string) => {
    const updated = timeSlots.map((s) => s.time === time ? { ...s, available: !s.available } : s);
    onUpdateTimeSlots(updated);
  };

  const handleUpdateSlotCapacity = (time: string, delta: number) => {
    const updated = timeSlots.map((s) => {
      if (s.time === time) {
        const nextCap = Math.max(0, Math.min(10, s.remainingCapacity + delta));
        return { ...s, remainingCapacity: nextCap, available: nextCap > 0 };
      }
      return s;
    });
    onUpdateTimeSlots(updated);
  };

  const handleDeleteSlot = (time: string) => {
    if (confirm(`Remove the ${time} time slot from booking calendar?`)) {
      const updated = timeSlots.filter((s) => s.time !== time);
      onUpdateTimeSlots(updated);
    }
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotTime.trim()) return;
    if (timeSlots.some((s) => s.time.toLowerCase() === newSlotTime.trim().toLowerCase())) {
      alert('This time slot already exists.');
      return;
    }

    const newSlot: BookingSlot = {
      time: newSlotTime.trim(),
      period: newSlotPeriod,
      available: newSlotCapacity > 0,
      remainingCapacity: newSlotCapacity,
    };

    onUpdateTimeSlots([...timeSlots, newSlot]);
    setIsAddSlotOpen(false);
    setNewSlotTime('08:30 AM');
  };

  const handleSaveOperatingHours = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('apex_operating_hours', JSON.stringify(operatingHours));
      alert('Operating schedule settings saved successfully.');
    } catch {}
  };

  // Filtered lists
  const filteredAppointments = useMemo(() => {
    return bookings.filter((b) => {
      const matchesSearch = 
        b.customerName.toLowerCase().includes(appointmentSearch.toLowerCase()) ||
        b.customerPhone.toLowerCase().includes(appointmentSearch.toLowerCase()) ||
        b.customerEmail.toLowerCase().includes(appointmentSearch.toLowerCase()) ||
        b.licensePlate.toLowerCase().includes(appointmentSearch.toLowerCase()) ||
        b.id.toLowerCase().includes(appointmentSearch.toLowerCase()) ||
        b.vehicleModel.toLowerCase().includes(appointmentSearch.toLowerCase());

      const matchesStatus = appointmentStatusFilter === 'All' || b.status === appointmentStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, appointmentSearch, appointmentStatusFilter]);

  const filteredCars = useMemo(() => {
    return cars.filter((c) => {
      const matchesSearch = 
        c.make.toLowerCase().includes(carSearch.toLowerCase()) ||
        c.model.toLowerCase().includes(carSearch.toLowerCase()) ||
        c.exteriorColor.toLowerCase().includes(carSearch.toLowerCase()) ||
        c.vin.toLowerCase().includes(carSearch.toLowerCase());

      const matchesType = carTypeFilter === 'All' || c.vehicleType === carTypeFilter;

      return matchesSearch && matchesType;
    });
  }, [cars, carSearch, carTypeFilter]);

  // Metrics
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const activeCount = bookings.filter((b) => b.status === 'Confirmed' || b.status === 'In Progress').length;
  const availableInventoryCount = cars.filter((c) => c.available).length;
  const totalInventoryValue = cars.reduce((sum, c) => sum + (c.available ? c.price : 0), 0);

  // -------------------------------------------------------------
  // VIEW: Login Page (if not authenticated)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <AdminLoginModal
        onSuccess={(user, email) => {
          setIsAuthenticated(true);
          setAdminProfileName(user);
          setConnectedGmail(email);
          try {
            localStorage.setItem('apex_admin_auth', 'true');
            localStorage.setItem('apex_admin_user', user);
            localStorage.setItem('apex_admin_gmail', email);
          } catch {}
        }}
        onClose={onClose}
      />
    );
  }

  // -------------------------------------------------------------
  // VIEW: Full Authenticated Admin Dashboard
  // -------------------------------------------------------------
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      <div className="w-full max-w-7xl bg-slate-50 dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[96vh] overflow-hidden">
        
        {/* Top Admin Navbar */}
        <div className="p-5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-lg text-white">Apex Operations Control Center</h1>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
                  ADMIN ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Showroom Inventory • AutoSpa Timings • Live Customer Appointments
              </p>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border border-slate-700"
            >
              <Eye className="w-4 h-4 text-blue-400" />
              <span>Back to Client View</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border border-rose-500/30"
              title="Sign Out of Admin Portal"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Section Navigation Strip */}
        <div className="bg-white dark:bg-slate-900/90 px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveSection('appointments')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeSection === 'appointments'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Appointments & CRM</span>
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-white/20 font-bold">
                {bookings.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSection('cars')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeSection === 'cars'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CarIcon className="w-4 h-4" />
              <span>Car Details & Stock</span>
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-white/20 font-bold">
                {cars.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSection('timings')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeSection === 'timings'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Service Timings & Hours</span>
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-white/20 font-bold">
                {timeSlots.length} Slots
              </span>
            </button>

            <button
              onClick={() => setActiveSection('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeSection === 'overview'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Metrics Overview</span>
            </button>

            <button
              onClick={() => setActiveSection('gmail')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeSection === 'gmail'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Mail className="w-4 h-4 text-cyan-400" />
              <span>Gmail Hub & Dispatch</span>
              <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                ACTIVE
              </span>
            </button>
          </div>

          {/* Quick Metrics pills */}
          <div className="flex items-center gap-3 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" /> Booked Revenue: ${totalRevenue.toLocaleString()}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold hidden md:inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Active Appointments: {activeCount}
            </span>
          </div>
        </div>

        {/* Dynamic Admin Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ========================================================
              TAB 1: APPOINTMENTS & BOOKINGS CRM
             ======================================================== */}
          {activeSection === 'appointments' && (
            <div className="space-y-6">
              {/* Controls bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 flex-1 flex-wrap">
                  {/* Search */}
                  <div className="relative flex-1 min-w-[220px]">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search customer, phone, plate, ref #..."
                      value={appointmentSearch}
                      onChange={(e) => setAppointmentSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  {/* Status Filter */}
                  <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                    {['All', 'Confirmed', 'In Progress', 'Ready for Pickup', 'Completed', 'Cancelled'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setAppointmentStatusFilter(status)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                          appointmentStatusFilter === status
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsManualBookingOpen(true)}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Walk-In / New Booking</span>
                  </button>

                  <button
                    onClick={handleExportCSV}
                    className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1 border border-slate-200 dark:border-slate-700"
                    title="Export appointments to CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Appointments List / Table */}
              {filteredAppointments.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {filteredAppointments.map((booking) => {
                    const formattedDate = new Date(booking.date + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    });

                    return (
                      <div
                        key={booking.id}
                        className="bg-white dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5 hover:border-blue-500/40 transition-all"
                      >
                        {/* Customer & Booking Meta */}
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-md font-mono text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                              #{booking.id}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                              Booked {new Date(booking.createdAt).toLocaleDateString()}
                            </span>

                            {/* Status selector */}
                            <select
                              value={booking.status}
                              onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value as any)}
                              className={`px-2.5 py-0.5 text-xs font-bold rounded-full border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                                booking.status === 'Confirmed'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : booking.status === 'In Progress'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : booking.status === 'Ready for Pickup'
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                  : booking.status === 'Completed'
                                  ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              }`}
                            >
                              <option value="Confirmed">● Confirmed</option>
                              <option value="In Progress">⚡ In Progress</option>
                              <option value="Ready for Pickup">✨ Ready for Pickup</option>
                              <option value="Completed">✓ Completed</option>
                              <option value="Cancelled">✕ Cancelled</option>
                            </select>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="font-black text-slate-900 dark:text-white text-base">
                              {booking.customerName}
                            </div>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-blue-500" /> {booking.customerPhone}
                            </span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Mail className="w-3 h-3 text-blue-500" /> {booking.customerEmail}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300 flex-wrap">
                            <span className="flex items-center gap-1 font-semibold text-slate-900 dark:text-white">
                              <CarIcon className="w-3.5 h-3.5 text-blue-500" />
                              {booking.vehicleYear} {booking.vehicleMake} {booking.vehicleModel}
                              <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded ml-1">
                                {booking.licensePlate}
                              </span>
                            </span>

                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-blue-500" />
                              {formattedDate}
                            </span>

                            <span className="flex items-center gap-1 font-bold text-slate-900 dark:text-white">
                              <Clock className="w-3.5 h-3.5 text-blue-500" />
                              {booking.timeSlot}
                            </span>

                            {/* Bay reassign */}
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-blue-500" />
                              <span>Bay:</span>
                              <select
                                value={booking.bayNumber}
                                onChange={(e) => handleUpdateBookingBay(booking.id, Number(e.target.value))}
                                className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs font-bold"
                              >
                                <option value={1}>Bay #1</option>
                                <option value={2}>Bay #2</option>
                                <option value={3}>Bay #3</option>
                                <option value={4}>Bay #4</option>
                              </select>
                            </div>
                          </div>

                          {/* Package & Addons */}
                          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-blue-600 dark:text-blue-400">
                              Package: {booking.packageName} (${booking.packagePrice})
                            </span>
                            {booking.addonNames && booking.addonNames.length > 0 && (
                              <span>• Add-ons: {booking.addonNames.join(', ')}</span>
                            )}
                            {booking.specialNotes && (
                              <span className="text-amber-600 dark:text-amber-400 font-medium">
                                • Note: "{booking.specialNotes}"
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price & Action Buttons */}
                        <div className="flex items-center justify-between lg:flex-col lg:items-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-700">
                          <div className="text-right">
                            <span className="text-xl font-black text-slate-900 dark:text-white">
                              ${booking.totalPrice}
                            </span>
                            <span className="text-[10px] text-slate-400 block">Total Due</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* PDF & Print Button */}
                            <button
                              title="Print Official PDF Receipt"
                              onClick={() => printBookingReceipt(booking)}
                              className="p-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-xl transition-all border border-blue-200 dark:border-blue-800"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            {/* Download HTML Receipt */}
                            <button
                              title="Download Receipt HTML"
                              onClick={() => downloadReceiptHTML(booking)}
                              className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl transition-all"
                            >
                              <Download className="w-4 h-4" />
                            </button>

                            {/* Edit Booking */}
                            <button
                              title="Edit Details"
                              onClick={() => setEditingBooking(booking)}
                              className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl transition-all"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Delete Booking */}
                            <button
                              title="Delete Appointment"
                              onClick={() => handleDeleteBooking(booking.id)}
                              className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                  <h3 className="font-bold text-slate-900 dark:text-white">No Appointments Found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    No bookings matched your filter criteria. Create a new walk-in appointment or reset filters.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              TAB 2: CAR INVENTORY & DETAILS MANAGER
             ======================================================== */}
          {activeSection === 'cars' && (
            <div className="space-y-6">
              {/* Header bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 flex-1 flex-wrap">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search make, model, color, VIN..."
                      value={carSearch}
                      onChange={(e) => setCarSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  <select
                    value={carTypeFilter}
                    onChange={(e) => setCarTypeFilter(e.target.value)}
                    className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-200"
                  >
                    <option value="All">All Body Types</option>
                    <option value="Coupe">Coupe</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Sports">Sports</option>
                    <option value="EV / Hybrid">EV / Hybrid</option>
                    <option value="Convertible">Convertible</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenAddCar}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Vehicle</span>
                  </button>
                </div>
              </div>

              {/* Cars Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCars.map((car) => (
                  <div
                    key={car.id}
                    className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm flex flex-col justify-between hover:border-blue-500/50 transition-all"
                  >
                    <div>
                      {/* Car Thumbnail */}
                      <div className="relative h-44 bg-slate-900 overflow-hidden">
                        <img
                          src={car.images[0] || SAMPLE_CAR_IMAGES[0]}
                          alt={`${car.make} ${car.model}`}
                          className="w-full h-full object-cover"
                        />
                        <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          car.available 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-rose-500 text-white'
                        }`}>
                          {car.available ? 'In Stock / Available' : 'Reserved / Pending'}
                        </span>

                        <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-white backdrop-blur-sm">
                          {car.vehicleType}
                        </span>
                      </div>

                      {/* Info Body */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                            {car.year} • {car.condition}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            {car.mileage.toLocaleString()} mi
                          </span>
                        </div>

                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white line-clamp-1">
                          {car.make} {car.model}
                        </h3>

                        <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-500">
                          <div>HP: <strong className="text-slate-800 dark:text-slate-200">{car.horsepower} hp</strong></div>
                          <div>0-60: <strong className="text-slate-800 dark:text-slate-200">{car.zeroToSixty}</strong></div>
                          <div>Fuel: <strong className="text-slate-800 dark:text-slate-200">{car.fuelType}</strong></div>
                          <div>Color: <strong className="text-slate-800 dark:text-slate-200">{car.exteriorColor}</strong></div>
                        </div>

                        <div className="text-[10px] text-slate-400 font-mono truncate pt-1">
                          VIN: {car.vin}
                        </div>
                      </div>
                    </div>

                    {/* Footer price & actions */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/90 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
                      <div>
                        <span className="text-lg font-black text-slate-900 dark:text-white">
                          ${car.price.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 block line-through">
                          MSRP ${car.originalMsrp.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleCarAvailability(car.id)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                            car.available
                              ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200'
                              : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200'
                          }`}
                          title="Toggle availability"
                        >
                          {car.available ? 'Set Reserved' : 'Set Available'}
                        </button>

                        <button
                          onClick={() => handleOpenEditCar(car)}
                          className="p-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 transition-all"
                          title="Edit vehicle details"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteCar(car.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950 rounded-lg transition-all"
                          title="Delete vehicle"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 3: SERVICE TIMINGS & OPERATING SCHEDULE
             ======================================================== */}
          {activeSection === 'timings' && (
            <div className="space-y-6">
              {/* Studio Hours Card */}
              <div className="bg-white dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      AutoSpa Operating Hours & Capacity Settings
                    </h3>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full text-xs font-bold">
                    {operatingHours.shopStatus}
                  </span>
                </div>

                <form onSubmit={handleSaveOperatingHours} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Mon – Sat Operating Hours
                    </label>
                    <input
                      type="text"
                      value={operatingHours.weekday}
                      onChange={(e) => setOperatingHours({ ...operatingHours, weekday: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Sunday Operating Hours
                    </label>
                    <input
                      type="text"
                      value={operatingHours.weekend}
                      onChange={(e) => setOperatingHours({ ...operatingHours, weekend: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Simultaneous Wash Bays
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={operatingHours.totalBays}
                        onChange={(e) => setOperatingHours({ ...operatingHours, totalBays: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl whitespace-nowrap transition-all shadow-sm"
                      >
                        Save Hours
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Time Slots Management */}
              <div className="bg-white dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      Configured Daily Time Slots ({timeSlots.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Enable, disable, adjust capacity, or add custom arrival time slots for customer bookings.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsAddSlotOpen(true)}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm self-start"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Time Slot</span>
                  </button>
                </div>

                {/* Slots Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {timeSlots.map((slot) => (
                    <div
                      key={slot.time}
                      className={`p-4 rounded-xl border transition-all ${
                        slot.available
                          ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                          : 'bg-slate-100/60 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 font-black text-sm text-slate-900 dark:text-white">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <span>{slot.time}</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {slot.period}
                        </span>
                      </div>

                      {/* Capacity adjuster */}
                      <div className="flex items-center justify-between text-xs py-2 border-t border-slate-200 dark:border-slate-800">
                        <span className="text-slate-500">Capacity:</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateSlotCapacity(slot.time, -1)}
                            className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 font-bold flex items-center justify-center text-slate-700 dark:text-slate-300"
                          >
                            -
                          </button>
                          <span className="font-extrabold text-sm w-4 text-center text-slate-900 dark:text-white">
                            {slot.remainingCapacity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateSlotCapacity(slot.time, 1)}
                            className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 font-bold flex items-center justify-center text-slate-700 dark:text-slate-300"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Status toggle & delete */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                        <button
                          onClick={() => handleToggleSlotAvailability(slot.time)}
                          className={`text-[11px] font-bold ${
                            slot.available ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                          }`}
                        >
                          {slot.available ? '● Slot Active' : '○ Slot Inactive'}
                        </button>

                        <button
                          onClick={() => handleDeleteSlot(slot.time)}
                          className="text-slate-400 hover:text-rose-500 p-1"
                          title="Delete slot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 4: METRICS & OPERATIONS OVERVIEW
             ======================================================== */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Top Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase">Total Booked Revenue</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    ${totalRevenue.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-medium">From {bookings.length} reservations</span>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase">Vehicles In Showroom</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {availableInventoryCount} <span className="text-xs font-normal text-slate-400">/ {cars.length} total</span>
                  </div>
                  <span className="text-[11px] text-blue-600 font-medium">Stock Value: ${totalInventoryValue.toLocaleString()}</span>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase">Active Appointments</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {activeCount}
                  </div>
                  <span className="text-[11px] text-amber-600 font-medium">In Bays 1 - 4</span>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase">Avg Detailing Value</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    ${bookings.length > 0 ? Math.round(totalRevenue / bookings.length) : 75}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">Per customer ticket</span>
                </div>
              </div>

              {/* Service Packages Breakdown */}
              <div className="bg-white dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  AutoSpa Package Offerings ({WASH_PACKAGES.length} Tiers)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {WASH_PACKAGES.map((pkg) => (
                    <div key={pkg.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{pkg.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{pkg.tagline}</p>
                        <span className="text-[11px] text-blue-500 font-semibold mt-2 block">
                          Duration: ~{pkg.durationMinutes} mins • SUV Surcharge: +${pkg.suvPriceAddon}
                        </span>
                      </div>
                      <span className="text-xl font-black text-slate-900 dark:text-white">${pkg.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 5: GMAIL INTEGRATION HUB & DISPATCH
             ======================================================== */}
          {activeSection === 'gmail' && (
            <GmailHubSection
              bookings={bookings}
              adminUsername={adminProfileName}
              adminGmail={connectedGmail || 'dharshikapharma@gmail.com'}
              onAdminGmailChange={(newEmail) => {
                setConnectedGmail(newEmail);
                try {
                  localStorage.setItem('apex_admin_gmail', newEmail);
                } catch {}
              }}
            />
          )}

        </div>
      </div>

      {/* ========================================================
          MODAL: ADD NEW TIME SLOT
         ======================================================== */}
      {isAddSlotOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                Add Arrival Time Slot
              </h3>
              <button onClick={() => setIsAddSlotOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSlot} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Slot Time (e.g. 07:30 AM, 04:15 PM)
                </label>
                <input
                  type="text"
                  required
                  value={newSlotTime}
                  onChange={(e) => setNewSlotTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Time Period
                </label>
                <select
                  value={newSlotPeriod}
                  onChange={(e) => setNewSlotPeriod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                >
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Initial Capacity (Max simultaneous vehicles)
                </label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={newSlotCapacity}
                  onChange={(e) => setNewSlotCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddSlotOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md"
                >
                  Add Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD / EDIT CAR DETAILS
         ======================================================== */}
      {isAddCarOpen && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 my-auto max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-lg text-slate-900 dark:text-white">
                  {editingCar ? 'Edit Vehicle Details' : 'Add Vehicle to Showroom'}
                </h3>
                <p className="text-xs text-slate-500">
                  Fill in the complete specifications for catalog display and speed animations.
                </p>
              </div>
              <button onClick={() => setIsAddCarOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCar} className="space-y-4 text-xs">
              {/* Row 1: Make, Model, Year */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Make</label>
                  <input
                    type="text"
                    required
                    value={carForm.make || ''}
                    onChange={(e) => setCarForm({ ...carForm, make: e.target.value })}
                    placeholder="e.g. BMW, Porsche, Audi"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Model</label>
                  <input
                    type="text"
                    required
                    value={carForm.model || ''}
                    onChange={(e) => setCarForm({ ...carForm, model: e.target.value })}
                    placeholder="e.g. M4 Competition"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Year</label>
                  <input
                    type="number"
                    required
                    value={carForm.year || 2023}
                    onChange={(e) => setCarForm({ ...carForm, year: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              {/* Row 2: Price, MSRP, Mileage */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Our Price ($)</label>
                  <input
                    type="number"
                    required
                    value={carForm.price || 0}
                    onChange={(e) => setCarForm({ ...carForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Original MSRP ($)</label>
                  <input
                    type="number"
                    value={carForm.originalMsrp || 0}
                    onChange={(e) => setCarForm({ ...carForm, originalMsrp: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mileage (Miles)</label>
                  <input
                    type="number"
                    required
                    value={carForm.mileage || 0}
                    onChange={(e) => setCarForm({ ...carForm, mileage: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              {/* Row 3: Vehicle Type, Condition, Fuel */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Body Type</label>
                  <select
                    value={carForm.vehicleType || 'Sedan'}
                    onChange={(e) => setCarForm({ ...carForm, vehicleType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  >
                    <option value="Coupe">Coupe</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Sports">Sports</option>
                    <option value="EV / Hybrid">EV / Hybrid</option>
                    <option value="Convertible">Convertible</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Condition</label>
                  <select
                    value={carForm.condition || 'Pristine'}
                    onChange={(e) => setCarForm({ ...carForm, condition: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  >
                    <option value="Showroom">Showroom</option>
                    <option value="Pristine">Pristine</option>
                    <option value="Like New">Like New</option>
                    <option value="Certified Pre-Owned">Certified Pre-Owned</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Fuel / Powertrain</label>
                  <select
                    value={carForm.fuelType || 'Gasoline'}
                    onChange={(e) => setCarForm({ ...carForm, fuelType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  >
                    <option value="Gasoline">Gasoline</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Plug-in Hybrid">Plug-in Hybrid</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Horsepower, 0-60, Exterior, Interior Color */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Horsepower (HP)</label>
                  <input
                    type="number"
                    value={carForm.horsepower || 300}
                    onChange={(e) => setCarForm({ ...carForm, horsepower: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">0-60 MPH (Sec)</label>
                  <input
                    type="text"
                    value={carForm.zeroToSixty || '4.2s'}
                    onChange={(e) => setCarForm({ ...carForm, zeroToSixty: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Exterior Color</label>
                  <input
                    type="text"
                    value={carForm.exteriorColor || ''}
                    onChange={(e) => setCarForm({ ...carForm, exteriorColor: e.target.value })}
                    placeholder="e.g. Tanzanite Blue"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Interior Color</label>
                  <input
                    type="text"
                    value={carForm.interiorColor || ''}
                    onChange={(e) => setCarForm({ ...carForm, interiorColor: e.target.value })}
                    placeholder="e.g. Cognac Leather"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              {/* Photos Gallery */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Image Gallery URLs
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="url"
                    placeholder="Paste image URL..."
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-3 py-2 bg-slate-800 text-white font-bold rounded-xl"
                  >
                    Add URL
                  </button>
                </div>

                {/* Preset Picker */}
                <div className="text-[11px] text-slate-400 mb-1">Or choose a curated studio image:</div>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {SAMPLE_CAR_IMAGES.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt="Sample"
                      onClick={() => setCarForm({ ...carForm, images: [img] })}
                      className="w-16 h-12 object-cover rounded-lg border-2 border-slate-700 hover:border-blue-500 cursor-pointer shrink-0"
                    />
                  ))}
                </div>
              </div>

              {/* Features Tags */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Key Vehicle Features
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. Panoramic Sunroof, Adaptive Cruise..."
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-3 py-2 bg-slate-800 text-white font-bold rounded-xl"
                  >
                    Add Feature
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(carForm.features || []).map((feat, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-lg font-medium flex items-center gap-1 border border-blue-200 dark:border-blue-800"
                    >
                      {feat}
                      <button type="button" onClick={() => handleRemoveFeature(idx)} className="hover:text-rose-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={carForm.available !== false}
                    onChange={(e) => setCarForm({ ...carForm, available: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-bold text-slate-800 dark:text-slate-200">Available for Purchase</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={carForm.carfaxClean !== false}
                    onChange={(e) => setCarForm({ ...carForm, carfaxClean: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-bold text-slate-800 dark:text-slate-200">Clean CARFAX Record</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddCarOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md"
                >
                  {editingCar ? 'Save Vehicle Updates' : 'Add Vehicle to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: MANUAL / WALK-IN BOOKING FORM
         ======================================================== */}
      {isManualBookingOpen && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 my-auto max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-lg text-slate-900 dark:text-white">
                  Add Walk-In / Front-Desk Reservation
                </h3>
                <p className="text-xs text-slate-500">
                  Instantly book an incoming vehicle into an active AutoSpa bay.
                </p>
              </div>
              <button onClick={() => setIsManualBookingOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualBooking} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={manualForm.customerName}
                    onChange={(e) => setManualForm({ ...manualForm, customerName: e.target.value })}
                    placeholder="e.g. Alex Henderson"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={manualForm.customerPhone}
                    onChange={(e) => setManualForm({ ...manualForm, customerPhone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Make</label>
                  <input
                    type="text"
                    required
                    value={manualForm.vehicleMake}
                    onChange={(e) => setManualForm({ ...manualForm, vehicleMake: e.target.value })}
                    placeholder="e.g. Mercedes-Benz"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Model</label>
                  <input
                    type="text"
                    required
                    value={manualForm.vehicleModel}
                    onChange={(e) => setManualForm({ ...manualForm, vehicleModel: e.target.value })}
                    placeholder="e.g. C63 AMG"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">License Plate</label>
                  <input
                    type="text"
                    required
                    value={manualForm.licensePlate}
                    onChange={(e) => setManualForm({ ...manualForm, licensePlate: e.target.value })}
                    placeholder="e.g. 8XYZ123"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Package</label>
                  <select
                    value={manualForm.packageId}
                    onChange={(e) => setManualForm({ ...manualForm, packageId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    {WASH_PACKAGES.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} (${pkg.price})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={manualForm.date}
                    onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Time Slot</label>
                  <select
                    value={manualForm.timeSlot}
                    onChange={(e) => setManualForm({ ...manualForm, timeSlot: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    {timeSlots.map((s) => (
                      <option key={s.time} value={s.time}>{s.time}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assign Wash Bay</label>
                  <select
                    value={manualForm.bayNumber}
                    onChange={(e) => setManualForm({ ...manualForm, bayNumber: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value={1}>Bay #1 (Express Hand Wash)</option>
                    <option value={2}>Bay #2 (Ceramic Spa Suite)</option>
                    <option value={3}>Bay #3 (Master Detail Suite)</option>
                    <option value={4}>Bay #4 (Graphene Correction)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Initial Status</label>
                  <select
                    value={manualForm.status}
                    onChange={(e) => setManualForm({ ...manualForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Ready for Pickup">Ready for Pickup</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Special Client Notes</label>
                <input
                  type="text"
                  value={manualForm.specialNotes}
                  onChange={(e) => setManualForm({ ...manualForm, specialNotes: e.target.value })}
                  placeholder="e.g. Focus extra on wheel brake dust, customer waiting in lounge"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsManualBookingOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md"
                >
                  Create Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: EDIT APPOINTMENT DETAILS
         ======================================================== */}
      {editingBooking && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                Edit Appointment #{editingBooking.id}
              </h3>
              <button onClick={() => setEditingBooking(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedBooking} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={editingBooking.customerName}
                  onChange={(e) => setEditingBooking({ ...editingBooking, customerName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editingBooking.customerPhone}
                    onChange={(e) => setEditingBooking({ ...editingBooking, customerPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Time Slot</label>
                  <select
                    value={editingBooking.timeSlot}
                    onChange={(e) => setEditingBooking({ ...editingBooking, timeSlot: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    {timeSlots.map((s) => (
                      <option key={s.time} value={s.time}>{s.time}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={editingBooking.date}
                    onChange={(e) => setEditingBooking({ ...editingBooking, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={editingBooking.status}
                    onChange={(e) => setEditingBooking({ ...editingBooking, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Ready for Pickup">Ready for Pickup</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Special Notes</label>
                <input
                  type="text"
                  value={editingBooking.specialNotes || ''}
                  onChange={(e) => setEditingBooking({ ...editingBooking, specialNotes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
