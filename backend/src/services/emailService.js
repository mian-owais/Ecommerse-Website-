const nodemailer = require('nodemailer');
const { getOrderConfirmationHtml, getPasswordResetHtml } = require('../utils/emailTemplates');

// Create transporter (using Gmail - update with your config)
// For production, use environment variables for sensitive data
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

// Alternative: For testing without real email (use Mailtrap or similar)
// You can also use this for development:
const devTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'localhost',
  port: process.env.EMAIL_PORT || 1025,
  secure: false
});

const emailService = {
  // Send order confirmation email
  sendOrderConfirmation: async (order, recipient) => {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@ecommerce.com',
      to: recipient.email,
      subject: `Order Confirmation - Order #${order.orderNumber}`,
      html: getOrderConfirmationHtml(order),
    };

    console.log('Attempting to send order confirmation email to:', recipient.email);
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Order confirmation email sent successfully:', info.response);
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      // In a real app, you might want to add this to a retry queue
    }
  },

  // Send order shipment notification
  sendShipmentNotification: async (order, user) => {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px; }
            .tracking-box { background: #e8f4f8; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; border-radius: 5px; }
            .tracking-number { font-size: 24px; font-weight: bold; color: #667eea; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Order Has Shipped!</h1>
              <p>Order #${order.orderNumber}</p>
            </div>

            <p>Hi ${user.name},</p>
            <p>Great news! Your order has been shipped and is on its way to you.</p>

            <div class="tracking-box">
              <p><strong>Track Your Package:</strong></p>
              <div class="tracking-number">${order.trackingNumber}</div>
              <p>Use this tracking number to monitor your delivery status.</p>
            </div>

            <h3>Estimated Delivery</h3>
            <p>${new Date(order.estimatedDelivery).toLocaleDateString()}</p>

            <p>Thank you for your business!</p>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@ecommerce.com',
        to: user.email,
        subject: `Order Shipped - Tracking #${order.trackingNumber}`,
        html: htmlContent
      };

      await transporter.sendMail(mailOptions);
      console.log(`Shipment notification email sent to ${user.email}`);
      return true;
    } catch (error) {
      console.error('Error sending shipment notification email:', error);
      return false;
    }
  },

  // Send order cancellation email
  sendCancellationEmail: async (order, user, reason) => {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ff6b6b; color: white; padding: 20px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Cancelled</h1>
              <p>Order #${order.orderNumber}</p>
            </div>

            <p>Hi ${user.name},</p>
            <p>Your order has been cancelled.</p>
            <p><strong>Reason:</strong> ${reason}</p>
            
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@ecommerce.com',
        to: user.email,
        subject: `Order Cancelled - Order #${order.orderNumber}`,
        html: htmlContent
      };

      await transporter.sendMail(mailOptions);
      console.log(`Cancellation email sent to ${user.email}`);
      return true;
    } catch (error) {
      console.error('Error sending cancellation email:', error);
      return false;
    }
  },

  // Send password reset email
  sendPasswordReset: async (user, resetUrl) => {
    try {
      const htmlContent = getPasswordResetHtml(user, resetUrl);

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@ecommerce.com',
        to: user.email,
        subject: 'Password Reset Request',
        html: htmlContent
      };

      await transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to ${user.email}`);
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }
};

module.exports = emailService;
