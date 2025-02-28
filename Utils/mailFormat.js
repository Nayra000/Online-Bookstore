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
                    process.env.HOSTNAME
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
