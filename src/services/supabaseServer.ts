/**
 * Supabase Server Helper
 * Utilizes @supabase/server patterns for server-side auth verification and data handling.
 */
import { createClient } from '@supabase/supabase-js';

export const SUPABASE_CONFIG = {
  url: process.env.SUPABASE_URL || 'https://isrmujbgbffshcmjztzo.supabase.co',
  publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_pBGQ5m5_2rzB8-5UTSdoVw_1oU5CCxA',
  secretKey: process.env.SUPABASE_SECRET_KEY || '',
  jwksUrl: process.env.SUPABASE_JWKS_URL || 'https://isrmujbgbffshcmjztzo.supabase.co/auth/v1/.well-known/jwks.json',
};

/**
 * Creates a server-scoped Supabase client with secret key if present, or publishable key
 */
export const createServerSupabaseClient = (authHeader?: string) => {
  const key = SUPABASE_CONFIG.secretKey || SUPABASE_CONFIG.publishableKey;
  return createClient(SUPABASE_CONFIG.url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: authHeader
      ? {
          headers: {
            Authorization: authHeader,
          },
        }
      : undefined,
  });
};
