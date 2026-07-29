import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const EMAIL_USER = process.env.EMAIL_USER || 'nushmeera4@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'mldqbcasitpxttkd';

// Initialize the transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

/**
 * Sends order confirmation emails to the customer and admin
 * @param {Object} order - The created order object
 */
export const sendOrderEmails = async (order) => {
  console.log(`📧 Triggering order emails for order ${order.orderId}...`);

  const adminEmail = EMAIL_USER; // Send admin notifications to nushmeera4@gmail.com
  const customerEmail = order.customerDetails?.email;
  const customerName = order.customerDetails?.name || order.customerDetails?.firstName || 'Valued Customer';
  
  if (!customerEmail) {
    console.log(`⚠️ No email provided for order ${order.orderId}. Skipping customer email.`);
  }

  // Format cart items
  const itemsHtml = (order.cartItems || []).map(item => 
    `<li style="padding: 6px 0; border-bottom: 1px dashed #eee;"><strong>${item.quantity}x</strong> ${item.title} (${item.size || 'Standard'}) - <strong>Rs. ${item.price}</strong></li>`
  ).join('');

  // 1. Admin Email Options
  const adminMailOptions = {
    from: `"Nushmeera Orders" <${EMAIL_USER}>`,
    to: adminEmail,
    subject: `🚨 New Order Received: ${order.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #0f3d33; margin-top: 0;">🎉 New Order Received!</h2>
        <p><strong>Order ID:</strong> ${order.orderId}</p>
        <p><strong>Total Amount:</strong> <span style="font-size: 1.2em; color: #D4AF37;">Rs. ${order.totalAmount}</span></p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;" />

        <h3 style="color: #0f3d33;">Customer Information</h3>
        <p><strong>Name:</strong> ${customerName}</p>
        <p><strong>Email:</strong> ${customerEmail || 'N/A'}</p>
        <p><strong>Phone:</strong> ${order.customerDetails?.phone}</p>
        <p><strong>Shipping Address:</strong> ${order.customerDetails?.address}, ${order.customerDetails?.city}</p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;" />

        <h3 style="color: #0f3d33;">Ordered Items</h3>
        <ul style="list-style: none; padding-left: 0;">${itemsHtml}</ul>
      </div>
    `
  };

  // 2. Customer Email Options
  const customerMailOptions = {
    from: `"Nushmeera Clothes" <${EMAIL_USER}>`,
    to: customerEmail,
    subject: `Order Confirmation - ${order.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #0f3d33; margin-top: 0;">Thank You for Your Order!</h2>
        <p>Hi <strong>${customerName}</strong>,</p>
        <p>We have successfully received your Cash on Delivery order <strong>${order.orderId}</strong>. Our team is now preparing your parcel for dispatch.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;" />

        <h3 style="color: #0f3d33;">Order Summary</h3>
        <ul style="list-style: none; padding-left: 0;">${itemsHtml}</ul>
        <p style="font-size: 1.1em;"><strong>Total Payable (COD):</strong> <span style="color: #0f3d33; font-weight: bold;">Rs. ${order.totalAmount}</span></p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;" />

        <p>If you have any questions, reply directly to this email or contact us on WhatsApp at <strong>+92 308 6195677</strong>.</p>
        <br>
        <p>Best regards,<br><strong>Team Nushmeera Clothes</strong></p>
      </div>
    `
  };

  // Send Emails
  try {
    // Send to Admin
    await transporter.sendMail(adminMailOptions);
    console.log(`✅ Admin notification email sent for order ${order.orderId}`);

    // Send to Customer (if email exists)
    if (customerEmail) {
      await transporter.sendMail(customerMailOptions);
      console.log(`✅ Customer confirmation email sent to ${customerEmail}`);
    }
  } catch (error) {
    console.error('❌ Failed to send order emails:', error);
    // We catch the error so it doesn't crash the server/checkout process
  }
};
