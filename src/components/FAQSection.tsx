import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, Car, ShieldCheck } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is included in the Apex 150-Point Certified Pre-Owned Inspection?',
      category: 'Vehicle Sales',
      a: 'Every pre-owned vehicle goes through a comprehensive 150-point mechanical, structural, and cosmetic inspection by our master technicians. This includes cylinder compression/high-voltage battery diagnostic tests, digital paint thickness gauge scans to verify no prior frame or accident damage, rotor and pad millimeter audit (minimum 70% pad life required), laser alignment, and full CARFAX title verification.'
    },
    {
      q: 'How does the AutoSpa Ceramic Wash & Detailing booking work?',
      category: 'AutoSpa Detailing',
      a: 'You can select your vehicle type, choose a concourse spa package (e.g. Signature Ceramic Spa, Graphene Concourse Suite, Interior Steam Sanitation), pick your preferred arrival date and timing slot, and reserve online. Upon arrival at 100 Performance Way, your vehicle is checked in at Bay 1–4 and detailed under dual color-match LED inspection lighting.'
    },
    {
      q: 'Do you offer financing and accept trade-ins on secondhand luxury cars?',
      category: 'Finance & Trade-in',
      a: 'Yes! We work directly with over 15 premier lending institutions offering competitive rates starting at 4.49% APR for qualified buyers. We also offer instant algorithmic trade-in appraisals that can be applied directly toward your purchase to save on state sales tax.'
    },
    {
      q: 'What warranty is included with purchased vehicles?',
      category: 'Warranty',
      a: 'All our certified pre-owned vehicles include a complimentary 90-Day / 3,000-Mile comprehensive powertrain warranty with zero deductible. In addition, you receive 1 full year of complimentary quarterly AutoSpa hand washes and our 7-Day / 500-Mile exchange policy.'
    },
    {
      q: 'Can I reschedule or cancel my AutoSpa detailing appointment?',
      category: 'AutoSpa Detailing',
      a: 'Yes. You can manage and view your reservations in real time under "My Bookings" in the top navigation or contact our concierge desk directly at (800) 555-WASH at any time.'
    }
  ];

  return (
    <section id="faq-section" className="py-12 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-black uppercase">
          <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
          <span>Client Knowledge Base</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Frequently Asked Questions
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Everything you need to know regarding our certified inventory, financing, and detailing studio reservations.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-all"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    {faq.category}
                  </span>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                    {faq.q}
                  </h4>
                </div>
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 animate-fadeIn">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
