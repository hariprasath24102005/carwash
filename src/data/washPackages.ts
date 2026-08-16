import { WashPackage, WashAddon, BookingSlot } from '../types';

export const WASH_PACKAGES: WashPackage[] = [
  {
    id: 'pkg-express-hydro',
    name: 'Hydro-Shine Express',
    tagline: 'Rapid high-gloss decontamination and hand touch-dry',
    price: 35,
    suvPriceAddon: 10,
    durationMinutes: 30,
    icon: 'Sparkles',
    badge: 'Quick & Effective',
    description: 'Perfect for regular maintenance. Neutralizes road grime, protects clear coat, and leaves streak-free glass in under 30 minutes.',
    includedSteps: [
      'Pre-soak snow foam loosening bath',
      'Two-bucket scratch-free hand microfibre wash',
      'Wheel faces and brake dust blast',
      'Tire shine nourishing treatment',
      'High-velocity warm filtered air blow dry',
      'Streak-free exterior glass wipe down'
    ]
  },
  {
    id: 'pkg-signature-spa',
    name: 'Signature Ceramic Spa',
    tagline: 'Deep exterior ceramic sealant plus full cabin freshening',
    price: 75,
    suvPriceAddon: 15,
    durationMinutes: 55,
    popular: true,
    badge: 'Most Popular',
    icon: 'ShieldCheck',
    description: 'Our client favorite. Features 3-month ceramic hydrophobic seal protection combined with detailed interior vacuuming and sanitized surfaces.',
    includedSteps: [
      'Everything in Hydro-Shine Express',
      '3-Month SIO2 ceramic liquid sealant protection',
      'Deep barrel wheel & brake caliper de-ironing',
      'Interior multi-zone vacuum (seats, trunk, footwells)',
      'Dashboard, console, and door panel UV wipe down',
      'Clean interior & exterior crystal glass',
      'Door jambs and trunk sill pressure wiped'
    ]
  },
  {
    id: 'pkg-master-detail',
    name: 'Master Executive Detail',
    tagline: 'Deep clay bar decontamination, steam sanitized cabin & leather massage',
    price: 145,
    suvPriceAddon: 25,
    durationMinutes: 110,
    badge: 'Showroom Finish',
    icon: 'Crown',
    description: 'Restores that new-car aroma and silky smooth touch. Includes full clay bar decontamination and hot water extraction on carpets and leather seats.',
    includedSteps: [
      'Everything in Signature Ceramic Spa',
      'Full automotive clay bar paint smoothing',
      'Deep leather conditioning & nourishment treatment',
      'Hot water carpet extraction & stain spot clean',
      'Ozone anti-microbial odor neutralization',
      'Air vent steam disinfection',
      'Exterior plastic & trim UV nano-restoration'
    ]
  },
  {
    id: 'pkg-diamond-graphene',
    name: 'Diamond Graphene & Paint Correction',
    tagline: '1-Step gloss correction polish with 12-month Graphene Matrix Armor',
    price: 260,
    suvPriceAddon: 40,
    durationMinutes: 180,
    badge: 'Concourse Protection',
    icon: 'Gem',
    description: 'The pinnacle of automotive reconditioning. Removes 70-85% of swirl marks, followed by an authentic 1-year graphene ceramic barrier.',
    includedSteps: [
      'Everything in Master Executive Detail',
      '1-Step machine gloss refinement & swirl reduction',
      '12-Month Graphene Matrix ceramic coating application',
      'Engine bay degreasing and satin preservation dressing',
      'All glass hydrophobic rain-repellent treatment',
      'Wheel ceramic coating shield (face & barrels)',
      'Certificate of warranty & maintenance kit'
    ]
  }
];

export const WASH_ADDONS: WashAddon[] = [
  {
    id: 'addon-engine-bay',
    name: 'Engine Bay Steam Clean & Dress',
    price: 40,
    durationMinutes: 20,
    category: 'engine',
    description: 'Removes accumulated grease and road salt, restoring factory satin look.'
  },
  {
    id: 'addon-headlight-restore',
    name: 'Headlight Oxidation Clarification',
    price: 45,
    durationMinutes: 25,
    category: 'exterior',
    description: 'Polishes cloudy lens housing to crystal clear with UV sealant.'
  },
  {
    id: 'addon-pet-hair',
    name: 'Heavy Pet Hair & Sand Extractor',
    price: 35,
    durationMinutes: 25,
    category: 'interior',
    description: 'Specialized rubber mechanical combs and high-suction extraction.'
  },
  {
    id: 'addon-rainx-armor',
    name: 'Ultra Hydrophobic Windshield Coating',
    price: 20,
    durationMinutes: 10,
    category: 'protection',
    description: 'Water beads instantly at 40+ mph for superior rainy day visibility.'
  },
  {
    id: 'addon-child-seat',
    name: 'Child Car Seat Steam Sanitization',
    price: 25,
    durationMinutes: 15,
    category: 'interior',
    description: '100% organic, non-toxic high-temperature steam sterilization.'
  },
  {
    id: 'addon-leather-shield',
    name: 'Ceramic Leather Shield Barrier',
    price: 50,
    durationMinutes: 30,
    category: 'protection',
    description: 'Repels dye transfer from blue jeans and resists liquid spills.'
  }
];

export const TIME_SLOTS: BookingSlot[] = [
  { time: '08:00 AM', period: 'morning', available: true, remainingCapacity: 3 },
  { time: '09:00 AM', period: 'morning', available: true, remainingCapacity: 2 },
  { time: '10:00 AM', period: 'morning', available: true, remainingCapacity: 4 },
  { time: '11:00 AM', period: 'morning', available: false, remainingCapacity: 0 },
  { time: '12:30 PM', period: 'afternoon', available: true, remainingCapacity: 3 },
  { time: '01:30 PM', period: 'afternoon', available: true, remainingCapacity: 1 },
  { time: '02:30 PM', period: 'afternoon', available: true, remainingCapacity: 4 },
  { time: '03:45 PM', period: 'afternoon', available: true, remainingCapacity: 2 },
  { time: '05:00 PM', period: 'evening', available: true, remainingCapacity: 3 },
  { time: '06:00 PM', period: 'evening', available: true, remainingCapacity: 2 },
  { time: '07:00 PM', period: 'evening', available: true, remainingCapacity: 2 }
];
