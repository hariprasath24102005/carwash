import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  Inbox, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  User, 
  Clock, 
  LogOut,
  Layers,
  Phone,
  Copy,
  Check
} from 'lucide-react';
import { BookingAppointment } from '../types';
import { 
  sendGmailMessage, 
  sendCustomerBookingEmail, 
  sendAdminLoginVerificationCode, 
  listRecentGmailMessages, 
  GmailMessageItem 
} from '../services/gmailService';
import { googleSignIn, googleLogout, getAccessToken } from '../services/gmailAuth';

interface GmailHubSectionProps {
  bookings: BookingAppointment[];
  adminUsername: string;
  adminGmail: string;
  onAdminGmailChange: (email: string) => void;
}

export const GmailHubSection: React.FC<GmailHubSectionProps> = ({
  bookings,
  adminUsername,
  adminGmail,
  onAdminGmailChange
}) => {
  /**
 * Gmail Authentication Service
 * Handles Google OAuth 2.0 flow for Gmail API access
 */

const GOOGLE_CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID || '';
const GOOGLE_REDIRECT_URI = `${window.location.origin}/auth/callback`;

/**
 * Initiate Google OAuth sign-in flow
 */
export async function googleSignIn(): Promise<string> {
  try {
    // Check if Google API client library is loaded
    if (typeof (window as any).google === 'undefined') {
      throw new Error('Google API client not loaded. Add Google Sign-In script to your HTML.');
    }

    // In a real implementation, this would use Google's OAuth 2.0 library
    // to open the consent screen and get an access token
    
    // For now, check if token is stored
    const existingToken = localStorage.getItem('google_access_token');
    if (existingToken) {
      return existingToken;
    }

    throw new Error(
      'Google OAuth not configured. To enable Gmail integration:\n' +
      '1. Set up Google Cloud Console OAuth 2.0 credentials\n' +
      '2. Add VITE_GOOGLE_CLIENT_ID to your .env.local\n' +
      '3. Implement the OAuth consent screen'
    );
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

/**
 * Sign out from Google and clear access token
 */
export async function googleLogout(): Promise<void> {
  try {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_user_info');

    // In a real implementation, would also sign out from Google API
    if (typeof (window as any).google !== 'undefined') {
      (window as any).google.accounts.id.revoke('', () => {
        console.log('Google Sign-Out complete');
      });
    }
  } catch (error) {
    console.error('Google Sign-Out Error:', error);
  }
}

/**
 * Get stored access token
 */
export function getAccessToken(): string | null {
  return localStorage.getItem('google_access_token');
}

/**
 * Store access token after successful OAuth flow
 */
export function setAccessToken(token: string): void {
  localStorage.setItem('google_access_token', token);
}

/**
 * Check if user is authenticated with Google
 */
export function isGoogleAuthenticated(): boolean {
  return !!getAccessToken();
}