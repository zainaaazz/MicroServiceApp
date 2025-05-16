// services/emailService.js
const nodemailer = require('nodemailer');
require('dotenv').config();

// 1) configure transporter from your SMTP credentials
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for others
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * Send an email notifying a user that their card was blocked/unblocked.
 * @param {string} to        Destination email address
 * @param {string} fullName  Recipient full name
 * @param {string} cardNum   Card number string
 * @param {string} newStatus "Blocked" or "Active"
 */
async function sendCardStatusEmail({ to, fullName, cardNum, newStatus }) {
  const last4 = cardNum.slice(-4);
  const subject = `Your card ending ${last4} is now ${newStatus}`;
  const text = `
Hello ${fullName},

This is to let you know that your card ending in ${last4} has been *${ newStatus === 'Blocked' ? 'blocked' : 'unblocked' }* by an administrator.

If you did not request this, or have any questions, please contact our support team.

Best regards,
Flexitec Bank
`;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM, // e.g. '"Flexitec Bank" <no-reply@flexitec.com>'
    to,
    subject,
    text
  });
}

module.exports = { sendCardStatusEmail };
