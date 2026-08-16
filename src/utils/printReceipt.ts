import { BookingAppointment } from '../types';

/**
 * Robust Receipt Printer & PDF Generator for Apex Motors & AutoSpa
 * Handles both iframe-restricted environments and popup-blocked browsers.
 */
export function generateReceiptHTML(booking: BookingAppointment): string {
  const formattedDate = new Date(booking.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const createdDate = new Date(booking.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Apex AutoSpa Receipt - ${booking.id}</title>
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    body {
      background-color: #f8fafc;
      color: #0f172a;
      padding: 30px;
      display: flex;
      justify-content: center;
    }
    .receipt-container {
      background: #ffffff;
      width: 100%;
      max-width: 680px;
      padding: 36px;
      border-radius: 16px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .brand-logo {
      font-size: 22px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #0f172a;
      text-transform: uppercase;
    }
    .brand-badge {
      background: #2563eb;
      color: #fff;
      font-size: 10px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 4px;
      letter-spacing: 1px;
      margin-left: 6px;
    }
    .tagline {
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
    }
    .receipt-meta {
      text-align: right;
    }
    .receipt-id {
      font-family: monospace;
      font-size: 15px;
      font-weight: 800;
      color: #2563eb;
      background: #eff6ff;
      padding: 4px 10px;
      border-radius: 6px;
      display: inline-block;
    }
    .receipt-date {
      font-size: 11px;
      color: #64748b;
      margin-top: 6px;
    }
    .status-badge {
      display: inline-block;
      margin-top: 6px;
      padding: 3px 10px;
      border-radius: 9999px;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      background: #dcfce7;
      color: #15803d;
    }
    .section-title {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #64748b;
      margin-bottom: 10px;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }
    .info-card {
      background: #f8fafc;
      padding: 14px;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
    }
    .info-label {
      font-size: 11px;
      color: #64748b;
      margin-bottom: 2px;
    }
    .info-value {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
    }
    .item-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    .item-table th {
      text-align: left;
      font-size: 11px;
      font-weight: 800;
      color: #64748b;
      text-transform: uppercase;
      padding: 10px 12px;
      background: #f1f5f9;
      border-radius: 6px;
    }
    .item-table td {
      padding: 12px;
      font-size: 13px;
      border-bottom: 1px solid #f1f5f9;
    }
    .item-table tr:last-child td {
      border-bottom: none;
    }
    .text-right {
      text-align: right !important;
    }
    .total-box {
      background: #0f172a;
      color: white;
      padding: 18px 24px;
      border-radius: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .total-title {
      font-size: 14px;
      font-weight: 700;
    }
    .total-amount {
      font-size: 26px;
      font-weight: 900;
      color: #60a5fa;
    }
    .notes-box {
      background: #fdf2f8;
      border: 1px dashed #f472b6;
      border-radius: 10px;
      padding: 12px;
      font-size: 11px;
      color: #831843;
      margin-bottom: 24px;
    }
    .footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #64748b;
    }
    .print-btn-bar {
      margin-bottom: 20px;
      text-align: right;
    }
    .btn-print {
      background: #2563eb;
      color: white;
      border: none;
      padding: 10px 20px;
      font-size: 13px;
      font-weight: 700;
      border-radius: 8px;
      cursor: pointer;
    }
    .btn-print:hover {
      background: #1d4ed8;
    }
    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }
      .receipt-container {
        border: none;
        box-shadow: none;
        padding: 0;
        max-width: 100%;
      }
      .print-btn-bar {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="print-btn-bar">
      <button class="btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
    </div>

    <div class="header">
      <div>
        <div class="brand-logo">
          Apex Motors <span class="brand-badge">AutoSpa</span>
        </div>
        <div class="tagline">100 Performance Way, Silicon Valley, CA 94025</div>
        <div class="tagline">Hotline: (800) 555-APEX • autospa@apexmotors.com</div>
      </div>
      <div class="receipt-meta">
        <div class="receipt-id">#${booking.id}</div>
        <div class="receipt-date">Issued: ${createdDate}</div>
        <div class="status-badge">${booking.status}</div>
      </div>
    </div>

    <div class="grid">
      <div class="info-card">
        <div class="section-title">Customer Information</div>
        <div class="info-value">${booking.customerName}</div>
        <div class="info-label" style="margin-top:4px;">📞 ${booking.customerPhone}</div>
        <div class="info-label">✉️ ${booking.customerEmail}</div>
      </div>

      <div class="info-card">
        <div class="section-title">Vehicle & Bay Assignment</div>
        <div class="info-value">${booking.vehicleYear} ${booking.vehicleMake} ${booking.vehicleModel}</div>
        <div class="info-label" style="margin-top:4px;">Type: ${booking.vehicleType} • Color: ${booking.vehicleColor}</div>
        <div class="info-label">License Plate: <strong>${booking.licensePlate}</strong> • <strong>Bay #${booking.bayNumber}</strong></div>
      </div>
    </div>

    <div class="grid" style="margin-bottom: 20px;">
      <div class="info-card">
        <div class="section-title">Scheduled Appointment</div>
        <div class="info-value" style="color:#2563eb;">📅 ${formattedDate}</div>
        <div class="info-label" style="font-size:13px; font-weight:700; color:#0f172a; margin-top:2px;">⏰ ${booking.timeSlot}</div>
      </div>

      <div class="info-card">
        <div class="section-title">Check-in Instructions</div>
        <div class="info-label">Please arrive 5 minutes before your time slot. Pull directly into Bay #${booking.bayNumber} and present this confirmation slip or code #${booking.id}.</div>
      </div>
    </div>

    <div class="section-title">Service & Enhancement Breakdown</div>
    <table class="item-table">
      <thead>
        <tr>
          <th>Service Item</th>
          <th>Category</th>
          <th class="text-right">Price</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${booking.packageName}</strong>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Vehicle Tier: ${booking.vehicleType}</div>
          </td>
          <td>Detailing Package</td>
          <td class="text-right" style="font-weight:700;">$${booking.packagePrice.toFixed(2)}</td>
        </tr>
        ${booking.addonNames && booking.addonNames.length > 0 ? booking.addonNames.map(addon => `
          <tr>
            <td>
              <span>+ ${addon}</span>
            </td>
            <td>Add-on Service</td>
            <td class="text-right" style="font-weight:600; color:#2563eb;">Included</td>
          </tr>
        `).join('') : ''}
        ${booking.addonsTotal > 0 ? `
          <tr>
            <td colspan="2" style="font-size: 12px; color: #475569;">Total Add-ons Surcharge</td>
            <td class="text-right" style="font-weight:700;">$${booking.addonsTotal.toFixed(2)}</td>
          </tr>
        ` : ''}
      </tbody>
    </table>

    <div class="total-box">
      <div>
        <div class="total-title">Total Amount Due at Bay</div>
        <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Sales Tax & Ceramic Materials Included</div>
      </div>
      <div class="total-amount">$${booking.totalPrice.toFixed(2)}</div>
    </div>

    ${booking.specialNotes ? `
      <div class="notes-box">
        <strong>Customer Special Instructions:</strong> ${booking.specialNotes}
      </div>
    ` : ''}

    <div class="footer">
      <div>Thank you for choosing Apex Motors & Luxury AutoSpa!</div>
      <div>150-Point Certified Standard • Silicon Valley, CA</div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Opens a print-friendly document in a new window and triggers print automatically.
 * If blocked by browser popups, safely triggers an HTML file download or fallback iframe.
 */
export function printBookingReceipt(booking: BookingAppointment): void {
  const htmlContent = generateReceiptHTML(booking);

  try {
    const printWindow = window.open('', '_blank', 'width=800,height=900,menubar=no,toolbar=no,location=no,status=no');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Allow styles to render before triggering print
      printWindow.onload = () => {
        try {
          printWindow.focus();
          printWindow.print();
        } catch (e) {
          console.warn('Auto print trigger prevented, print button available on page.', e);
        }
      };
      return;
    }
  } catch (err) {
    console.warn('Popup window was blocked, falling back to iframe print', err);
  }

  // Fallback 1: Hidden iframe print
  try {
    const existingIframe = document.getElementById('print-receipt-iframe');
    if (existingIframe) {
      existingIframe.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'print-receipt-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (printErr) {
          downloadReceiptHTML(booking);
        }
      }, 500);
      return;
    }
  } catch (iframeErr) {
    console.warn('Iframe printing failed, downloading file directly', iframeErr);
  }

  // Fallback 2: Direct HTML Receipt Download
  downloadReceiptHTML(booking);
}

/**
 * Downloads the printable HTML receipt directly to user's device.
 */
export function downloadReceiptHTML(booking: BookingAppointment): void {
  const htmlContent = generateReceiptHTML(booking);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Apex_Receipt_${booking.id}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
