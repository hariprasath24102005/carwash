import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  User, 
  Bookmark, 
  Car as CarIcon, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  Gauge, 
  Fuel, 
  DollarSign, 
  Heart,
  AlertCircle
} from 'lucide-react';
import { Car } from '../types';
import { signOutUser } from '../services/supabaseClient';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSignOut: () => void;
  savedCars: Car[];
  userListings: Car[];
  onSelectCar: (car: Car) => void;
  onRemoveSavedCar: (carId: string) => void;
  onOpenCreateListing: () => void;
  onEditListing: (car: Car) => void;
  onDeleteListing: (carId: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onSignOut,
  savedCars,
  userListings,
  onSelectCar,
  onRemoveSavedCar,
  onOpenCreateListing,
  onEditListing,
  onDeleteListing,
}) => {
  const [activeTab, setActiveTab] = useState<'saved' | 'listings'>('saved');
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (!isOpen || !user) return null;

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOutUser();
      onSignOut();
      onClose();
    } catch {
      onSignOut();
      onClose();
    } finally {
      setIsSigningOut(false);
    }
  };

  const userDisplayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Apex Member';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6"
        >
          {/* Header Profile Banner */}
          <div className="relative px-6 py-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-blue-500/25 border-2 border-white/20">
                  {userDisplayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">{userDisplayName}</h2>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono mt-0.5">{user.email}</p>
                  <p className="text-[11px] text-blue-300 flex items-center gap-1 mt-1 font-mono">
                    <span className="text-slate-400">UID:</span> {user.id.substring(0, 16)}...
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenCreateListing}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>List a Vehicle</span>
                </button>

                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="mt-6 flex gap-2 border-b border-slate-800">
              <button
                onClick={() => setActiveTab('saved')}
                className={`pb-2.5 px-3 text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
                  activeTab === 'saved'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>Saved Vehicles</span>
                <span className="px-2 py-0.5 text-[10px] rounded-full bg-blue-600/30 text-blue-300 font-mono">
                  {savedCars.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('listings')}
                className={`pb-2.5 px-3 text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
                  activeTab === 'listings'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <CarIcon className="w-4 h-4" />
                <span>My Listed Vehicles</span>
                <span className="px-2 py-0.5 text-[10px] rounded-full bg-cyan-600/30 text-cyan-300 font-mono">
                  {userListings.length}
                </span>
              </button>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {/* ================= SAVED VEHICLES TAB ================= */}
            {activeTab === 'saved' && (
              <div>
                {savedCars.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
                      <Bookmark className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white">
                      No Saved Vehicles Yet
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                      Browse the showroom and click the heart icon on any vehicle to save it to your personal garage.
                    </p>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 cursor-pointer"
                    >
                      Browse Showroom
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedCars.map((car) => (
                      <div
                        key={car.id}
                        className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between gap-3 hover:border-blue-500/50 transition-all"
                      >
                        <div className="flex gap-3">
                          <img
                            src={car.images[0]}
                            alt={`${car.year} ${car.make} ${car.model}`}
                            className="w-28 h-20 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">
                              {car.condition} • {car.vehicleType}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                              {car.year} {car.make} {car.model}
                            </h4>
                            <div className="text-base font-black text-slate-900 dark:text-cyan-400 mt-0.5">
                              ${car.price.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                              <span>{car.mileage.toLocaleString()} mi</span>
                              <span>•</span>
                              <span>{car.horsepower} HP</span>
                              <span>•</span>
                              <span>{car.exteriorColor}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                          <button
                            onClick={() => {
                              onSelectCar(car);
                              onClose();
                            }}
                            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>View Full Specs</span>
                          </button>

                          <button
                            onClick={() => onRemoveSavedCar(car.id)}
                            className="px-2.5 py-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ================= MY LISTINGS TAB ================= */}
            {activeTab === 'listings' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Your Showroom Listings
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Manage your listed luxury vehicles in the Apex Motors marketplace.
                    </p>
                  </div>
                  <button
                    onClick={onOpenCreateListing}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Listing</span>
                  </button>
                </div>

                {userListings.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
                      <CarIcon className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white">
                      No Vehicle Listings Yet
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                      Have a sports car or exotic vehicle you'd like to list? Publish it directly to our Silicon Valley showroom.
                    </p>
                    <button
                      onClick={onOpenCreateListing}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-bold rounded-xl hover:opacity-90 shadow-md cursor-pointer"
                    >
                      Create Your First Listing
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userListings.map((car) => (
                      <div
                        key={car.id}
                        className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between gap-3"
                      >
                        <div className="flex gap-3">
                          <img
                            src={car.images[0]}
                            alt={`${car.year} ${car.make} ${car.model}`}
                            className="w-28 h-20 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Active in Showroom
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {car.condition}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate mt-0.5">
                              {car.year} {car.make} {car.model}
                            </h4>
                            <div className="text-base font-black text-slate-900 dark:text-cyan-400 mt-0.5">
                              ${car.price.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                              <span>{car.mileage.toLocaleString()} mi</span>
                              <span>•</span>
                              <span>{car.horsepower} HP</span>
                              <span>•</span>
                              <span>{car.fuelType}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2.5 border-t border-slate-200 dark:border-slate-700">
                          <button
                            onClick={() => {
                              onSelectCar(car);
                              onClose();
                            }}
                            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onEditListing(car)}
                              className="px-2.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => onDeleteListing(car.id)}
                              className="px-2.5 py-1 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
