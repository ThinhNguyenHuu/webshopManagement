const nodemailer = require('nodemailer');

module.exports.sendVerificationCode = async (email, verifyCode) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SUPERADMIN_EMAIL_USER,
      pass: process.env.SUPERADMIN_EMAIL_PASS,
    }
  });

  const mailOptions = {
    from: process.env.SUPERADMIN_EMAIL_USER,
    to: email,
    subject: 'Mã xác nhận tài khoản',
    text: `Mã xác nhận: ${verifyCode}`
  }

  await transporter.sendMail(mailOptions);
  return true;
}

