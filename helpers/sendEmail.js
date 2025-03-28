const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com', 
  port: 465,  
  secure: true, 
  auth: {
    user: "souqalcrypto@jeuxtesting.com", 
    pass: "I/L^A&a&6q", 
  },
  logger: true,   
  debug: true     
});

/**
 * Sends an email and logs debugging info
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Email content
 */
const sendEmail = async (to, subject, text) => {
  try {
    const mailOptions = {
      from: "souqalcrypto@jeuxtesting.com",
      to,
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = sendEmail;
