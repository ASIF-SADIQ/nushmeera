import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Initialize the transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Sends order confirmation emails to the customer and admin
 * @param {Object} order - The created order object
 */
export const sendOrderEmails = async (order) => {
  // If credentials are not set, log and skip (prevents crashes on local/dev)
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('⚠️ Email credentials not configured. Skipping order notification emails.');
    return;
  }

  const adminEmail = process.env.EMAIL_USER; // Send admin notifications to the same email
  const customerEmail = order.customerDetails?.email;
  
  if (!customerEmail) {
    console.log(`⚠️ No email provided for order ${order.orderId}. Skipping customer email.`);
  }

  // Format cart items
  const itemsHtml = order.cartItems.map(item => 
    `<li>${item.quantity}x ${item.title} - Rs. ${item.price}</li>`
  ).join('');

  // 1. Admin Email Options
  const adminMailOptions = {
    from: `"Nushmeera System" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `🚨 New Order Received: ${order.orderId}`,
    html: `
      <h2>New Order Received!</h2>
      <p><strong>Order ID:</strong> ${order.orderId}</p>
      <p><strong>Total Amount:</strong> Rs. ${order.totalAmount}</p>
      
      <h3>Customer Details</h3>
      <p><strong>Name:</strong> ${order.customerDetails?.firstName} ${order.customerDetails?.lastName}</p>
      <p><strong>Email:</strong> ${order.customerDetails?.email || 'N/A'}</p>
      <p><strong>Phone:</strong> ${order.customerDetails?.phone}</p>
      <p><strong>Address:</strong> ${order.customerDetails?.address}, ${order.customerDetails?.city}</p>

      <h3>Order Items</h3>
      <ul>${itemsHtml}</ul>
    `
  };

  // 2. Customer Email Options
  const customerMailOptions = {
    from: `"Nushmeera" <${process.env.EMAIL_USER}>`,
    to: customerEmail,
    subject: `Order Confirmation - ${order.orderId}`,
    html: `
      <h2>Thank you for your order!</h2>
      <p>Hi ${order.customerDetails?.firstName},</p>
      <p>Your order <strong>${order.orderId}</strong> has been successfully placed. We will begin processing it right away.</p>
      
      <h3>Order Summary</h3>
      <ul>${itemsHtml}</ul>
      <p><strong>Total Paid / COD Amount:</strong> Rs. ${order.totalAmount}</p>
      
      <p>If you have any questions, feel free to reply to this email or contact us on WhatsApp at 03086195677.</p>
      <br>
      <p>Best regards,<br>Team Nushmeera</p>
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
