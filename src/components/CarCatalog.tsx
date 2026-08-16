import React, { useState, useMemo } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  Sparkles, 
  RotateCcw, 
  Flame, 
  ShieldCheck, 
  Fuel, 
  Zap, 
  Grid, 
  Layers, 
  Check, 
  X, 
  ArrowUpDown,
  Car as CarIcon,
  ChevronDown
} from 'lucide-react';
import { Car, FilterState, VehicleType } from '../types';
import { CarCard } from './CarCard';
import { MOCK_CARS } from '../data/mockCars';

interface CarCatalogProps {
  cars?: Car[];
  onSelectCar: (car: Car) => void;
  onBookWash: (car: Car) => void;
  comparedCars: Car[];
  onToggleCompare: (car: Car) => void;
  onOpenCompareModal: () => void;
  favoriteCarIds: string[];
  onToggleFavorite: (car: Car) => void;
}

const VEHICLE_TYPES: (string)[] = ['All Types', 'Coupe', 'Sedan', 'SUV', 'Sports', 'EV / Hybrid', 'Convertible'];
const CONDITIONS = ['All Conditions', 'Showroom', 'Pristine', 'Like New', 'Certified Pre-Owned'];
const FUELS = ['All Powertrains', 'Gasoline', 'Electric', 'Hybrid', 'Plug-in Hybrid'];

export const CarCatalog: React.FC<CarCatalogProps> = ({
  cars = MOCK_CARS,
  onSelectCar,
  onBookWash,
  comparedCars,
  onToggleCompare,
  onOpenCompareModal,
  favoriteCarIds,
  onToggleFavorite,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedCondition, setSelectedCondition] = useState('All Conditions');
  const [selectedFuel, setSelectedFuel] = useState('All Powertrains');
  const [maxPrice, setMaxPrice] = useState(90000);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'year-desc' | 'mileage-asc' | 'hp-desc'>('year-desc');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Filter and Sort Logic
  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = `${car.year} ${car.make} ${car.model}`.toLowerCase().includes(q);
        const matchesColor = car.exteriorColor.toLowerCase().includes(q);
        const matchesFeatures = car.features.some((f) => f.toLowerCase().includes(q));
        if (!matchesName && !matchesColor && !matchesFeatures) return false;
      }

      // Type
      if (selectedType !== 'All Types' && car.vehicleType !== selectedType) {
        return false;
      }

      // Condition
      if (selectedCondition !== 'All Conditions' && car.condition !== selectedCondition) {
        return false;
      }

      // Fuel
      if (selectedFuel !== 'All Powertrains' && car.fuelType !== selectedFuel) {
        return false;
      }

      // Max Price
      if (car.price > maxPrice) {
        return false;
      }

      // Only Available
      if (onlyAvailable && !car.available) {
        return false;
      }

      // Only Favorites
      if (onlyFavorites && !favoriteCarIds.includes(car.id)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'year-desc': return b.year - a.year;
        case 'mileage-asc': return a.mileage - b.mileage;
        case 'hp-desc': return b.horsepower - a.horsepower;
        default: return 0;
      }
    });
  }, [searchQuery, selectedType, selectedCondition, selectedFuel, maxPrice, onlyAvailable, onlyFavorites, sortBy, favoriteCarIds]);

  const hasActiveFilters = searchQuery || selectedType !== 'All Types' || selectedCondition !== 'All Conditions' || selectedFuel !== 'All Powertrains' || maxPrice < 90000 || onlyAvailable || onlyFavorites;

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('All Types');
    setSelectedCondition('All Conditions');
    setSelectedFuel('All Powertrains');
    setMaxPrice(90000);
    setOnlyAvailable(false);
    setOnlyFavorites(false);
  };

  return (
    <div className="max-w-7xl mx-auto py-4 space-y-6">
      {/* Hero Header with Interactive Proximity Hint */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold mb-2">
            <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>Interactive Speed Throttle Active</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Certified Secondhand Showroom
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Hover or move your cursor near any car card to unleash real-time dynamic throttle motion & aerodynamic speed trails.
          </p>
        </div>

        {/* Floating Compare Matrix Button if cars selected */}
        {comparedCars.length > 0 && (
          <button
            id="btn-view-comparison"
            onClick={onOpenCompareModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-500/30 flex items-center gap-2 animate-bounce transition-all"
          >
            <Layers className="w-4 h-4" />
            <span>Compare Matrix ({comparedCars.length} Selected)</span>
          </button>
        )}
      </div>

      {/* Search Bar & Fast Controls Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              id="input-car-search"
              type="text"
              placeholder="Search by make, model, color, V8, carbon, electric..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="w-full sm:w-auto flex items-center gap-2">
            <div className="relative flex-1 sm:flex-none">
              <select
                id="select-car-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full appearance-none pl-8 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="year-desc">Sort: Newest Year</option>
                <option value="price-asc">Sort: Price (Low to High)</option>
                <option value="price-desc">Sort: Price (High to Low)</option>
                <option value="mileage-asc">Sort: Lowest Mileage</option>
                <option value="hp-desc">Sort: Most Horsepower</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
            </div>

            {/* Filter Toggle Button */}
            <button
              id="btn-toggle-filters"
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                isFilterPanelOpen || hasActiveFilters
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              )}
            </button>
          </div>
        </div>

        {/* Quick Body Type Pills Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          {VEHICLE_TYPES.map((type) => {
            const isSelected = selectedType === type;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>

        {/* Expanded Filter Panel */}
        {isFilterPanelOpen && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {/* Condition Filter */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Vehicle Condition
              </label>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Powertrain / Fuel */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Fuel & Powertrain
              </label>
              <select
                value={selectedFuel}
                onChange={(e) => setSelectedFuel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                {FUELS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {/* Max Price Slider */}
            <div>
              <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                <span>Max Price</span>
                <span className="text-blue-600 dark:text-blue-400">${maxPrice.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="25000"
                max="90000"
                step="2500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Toggle Switches */}
            <div className="flex flex-col justify-center space-y-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 accent-blue-600"
                />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Ready for Immediate Delivery
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyFavorites}
                  onChange={(e) => setOnlyFavorites(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 accent-rose-600"
                />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Saved Favorites Only ({favoriteCarIds.length})
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Active Filter Chips & Counter */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-800 dark:text-slate-200">
            Showing {filteredCars.length} of {MOCK_CARS.length} Vehicles
          </span>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-semibold ml-2"
            >
              <RotateCcw className="w-3 h-3" /> Reset all filters
            </button>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
          <span>⚡ All vehicles include CARFAX Clean Title Guarantee</span>
        </div>
      </div>

      {/* Vehicle Grid */}
      {filteredCars.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars.map((car) => (
            <CarCard
              key={car.id}
              car={car}
              onSelect={onSelectCar}
              onBookWash={onBookWash}
              isComparing={comparedCars.some((c) => c.id === car.id)}
              onToggleCompare={onToggleCompare}
              isFavorite={favoriteCarIds.includes(car.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <CarIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            No Vehicles Match Your Current Filters
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try broadening your search query or adjusting the price and body type filters to view our full collection of pre-owned vehicles.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow transition-all"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};
