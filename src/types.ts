export type VehicleType = 'Coupe' | 'Sedan' | 'SUV' | 'Sports' | 'EV / Hybrid' | 'Convertible';
export type VehicleCondition = 'Showroom' | 'Pristine' | 'Like New' | 'Certified Pre-Owned';
export type FuelType = 'Gasoline' | 'Electric' | 'Hybrid' | 'Plug-in Hybrid';

export interface Car {
  id: string;
  userId?: string;
  make: string;
  model: string;
  year: number;
  price: number;
  originalMsrp: number;
  mileage: number;
  condition: VehicleCondition;
  vehicleType: VehicleType;
  fuelType: FuelType;
  transmission: string;
  drivetrain: string;
  horsepower: number;
  zeroToSixty: string;
  exteriorColor: string;
  interiorColor: string;
  vin: string;
  available: boolean;
  featured?: boolean;
  images: string[];
  features: string[];
  inspectionScore: number; // e.g. 150/150
  previousOwners: number;
  carfaxClean: boolean;
  topSpeed: number;
  mpgOrRange: string;
}

export interface PropertyLike {
  id: string;
  userId: string;
  carId: string;
  createdAt: string;
}

export interface WashPackage {
  id: string;
  name: string;
  tagline: string;
  price: number;
  suvPriceAddon: number;
  durationMinutes: number;
  badge?: string;
  popular?: boolean;
  icon: string;
  description: string;
  includedSteps: string[];
}

export interface WashAddon {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  description: string;
  category: 'exterior' | 'interior' | 'protection' | 'engine';
}

export interface BookingSlot {
  time: string;
  period: 'morning' | 'afternoon' | 'evening';
  available: boolean;
  remainingCapacity: number;
}

export interface BookingAppointment {
  id: string;
  createdAt: string;
  packageId: string;
  packageName: string;
  packagePrice: number;
  addonIds: string[];
  addonNames: string[];
  addonsTotal: number;
  totalPrice: number;
  date: string;
  timeSlot: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number | string;
  vehicleType: string;
  licensePlate: string;
  vehicleColor: string;
  specialNotes?: string;
  status: 'Confirmed' | 'In Progress' | 'Completed' | 'Ready for Pickup';
  bayNumber: number;
}

export interface FilterState {
  search: string;
  vehicleType: string;
  condition: string;
  fuelType: string;
  minPrice: number;
  maxPrice: number;
  maxMileage: number;
  sortBy: 'price-asc' | 'price-desc' | 'year-desc' | 'mileage-asc' | 'hp-desc';
  onlyAvailable: boolean;
}
