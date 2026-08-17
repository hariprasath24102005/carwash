/**
 * Gmail Service - Handles Gmail API interactions
 * This service manages sending emails and retrieving messages.
 * Requires prior OAuth authentication via gmailAuth.ts
 */

import { getAccessToken } from './gmailAuth';

export interface GmailMessageItem {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  snippet: string;
  date: string;
}

export interface BookingEmailDetails {
  bookingId: string;
  packageName: string;
  date: string;
  timeSlot: string;
  vehicleSummary: string;
  totalPrice: number;
  bayNumber: number;
}

/**
 * Send a Gmail message via the Gmail API
 * Requires prior OAuth authentication via googleSignIn()
 */
export async function sendGmailMessage(
  to: string,
  subject: string,
  htmlBody: string
): Promise<string> {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error('Gmail not authenticated. Please click "Re-Authorize Google" first.');
    }

    // In production, this would call your backend API that uses the Gmail API
    // Backend would safely store and refresh OAuth tokens
    // For now, we throw to trigger the demo fallback in the component
    throw new Error('Gmail API not configured. Please set up Google OAuth credentials and a backend service.');
  } catch (error) {
    throw error;
  }
}

/**
 * Send a branded booking confirmation email to a customer
 * Includes appointment details, vehicle info, and pricing
 */
export async function sendCustomerBookingEmail(
  customerEmail: string,
  customerName: string,
  bookingDetails: BookingEmailDetails
): Promise<string> {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error('Gmail not authenticated. Please click "Re-Authorize Google" first.');
    }

    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 28px;">Apex Motors & AutoSpa</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Booking Confirmation</p>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="font-size: 16px; margin-top: 0;">Hello <strong>${customerName}</strong>,</p>
          <p style="color: #64748b;">Your booking has been confirmed! Here are the details:</p>
          
          <div style="background: #f1f5f9; padding: 15px; border-left: 4px solid #0ea5e9; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Booking ID:</strong> #${bookingDetails.bookingId}</p>
            <p style="margin: 5px 0;"><strong>Package:</strong> ${bookingDetails.packageName}</p>
            <p style="margin: 5px 0;"><strong>Vehicle:</strong> ${bookingDetails.vehicleSummary}</p>
            <p style="margin: 5px 0;"><strong>Date & Time:</strong> ${bookingDetails.date} at ${bookingDetails.timeSlot}</p>
            <p style="margin: 5px 0;"><strong>Assigned Bay:</strong> Bay #${bookingDetails.bayNumber}</p>
            <p style="margin: 5px 0; font-size: 18px; color: #10b981;"><strong>Total Price: $${bookingDetails.totalPrice}</strong></p>
          </div>

          <p style="color: #64748b; margin: 20px 0;">If you need to reschedule or have any questions, please reply to this email or contact us at (800) 555-APEX.</p>

          <p style="color: #64748b; margin-top: 30px; margin-bottom: 0;">Best regards,<br/><strong>Apex Motors & Concourse Detailing Team</strong></p>
        </div>

        <div style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px;">
          <p>100 Performance Way, Silicon Valley, CA 94025<br/>(800) 555-APEX | support@apexmotors.com</p>
        </div>
      </div>
    `;

    throw new Error('Gmail API not configured. Please set up Google OAuth credentials and a backend service.');
  } catch (error) {
    throw error;
  }
}

/**
 * Send a 2FA verification PIN via Gmail
 * Used for admin login security verification
 */
export async function sendAdminLoginVerificationCode(
  adminEmail: string,
  pin: string,
  adminUsername: string
): Promise<string> {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error('Gmail not authenticated. Please click "Re-Authorize Google" first.');
    }

    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0f172a; color: white; padding: 30px; border-radius: 12px; text-align: center;">
          <h1 style="margin: 0;">Apex Security Operations</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.8;">Admin Login Verification</p>
        </div>

        <div style="background: white; padding: 30px; margin-top: 20px; text-align: center;">
          <p style="color: #64748b; margin-bottom: 20px;">Hello <strong>${adminUsername}</strong>,</p>
          <p style="color: #64748b; margin-bottom: 30px;">Your login verification code is:</p>
          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="font-size: 32px; font-weight: bold; color: #0ea5e9; margin: 0; letter-spacing: 5px;">${pin}</p>
            <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 12px;">This code expires in 10 minutes</p>
          </div>
          <p style="color: #ef4444; font-size: 12px;">Do not share this code with anyone.</p>
        </div>
      </div>
    `;

    throw new Error('Gmail API not configured. Please set up Google OAuth credentials and a backend service.');
  } catch (error) {
    throw error;
  }
}

/**
 * Retrieve recent Gmail messages
 * Fetches up to `limit` messages from the authenticated user's inbox
 */
export async function listRecentGmailMessages(
  limit: number = 10
): Promise<GmailMessageItem[]> {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error('Gmail not authenticated. Please click "Re-Authorize Google" first.');
    }

    // In production, this would call the Gmail API to fetch actual messages
    // For now, throw to trigger demo fallback
    throw new Error('Gmail API not configured. Please set up Google OAuth credentials and a backend service.');
  } catch (error) {
    throw error;
  }
}