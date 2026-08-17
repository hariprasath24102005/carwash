import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Car, BookingAppointment, BookingSlot } from '../types';

// Supabase Credentials provided for project "car"
export const SUPABASE_PROJECT_ID = 'isrmujbgbffshcmjztzo';
export const DEFAULT_SUPABASE_URL = 'https://isrmujbgbffshcmjztzo.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_pBGQ5m5_2rzB8-5UTSdoVw_1oU5CCxA';

// Get config from env or fallback to provided credentials
export const getSupabaseConfig = () => {
  const env = (import.meta as unknown as { env?: Record<string, string> }).env || {};
  const url = env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  return { url, key };
};

const config = getSupabaseConfig();

// Initialize the client
export const supabase: SupabaseClient = createClient(config.url, config.key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface SupabaseHealthStatus {
  connected: boolean;
  projectUrl: string;
  projectId: string;
  latencyMs?: number;
  tables: {
    cars: boolean;
    bookings: boolean;
    inquiries: boolean;
  };
  error?: string | null;
  lastChecked: string;
}

/**
 * Health check to verify live connectivity to Supabase
 */
export const checkSupabaseConnection = async (): Promise<SupabaseHealthStatus> => {
  const startTime = Date.now();
  const status: SupabaseHealthStatus = {
    connected: false,
    projectUrl: config.url,
    projectId: SUPABASE_PROJECT_ID,
    tables: {
      cars: false,
      bookings: false,
      inquiries: false,
    },
    error: null,
    lastChecked: new Date().toLocaleTimeString(),
  };

  try {
    // Check cars table
    const { data: carsData, error: carsErr } = await supabase
      .from('cars')
      .select('id')
      .limit(1);

    if (!carsErr) {
      status.tables.cars = true;
      status.connected = true;
    } else if (carsErr.code !== 'PGRST116' && carsErr.code !== '42P01') {
      // 42P01 is table does not exist, other errors might still mean API is up
      status.connected = true;
    }

    // Check bookings table
    const { error: bookingsErr } = await supabase
      .from('bookings')
      .select('id')
      .limit(1);

    if (!bookingsErr) {
      status.tables.bookings = true;
      status.connected = true;
    }

    // Check inquiries table
    const { error: inquiriesErr } = await supabase
      .from('inquiries')
      .select('id')
      .limit(1);

    if (!inquiriesErr) {
      status.tables.inquiries = true;
      status.connected = true;
    }

    // If API responded without network error
    status.latencyMs = Date.now() - startTime;
    if (!status.connected && (carsErr || bookingsErr)) {
      // If error is table not created yet, Supabase is still connected!
      const errMessage = carsErr?.message || bookingsErr?.message || '';
      if (errMessage.includes('relation') || errMessage.includes('does not exist') || errMessage.includes('schema')) {
        status.connected = true;
        status.error = 'Connected! Tables need to be initialized in Supabase SQL editor.';
      } else {
        status.error = errMessage;
      }
    }

    return status;
  } catch (err: any) {
    status.latencyMs = Date.now() - startTime;
    status.error = err?.message || 'Network error connecting to Supabase';
    return status;
  }
};

/**
 * =================================================================
 * CARS SYNC OPERATIONS
 * =================================================================
 */

export const fetchCarsFromSupabase = async (): Promise<Car[] | null> => {
  try {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .order('year', { ascending: false });

    if (error) {
      console.warn('Supabase fetchCars notice:', error.message);
      return null;
    }

    if (data && data.length > 0) {
      // Transform data if needed to match interface
      return data.map((item) => ({
        ...item,
        userId: item.user_id,
        originalMsrp: item.original_msrp,
        vehicleType: item.vehicle_type,
        fuelType: item.fuel_type,
        zeroToSixty: item.zero_to_sixty,
        exteriorColor: item.exterior_color,
        interiorColor: item.interior_color,
        inspectionScore: item.inspection_score,
        previousOwners: item.previous_owners,
        carfaxClean: item.carfax_clean,
        topSpeed: item.top_speed,
        mpgOrRange: item.mpg_or_range,
        images: Array.isArray(item.images) ? item.images : (typeof item.images === 'string' ? JSON.parse(item.images) : []),
        features: Array.isArray(item.features) ? item.features : (typeof item.features === 'string' ? JSON.parse(item.features) : []),
      }));
    }
    return null;
  } catch (err) {
    console.warn('Supabase fetchCars error:', err);
    return null;
  }
};

export const upsertCarToSupabase = async (car: Car): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const currentUserId = authData?.user?.id;

    const payload: any = {
      id: car.id,
      make: car.make,
      model: car.model,
      year: car.year,
      price: car.price,
      original_msrp: car.originalMsrp,
      mileage: car.mileage,
      condition: car.condition,
      vehicle_type: car.vehicleType,
      fuel_type: car.fuelType,
      transmission: car.transmission,
      drivetrain: car.drivetrain,
      horsepower: car.horsepower,
      zero_to_sixty: car.zeroToSixty,
      exterior_color: car.exteriorColor,
      interior_color: car.interiorColor,
      vin: car.vin,
      available: car.available,
      featured: car.featured ?? false,
      images: car.images,
      features: car.features,
      inspection_score: car.inspectionScore,
      previous_owners: car.previousOwners,
      carfax_clean: car.carfaxClean,
      top_speed: car.topSpeed,
      mpg_or_range: car.mpgOrRange,
      updated_at: new Date().toISOString(),
    };

    if (car.userId || currentUserId) {
      payload.user_id = car.userId || currentUserId;
    }

    const { error } = await supabase
      .from('cars')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase upsertCar error:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
};

export const deleteCarFromSupabase = async (carId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('cars')
      .delete()
      .eq('id', carId);

    if (error) {
      console.warn('Supabase deleteCar error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
};

export const syncAllCarsToSupabase = async (cars: Car[]): Promise<{ count: number; error?: string }> => {
  let successCount = 0;
  for (const car of cars) {
    const res = await upsertCarToSupabase(car);
    if (res.success) successCount++;
  }
  return { count: successCount };
};

/**
 * =================================================================
 * BOOKINGS SYNC OPERATIONS
 * =================================================================
 */

export const fetchBookingsFromSupabase = async (): Promise<BookingAppointment[] | null> => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchBookings notice:', error.message);
      return null;
    }

    if (data && data.length > 0) {
      return data.map((item) => ({
        id: item.id,
        createdAt: item.created_at || item.createdAt || new Date().toISOString(),
        packageId: item.package_id || item.packageId,
        packageName: item.package_name || item.packageName,
        packagePrice: Number(item.package_price || item.packagePrice || 0),
        addonIds: Array.isArray(item.addon_ids) ? item.addon_ids : (item.addonIds || []),
        addonNames: Array.isArray(item.addon_names) ? item.addon_names : (item.addonNames || []),
        addonsTotal: Number(item.addons_total || item.addonsTotal || 0),
        totalPrice: Number(item.total_price || item.totalPrice || 0),
        date: item.date,
        timeSlot: item.time_slot || item.timeSlot,
        customerName: item.customer_name || item.customerName,
        customerPhone: item.customer_phone || item.customerPhone,
        customerEmail: item.customer_email || item.customerEmail,
        vehicleMake: item.vehicle_make || item.vehicleMake,
        vehicleModel: item.vehicle_model || item.vehicleModel,
        vehicleYear: item.vehicle_year || item.vehicleYear,
        vehicleType: item.vehicle_type || item.vehicleType,
        licensePlate: item.license_plate || item.licensePlate,
        vehicleColor: item.vehicle_color || item.vehicleColor,
        specialNotes: item.special_notes || item.specialNotes,
        status: item.status || 'Confirmed',
        bayNumber: Number(item.bay_number || item.bayNumber || 1),
      }));
    }
    return null;
  } catch (err) {
    console.warn('Supabase fetchBookings error:', err);
    return null;
  }
};

export const saveBookingToSupabase = async (booking: BookingAppointment): Promise<{ success: boolean; error?: string }> => {
  try {
    const payload = {
      id: booking.id,
      created_at: booking.createdAt,
      package_id: booking.packageId,
      package_name: booking.packageName,
      package_price: booking.packagePrice,
      addon_ids: booking.addonIds,
      addon_names: booking.addonNames,
      addons_total: booking.addonsTotal,
      total_price: booking.totalPrice,
      date: booking.date,
      time_slot: booking.timeSlot,
      customer_name: booking.customerName,
      customer_phone: booking.customerPhone,
      customer_email: booking.customerEmail,
      vehicle_make: booking.vehicleMake,
      vehicle_model: booking.vehicleModel,
      vehicle_year: booking.vehicleYear,
      vehicle_type: booking.vehicleType,
      license_plate: booking.licensePlate,
      vehicle_color: booking.vehicleColor,
      special_notes: booking.specialNotes || '',
      status: booking.status,
      bay_number: booking.bayNumber,
    };

    const { error } = await supabase
      .from('bookings')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase saveBooking notice:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
};

export const deleteBookingFromSupabase = async (bookingId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId);

    if (error) {
      console.warn('Supabase deleteBooking error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
};

/**
 * =================================================================
 * CUSTOMER INQUIRIES & TEST DRIVES
 * =================================================================
 */

export interface CustomerInquiry {
  id?: string;
  type: 'test_drive' | 'trade_in' | 'general' | 'vip_staging';
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  vehicleInterest?: string;
  preferredDate?: string;
  notes?: string;
  created_at?: string;
}

export const saveInquiryToSupabase = async (inquiry: CustomerInquiry): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('inquiries')
      .insert({
        type: inquiry.type,
        customer_name: inquiry.customerName,
        customer_email: inquiry.customerEmail,
        customer_phone: inquiry.customerPhone || '',
        vehicle_interest: inquiry.vehicleInterest || '',
        preferred_date: inquiry.preferredDate || '',
        notes: inquiry.notes || '',
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.warn('Supabase saveInquiry error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
};

/**
 * Ready-to-execute SQL Script for Supabase SQL Editor to initialize all tables
 */
export const getSupabaseSchemaSQL = (): string => {
  return `-- ================================================================
-- APEX MOTORS & AUTOSPA - SUPABASE POSTGRESQL SCHEMA
-- Project ID: isrmujbgbffshcmjztzo (car)
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/isrmujbgbffshcmjztzo/sql
-- ================================================================

-- 1. VEHICLE INVENTORY TABLE
CREATE TABLE IF NOT EXISTS public.cars (
  id TEXT PRIMARY KEY,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  original_msrp NUMERIC,
  mileage INTEGER NOT NULL,
  condition TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  fuel_type TEXT NOT NULL,
  transmission TEXT,
  drivetrain TEXT,
  horsepower INTEGER,
  zero_to_sixty TEXT,
  exterior_color TEXT,
  interior_color TEXT,
  vin TEXT,
  available BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  images JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  inspection_score INTEGER DEFAULT 150,
  previous_owners INTEGER DEFAULT 1,
  carfax_clean BOOLEAN DEFAULT true,
  top_speed INTEGER,
  mpg_or_range TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. AUTOSPA BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  package_id TEXT NOT NULL,
  package_name TEXT NOT NULL,
  package_price NUMERIC NOT NULL,
  addon_ids JSONB DEFAULT '[]'::jsonb,
  addon_names JSONB DEFAULT '[]'::jsonb,
  addons_total NUMERIC DEFAULT 0,
  total_price NUMERIC NOT NULL,
  date TEXT NOT NULL,
  time_slot TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  vehicle_make TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  vehicle_year TEXT,
  vehicle_type TEXT,
  license_plate TEXT,
  vehicle_color TEXT,
  special_notes TEXT,
  status TEXT DEFAULT 'Confirmed',
  bay_number INTEGER DEFAULT 1
);

-- 3. CUSTOMER INQUIRIES & TEST DRIVES
CREATE TABLE IF NOT EXISTS public.inquiries (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  vehicle_interest TEXT,
  preferred_date TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS) and grant public read/write permissions for demo
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on cars" ON public.cars FOR SELECT USING (true);
CREATE POLICY "Allow public insert on cars" ON public.cars FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on cars" ON public.cars FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on cars" ON public.cars FOR DELETE USING (true);

CREATE POLICY "Allow public read on bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Allow public insert on bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on bookings" ON public.bookings FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on bookings" ON public.bookings FOR DELETE USING (true);

CREATE POLICY "Allow public insert on inquiries" ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read on inquiries" ON public.inquiries FOR SELECT USING (true);

-- 4. USER PROPERTY LIKES (SAVED CARS)
CREATE TABLE IF NOT EXISTS public.property_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  car_id TEXT NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_user_car_like UNIQUE (user_id, car_id)
);

CREATE INDEX IF NOT EXISTS idx_property_likes_user_id ON public.property_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_property_likes_car_id ON public.property_likes(car_id);

ALTER TABLE public.property_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own property likes" 
  ON public.property_likes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own property likes" 
  ON public.property_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own property likes" 
  ON public.property_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);
`;
};

/**
 * =================================================================
 * SUPABASE AUTHENTICATION HELPERS
 * =================================================================
 */

export const getAuthUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
};

export const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: displayName || email.split('@')[0],
      },
    },
  });
  return { user: data?.user, session: data?.session, error: error?.message };
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { user: data?.user, session: data?.session, error: error?.message };
};

export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();
  return { error: error?.message };
};

/**
 * =================================================================
 * PROPERTY LIKES / SAVED VEHICLES HELPERS
 * =================================================================
 */

export const fetchUserLikedCarIds = async (): Promise<string[]> => {
  try {
    const user = await getAuthUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('property_likes')
      .select('car_id')
      .eq('user_id', user.id);

    if (error) {
      console.warn('fetchUserLikedCarIds error:', error.message);
      return [];
    }

    return data ? data.map((row: any) => row.car_id) : [];
  } catch (err) {
    console.warn('fetchUserLikedCarIds err:', err);
    return [];
  }
};

export const likeCarInSupabase = async (carId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const user = await getAuthUser();
    if (!user) {
      return { success: false, error: 'Please sign in to save vehicles to your profile.' };
    }

    const { error } = await supabase
      .from('property_likes')
      .insert({
        user_id: user.id,
        car_id: carId,
      });

    if (error) {
      // If duplicate key error, it's already liked
      if (error.code === '23505') {
        return { success: true };
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
};

export const unlikeCarInSupabase = async (carId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const user = await getAuthUser();
    if (!user) {
      return { success: false, error: 'Please sign in to manage saved vehicles.' };
    }

    const { error } = await supabase
      .from('property_likes')
      .delete()
      .eq('user_id', user.id)
      .eq('car_id', carId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
};

/**
 * =================================================================
 * USER LISTINGS HELPERS (My Listed Cars)
 * =================================================================
 */

export const fetchUserListings = async (): Promise<Car[]> => {
  try {
    const user = await getAuthUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('fetchUserListings error:', error.message);
      return [];
    }

    if (data && data.length > 0) {
      return data.map((item) => ({
        ...item,
        userId: item.user_id,
        originalMsrp: item.original_msrp,
        vehicleType: item.vehicle_type,
        fuelType: item.fuel_type,
        zeroToSixty: item.zero_to_sixty,
        exteriorColor: item.exterior_color,
        interiorColor: item.interior_color,
        inspectionScore: item.inspection_score,
        previousOwners: item.previous_owners,
        carfaxClean: item.carfax_clean,
        topSpeed: item.top_speed,
        mpgOrRange: item.mpg_or_range,
        images: Array.isArray(item.images) ? item.images : (typeof item.images === 'string' ? JSON.parse(item.images) : []),
        features: Array.isArray(item.features) ? item.features : (typeof item.features === 'string' ? JSON.parse(item.features) : []),
      }));
    }
    return [];
  } catch (err) {
    console.warn('fetchUserListings err:', err);
    return [];
  }
};

