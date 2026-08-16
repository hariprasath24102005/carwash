import React, { useState } from 'react';
import { 
  Calculator, 
  Car, 
  DollarSign, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  TrendingUp,
  RotateCcw
} from 'lucide-react';

export const TradeInEstimator: React.FC = () => {
  const [year, setYear] = useState('2021');
  const [make, setMake] = useState('BMW');
  const [model, setModel] = useState('M3 Competition');
  const [mileage, setMileage] = useState('28500');
  const [condition, setCondition] = useState<'Excellent' | 'Very Good' | 'Good' | 'Fair'>('Excellent');
  const [estimatedValue, setEstimatedValue] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const calculateEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);

    setTimeout(() => {
      // Algorithmic estimation calculation based on year, mileage, and condition
      const currentYear = 2026;
      const age = Math.max(1, currentYear - parseInt(year || '2020'));
      const miles = parseInt(mileage || '30000');
      
      // Base luxury reference price
      let baseVal = 78000;
      if (make.toLowerCase().includes('porsche')) baseVal = 95000;
      if (make.toLowerCase().includes('audi')) baseVal = 74000;
      if (make.toLowerCase().includes('mercedes')) baseVal = 82000;
      if (make.toLowerCase().includes('tesla')) baseVal = 58000;
      if (make.toLowerCase().includes('bmw')) baseVal = 72000;

      // Depreciation & mileage multiplier
      const ageFactor = Math.max(0.45, 1 - (age * 0.08));
      const mileagePenalty = Math.min(25000, (miles / 10000) * 1800);
      
      let conditionMultiplier = 1.0;
      if (condition === 'Very Good') conditionMultiplier = 0.94;
      if (condition === 'Good') conditionMultiplier = 0.87;
      if (condition === 'Fair') conditionMultiplier = 0.76;

      const finalEstimate = Math.round((baseVal * ageFactor - mileagePenalty) * conditionMultiplier);
      const boundedVal = Math.max(18000, finalEstimate);

      setEstimatedValue(boundedVal);
      setIsCalculating(false);
      setSubmitted(true);
    }, 600);
  };

  const resetForm = () => {
    setEstimatedValue(null);
    setSubmitted(false);
  };

  return (
    <section id="trade-in-section" className="py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-black uppercase">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Instant Showroom Trade-In Appraisal</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Sell or Trade Your Vehicle
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Get an instant algorithmic market value offer valid for 7 days. Apply toward your next certified car or receive direct wire payment.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Silicon Valley Live Market Index</span>
          </div>
        </div>

        {!submitted ? (
          <form onSubmit={calculateEstimate} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Model Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017'].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Make / Manufacturer</label>
                <input
                  type="text"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  placeholder="e.g. Porsche, BMW, Audi"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Model & Trim</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. 911 Carrera S, M3"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Current Odometer (Miles)</label>
                <input
                  type="number"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  placeholder="e.g. 32000"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Condition Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Vehicle Physical & Mechanical Condition</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Excellent', desc: 'No mechanical flaws, flawless paint & interior' },
                  { label: 'Very Good', desc: 'Minor cosmetic wear, full service history' },
                  { label: 'Good', desc: 'Normal wear and tear, fully operational' },
                  { label: 'Fair', desc: 'Requires minor reconditioning or tires' }
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setCondition(item.label as any)}
                    className={`p-3 rounded-2xl text-left border transition-all ${
                      condition === item.label
                        ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/60 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
                    }`}
                  >
                    <div className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center justify-between">
                      <span>{item.label}</span>
                      {condition === item.label && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 leading-snug">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isCalculating}
                className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                {isCalculating ? (
                  <>
                    <Zap className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Analyzing Silicon Valley Auction & Market Trends...</span>
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4" />
                    <span>Calculate Instant Trade-In Valuation</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-8 space-y-6 shadow-2xl animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold font-mono">
                  Guaranteed 7-Day Appraisal Voucher #APX-TRD-{Math.floor(1000 + Math.random() * 9000)}
                </span>
                <h3 className="text-xl sm:text-2xl font-black mt-2">
                  {year} {make} {model}
                </h3>
                <p className="text-xs text-slate-300">
                  {parseInt(mileage).toLocaleString()} Miles • {condition} Condition Rating
                </p>
              </div>

              <div className="text-right sm:text-right">
                <span className="text-xs text-blue-200 uppercase font-bold tracking-wider">Estimated Trade Value</span>
                <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">
                  ${estimatedValue?.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Direct Wire Transfer
                </span>
                <p className="text-[11px] text-slate-400">Receive full cash payment into your bank within 24 hours.</p>
              </div>

              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-300" /> Tax Credit Benefit
                </span>
                <p className="text-[11px] text-slate-400">Save up to ~9.25% in California sales tax when trading toward inventory.</p>
              </div>

              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-blue-400" /> Free Loan Payoff
                </span>
                <p className="text-[11px] text-slate-400">We handle all bank lien releases and DMV title transfer paperwork.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <button
                onClick={resetForm}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Recalculate with different vehicle</span>
              </button>

              <div className="flex items-center gap-3">
                <a
                  href="tel:8005552739"
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-1.5"
                >
                  <span>Call Appraiser: (800) 555-APEX</span>
                </a>
                <button
                  onClick={() => alert(`Your trade voucher for $${estimatedValue?.toLocaleString()} has been logged. Our senior appraiser will contact you at your convenience!`)}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all cursor-pointer"
                >
                  Lock In Appraisal Voucher
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
