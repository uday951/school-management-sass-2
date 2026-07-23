const nodemailer = require('nodemailer');
const env = require('./environment');

const transporter = nodemailer.createTransport({
  host: env.mail.smtpHost,
  port: env.mail.smtpPort,
  auth: {
    user: env.mail.smtpUser,
    pass: env.mail.smtpPass
  }
});

module.exports = {
  transporter,
  from: env.mail.from
};
