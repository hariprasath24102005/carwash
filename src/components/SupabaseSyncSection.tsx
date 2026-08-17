import React, { useState, useEffect } from 'react';
import { 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Copy, 
  Check, 
  UploadCloud, 
  DownloadCloud, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  FileCode2, 
  Activity, 
  Zap 
} from 'lucide-react';
import { Car, BookingAppointment } from '../types';
import { 
  checkSupabaseConnection, 
  SupabaseHealthStatus, 
  syncAllCarsToSupabase, 
  fetchCarsFromSupabase, 
  saveBookingToSupabase, 
  fetchBookingsFromSupabase, 
  getSupabaseSchemaSQL, 
  SUPABASE_PROJECT_ID, 
  DEFAULT_SUPABASE_URL 
} from '../services/supabaseClient';

interface SupabaseSyncSectionProps {
  cars: Car[];
  onUpdateCars: (cars: Car[]) => void;
  bookings: BookingAppointment[];
  onUpdateBookings: (bookings: BookingAppointment[]) => void;
}

export const SupabaseSyncSection: React.FC<SupabaseSyncSectionProps> = ({
  cars,
  onUpdateCars,
  bookings,
  onUpdateBookings,
}) => {
  const [healthStatus, setHealthStatus] = useState<SupabaseHealthStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isSyncingCars, setIsSyncingCars] = useState(false);
  const [isSyncingBookings, setIsSyncingBookings] = useState(false);
  const [isPullingCars, setIsPullingCars] = useState(false);
  const [isPullingBookings, setIsPullingBookings] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const runHealthCheck = async () => {
    setIsChecking(true);
    try {
      const status = await checkSupabaseConnection();
      setHealthStatus(status);
    } catch (err: any) {
      console.warn('Supabase health check notice:', err);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    runHealthCheck();
  }, []);

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handlePushCars = async () => {
    setIsSyncingCars(true);
    try {
      const res = await syncAllCarsToSupabase(cars);
      showToast('success', `Successfully pushed ${res.count}/${cars.length} vehicles to Supabase "cars" table!`);
      runHealthCheck();
    } catch (err: any) {
      showToast('error', `Failed to sync cars: ${err.message || 'Make sure the "cars" table exists in Supabase'}`);
    } finally {
      setIsSyncingCars(false);
    }
  };

  const handlePullCars = async () => {
    setIsPullingCars(true);
    try {
      const remoteCars = await fetchCarsFromSupabase();
      if (remoteCars && remoteCars.length > 0) {
        onUpdateCars(remoteCars);
        try {
          localStorage.setItem('apex_custom_cars', JSON.stringify(remoteCars));
        } catch {}
        showToast('success', `Pulled ${remoteCars.length} vehicles from Supabase database!`);
      } else {
        showToast('info', 'No cars found in Supabase table. Use "Push to Cloud" to upload current inventory.');
      }
    } catch (err: any) {
      showToast('error', `Error fetching cars: ${err?.message}`);
    } finally {
      setIsPullingCars(false);
    }
  };

  const handlePushBookings = async () => {
    setIsSyncingBookings(true);
    try {
      let count = 0;
      for (const booking of bookings) {
        const res = await saveBookingToSupabase(booking);
        if (res.success) count++;
      }
      showToast('success', `Successfully pushed ${count}/${bookings.length} appointments to Supabase "bookings" table!`);
      runHealthCheck();
    } catch (err: any) {
      showToast('error', `Failed to sync bookings: ${err.message}`);
    } finally {
      setIsSyncingBookings(false);
    }
  };

  const handlePullBookings = async () => {
    setIsPullingBookings(true);
    try {
      const remoteBookings = await fetchBookingsFromSupabase();
      if (remoteBookings && remoteBookings.length > 0) {
        onUpdateBookings(remoteBookings);
        try {
          localStorage.setItem('apex_saved_bookings', JSON.stringify(remoteBookings));
        } catch {}
        showToast('success', `Pulled ${remoteBookings.length} appointments from Supabase database!`);
      } else {
        showToast('info', 'No bookings found in Supabase table. Use "Push to Cloud" to seed appointments.');
      }
    } catch (err: any) {
      showToast('error', `Error fetching bookings: ${err?.message}`);
    } finally {
      setIsPullingBookings(false);
    }
  };

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(getSupabaseSchemaSQL());
    setCopiedSql(true);
    showToast('success', 'Supabase SQL schema copied to clipboard!');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner Status */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 p-6 rounded-3xl border border-emerald-800/40 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-inner">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-black tracking-tight text-white">
                Supabase PostgreSQL Cloud Database
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                PROJECT: CAR (isrmujbgbffshcmjztzo)
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Live REST API Endpoint: <span className="text-emerald-300 font-mono">{DEFAULT_SUPABASE_URL}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={runHealthCheck}
            disabled={isChecking}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Testing...' : 'Test Connection'}</span>
          </button>

          <a
            href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-md"
          >
            <span>Supabase Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Feedback Toast */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between animate-fadeIn ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : toastMessage.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
              : 'bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            ) : toastMessage.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            ) : (
              <Sparkles className="w-5 h-5 text-blue-500 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="opacity-80 hover:opacity-100 hover:underline text-[11px]">
            Dismiss
          </button>
        </div>
      )}

      {/* Grid: Live Connection Status & Sync Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Data Table Sync Cards */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card 1: Vehicles Inventory Cloud Sync */}
          <div className="bg-white dark:bg-slate-800/60 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Vehicle Inventory Sync (Table: <code className="text-emerald-600 dark:text-emerald-400 font-mono">cars</code>)
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {cars.length} Active Vehicles
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Synchronize your entire showroom inventory, pricing, specifications, and 150-point inspection scores with your Supabase database in real-time.
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Table Status:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${healthStatus?.tables.cars ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {healthStatus?.tables.cars ? 'Online & Queryable' : 'Pending Initialization'}
                </span>
              </div>

              <div className="text-right">
                <span className="text-slate-500 block text-[11px]">Local Records:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{cars.length} Vehicles</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handlePushCars}
                disabled={isSyncingCars}
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <UploadCloud className={`w-4 h-4 ${isSyncingCars ? 'animate-bounce' : ''}`} />
                <span>{isSyncingCars ? 'Uploading to Cloud...' : 'Push to Supabase'}</span>
              </button>

              <button
                onClick={handlePullCars}
                disabled={isPullingCars}
                className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <DownloadCloud className={`w-4 h-4 ${isPullingCars ? 'animate-spin' : ''}`} />
                <span>{isPullingCars ? 'Pulling...' : 'Pull from Supabase'}</span>
              </button>
            </div>
          </div>

          {/* Card 2: AutoSpa Appointments Cloud Sync */}
          <div className="bg-white dark:bg-slate-800/60 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-teal-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  AutoSpa Bookings Sync (Table: <code className="text-teal-600 dark:text-teal-400 font-mono">bookings</code>)
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {bookings.length} Appointments
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Persist all detailing reservations, assigned service bays, customer contact records, and service add-ons to Supabase.
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Table Status:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${healthStatus?.tables.bookings ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {healthStatus?.tables.bookings ? 'Online & Queryable' : 'Pending Initialization'}
                </span>
              </div>

              <div className="text-right">
                <span className="text-slate-500 block text-[11px]">Total Revenue Stored:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  ${bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handlePushBookings}
                disabled={isSyncingBookings}
                className="py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <UploadCloud className={`w-4 h-4 ${isSyncingBookings ? 'animate-bounce' : ''}`} />
                <span>{isSyncingBookings ? 'Uploading Bookings...' : 'Push Bookings'}</span>
              </button>

              <button
                onClick={handlePullBookings}
                disabled={isPullingBookings}
                className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <DownloadCloud className={`w-4 h-4 ${isPullingBookings ? 'animate-spin' : ''}`} />
                <span>{isPullingBookings ? 'Pulling...' : 'Pull Bookings'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Connection Health & SQL Schema Helper */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Connection Diagnostics Card */}
          <div className="bg-white dark:bg-slate-800/60 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Connection Health
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                {healthStatus?.latencyMs ? `${healthStatus.latencyMs}ms` : 'Active'}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Project Name:</span>
                  <span className="font-bold text-slate-900 dark:text-white">car</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Project ID:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{SUPABASE_PROJECT_ID}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">API Status:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ready & Connected
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Last Checked:</span>
                  <span className="text-slate-400 font-mono text-[11px]">{healthStatus?.lastChecked || 'Just now'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Database Setup & SQL Editor Helper */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-base text-white">
                  Database SQL Schema
                </h3>
              </div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                PostgreSQL
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              If your Supabase project is fresh, copy the SQL schema script and run it in the Supabase SQL Editor to create tables with Row Level Security.
            </p>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-[11px] text-slate-300 max-h-36 overflow-y-auto leading-relaxed">
              <pre className="whitespace-pre-wrap">{getSupabaseSchemaSQL().slice(0, 320)}...</pre>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={copySqlToClipboard}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedSql ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSql ? 'Schema Copied!' : 'Copy SQL Schema'}</span>
              </button>

              <a
                href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1"
                title="Open Supabase SQL Editor"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
