exports.getWelcomeMessage = (user) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color: #f4f4f4;">

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#f4f4f4">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff" style="margin:20px auto; padding:20px; border-radius:10px; box-shadow:0px 4px 8px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <tr>
              <td align="center" bgcolor="#004aad" style="color:#ffffff; padding:20px; font-size:22px; font-weight:bold; border-top-left-radius:10px; border-top-right-radius:10px;">
                Welcome to Bookstore, ${user.name}!
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td align="left" style="padding:20px; color:#333; font-size:16px; line-height:1.6;">
                <p>Dear ${user.name},</p>
                <p>Thank you for joining <strong>Bookstore</strong>! We are excited to have you as part of our community.</p>
                <p>Your account has been successfully created. Below are your details:</p>
                <ul>
                  <li><strong>Username:</strong> ${user.name}</li>
                  <li><strong>Email:</strong> ${user.email}</li>
                </ul>
                <p>You can log in and start exploring our platform:</p>
                <p style="text-align:center;">
                  <a href= ${
                    process.env.BASH_HOSTNAME
                  }/auth/login  style="background:#004aad; color:#ffffff; text-decoration:none; padding:12px 20px; font-size:16px; border-radius:5px; display:inline-block; font-weight:bold;">Log In to Your Account</a>
                </p>
                <p>If you have any questions, feel free to contact our support team at <a href="mailto:sallma.yasser.abdulla@gmail.com" style="color:#004aad;">sallma.yasser.abdulla@gmail.com</a>.</p>
                <p>Happy Reading! 📚</p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" bgcolor="#f4f4f4" style="padding:15px; font-size:12px; color:#888; border-bottom-left-radius:10px; border-bottom-right-radius:10px;">
                &copy; ${new Date().getFullYear()} Bookstore | All Rights Reserved
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
};

exports.getReceiptEmail = (user, order) => {
  return `
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0px 4px 8px rgba(0,0,0,0.1);">
            <h2 style="background-color: #004aad; color: white; padding: 15px; text-align: center; border-radius: 10px 10px 0 0;">📜 Order Confirmation</h2>
            
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>Thank you for your order! Here are the details:</p>

            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <thead>
                    <tr style="background: #004aad; color: white;">
                        <th style="padding: 10px;">Book</th>
                        <th style="padding: 10px;">Price</th>
                        <th style="padding: 10px;">Quantity</th>
                        <th style="padding: 10px;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.books
                      .map(
                        (book) => `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${
                          book.book.title
                        }</td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">$${book.priceAtPurchase.toFixed(
                          2
                        )}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${
                          book.quantity
                        }</td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">$${(
                          book.quantity * book.priceAtPurchase
                        ).toFixed(2)}</td>
                    </tr>
                    `
                      )
                      .join("")}
                </tbody>
            </table>

            <p><strong>Subtotal:</strong> $${order.totalWithoutDiscount.toFixed(
              2
            )}</p>
            <p><strong>Discount:</strong> -$${order.discountAmount.toFixed(
              2
            )}</p>
            <p><strong>Total Payment:</strong> <span style="color: #004aad; font-size: 18px;">$${order.totalPayment.toFixed(
              2
            )}</span></p>

            <p>Need help? <a href="${
              process.env.SUPPORT_URL
            }" style="color: #004aad; text-decoration: none;">Contact Support</a></p>

            <p style="text-align: center;">
                <a href="${process.env.BASH_HOSTNAME}/orders/${order._id}" 
                   style="display: inline-block; background: #004aad; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">View Order Details</a>
            </p>

            <p>Happy Reading! 📚</p>

            <div style="background-color: #f4f4f4; text-align: center; padding: 15px; font-size: 12px; color: #888; border-radius: 0 0 10px 10px;">
                &copy; ${new Date().getFullYear()} Bookstore | All Rights Reserved
            </div>
        </div>
    </body>
    </html>
    `;
};

exports.getStatusUpdateEmail = (name, order) => {
  return `
  <html>
  <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0px 4px 8px rgba(0,0,0,0.1);">
          <h2 style="background-color: #004aad; color: white; padding: 15px; text-align: center; border-radius: 10px 10px 0 0;">📦 Order Status Updated</h2>
          
          <p>Hello <strong>${name}</strong>,</p>
          <p>Your order <strong>#${
            order._id
          }</strong> has been : <strong style="color: #004aad;">${
    order.status
  }</strong>.</p>

          <h3>Order Details:</h3>
          <ul>
              ${order.books
                .map(
                  (book) => `
              <li><strong>${book.book.title}</strong> - ${
                    book.quantity
                  } x $${book.priceAtPurchase.toFixed(2)}</li>
              `
                )
                .join("")}
          </ul>

          <p><strong>Total Payment:</strong> $${order.totalPayment.toFixed(
            2
          )}</p>

          <p>Need help? <a href="${
            process.env.SUPPORT_URL
          }" style="color: #004aad;">Contact Support</a></p>

          <div style="background-color: #f4f4f4; text-align: center; padding: 15px; font-size: 12px; color: #888; border-radius: 0 0 10px 10px;">
              &copy; ${new Date().getFullYear()} Bookstore | All Rights Reserved
          </div>
      </div>
  </body>
  </html>
  `;
};
