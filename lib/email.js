// lib/email.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: { 
    user: process.env.GMAIL_USERNAME, 
    pass: process.env.GMAIL_APP_PASSWORD 
  },
  tls: {
    rejectUnauthorized: false
  }
});

export async function sendMail({ to, subject, html }) {
  const from = `${process.env.FROM_NAME || 'Celestia Mistica'} <${process.env.FROM_EMAIL || process.env.GMAIL_USERNAME}>`;
  return transporter.sendMail({ from, to, subject, html });
}

// Enhanced email templates for astrology platform
export async function sendEmail({ to, subject, html, type, data = {} }) {
  const templates = {
    booking_confirmation: {
      subject: `Cosmic Session Confirmed - ${data.bookingId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #fbbf24; font-size: 2.5em; margin: 0;">✨ Celestia</h1>
            <p style="color: #e5e7eb; margin: 5px 0;">Your Cosmic Journey Awaits</p>
          </div>
          
          <h2 style="color: #fbbf24; text-align: center;">Session Confirmed! 🌟</h2>
          
          <div style="background: rgba(255,255,255,0.1); padding: 25px; border-radius: 10px; margin: 20px 0;">
            <p><strong>📅 Booking ID:</strong> ${data.bookingId}</p>
            <p><strong>🔮 Service:</strong> ${data.serviceName}</p>
            <p><strong>⏰ Duration:</strong> ${data.duration} minutes</p>
            <p><strong>💫 Scheduled:</strong> ${data.sessionDateTime || 'To be scheduled'}</p>
            <p><strong>💰 Investment:</strong> $${data.amount}</p>
            ${data.meetLink ? `<p><strong>🎥 Google Meet:</strong> <a href="${data.meetLink}" style="color: #fbbf24; text-decoration: none;">${data.meetLink}</a></p>` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="font-size: 1.1em; line-height: 1.6;">Prepare your questions and open your heart to receive the cosmic wisdom that awaits you.</p>
          </div>
          
          <div style="text-align: center; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 20px; margin-top: 30px;">
            <p style="margin: 0; font-style: italic;">Blessed be on your celestial path,</p>
            <p style="margin: 5px 0; font-weight: bold; color: #fbbf24;">Mistica ✨</p>
          </div>
        </div>
      `
    },
    new_user_registration: {
      subject: `New Celestial Soul - ${data.userName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; border-radius: 10px;">
          <h2 style="color: #7c3aed; text-align: center;">🌟 New User Registration</h2>
          <div style="background: white; padding: 20px; border-radius: 10px; border-left: 4px solid #fbbf24;">
            <p><strong>✨ Name:</strong> ${data.userName}</p>
            <p><strong>📧 Email:</strong> ${data.userEmail}</p>
            <p><strong>🕐 Registration:</strong> ${new Date().toLocaleString()}</p>
            ${data.birthInfo ? `<p><strong>🌙 Birth Info:</strong> ${data.birthInfo}</p>` : ''}
          </div>
          <p style="text-align: center; margin-top: 20px; color: #6b7280;">
            Another soul has joined the Celestia community! 🙏
          </p>
        </div>
      `
    }
  };

  const emailContent = type && templates[type] ? templates[type] : { subject, html };
  return sendMail({ to, subject: emailContent.subject, html: emailContent.html });
}