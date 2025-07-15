const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, htmlContent) => {
  const msg = {
    to,
    from: {
      email: process.env.EMAIL_SENDER,
      name: process.env.MAIL_SENDER_NAME,
    },
    subject,
    html: htmlContent,
  };

  try {
    await sgMail.send(msg);
    console.log('✅ Reset email sent successfully.');
  } catch (error) {
    console.error('❌ Error sending email:', error.response?.body || error);
    throw new Error('Failed to send email.');
  }
};

module.exports = sendEmail;
