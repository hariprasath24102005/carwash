import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Car as CarIcon, 
  Plus, 
  Trash2, 
  Sparkles, 
  DollarSign, 
  Gauge, 
  Fuel, 
  Calendar, 
  Palette, 
  Check, 
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { Car, VehicleType, VehicleCondition, FuelType } from '../types';
import { upsertCarToSupabase } from '../services/supabaseClient';

interface UserCarListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (car: Car) => void;
  editingCar?: Car | null;
  currentUserId: string;
}

const SAMPLE_IMAGE_PRESETS = [
  { label: 'Porsche 911 GT3', url: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80' },
  { label: 'BMW M4 Sports', url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Audi RS e-tron GT', url: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Mercedes-AMG GT', url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Range Rover SV', url: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80' },
];

export const UserCarListingModal: React.FC<UserCarListingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingCar,
  currentUserId,
}) => {
  const [make, setMake] = useState(editingCar?.make || '');
  const [model, setModel] = useState(editingCar?.model || '');
  const [year, setYear] = useState<number>(editingCar?.year || 2023);
  const [price, setPrice] = useState<number>(editingCar?.price || 65000);
  const [originalMsrp, setOriginalMsrp] = useState<number>(editingCar?.originalMsrp || 75000);
  const [mileage, setMileage] = useState<number>(editingCar?.mileage || 12000);
  const [condition, setCondition] = useState<VehicleCondition>(editingCar?.condition || 'Pristine');
  const [vehicleType, setVehicleType] = useState<VehicleType>(editingCar?.vehicleType || 'Coupe');
  const [fuelType, setFuelType] = useState<FuelType>(editingCar?.fuelType || 'Gasoline');
  const [transmission, setTransmission] = useState(editingCar?.transmission || '8-Speed Dual-Clutch Automatic');
  const [drivetrain, setDrivetrain] = useState(editingCar?.drivetrain || 'All-Wheel Drive (AWD)');
  const [horsepower, setHorsepower] = useState<number>(editingCar?.horsepower || 480);
  const [zeroToSixty, setZeroToSixty] = useState(editingCar?.zeroToSixty || '3.5s');
  const [exteriorColor, setExteriorColor] = useState(editingCar?.exteriorColor || 'Metallic Black');
  const [interiorColor, setInteriorColor] = useState(editingCar?.interiorColor || 'Black Nappa Leather');
  const [vin, setVin] = useState(editingCar?.vin || `APX-USR-${Math.floor(100000 + Math.random() * 900000)}`);
  const [imageUrl, setImageUrl] = useState(editingCar?.images?.[0] || SAMPLE_IMAGE_PRESETS[0].url);
  const [imageError, setImageError] = useState(false);
  const [featureInput, setFeatureInput] = useState('');
  const [featuresList, setFeaturesList] = useState<string[]>(
    editingCar?.features || [
      'Clean CARFAX 1-Owner',
      'Ceramic Coated Paint',
      'Premium Audio Suite',
      'Sport Chrono Package'
    ]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state if editingCar changes
  React.useEffect(() => {
    if (editingCar) {
      setMake(editingCar.make);
      setModel(editingCar.model);
      setYear(editingCar.year);
      setPrice(editingCar.price);
      setOriginalMsrp(editingCar.originalMsrp);
      setMileage(editingCar.mileage);
      setCondition(editingCar.condition);
      setVehicleType(editingCar.vehicleType);
      setFuelType(editingCar.fuelType);
      setTransmission(editingCar.transmission);
      setDrivetrain(editingCar.drivetrain);
      setHorsepower(editingCar.horsepower);
      setZeroToSixty(editingCar.zeroToSixty);
      setExteriorColor(editingCar.exteriorColor);
      setInteriorColor(editingCar.interiorColor);
      setVin(editingCar.vin);
      setImageUrl(editingCar.images?.[0] || SAMPLE_IMAGE_PRESETS[0].url);
      setFeaturesList(editingCar.features || []);
      setImageError(false);
    }
  }, [editingCar]);

  if (!isOpen) return null;

  const handleAddFeature = () => {
    if (featureInput.trim() && !featuresList.includes(featureInput.trim())) {
      setFeaturesList([...featuresList, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (idx: number) => {
    setFeaturesList(featuresList.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!make.trim() || !model.trim()) {
      setErrorMsg('Please specify vehicle make and model.');
      return;
    }

    setIsLoading(true);

    const carData: Car = {
      id: editingCar?.id || `user-car-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: currentUserId,
      make: make.trim(),
      model: model.trim(),
      year: Number(year),
      price: Number(price),
      originalMsrp: Number(originalMsrp) || Number(price),
      mileage: Number(mileage),
      condition,
      vehicleType,
      fuelType,
      transmission: transmission.trim() || 'Automatic',
      drivetrain: drivetrain.trim() || 'RWD',
      horsepower: Number(horsepower) || 300,
      zeroToSixty: zeroToSixty.trim() || '4.2s',
      exteriorColor: exteriorColor.trim() || 'Custom',
      interiorColor: interiorColor.trim() || 'Premium Interior',
      vin: vin.trim() || `APX-USR-${Date.now()}`,
      available: true,
      featured: editingCar?.featured ?? false,
      images: [imageUrl.trim() || SAMPLE_IMAGE_PRESETS[0].url],
      features: featuresList.length > 0 ? featuresList : ['Apex Verified', '150-Point Inspected'],
      inspectionScore: editingCar?.inspectionScore || 150,
      previousOwners: editingCar?.previousOwners || 1,
      carfaxClean: editingCar?.carfaxClean ?? true,
      topSpeed: editingCar?.topSpeed || 175,
      mpgOrRange: editingCar?.mpgOrRange || '24 MPG',
    };

    try {
      const res = await upsertCarToSupabase(carData);
      if (!res.success && res.error) {
        setErrorMsg(`Database notice: ${res.error}. Saving locally.`);
      }
      onSuccess(carData);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error saving listing');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8"
        >
          {/* Modal Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-400">
                <CarIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {editingCar ? 'Edit Vehicle Listing' : 'List Your Vehicle for Sale'}
                </h2>
                <p className="text-xs text-slate-300">
                  {editingCar ? 'Update specs, pricing and details' : 'Publish your private vehicle to the Apex Motors showroom'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {errorMsg && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-2.5 text-amber-800 dark:text-amber-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Make <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Porsche"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Model <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 911 Carrera S"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Model Year <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1990}
                  max={2027}
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                />
              </div>
            </div>

            {/* Price & Mileage */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Selling Price ($) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1000}
                  step={500}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Original MSRP ($)
                </label>
                <input
                  type="number"
                  min={1000}
                  step={500}
                  value={originalMsrp}
                  onChange={(e) => setOriginalMsrp(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Current Mileage <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={mileage}
                  onChange={(e) => setMileage(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                />
              </div>
            </div>

            {/* Vehicle Type, Condition & Powertrain */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Vehicle Body Type
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
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
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Condition Rating
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as VehicleCondition)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                >
                  <option value="Showroom">Showroom (Like Brand New)</option>
                  <option value="Pristine">Pristine (Concourse Grade)</option>
                  <option value="Like New">Like New (Immaculate)</option>
                  <option value="Certified Pre-Owned">Certified Pre-Owned</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Powertrain / Fuel
                </label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value as FuelType)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                >
                  <option value="Gasoline">Gasoline</option>
                  <option value="Electric">Electric (EV)</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Plug-in Hybrid">Plug-in Hybrid (PHEV)</option>
                </select>
              </div>
            </div>

            {/* Performance Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Horsepower (HP)
                </label>
                <input
                  type="number"
                  min={50}
                  value={horsepower}
                  onChange={(e) => setHorsepower(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  0-60 MPH Acceleration
                </label>
                <input
                  type="text"
                  placeholder="e.g. 3.2s"
                  value={zeroToSixty}
                  onChange={(e) => setZeroToSixty(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Exterior Color
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chalk Grey"
                  value={exteriorColor}
                  onChange={(e) => setExteriorColor(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                />
              </div>
            </div>

            {/* Image URL & Presets */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Vehicle High-Res Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                />
              </div>

              {/* Quick Preset Badges */}
              <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Quick Presets:
                </span>
                {SAMPLE_IMAGE_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setImageUrl(p.url)}
                    className="px-2 py-0.5 text-[10px] rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Image Preview */}
              {imageUrl && (
                <div className="mt-2 relative w-full h-40 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <img
                    src={imageUrl}
                    alt="Vehicle preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      setImageError(true);
                      // Don't overwrite state, but provide fallback in UI
                      (e.target as HTMLImageElement).src = SAMPLE_IMAGE_PRESETS[0].url;
                    }}
                    onLoad={() => setImageError(false)}
                  />
                  <div className="absolute bottom-2 left-2 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-white text-[10px] font-medium">
                      Live Preview
                    </span>
                    {imageError && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-600/90 text-white text-[10px] font-medium">
                        URL failed to load • Using fallback
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Features Tags */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Vehicle Highlights & Features
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Carbon Ceramic Brakes, Apple CarPlay"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                  className="flex-1 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Add
                </button>
              </div>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {featuresList.map((f, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                  >
                    <span>{f}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="hover:text-rose-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Submit Actions */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{editingCar ? 'Update Listing' : 'Publish Listing'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
