const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_PASS;
const TO_EMAIL = process.env.TO_EMAIL || GMAIL_USER;
const FROM_NAME = process.env.FROM_NAME || 'Chapells Contact Form';

if (!GMAIL_USER || !GMAIL_PASS) {
  console.warn('Warning: Missing GMAIL_USER or GMAIL_PASS in .env. Email sending will not work until these values are configured.');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.warn('Mail transporter verification failed:', error.message || error);
  } else {
    console.log('Mail transporter is ready.');
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/send-email', async (req, res) => {
  const { name = '', phone = '', email = '', service = 'Not specified', message = '' } = req.body || {};

  if (!name || !phone || !email || !message) {
    return res.status(400).json({ error: 'Please complete all required fields.' });
  }

  if (!GMAIL_USER || !GMAIL_PASS) {
    return res.status(500).json({ error: 'Email configuration is missing on the server.' });
  }

  const mailOptions = {
    from: `"${FROM_NAME}" <${GMAIL_USER}>`,
    to: TO_EMAIL,
    subject: `Service Request from ${name}`,
    text: `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\nService: ${service}\n\nMessage:\n${message}`,
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Service:</strong> ${service}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.json({ success: true });
  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ error: 'Unable to send email right now. Please try again later.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
