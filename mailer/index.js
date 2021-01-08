const nodemailer = require('nodemailer');

module.exports.sendVerificationCode = async (email, verifyCode) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'inspirewebshop@gmail.com',
      pass: '1234-abcd',
    }
  });

  const mailOptions = {
    from: 'inspirewebshop@gmail.com',
    to: email,
    subject: 'Mã xác nhận tài khoản',
    text: `Mã xác nhận: ${verifyCode}`
  }

  await transporter.sendMail(mailOptions);
  return true;
}

