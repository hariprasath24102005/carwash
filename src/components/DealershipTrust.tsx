import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  Star, 
  Wrench, 
  Sparkles, 
  FileCheck, 
  Clock, 
  ShieldAlert, 
  BadgePercent, 
  Users, 
  ThumbsUp, 
  Quote
} from 'lucide-react';

export const DealershipTrust: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inspection' | 'warranty' | 'reviews'>('inspection');

  const inspectionCategories = [
    {
      title: 'Engine & Hybrid/EV Powertrain',
      points: '38 Points',
      desc: 'Compression testing, oil analysis, turbo spool metrics, high-voltage battery health, cooling efficiency.',
      items: ['Cylinder Compression & Leak-Down', 'High-Voltage Battery Degradation Index', 'Turbocharger Boost & Wastegate Check', 'Transmission Clutch & Fluid Thermal State']
    },
    {
      title: 'Chassis, Suspension & Braking',
      points: '42 Points',
      desc: 'Brembo/Carbon Ceramic rotor thickness, adaptive damper diagnostics, subframe torque specs, alignment.',
      items: ['Laser-Guided 4-Wheel Alignment', 'Brake Pad & Rotor Thickness (>70% req)', 'Adaptive Suspension Bushings & Ball Joints', 'Tire Tread Depth & Uniform Wear Check']
    },
    {
      title: 'Electronics & ADAS Diagnostics',
      points: '35 Points',
      desc: 'Factory OEM scan tool verification, LiDAR/Radar calibration, infotainment firmware, battery charging systems.',
      items: ['OEM ECU Diagnostic Diagnostic Scan', 'Lane Keep & Adaptive Cruise Calibration', 'Infotainment & Premium Audio Telemetry', 'Full Harness & Alternator Output Testing']
    },
    {
      title: 'Concourse Cosmetic & Paint Assessment',
      points: '35 Points',
      desc: 'Digital paint depth gauge measurement, swirl correction audit, interior leather conditioning, glass clarity.',
      items: ['Digital Paint Thickness Gauge Scan', 'Interior Nappa Leather Steam Sanitization', 'Hydrophobic Ceramic Sealant Audit', 'Zero Frame Damage & Clean Title Verif.']
    }
  ];

  const customerReviews = [
    {
      name: 'Dr. Evelyn Montgomery',
      location: 'Palo Alto, CA',
      vehicle: '2022 Porsche Taycan 4S',
      rating: 5,
      date: '2 weeks ago',
      verified: 'Verified Vehicle Buyer',
      comment: 'The transparency at Apex Motors is unmatched. The digital 150-point inspection report showed exact paint depths and battery diagnostics. Combined with their complimentary AutoSpa ceramic detail, the car looked cleaner than brand new.'
    },
    {
      name: 'Rajiv Sharma',
      location: 'Sunnyvale, CA',
      vehicle: '2021 BMW M4 Competition',
      rating: 5,
      date: 'Last month',
      verified: 'Verified Detailing & Buyer Client',
      comment: 'I bought my M4 here and now bring it back every month for their Signature Ceramic Spa. Their detailers treat carbon fiber and Matte frozen paint with surgical precision. The online booking and appointment receipt system is effortless.'
    },
    {
      name: 'Elena Rostova',
      location: 'San Jose, CA',
      vehicle: '2023 Audi RS6 Avant',
      rating: 5,
      date: '3 weeks ago',
      verified: 'Verified Vehicle Buyer',
      comment: 'Zero hidden dealer fees, straightforward trade-in valuation, and the 90-day comprehensive warranty gave me total peace of mind. Truly the highest standard in secondhand luxury automotive.'
    }
  ];

  return (
    <section id="trust-section" className="py-16 space-y-12">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-xs font-extrabold tracking-wide uppercase">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>The Apex Quality Assurance Standard</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Confidence in Every Mile & Every Wash
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          Every vehicle in our showroom undergoes our rigorous 150-point mechanical, structural, and cosmetic inspection. Paired with certified IDA concourse detailing standards.
        </p>
      </div>

      {/* Navigation Pills */}
      <div className="flex justify-center">
        <div className="p-1 bg-slate-200/80 dark:bg-slate-800 rounded-2xl flex items-center gap-1 border border-slate-300 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('inspection')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'inspection'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Wrench className="w-4 h-4 text-blue-500" />
            <span>150-Point Certified Inspection</span>
          </button>

          <button
            onClick={() => setActiveTab('warranty')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'warranty'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            <span>Apex Warranty & Protection</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Star className="w-4 h-4 text-amber-500" />
            <span>Verified Client Reviews</span>
          </button>
        </div>
      </div>

      {/* Dynamic Tab Content */}
      {activeTab === 'inspection' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {inspectionCategories.map((cat, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500/40 transition-all space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {cat.title}
                  </h3>
                  <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-black">
                    {cat.points}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {cat.desc}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  {cat.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="text-[11px]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-1 text-center md:text-left">
              <h4 className="font-black text-lg">Download Sample 150-Point Certificate</h4>
              <p className="text-xs text-blue-200">
                View complete diagnostic line items, brake millimeters, and CARFAX title verification history.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-2 rounded-xl bg-white/10 text-xs font-mono font-bold text-white border border-white/20">
                CARFAX Advantage Dealer
              </span>
              <span className="px-3.5 py-2 rounded-xl bg-emerald-500/20 text-xs font-mono font-bold text-emerald-300 border border-emerald-500/30">
                100% Clean Titles Only
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'warranty' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              90-Day / 3,000-Mile Warranty
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Full powertrain, transmission, hybrid battery systems, and electronic module coverage included with zero deductible.
            </p>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-medium pt-2">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 100% Parts & Labor Covered</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Nationwide Repair Facility Network</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 24/7 Roadside Assistance</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              Complimentary 1-Year AutoSpa
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Every vehicle purchased from our showroom receives 1 full year of quarterly Signature Ceramic Hand Washes and interior steam sanitation.
            </p>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-medium pt-2">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 4 VIP Concourse Detail Sessions</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Priority Bay Scheduling</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Ceramic Booster Application</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              7-Day / 500-Mile Exchange
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              If your chosen performance vehicle doesn't fit your daily lifestyle or garage, exchange it seamlessly for any other vehicle in inventory.
            </p>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-medium pt-2">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> No Restocking Penalties</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Simple Title Re-assignment</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Zero Pressure Experience</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          {customerReviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">{rev.date}</span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {rev.name}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{rev.location}</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">{rev.vehicle}</span>
                </div>
                <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                  ✓ {rev.verified}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
