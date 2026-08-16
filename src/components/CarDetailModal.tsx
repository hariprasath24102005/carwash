import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Zap, 
  Gauge, 
  Fuel, 
  Sparkles, 
  Check, 
  Calendar, 
  RotateCw, 
  DollarSign, 
  Info,
  Car as CarIcon,
  ChevronLeft,
  ChevronRight,
  FileText
} from 'lucide-react';
import { Car } from '../types';

interface CarDetailModalProps {
  car: Car | null;
  onClose: () => void;
  onBookWash: (car: Car) => void;
  onScheduleTestDrive?: (car: Car) => void;
}

export const CarDetailModal: React.FC<CarDetailModalProps> = ({
  car,
  onClose,
  onBookWash,
  onScheduleTestDrive,
}) => {
  if (!car) return null;

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [downPayment, setDownPayment] = useState(Math.round(car.price * 0.2));
  const [loanMonths, setLoanMonths] = useState(60);
  const [interestRate, setInterestRate] = useState(5.9);
  const [isTestDriveSubmitted, setIsTestDriveSubmitted] = useState(false);
  const [testDriveDate, setTestDriveDate] = useState('');
  const [testDriveName, setTestDriveName] = useState('');
  const [testDrivePhone, setTestDrivePhone] = useState('');
  const [viewMode, setViewMode] = useState<'gallery' | '360' | 'inspection'>('gallery');
  const [rotationAngle, setRotationAngle] = useState(0);

  // Calculate monthly payment
  const loanAmount = Math.max(0, car.price - downPayment);
  const monthlyRate = interestRate / 100 / 12;
  const estimatedMonthly = monthlyRate > 0
    ? Math.round((loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanMonths)) / (Math.pow(1 + monthlyRate, loanMonths) - 1))
    : Math.round(loanAmount / loanMonths);

  const handleTestDriveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsTestDriveSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div 
        id="car-detail-modal"
        className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 z-20">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-xs font-bold bg-blue-600 text-white rounded-full">
              {car.year} {car.make}
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {car.model}
            </h2>
            <span className="text-xs text-slate-500 font-mono hidden md:inline">
              VIN: {car.vin}
            </span>
          </div>

          <button
            id="btn-close-modal"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-8">
          {/* Main Visual Stage & Gallery */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visual Viewport */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-200 dark:border-slate-800">
                {viewMode === 'gallery' ? (
                  <>
                    <img
                      src={car.images[activeImageIdx]}
                      alt={`${car.make} ${car.model}`}
                      className="w-full h-full object-cover transition-all duration-300"
                    />
                    {/* Gallery Navigation Arrows */}
                    <button
                      onClick={() => setActiveImageIdx((prev) => (prev === 0 ? car.images.length - 1 : prev - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setActiveImageIdx((prev) => (prev === car.images.length - 1 ? 0 : prev + 1))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center">
                    <div 
                      style={{ transform: `rotateY(${rotationAngle}deg)` }}
                      className="w-full h-64 flex items-center justify-center transition-transform duration-75"
                    >
                      <img
                        src={car.images[0]}
                        alt="360 View"
                        className="max-h-full max-w-full object-contain filter drop-shadow-2xl"
                      />
                    </div>
                    {/* 360 Rotation Slider */}
                    <div className="absolute bottom-4 left-6 right-6 flex items-center gap-3 bg-black/70 backdrop-blur-md px-4 py-2 rounded-xl text-white text-xs">
                      <RotateCw className="w-4 h-4 text-blue-400 animate-spin" />
                      <span className="font-medium whitespace-nowrap">Drag to Rotate 360°</span>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={rotationAngle}
                        onChange={(e) => setRotationAngle(Number(e.target.value))}
                        className="w-full accent-blue-500 cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* View Switchers & Thumbnails */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {car.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveImageIdx(idx);
                        setViewMode('gallery');
                      }}
                      className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                        viewMode === 'gallery' && activeImageIdx === idx
                          ? 'border-blue-600 scale-105 shadow'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode(viewMode === '360' ? 'gallery' : '360')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                      viewMode === '360'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>360° Studio View</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Price & Main Specs Card */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-5 bg-slate-50 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Verified Vehicle Price
                  </span>
                  <span className="px-2.5 py-0.5 text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 rounded-full">
                    {car.condition} Condition
                  </span>
                </div>

                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    ${car.price.toLocaleString()}
                  </span>
                  <span className="text-sm text-slate-400 line-through">
                    ${car.originalMsrp.toLocaleString()}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mt-1">
                  Est. <strong>${estimatedMonthly}/mo</strong> for {loanMonths} mos @ {interestRate}% APR
                </p>
              </div>

              {/* High-Impact Performance Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 font-medium">Horsepower</span>
                  <p className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                    <Gauge className="w-4 h-4 text-blue-500" />
                    {car.horsepower} HP
                  </p>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 font-medium">0 - 60 MPH</span>
                  <p className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    {car.zeroToSixty}
                  </p>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 font-medium">Mileage</span>
                  <p className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    {car.mileage.toLocaleString()} mi
                  </p>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 font-medium">Efficiency</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate mt-1">
                    {car.mpgOrRange}
                  </p>
                </div>
              </div>

              {/* Actions Box */}
              <div className="space-y-2.5 pt-2">
                <button
                  id="btn-modal-book-wash"
                  onClick={() => {
                    onClose();
                    onBookWash(car);
                  }}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Book Spa Wash & Detailing for this Model</span>
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById('test-drive-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full py-3 px-4 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-xl border border-slate-300 dark:border-slate-700 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <CarIcon className="w-4 h-4 text-blue-500" />
                  <span>Request VIP Test Drive</span>
                </button>
              </div>
            </div>
          </div>

          {/* Full Specifications & Inspection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Tech Specs */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Technical Specifications
              </h3>

              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                <div>
                  <span className="text-slate-400">Transmission</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{car.transmission}</p>
                </div>
                <div>
                  <span className="text-slate-400">Drivetrain</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{car.drivetrain}</p>
                </div>
                <div>
                  <span className="text-slate-400">Exterior Color</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{car.exteriorColor}</p>
                </div>
                <div>
                  <span className="text-slate-400">Interior Color</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{car.interiorColor}</p>
                </div>
                <div>
                  <span className="text-slate-400">Previous Owners</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{car.previousOwners} Owner ({car.carfaxClean ? 'Clean Title / 0 Accidents' : 'Verified'})</p>
                </div>
                <div>
                  <span className="text-slate-400">Top Track Speed</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{car.topSpeed} MPH</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                  Key Premium Packages Included
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {car.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="line-clamp-1">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 150-Point Inspection & Peace of Mind */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Apex 150-Point Certified Inspection
                </h3>
                <span className="px-3 py-1 text-xs font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/80 rounded-full">
                  {car.inspectionScore} / 150 Passed
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Engine, Transmission & Drivetrain</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1"><Check className="w-4 h-4" /> 100% Passed</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Braking, Suspension & Steering Rack</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1"><Check className="w-4 h-4" /> 100% Passed</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Electrical, Infotainment & Sensors</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1"><Check className="w-4 h-4" /> 100% Passed</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Chassis, Frame Integrity & Flood Check</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1"><Check className="w-4 h-4" /> 100% Verified Clean</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl text-xs text-blue-900 dark:text-blue-300 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Includes complimentary 90-Day / 3,000-Mile Apex Comprehensive Powertrain Warranty.</span>
              </div>
            </div>
          </div>

          {/* Interactive Financing & Test Drive Section */}
          <div id="test-drive-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            {/* Loan Payment Estimator */}
            <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Payment & Financing Estimator
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    <span>Down Payment</span>
                    <span>${downPayment.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={car.price}
                    step="500"
                    value={downPayment}
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    <span>Loan Term</span>
                    <span>{loanMonths} Months</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[36, 48, 60, 72].map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => setLoanMonths(term)}
                        className={`py-2 rounded-lg font-bold border transition-all ${
                          loanMonths === term
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {term} mo
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Estimated Monthly Note</span>
                    <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight">
                      ${estimatedMonthly} <span className="text-xs font-normal text-slate-500">/ mo</span>
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-500 text-right">
                    Taxes & licensing calculated at closing
                  </span>
                </div>
              </div>
            </div>

            {/* Schedule Test Drive Form */}
            <div className="lg:col-span-6 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                <CarIcon className="w-5 h-5 text-blue-600" />
                Schedule a VIP Test Drive
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                We will have this {car.year} {car.model} freshly detailed and pre-cooled at our private driving suite.
              </p>

              {isTestDriveSubmitted ? (
                <div className="p-6 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center space-y-2">
                  <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-base">
                    VIP Test Drive Confirmed!
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    Thank you {testDriveName}. Our concierge specialist will call you at {testDrivePhone} to verify your preferred time.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleTestDriveSubmit} className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Your Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Alex Morgan"
                        value={testDriveName}
                        onChange={(e) => setTestDriveName(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="(555) 000-0000"
                        value={testDrivePhone}
                        onChange={(e) => setTestDrivePhone(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Preferred Date</label>
                    <input
                      type="date"
                      required
                      value={testDriveDate}
                      onChange={(e) => setTestDriveDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md mt-2"
                  >
                    Confirm VIP Test Drive Request
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
