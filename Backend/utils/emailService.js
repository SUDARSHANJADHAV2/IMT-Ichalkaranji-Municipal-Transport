// utils/emailService.js
const nodemailer = require('nodemailer');

// You'll need to install nodemailer: npm install nodemailer

const sendEmail = async (options) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: process.env.SMTP_PORT || 2525,
    auth: {
      user: process.env.SMTP_USER || 'your_user',
      pass: process.env.SMTP_PASSWORD || 'your_password'
    }
  });

  // Define email options
  const mailOptions = {
    from: process.env.FROM_EMAIL || 'noreply@ibbps.com',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  // Send email
  await transporter.sendMail(mailOptions);
};

module.exports = { sendEmail };