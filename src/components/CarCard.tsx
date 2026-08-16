import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { 
  Gauge, 
  Fuel, 
  Zap, 
  ShieldCheck, 
  Calendar, 
  Sparkles, 
  ArrowUpRight, 
  Eye, 
  Check, 
  Plus,
  Flame
} from 'lucide-react';
import { Car } from '../types';
import { playTurboEngineRev } from '../utils/audio';

interface CarCardProps {
  car: Car;
  onSelect: (car: Car) => void;
  onBookWash: (car: Car) => void;
  isComparing: boolean;
  onToggleCompare: (car: Car) => void;
  isFavorite: boolean;
  onToggleFavorite: (car: Car) => void;
}

export const CarCard: React.FC<CarCardProps> = ({
  car,
  onSelect,
  onBookWash,
  isComparing,
  onToggleCompare,
  isFavorite,
  onToggleFavorite,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isNear, setIsNear] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [simulatedSpeed, setSimulatedSpeed] = useState(0);
  const [hasTriggeredRev, setHasTriggeredRev] = useState(false);

  // Motion values for smooth 3D tilt & high-speed reactive glide
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 18, stiffness: 220 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), springConfig);
  const carTranslateX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-14, 18]), springConfig);
  const carTranslateY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-6, 6]), springConfig);
  const carScale = useSpring(isHovered ? 1.08 : isNear ? 1.04 : 1.0, springConfig);

  // Track global cursor proximity to trigger high-speed animated reaction when nearby
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const cardCenterY = rect.top + rect.height / 2;

      const distX = e.clientX - cardCenterX;
      const distY = e.clientY - cardCenterY;
      const distance = Math.hypot(distX, distY);

      // 280px proximity radius
      const proximityThreshold = 280;
      if (distance < proximityThreshold) {
        setIsNear(true);
        // Calculate simulated speed based on closeness (0 to 120 mph)
        const proximityRatio = Math.max(0, 1 - distance / proximityThreshold);
        const speed = Math.round(proximityRatio * (car.topSpeed ? Math.min(car.topSpeed, 140) : 100));
        setSimulatedSpeed(speed);

        // Normalize relative position for tilt
        const normX = Math.max(-0.5, Math.min(0.5, distX / rect.width));
        const normY = Math.max(-0.5, Math.min(0.5, distY / rect.height));
        mouseX.set(normX);
        mouseY.set(normY);
      } else {
        if (isNear) {
          setIsNear(false);
          setSimulatedSpeed(0);
          mouseX.set(0);
          mouseY.set(0);
          setHasTriggeredRev(false);
        }
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, [car.topSpeed, isNear, mouseX, mouseY]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (!hasTriggeredRev) {
      playTurboEngineRev(0.7);
      setHasTriggeredRev(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setHasTriggeredRev(false);
  };

  const getConditionColor = (cond: string) => {
    switch (cond) {
      case 'Showroom':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'Pristine':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'Like New':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      default:
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
    }
  };

  return (
    <motion.div
      ref={cardRef}
      id={`car-card-${car.id}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1000,
      }}
      className="relative group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
    >
      {/* Top Banner / Badges */}
      <div className="p-5 pb-0 flex items-center justify-between z-20">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getConditionColor(car.condition)}`}>
            {car.condition}
          </span>
          <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-700">
            {car.vehicleType}
          </span>
          {!car.available && (
            <span className="px-2 py-0.5 text-xs font-bold bg-rose-500 text-white rounded-full">
              Reserved
            </span>
          )}
        </div>

        {/* Favorite & Compare Action Pills */}
        <div className="flex items-center gap-1.5">
          <button
            id={`btn-compare-${car.id}`}
            title={isComparing ? "Remove from comparison" : "Compare this vehicle"}
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(car);
            }}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              isComparing
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700'
            }`}
          >
            {isComparing ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span className="text-[11px] font-semibold hidden sm:inline">Compare</span>
          </button>

          <button
            id={`btn-favorite-${car.id}`}
            title="Save to favorites"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(car);
            }}
            className={`p-1.5 rounded-lg transition-all ${
              isFavorite
                ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40'
                : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <svg
              className={`w-4 h-4 transition-transform active:scale-125 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`}
              fill={isFavorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Interactive High-Speed Vehicle Visual Stage */}
      <div 
        onClick={() => onSelect(car)}
        className="relative px-5 py-4 cursor-pointer overflow-hidden flex flex-col items-center justify-center min-h-[220px]"
      >
        {/* Speedometer Proximity HUD Display */}
        <div 
          className={`absolute top-2 right-4 transition-all duration-300 flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-mono text-cyan-400 border border-cyan-500/30 z-20 ${
            isNear ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 -translate-y-2 pointer-events-none'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>{simulatedSpeed} MPH</span>
          <span className="text-[10px] text-slate-400 font-sans">BOOST</span>
        </div>

        {/* Dynamic High-Speed Wind Velocity Streaks when near or hovered */}
        <div 
          className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
            isNear ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute top-1/4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent transform -translate-x-full animate-[shimmer_1s_infinite]" />
          <div className="absolute top-2/4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-400/40 to-transparent transform -translate-x-full animate-[shimmer_0.7s_infinite]" />
          <div className="absolute top-3/4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent transform -translate-x-full animate-[shimmer_0.9s_infinite]" />
        </div>

        {/* Asphalt speed shadow ground effect */}
        <div className="absolute bottom-6 w-3/4 h-5 bg-black/25 dark:bg-black/60 rounded-full blur-md transform scale-y-50 transition-all duration-300 group-hover:scale-x-110 group-hover:bg-blue-600/20" />

        {/* The 3D High-Speed Animated Vehicle Image */}
        <motion.div
          style={{
            rotateX,
            rotateY,
            x: carTranslateX,
            y: carTranslateY,
            scale: carScale,
            transformStyle: 'preserve-3d',
          }}
          className="relative w-full h-44 flex items-center justify-center z-10"
        >
          <img
            src={car.images[0]}
            alt={`${car.year} ${car.make} ${car.model}`}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover rounded-xl shadow-md transition-all duration-300 group-hover:shadow-2xl"
          />

          {/* Quick View floating prompt on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30">
              <Eye className="w-3.5 h-3.5" /> View Specs & 360°
            </span>
          </div>
        </motion.div>
      </div>

      {/* Vehicle Info & Specs Strip */}
      <div className="p-5 pt-1 space-y-4">
        {/* Title and Pricing */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>{car.year} • {car.fuelType}</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> {car.inspectionScore}/150 Inspected
            </span>
          </div>
          <h3 
            onClick={() => onSelect(car)}
            className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer line-clamp-1"
          >
            {car.make} {car.model}
          </h3>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              ${car.price.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 line-through">
              ${car.originalMsrp.toLocaleString()} MSRP
            </span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded ml-auto">
              Save ${(car.originalMsrp - car.price).toLocaleString()}
            </span>
          </div>
        </div>

        {/* 3 Key Metrics Chips */}
        <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-1 text-slate-400 font-medium">
              <Calendar className="w-3 h-3" />
              <span>Mileage</span>
            </div>
            <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
              {car.mileage.toLocaleString()} mi
            </span>
          </div>

          <div className="flex flex-col items-center text-center border-x border-slate-200 dark:border-slate-700/60 px-1">
            <div className="flex items-center gap-1 text-slate-400 font-medium">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>0-60 MPH</span>
            </div>
            <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
              {car.zeroToSixty}
            </span>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-1 text-slate-400 font-medium">
              <Gauge className="w-3 h-3 text-blue-500" />
              <span>Power</span>
            </div>
            <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
              {car.horsepower} HP
            </span>
          </div>
        </div>

        {/* Actions Button Row */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            id={`btn-view-details-${car.id}`}
            onClick={() => onSelect(car)}
            className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <span>Full Specs</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          <button
            id={`btn-wash-prep-${car.id}`}
            onClick={() => onBookWash(car)}
            className="w-full py-2.5 px-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-xl transition-all border border-blue-200 dark:border-blue-800/80 flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Book Wash</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
