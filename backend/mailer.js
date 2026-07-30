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
 * Sends order confirmation emails with product images to customer and admin
 * @param {Object} order - The created order object
 */
export const sendOrderEmails = async (order) => {
  if (!BREVO_API_KEY) {
    console.log('⚠️ BREVO_API_KEY not configured. Skipping order notification emails.');
    return;
  }

  console.log(`📧 Triggering instant Brevo emails with product photos for order ${order.orderId}...`);

  const adminEmail = EMAIL_USER; // Send admin notifications to nushmeera4@gmail.com
  const customerEmail = order.customerDetails?.email;
  const customerName = order.customerDetails?.name || order.customerDetails?.firstName || 'Valued Customer';
  const customerPhone = order.customerDetails?.phone || 'N/A';
  const customerAddress = order.customerDetails?.address || '';
  const customerCity = order.customerDetails?.city || '';
  const cleanPhone = customerPhone.replace(/\D/g, ''); // Clean digits for WhatsApp link

  // Format cart items with Product Photos & Sizes
  const itemsHtml = (order.cartItems || []).map(item => {
    let imgUrl = (item.images && item.images[0]) ? item.images[0] : '/images/hero_banner.webp';
    if (!imgUrl.startsWith('http')) {
      imgUrl = `https://nushmeera.store${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`;
    }
    const size = item.selectedSize || item.size || 'Medium';

    return `
      <tr style="border-bottom: 1px solid #eeeeee;">
        <td style="padding: 12px; width: 70px; text-align: center;">
          <img src="${imgUrl}" alt="${item.title}" style="width: 60px; height: 75px; object-fit: cover; border-radius: 6px; border: 1px solid #e0e0e0; display: block;" />
        </td>
        <td style="padding: 12px; vertical-align: middle;">
          <div style="font-weight: 600; color: #111111; font-size: 14px; margin-bottom: 4px;">${item.title}</div>
          <div style="color: #666666; font-size: 12px;">Size: <span style="font-weight: 600; color: #333333;">${size}</span> | Qty: <span style="font-weight: 600; color: #333333;">${item.quantity}</span></div>
        </td>
        <td style="padding: 12px; text-align: right; vertical-align: middle; font-weight: 700; color: #0f3d33; font-size: 14px;">
          Rs. ${(item.price * item.quantity).toLocaleString()}
        </td>
      </tr>
    `;
  }).join('');

  // 1. ADMIN EMAIL HTML
  const adminHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px;">
      <div style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
        
        <!-- Header Banner -->
        <div style="background-color: #0f3d33; padding: 25px 30px; text-align: center;">
          <h1 style="color: #D4AF37; margin: 0; font-size: 24px; letter-spacing: 0.15em; font-family: Georgia, serif; text-transform: uppercase;">NUSHMEERA CLOTHES</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0 0; font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase;">ADMIN ORDER NOTIFICATION</p>
        </div>

        <!-- Content Body -->
        <div style="padding: 30px;">
          <div style="background-color: #fff8e6; border: 1px solid #ffeeba; border-radius: 8px; padding: 15px 20px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #856404; font-weight: 700; display: block;">STATUS: PENDING DISPATCH</span>
              <span style="font-size: 20px; font-weight: 800; color: #0f3d33; font-family: monospace;">${order.orderId}</span>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 12px; color: #856404; display: block;">COD Total</span>
              <span style="font-size: 22px; font-weight: 800; color: #D4AF37;">Rs. ${Number(order.totalAmount).toLocaleString()}</span>
            </div>
          </div>

          <!-- Customer Details Card -->
          <h3 style="color: #0f3d33; margin: 0 0 12px 0; font-size: 16px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #0f3d33; padding-bottom: 6px; display: inline-block;">👤 Customer Information</h3>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 25px; font-size: 14px; line-height: 1.6; color: #334155;">
            <p style="margin: 0 0 6px 0;"><strong>Name:</strong> ${customerName}</p>
            <p style="margin: 0 0 6px 0;"><strong>Phone:</strong> <a href="tel:${customerPhone}" style="color: #0f3d33; text-decoration: none; font-weight: 600;">${customerPhone}</a></p>
            <p style="margin: 0 0 6px 0;"><strong>Email:</strong> ${customerEmail ? `<a href="mailto:${customerEmail}" style="color: #0f3d33;">${customerEmail}</a>` : '<span style="color: #94a3b8;">Not Provided</span>'}</p>
            <p style="margin: 0;"><strong>Delivery Address:</strong> ${customerAddress}, ${customerCity}</p>
          </div>

          <!-- WhatsApp Action Button -->
          ${cleanPhone ? `
            <div style="margin-bottom: 25px; text-align: center;">
              <a href="https://wa.me/${cleanPhone.startsWith('92') ? cleanPhone : '92' + cleanPhone.replace(/^0/, '')}?text=Hi%20${encodeURIComponent(customerName)},%20thank%20you%20for%20your%20order%20${order.orderId}%20at%20Nushmeera%20Clothes!" style="background-color: #25D366; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(37,211,102,0.3);">
                💬 Contact Customer on WhatsApp
              </a>
            </div>
          ` : ''}

          <!-- Ordered Products Table -->
          <h3 style="color: #0f3d33; margin: 0 0 12px 0; font-size: 16px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #0f3d33; padding-bottom: 6px; display: inline-block;">🛍️ Ordered Products</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Financial Total -->
          <div style="background-color: #0f3d33; color: #ffffff; border-radius: 8px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 14px; letter-spacing: 0.05em; text-transform: uppercase;">Total Cash to Collect:</span>
            <span style="font-size: 22px; font-weight: 800; color: #D4AF37;">Rs. ${Number(order.totalAmount).toLocaleString()}</span>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
          Nushmeera Clothes Automated Notification System
        </div>
      </div>
    </body>
    </html>
  `;

  // 2. CUSTOMER EMAIL HTML
  const customerHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px;">
      <div style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
        
        <!-- Header Banner -->
        <div style="background-color: #0f3d33; padding: 30px; text-align: center;">
          <h1 style="color: #D4AF37; margin: 0; font-size: 26px; letter-spacing: 0.15em; font-family: Georgia, serif; text-transform: uppercase;">NUSHMEERA CLOTHES</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0 0; font-size: 12px; letter-spacing: 0.25em; text-transform: uppercase;">EVERYDAY LUXURY FASHION</p>
        </div>

        <!-- Content Body -->
        <div style="padding: 30px;">
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="width: 50px; height: 50px; background-color: #d4edda; color: #155724; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 12px;">✓</div>
            <h2 style="color: #0f3d33; margin: 0 0 8px 0; font-size: 22px;">Thank You For Your Order!</h2>
            <p style="color: #64748b; margin: 0; font-size: 14px;">Hi <strong>${customerName}</strong>, we have received your order and are preparing it for dispatch.</p>
          </div>

          <!-- Order Reference Box -->
          <div style="background-color: #faf9f6; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px 20px; margin-bottom: 25px; text-align: center;">
            <span style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 4px;">ORDER REFERENCE NUMBER</span>
            <span style="font-size: 20px; font-weight: 800; color: #0f3d33; font-family: monospace;">${order.orderId}</span>
          </div>

          <!-- Ordered Products Table -->
          <h3 style="color: #0f3d33; margin: 0 0 12px 0; font-size: 15px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #0f3d33; padding-bottom: 6px; display: inline-block;">🛍️ Your Items</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Shipping Summary Card -->
          <h3 style="color: #0f3d33; margin: 0 0 12px 0; font-size: 15px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #0f3d33; padding-bottom: 6px; display: inline-block;">📍 Shipping & Delivery Details</h3>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 25px; font-size: 14px; line-height: 1.6; color: #334155;">
            <p style="margin: 0 0 6px 0;"><strong>Recipient:</strong> ${customerName}</p>
            <p style="margin: 0 0 6px 0;"><strong>Phone:</strong> ${customerPhone}</p>
            <p style="margin: 0 0 6px 0;"><strong>Address:</strong> ${customerAddress}, ${customerCity}</p>
            <p style="margin: 0; color: #0f3d33; font-weight: 600;"><strong>Payment Method:</strong> Cash On Delivery (COD)</p>
          </div>

          <!-- Total Amount Box -->
          <div style="background-color: #0f3d33; color: #ffffff; border-radius: 8px; padding: 18px 20px; text-align: center; margin-bottom: 25px;">
            <span style="font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.9; display: block; margin-bottom: 4px;">Total Payable Upon Delivery</span>
            <span style="font-size: 26px; font-weight: 800; color: #D4AF37;">Rs. ${Number(order.totalAmount).toLocaleString()}</span>
          </div>

          <!-- Customer Support Contact -->
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 13px; color: #64748b; text-align: center; line-height: 1.5;">
            Need help with your order? Contact us on WhatsApp at <strong style="color: #0f3d33;">+92 308 6195677</strong> or reply directly to this email.
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #0f3d33; padding: 20px; text-align: center; font-size: 12px; color: rgba(255,255,255,0.7);">
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
