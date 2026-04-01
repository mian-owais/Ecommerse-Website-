const getOrderConfirmationHtml = (order) => {
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const itemsHtml = order.items
    .map(
      (item) => `
    <tr class="item">
      <td>${item.name} (x${item.quantity})</td>
      <td>$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Order Confirmation</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { width: 100%; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; }
      .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eee; }
      .header h1 { margin: 0; color: #444; }
      .content { padding: 20px 0; }
      .content h2 { color: #444; }
      .order-details, .summary { width: 100%; margin-bottom: 20px; border-collapse: collapse; }
      .order-details th, .order-details td, .summary th, .summary td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
      .order-details th { background-color: #f8f8f8; }
      .summary .total { font-weight: bold; font-size: 1.1em; }
      .item td:last-child, .summary td { text-align: right; }
      .footer { text-align: center; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.9em; color: #777; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Thank You for Your Order!</h1>
      </div>
      <div class="content">
        <h2>Hi ${order.shippingAddress.fullName},</h2>
        <p>We've received your order and are getting it ready for shipment. You can track your order status using the tracking number below.</p>
        
        <h3>Order Summary</h3>
        <table class="order-details">
          <tr>
            <th>Order Number</th>
            <td>${order.orderNumber}</td>
          </tr>
          <tr>
            <th>Order Date</th>
            <td>${formattedDate}</td>
          </tr>
          <tr>
            <th>Tracking Number</th>
            <td>${order.trackingNumber}</td>
          </tr>
           <tr>
            <th>Estimated Delivery</th>
            <td>${new Date(order.estimatedDelivery).toLocaleDateString()}</td>
          </tr>
        </table>

        <h3>Items Ordered</h3>
        <table class="summary">
          ${itemsHtml}
          <tr class="total">
            <td>Subtotal:</td>
            <td>$${order.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Tax:</td>
            <td>$${order.tax.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Shipping:</td>
            <td>$${order.shipping.toFixed(2)}</td>
          </tr>
          <tr class="total">
            <td>Total:</td>
            <td>$${order.totalPrice.toFixed(2)}</td>
          </tr>
        </table>

        <h3>Shipping To:</h3>
        <p>
          ${order.shippingAddress.fullName}<br>
          ${order.shippingAddress.address}<br>
          ${order.shippingAddress.city}, ${order.shippingAddress.state || ''} ${order.shippingAddress.zipCode || ''}<br>
          ${order.shippingAddress.country}
        </p>
      </div>
      <div class="footer">
        <p>If you have any questions, reply to this email.</p>
        <p>&copy; ${new Date().getFullYear()} E-commerse. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

const getPasswordResetHtml = (user, resetUrl) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Password Reset Request</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { width: 100%; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; }
      .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eee; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
      .header h1 { margin: 0; }
      .content { padding: 20px 0; }
      .reset-button { display: inline-block; margin: 20px 0; padding: 12px 30px; background-color: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
      .warning { background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0; }
      .footer { text-align: center; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.9em; color: #777; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Password Reset Request</h1>
      </div>
      <div class="content">
        <h2>Hi ${user.name},</h2>
        <p>We received a request to reset your password. Click the button below to create a new password.</p>
        
        <center>
          <a href="${resetUrl}" class="reset-button">Reset Your Password</a>
        </center>

        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; background-color: #f8f8f8; padding: 10px; border-radius: 5px;">
          ${resetUrl}
        </p>

        <div class="warning">
          <strong>⚠️ Important:</strong>
          <ul>
            <li>This link will expire in 1 hour</li>
            <li>If you didn't request a password reset, please ignore this email</li>
            <li>Never share this link with anyone</li>
          </ul>
        </div>

        <p>For security reasons, we never send passwords via email. If you have any questions, please contact our support team.</p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} E-commerse. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

module.exports = { getOrderConfirmationHtml, getPasswordResetHtml };
