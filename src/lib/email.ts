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

export async function sendLeaveStatusEmail(to: string, name: string, status: string, leaveType: string, days: number, approverName: string) {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    return;
  }
  const mailOptions = {
    from: `"Dayflow HR" <${process.env.SMTP_EMAIL}>`,
    to,
    subject: `Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: ${status === 'approved' ? '#10b981' : '#ef4444'};">Leave Request ${status}</h2>
        <p>Hi ${name},</p>
        <p>Your request for <strong>${days} day(s)</strong> of <strong>${leaveType}</strong> has been <strong>${status}</strong> by ${approverName}.</p>
        <div style="margin-top: 30px; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/timeoff" style="background: #6d28d9; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-weight: bold;">View Details</a>
        </div>
      </div>
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending leave email:', error);
  }
}

export async function sendPayslipEmail(to: string, name: string, month: string, year: string) {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    return;
  }
  const mailOptions = {
    from: `"Dayflow HR" <${process.env.SMTP_EMAIL}>`,
    to,
    subject: `Your Payslip for ${month} ${year} is ready`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #6d28d9;">Payslip Available</h2>
        <p>Hi ${name},</p>
        <p>Your salary slip for <strong>${month} ${year}</strong> has been generated and is now available in your dashboard.</p>
        <div style="margin-top: 30px; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/payslips" style="background: #6d28d9; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-weight: bold;">View Payslip</a>
        </div>
      </div>
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending payslip email:', error);
  }
}

export async function sendCompanyRegistrationEmail(
  to: string,
  adminName: string,
  companyName: string,
  employeeId: string,
  password: string
) {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.warn('SMTP_EMAIL or SMTP_PASSWORD not set. Skipping company registration email.');
    return;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const mailOptions = {
    from: `"Dayflow HR" <${process.env.SMTP_EMAIL}>`,
    to,
    subject: `🎉 Welcome to Dayflow – ${companyName} is now registered!`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 30px; color: #1a1a1a; max-width: 600px; margin: 0 auto; border: 2px solid #e5e7eb; border-radius: 12px; background: #fafaf9;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; border: 2px solid #1a1a1a; padding: 8px 20px; border-radius: 8px; font-size: 22px; font-weight: bold; letter-spacing: 1px;">
            Dayflow
          </div>
          <p style="color: #6b7280; margin-top: 8px; font-size: 13px;">Every workday, perfectly aligned ✦</p>
        </div>

        <h2 style="color: #6d28d9; margin-bottom: 8px;">Welcome aboard, ${adminName}! 🚀</h2>
        <p style="color: #374151;">Your company <strong>${companyName}</strong> has been successfully registered on Dayflow. You can now access the HR platform and start managing your team.</p>

        <div style="background: #f5f3ff; border-left: 4px solid #7c3aed; padding: 16px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0; font-weight: bold; color: #5b21b6;">Your Admin Login Credentials</p>
          <p style="margin: 0; color: #374151;"><strong>Employee ID:</strong> <code style="background:#ede9fe;padding:2px 6px;border-radius:4px;">${employeeId}</code></p>
          <p style="margin: 6px 0 0 0; color: #374151;"><strong>Password:</strong> <code style="background:#ede9fe;padding:2px 6px;border-radius:4px;">${password}</code></p>
          <p style="margin: 6px 0 0 0; color: #374151;"><strong>Email:</strong> ${to}</p>
        </div>

        <p style="color: #6b7280; font-size: 13px;">⚠️ For security, please change your password after your first sign-in.</p>

        <div style="text-align: center; margin: 28px 0 16px 0;">
          <a href="${appUrl}/signin"
             style="background: #7c3aed; color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">
            Sign In to Dayflow →
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          If you did not register on Dayflow, please ignore this email.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Company registration email sent to ${to}`);
  } catch (error) {
    console.error('Error sending company registration email:', error);
  }
}
