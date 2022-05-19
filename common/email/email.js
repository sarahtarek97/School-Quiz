const nodemailer = require("nodemailer");
// require('dotenv').config()

// async..await is not allowed in global scope, must use a wrapper
const sendEmail = async (options) =>  {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service:'gmail',
    // host: "smtp.gmail.com",
    auth: {
      user: process.env.MAIL_SENDER, // generated ethereal user
      pass: process.env.MAIL_PASSWORD, // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"eduFun 👻"', // sender address
    to: options.email, // list of receivers
    subject: options.subject, // Subject line
    text: options.message, // plain text body
  })
}

module.exports = sendEmail;