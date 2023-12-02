require("dotenv").config();

const nodemailer = require("nodemailer");

const { MAILPRAT_USER, MAILPRAT_PASS } = process.env;

const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: MAILPRAT_USER,
    pass: MAILPRAT_PASS,
  },
});

function sendEmail(email) {
  email.from = "borysenko343@gmail.com";

  return transport.sendMail(email);
}
module.exports = sendEmail;
