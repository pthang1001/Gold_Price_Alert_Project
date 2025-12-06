const nodemailer = require('nodemailer');

/**
 * Email configuration for sending OTP and notifications
 * Uses Gmail SMTP to send emails
 */

let transporter = null;

// Initialize Gmail SMTP transporter
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true' || false, // false for TLS, true for SSL
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  console.log(`✅ Email service initialized: Gmail SMTP (${process.env.SMTP_USER})`);
  
  // Verify connection
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Email transporter verification failed:', error.message);
    } else {
      console.log('✅ Email transporter verified and ready to send');
    }
  });
} else {
  console.warn('⚠️  SMTP credentials not configured. Email sending disabled.');
}

/**
 * Send OTP email using Gmail SMTP
 */
async function sendOTPEmail(email, otpCode) {
  if (!transporter) {
    console.warn(`⚠️  Email transporter not configured. OTP would be sent to: ${email}`);
    logOTPToConsole(email, otpCode);
    return true;
  }

  try {
    console.log(`📧 Attempting to send OTP via Gmail SMTP to ${email}...`);
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@goldpricealert.local',
      to: email,
      subject: '🔐 Your Gold Price Alert OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
            <h2 style="margin: 0;">🏆 Gold Price Alert</h2>
            <p style="margin: 5px 0;">Email Verification</p>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 0 0 10px 10px;">
            <p>Hello,</p>
            <p>Thank you for signing up for <strong>Gold Price Alert</strong>! To verify your email address and complete your registration, please use the verification code below:</p>
            
            <div style="background-color: #fff; padding: 25px; text-align: center; margin: 25px 0; border-radius: 8px; border: 3px solid #667eea; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <h1 style="color: #667eea; letter-spacing: 8px; margin: 0; font-size: 36px; font-weight: bold;">${otpCode}</h1>
              <p style="color: #999; margin: 12px 0 0 0; font-size: 14px;">This code expires in 10 minutes</p>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              <strong>⚠️ Security Notice:</strong><br>
              If you didn't sign up for this account, please ignore this email and do not share this code with anyone. This code is confidential and for your security only.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 25px 0;">
            <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
              Gold Price Alert © ${new Date().getFullYear()} | All rights reserved
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    
    console.log(`✅ OTP email sent successfully via Gmail SMTP to ${email}`);
    console.log(`📧 Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send OTP via Gmail SMTP to ${email}:`, error.message);
    // Fall back to console logging
    logOTPToConsole(email, otpCode);
    return true; // Don't fail registration
  }
}

/**
 * Log OTP to console (fallback)
 */
function logOTPToConsole(email, otpCode) {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║           📧 OTP EMAIL (Console Logging - Fallback)            ║');
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log(`║ To: ${email.padEnd(58).substring(0, 58)} ║`);
  console.log(`║ OTP Code: ${otpCode}${' '.repeat(50 - otpCode.length)} ║`);
  console.log('║ Expires in: 10 minutes                                         ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');
}

/**
 * Verify email service connection
 */
async function verifyEmailConnection() {
  if (transporter) {
    try {
      await transporter.verify();
      console.log('✅ Email service (Gmail SMTP) verified and ready');
      return true;
    } catch (error) {
      console.error('❌ Email service verification failed:', error.message);
      return false;
    }
  } else {
    console.warn('⚠️  Email service not configured');
    return false;
  }
}

module.exports = {
  sendOTPEmail,
  verifyEmailConnection,
  transporter
};
