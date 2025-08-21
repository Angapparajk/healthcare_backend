// nodemailer.js
// Centralized nodemailer transporter config for Gmail
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // Your Gmail address
    pass: process.env.GMAIL_PASS  // App password (not your Gmail password)
  }
});

module.exports = transporter;
