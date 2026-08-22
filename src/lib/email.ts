import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendWelcomeEmail(to: string, name: string, employeeId: string, temporaryPassword: string) {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.warn('SMTP_EMAIL or SMTP_PASSWORD not set. Skipping email send.');
    return;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const mailOptions = {
    from: `"Dayflow HR" <${process.env.SMTP_EMAIL}>`,
    to,
    subject: 'Welcome to Dayflow - Your Account Credentials',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #6d28d9;">Welcome to Dayflow!</h2>
        <p>Hi ${name},</p>
        <p>An administrator has created a new account for you on the Dayflow HR platform.</p>
        <p>Here are your temporary login credentials:</p>
        <div style="background: #f4f4f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Employee ID:</strong> ${employeeId}</p>
          <p style="margin: 0;"><strong>Password:</strong> ${temporaryPassword}</p>
        </div>
        <p><strong>Important:</strong> For security reasons, you will be required to change your password and complete your profile setup immediately upon your first login.</p>
        <div style="margin-top: 30px; text-align: center;">
          <a href="${appUrl}/signin" style="background: #6d28d9; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-weight: bold;">Sign In to Dayflow</a>
        </div>
        <p style="margin-top: 30px; font-size: 12px; color: #777;">If you did not expect this email, please contact your HR administrator.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${to}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
}
