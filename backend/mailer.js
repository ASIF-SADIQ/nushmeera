import dotenv from 'dotenv';
dotenv.config();

const EMAIL_USER = process.env.EMAIL_USER || 'nushmeera4@gmail.com';
const BREVO_API_KEY = process.env.BREVO_API_KEY;

/**
 * Helper function to send email via Brevo REST API v3
 */
const sendBrevoEmail = async ({ to, subject, htmlContent, senderName = 'Nushmeera Clothes' }) => {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': BREVO_API_KEY,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: { name: senderName, email: EMAIL_USER },
      to: Array.isArray(to) ? to : [{ email: to }],
      subject: subject,
      htmlContent: htmlContent
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Brevo API error');
  }
  return data;
};

/**
 * Sends luxury order confirmation emails with product images to customer and admin
 * @param {Object} order - The created order object
 */
export const sendOrderEmails = async (order) => {
  if (!BREVO_API_KEY) {
    console.log('⚠️ BREVO_API_KEY not configured. Skipping order notification emails.');
    return;
  }

  console.log(`📧 Triggering luxury Brevo emails with product photos for order ${order.orderId}...`);

  const adminEmail = EMAIL_USER; // Send admin notifications to nushmeera4@gmail.com
  const customerEmail = order.customerDetails?.email;
  const customerName = order.customerDetails?.name || order.customerDetails?.firstName || 'Valued Customer';
  const customerPhone = order.customerDetails?.phone || 'N/A';
  const customerAddress = order.customerDetails?.address || '';
  const customerCity = order.customerDetails?.city || '';
  const cleanPhone = customerPhone.replace(/\D/g, ''); // Clean digits for WhatsApp link
  const orderDate = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  // Format cart items with Product Photos, Sizes, and Prices
  const itemsHtml = (order.cartItems || []).map(item => {
    let imgUrl = (item.images && item.images[0]) ? item.images[0] : '/images/hero_banner.webp';
    if (!imgUrl.startsWith('http')) {
      imgUrl = `https://nushmeera.store${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`;
    }
    const size = item.selectedSize || item.size || 'Standard';

    return `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 14px 10px; width: 70px; text-align: center; vertical-align: middle;">
          <img src="${imgUrl}" alt="${item.title}" style="width: 64px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0; display: block; box-shadow: 0 2px 6px rgba(0,0,0,0.06);" />
        </td>
        <td style="padding: 14px 12px; vertical-align: middle;">
          <div style="font-weight: 700; color: #0f172a; font-size: 15px; margin-bottom: 5px; line-height: 1.3;">${item.title}</div>
          <div style="color: #64748b; font-size: 13px;">
            <span style="background-color: #0f3d33; color: #ffffff; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; display: inline-block; margin-right: 6px; letter-spacing: 0.05em;">${size}</span>
            <span>Qty: <strong style="color: #0f172a;">${item.quantity}</strong></span>
          </div>
        </td>
        <td style="padding: 14px 10px; text-align: right; vertical-align: middle; font-weight: 800; color: #0f3d33; font-size: 15px;">
          Rs. ${(item.price * item.quantity).toLocaleString()}
        </td>
      </tr>
    `;
  }).join('');

  // 1. ELEGANT ADMIN EMAIL TEMPLATE
  const adminHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order ${order.orderId}</title>
    </head>
    <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 10px; color: #1e293b;">
      <div style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 15px 35px rgba(0,0,0,0.07); border: 1px solid #e2e8f0;">
        
        <!-- Header Banner -->
        <div style="background-color: #0f3d33; padding: 32px 25px; text-align: center; border-bottom: 3px solid #D4AF37;">
          <h1 style="color: #D4AF37; margin: 0; font-size: 24px; letter-spacing: 0.2em; font-family: Georgia, serif; text-transform: uppercase; font-weight: 700;">NUSHMEERA CLOTHES</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0 0; font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase;">ADMIN ORDER MANAGEMENT</p>
        </div>

        <!-- Content Area -->
        <div style="padding: 28px 25px;">
          
          <!-- Order Header Badge -->
          <div style="background: linear-gradient(135deg, #0f3d33 0%, #1a5647 100%); border-radius: 12px; padding: 20px 24px; color: #ffffff; margin-bottom: 25px; box-shadow: 0 4px 15px rgba(15,61,51,0.12);">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td>
                  <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #D4AF37; font-weight: 700; display: block; margin-bottom: 4px;">ORDER REFERENCE</span>
                  <span style="font-size: 22px; font-weight: 800; font-family: 'Courier New', monospace; letter-spacing: 0.05em;">${order.orderId}</span>
                </td>
                <td style="text-align: right;">
                  <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: rgba(255,255,255,0.7); display: block; margin-bottom: 4px;">TOTAL AMOUNT (COD)</span>
                  <span style="font-size: 24px; font-weight: 800; color: #D4AF37;">Rs. ${Number(order.totalAmount).toLocaleString()}</span>
                </td>
              </tr>
            </table>
          </div>

          <!-- Customer Shipping Details Card -->
          <div style="margin-bottom: 28px;">
            <h3 style="color: #0f3d33; margin: 0 0 14px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 800;">👤 Customer Information</h3>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; font-size: 14px; line-height: 1.7; color: #334155;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 4px 0; width: 120px; color: #64748b; font-weight: 600;">Customer Name:</td>
                  <td style="padding: 4px 0; font-weight: 700; color: #0f172a;">${customerName}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b; font-weight: 600;">Mobile Number:</td>
                  <td style="padding: 4px 0; font-weight: 700; color: #0f3d33;"><a href="tel:${customerPhone}" style="color: #0f3d33; text-decoration: none;">${customerPhone}</a></td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b; font-weight: 600;">Email Address:</td>
                  <td style="padding: 4px 0; font-weight: 600; color: #0f172a;">${customerEmail ? `<a href="mailto:${customerEmail}" style="color: #0f3d33;">${customerEmail}</a>` : '<span style="color: #94a3b8;">Not Provided</span>'}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b; font-weight: 600; vertical-align: top;">Delivery Address:</td>
                  <td style="padding: 4px 0; font-weight: 600; color: #0f172a;">${customerAddress}, ${customerCity}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b; font-weight: 600;">Date Placed:</td>
                  <td style="padding: 4px 0; color: #64748b;">${orderDate}</td>
                </tr>
              </table>
            </div>
          </div>

          <!-- Direct Admin Action Buttons -->
          ${cleanPhone ? `
            <div style="margin-bottom: 28px; text-align: center; display: flex; gap: 12px; justify-content: center;">
              <a href="https://wa.me/${cleanPhone.startsWith('92') ? cleanPhone : '92' + cleanPhone.replace(/^0/, '')}?text=Hi%20${encodeURIComponent(customerName)},%20thank%20you%20for%20your%20order%20${order.orderId}%20at%20Nushmeera%20Clothes!" style="background-color: #25D366; color: #ffffff; text-decoration: none; padding: 12px 22px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(37,211,102,0.25);">
                💬 WhatsApp Customer
              </a>
              <a href="tel:${customerPhone}" style="background-color: #0f3d33; color: #ffffff; text-decoration: none; padding: 12px 22px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block; margin-left: 10px;">
                📞 Call Customer
              </a>
            </div>
          ` : ''}

          <!-- Ordered Products Section -->
          <div style="margin-bottom: 28px;">
            <h3 style="color: #0f3d33; margin: 0 0 14px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 800;">🛍️ Ordered Outfits</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <!-- Total COD Box -->
          <div style="background-color: #0f3d33; color: #ffffff; border-radius: 12px; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600;">Total Cash to Collect (COD):</span>
            <span style="font-size: 22px; font-weight: 800; color: #D4AF37;">Rs. ${Number(order.totalAmount).toLocaleString()}</span>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #f1f5f9; padding: 18px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
          Nushmeera Clothes Automated Order Dispatch Notification System
        </div>
      </div>
    </body>
    </html>
  `;

  // 2. ELEGANT CUSTOMER EMAIL TEMPLATE
  const customerHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - Nushmeera Clothes</title>
    </head>
    <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 10px; color: #1e293b;">
      <div style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 15px 35px rgba(0,0,0,0.07); border: 1px solid #e2e8f0;">
        
        <!-- Header Banner -->
        <div style="background-color: #0f3d33; padding: 35px 25px; text-align: center; border-bottom: 3px solid #D4AF37;">
          <h1 style="color: #D4AF37; margin: 0; font-size: 26px; letter-spacing: 0.2em; font-family: Georgia, serif; text-transform: uppercase; font-weight: 700;">NUSHMEERA CLOTHES</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0 0; font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase;">Luxury Pret & Couture</p>
        </div>

        <!-- Content Area -->
        <div style="padding: 32px 25px;">
          
          <!-- Thank You Message -->
          <div style="text-align: center; margin-bottom: 28px;">
            <div style="width: 56px; height: 56px; background-color: #d4edda; color: #155724; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 26px; margin-bottom: 14px; box-shadow: 0 4px 12px rgba(40,167,69,0.15);">✓</div>
            <h2 style="color: #0f3d33; margin: 0 0 8px 0; font-size: 24px; font-family: Georgia, serif;">Thank You For Your Order!</h2>
            <p style="color: #64748b; margin: 0; font-size: 15px; line-height: 1.5;">Hi <strong>${customerName}</strong>, we have received your Cash on Delivery order and our team is preparing your parcel for dispatch.</p>
          </div>

          <!-- Order Reference Box -->
          <div style="background-color: #faf9f6; border: 2px dashed #0f3d33; border-radius: 12px; padding: 16px 20px; margin-bottom: 28px; text-align: center;">
            <span style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.12em; display: block; margin-bottom: 4px; font-weight: 700;">YOUR ORDER REFERENCE NUMBER</span>
            <span style="font-size: 22px; font-weight: 800; color: #0f3d33; font-family: 'Courier New', monospace; letter-spacing: 0.05em;">${order.orderId}</span>
          </div>

          <!-- Ordered Outfits Table -->
          <div style="margin-bottom: 28px;">
            <h3 style="color: #0f3d33; margin: 0 0 14px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 800; border-bottom: 2px solid #0f3d33; padding-bottom: 6px; display: inline-block;">🛍️ Your Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <!-- Delivery Address Summary -->
          <div style="margin-bottom: 28px;">
            <h3 style="color: #0f3d33; margin: 0 0 14px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 800; border-bottom: 2px solid #0f3d33; padding-bottom: 6px; display: inline-block;">📍 Shipping & Delivery Details</h3>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; font-size: 14px; line-height: 1.7; color: #334155;">
              <p style="margin: 0 0 6px 0;"><strong>Recipient:</strong> ${customerName}</p>
              <p style="margin: 0 0 6px 0;"><strong>Mobile Number:</strong> ${customerPhone}</p>
              <p style="margin: 0 0 6px 0;"><strong>Delivery Address:</strong> ${customerAddress}, ${customerCity}</p>
              <p style="margin: 0; color: #0f3d33; font-weight: 700;"><strong>Payment Method:</strong> Cash On Delivery (COD)</p>
            </div>
          </div>

          <!-- Total Amount Box -->
          <div style="background-color: #0f3d33; color: #ffffff; border-radius: 12px; padding: 20px 24px; text-align: center; margin-bottom: 28px; box-shadow: 0 6px 20px rgba(15,61,51,0.15);">
            <span style="font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.9; display: block; margin-bottom: 4px;">Total Payable Upon Delivery</span>
            <span style="font-size: 28px; font-weight: 800; color: #D4AF37;">Rs. ${Number(order.totalAmount).toLocaleString()}</span>
          </div>

          <!-- Support Line -->
          <div style="border-top: 1px solid #e2e8f0; padding-top: 22px; font-size: 13px; color: #64748b; text-align: center; line-height: 1.6;">
            Need help or want to track your order? Contact us on WhatsApp at <strong style="color: #0f3d33;">+92 308 6195677</strong> or reply directly to this email.
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #0f3d33; padding: 22px; text-align: center; font-size: 12px; color: rgba(255,255,255,0.75);">
          © 2026 Nushmeera Clothes. All rights reserved.<br>
          Everyday Luxury Pakistani Lawn & Pret Outfits.
        </div>
      </div>
    </body>
    </html>
  `;

  // Trigger Brevo API Emails
  try {
    // Send to Admin
    const adminRes = await sendBrevoEmail({
      to: adminEmail,
      subject: `🚨 NEW ORDER: ${order.orderId} - Rs. ${Number(order.totalAmount).toLocaleString()}`,
      htmlContent: adminHtml,
      senderName: 'Nushmeera Orders'
    });
    console.log(`✅ Brevo Admin email sent for order ${order.orderId}:`, adminRes.messageId);

    // Send to Customer (if customer email provided)
    if (customerEmail) {
      const custRes = await sendBrevoEmail({
        to: customerEmail,
        subject: `Order Confirmation - ${order.orderId} | Nushmeera Clothes`,
        htmlContent: customerHtml,
        senderName: 'Nushmeera Clothes'
      });
      console.log(`✅ Brevo Customer email sent to ${customerEmail}:`, custRes.messageId);
    }
  } catch (error) {
    console.error('❌ Brevo Email Delivery Error:', error.message);
  }
};
