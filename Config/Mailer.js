const nodemailer = require('nodemailer');
require('dotenv').config();  


const transporter = nodemailer.createTransport({
  service: 'gmail',  
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS,
  },
});


transporter.verify((error, success) => {
  if (error) {
    console.error('Error with mailer configuration:', error);
  } else {
    console.log('Mailer is configured and ready to send emails');
  }
});

module.exports = transporter;