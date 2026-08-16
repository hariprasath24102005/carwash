import React, { useState } from 'react';
import { 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  Car, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Navigation,
  Calendar,
  ShieldCheck
} from 'lucide-react';

export const LocationContactSection: React.FC = () => {
  const [formType, setFormType] = useState<'test-drive' | 'general' | 'detailing'>('test-drive');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredVehicle, setPreferredVehicle] = useState('Porsche Taycan 4S');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <section id="location-section" className="py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-xs font-extrabold uppercase tracking-wide">
          <MapPin className="w-3.5 h-3.5" />
          <span>Showroom & Detailing Studio Campus</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Visit Apex Motors & AutoSpa
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          Located in the heart of Silicon Valley. Visit our climate-controlled indoor showroom or experience our state-of-the-art 4-bay detailing studio.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Campus Details & Interactive Visual Map card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="space-y-4">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-500" />
                <span>Showroom & Detailing Campus</span>
              </h3>
              
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                <p className="font-bold text-xs text-slate-900 dark:text-white">Apex Motors Flagship Showroom</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">100 Performance Way, Suite 400</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Silicon Valley (Menlo Park / Palo Alto), CA 94025</p>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Operating Hours</span>
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span className="font-semibold">Monday – Friday</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">8:00 AM – 7:30 PM</span>
                </div>
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span className="font-semibold">Saturday</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">8:30 AM – 6:00 PM</span>
                </div>
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span className="font-semibold">Sunday</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">9:00 AM – 5:00 PM</span>
                </div>
              </div>
            </div>

            {/* Direct Contacts */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Direct Department Hotlines</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <a
                  href="tel:8005552739"
                  className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/60 hover:border-blue-500 transition-colors flex items-center gap-2"
                >
                  <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Sales & Showroom</p>
                    <p className="font-bold text-slate-900 dark:text-white">(800) 555-APEX</p>
                  </div>
                </a>

                <a
                  href="tel:8005552740"
                  className="p-3 bg-cyan-50 dark:bg-cyan-950/40 rounded-xl border border-cyan-100 dark:border-cyan-900/60 hover:border-cyan-500 transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">AutoSpa Detailing</p>
                    <p className="font-bold text-slate-900 dark:text-white">(800) 555-WASH</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Map Visual / Driving Directions */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 h-44 flex items-center justify-center text-center p-4">
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-40"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80')`
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
              
              <div className="relative z-10 space-y-2">
                <span className="px-2.5 py-1 rounded-full bg-blue-600/80 text-white text-[11px] font-extrabold backdrop-blur-sm">
                  Off US-101 / Willow Rd Exit
                </span>
                <p className="text-xs text-slate-200 font-medium max-w-xs">
                  5 minutes from Stanford Shopping Center & Palo Alto Downtown
                </p>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-bold hover:bg-slate-100 transition-all shadow-md"
                >
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  <span>Open in Google Maps / Apple Maps</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Inquiry & Test Drive Scheduling Form */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="space-y-2">
              <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">
                VIP Showroom Experience & Test Drive Inquiry
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Reserve a private showing with an automotive specialist. We prepare the vehicle in our climate-controlled staging bay prior to your arrival.
              </p>
            </div>

            {/* Selector for inquiry type */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'test-drive', label: 'VIP Test Drive', icon: Car },
                { id: 'detailing', label: 'Detailing Consultation', icon: Sparkles },
                { id: 'general', label: 'General Inquiry', icon: Mail }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFormType(tab.id as any)}
                  className={`p-3 rounded-2xl text-center border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    formType === tab.id
                      ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="text-[11px]">{tab.label}</span>
                </button>
              ))}
            </div>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jonathan Hayes"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. j.hayes@example.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Contact Phone</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. (415) 555-0199"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Vehicle of Interest</label>
                    <select
                      value={preferredVehicle}
                      onChange={(e) => setPreferredVehicle(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Porsche Taycan 4S">2022 Porsche Taycan 4S</option>
                      <option value="BMW M4 Competition">2021 BMW M4 Competition</option>
                      <option value="Audi RS6 Avant">2023 Audi RS6 Avant</option>
                      <option value="Mercedes-AMG GT">2020 Mercedes-AMG GT Coupe</option>
                      <option value="General Inventory Inquiry">General Showroom Tour</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Specific Requests or Desired Test Drive Date</label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Let us know your preferred date/time or any specific trade-in/financing questions..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>

                <div className="p-3 bg-blue-50/50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/40 text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>No obligation consultation. Valid driver's license required for dynamic test drives.</span>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit VIP Request</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-8 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center space-y-3 animate-fadeIn">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-black text-base text-slate-900 dark:text-white">
                  Inquiry Dispatched to Concierge Desk
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                  Thank you, <strong>{name}</strong>! An Apex client advisor will contact you at <strong>{phone}</strong> to confirm your vehicle staging and test drive window.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline pt-2"
                >
                  Send another inquiry
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
