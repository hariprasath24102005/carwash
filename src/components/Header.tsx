import React from 'react';
import { 
  Sparkles, 
  Car, 
  Calendar, 
  Layers, 
  Volume2, 
  VolumeX, 
  Moon, 
  Sun, 
  ShieldCheck, 
  Flame,
  Bookmark,
  Lock,
  Menu,
  X,
  Phone,
  MapPin,
  TrendingUp,
  HelpCircle
} from 'lucide-react';
import { isSoundEnabled, setSoundEnabled, playTurboEngineRev } from '../utils/audio';

interface HeaderProps {
  activeTab: 'catalog' | 'booking';
  setActiveTab: (tab: 'catalog' | 'booking') => void;
  comparedCarsCount: number;
  onOpenCompareModal: () => void;
  savedBookingsCount: number;
  onOpenBookingsDrawer: () => void;
  favoriteCarsCount: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenAdmin: () => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  comparedCarsCount,
  onOpenCompareModal,
  savedBookingsCount,
  onOpenBookingsDrawer,
  favoriteCarsCount,
  isDarkMode,
  onToggleDarkMode,
  onOpenAdmin,
  onNavigateSection
}) => {
  const [soundOn, setSoundOnState] = React.useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const toggleSound = () => {
    const nextState = !soundOn;
    setSoundOnState(nextState);
    setSoundEnabled(nextState);
    if (nextState) {
      playTurboEngineRev(0.4);
    }
  };

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (onNavigateSection) {
      onNavigateSection(sectionId);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Top micro-announcement banner */}
      <div className="bg-slate-950 text-slate-300 py-1.5 px-4 text-[11px] font-medium border-b border-slate-800">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="hidden sm:inline">Certified Pre-Owned Silicon Valley Showroom & Concourse Studio</span>
            <span className="sm:hidden font-bold">Apex Certified Motors</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">150-Point Inspection Guaranteed</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={onOpenAdmin}
              className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Lock className="w-3 h-3" />
              <span>Admin Portal</span>
            </button>
            <span className="text-blue-400 font-semibold hidden sm:inline">📞 (800) 555-APEX</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => {
            setActiveTab('catalog');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Flame className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white uppercase font-sans">
                Apex
              </span>
              <span className="text-xs font-extrabold px-1.5 py-0.5 rounded bg-blue-600 text-white tracking-widest uppercase">
                Motors
              </span>
            </div>
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
              Pre-Owned Showroom & AutoSpa
            </p>
          </div>
        </div>

        {/* Website Links & Switcher */}
        <nav className="hidden lg:flex items-center gap-1">
          <button
            id="nav-link-inventory"
            onClick={() => {
              setActiveTab('catalog');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'catalog'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Car className="w-4 h-4 text-blue-500" />
            <span>Showroom Inventory</span>
          </button>

          <button
            id="nav-link-autospa"
            onClick={() => {
              setActiveTab('booking');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'booking'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span>AutoSpa Studio</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          <button
            onClick={() => handleNavClick('trust-section')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>150-Point Standard</span>
          </button>

          <button
            onClick={() => handleNavClick('trade-in-section')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5"
          >
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <span>Trade-In Appraisal</span>
          </button>

          <button
            onClick={() => handleNavClick('location-section')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5"
          >
            <MapPin className="w-4 h-4 text-amber-500" />
            <span>Showroom & Hours</span>
          </button>
        </nav>

        {/* Right Tools & Badges */}
        <div className="flex items-center gap-2">
          {/* Admin Portal Button */}
          <button
            id="btn-nav-admin"
            onClick={onOpenAdmin}
            className="px-3 py-1.5 text-xs font-bold bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-xl transition-all flex items-center gap-1.5 border border-blue-200 dark:border-blue-800"
            title="Administrator Operations Portal"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Admin Portal</span>
          </button>

          {/* Compare Button */}
          {comparedCarsCount > 0 && (
            <button
              id="btn-nav-compare"
              onClick={onOpenCompareModal}
              className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              title="Compare Vehicles"
            >
              <Layers className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                {comparedCarsCount}
              </span>
            </button>
          )}

          {/* My Bookings Button */}
          <button
            id="btn-nav-my-bookings"
            onClick={onOpenBookingsDrawer}
            className="relative px-3 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl transition-all flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
          >
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className="hidden sm:inline">My Bookings</span>
            {savedBookingsCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-blue-600 text-white font-bold">
                {savedBookingsCount}
              </span>
            )}
          </button>

          {/* Sound Synthesizer Toggle */}
          <button
            id="btn-toggle-sound"
            onClick={toggleSound}
            title={soundOn ? 'Interactive Engine Audio Enabled' : 'Audio Muted'}
            className={`p-2 rounded-xl transition-all ${
              soundOn
                ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50'
                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Dark / Light Toggle */}
          <button
            id="btn-toggle-theme"
            onClick={onToggleDarkMode}
            title="Toggle theme"
            className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Responsive Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-2 animate-fadeIn">
          <button
            onClick={() => {
              setActiveTab('catalog');
              setMobileMenuOpen(false);
            }}
            className={`w-full p-3 rounded-xl text-left text-xs font-bold flex items-center justify-between ${
              activeTab === 'catalog' ? 'bg-blue-50 dark:bg-blue-950 text-blue-600' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <Car className="w-4 h-4 text-blue-500" />
              Showroom Pre-Owned Inventory
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('booking');
              setMobileMenuOpen(false);
            }}
            className={`w-full p-3 rounded-xl text-left text-xs font-bold flex items-center justify-between ${
              activeTab === 'booking' ? 'bg-blue-50 dark:bg-blue-950 text-blue-600' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              AutoSpa Detailing Booking
            </span>
          </button>

          <button
            onClick={() => handleNavClick('trust-section')}
            className="w-full p-3 rounded-xl text-left text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            150-Point Certified Standard
          </button>

          <button
            onClick={() => handleNavClick('trade-in-section')}
            className="w-full p-3 rounded-xl text-left text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            Sell or Trade Your Vehicle
          </button>

          <button
            onClick={() => handleNavClick('location-section')}
            className="w-full p-3 rounded-xl text-left text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"
          >
            <MapPin className="w-4 h-4 text-amber-500" />
            Showroom Location & Hours
          </button>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Management Portal</span>
            </button>
            <a href="tel:8005552739" className="text-xs font-bold text-slate-500">
              (800) 555-APEX
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
