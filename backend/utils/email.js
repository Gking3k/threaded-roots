const nodemailer =
  require("nodemailer");

const transporter =
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,

    port: Number(
      process.env.SMTP_PORT || 465
    ),

    secure:
      String(
        process.env.SMTP_SECURE
      ) === "true",

    auth: {
      user:
        process.env.SMTP_USER,

      pass:
        process.env.SMTP_PASS,
    },
  });

async function verifyEmailConnection() {
  if (
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    throw new Error(
      "SMTP credentials are not configured"
    );
  }

  await transporter.verify();

  console.log(
    "Email server connection verified"
  );
}

async function sendEmail({
  to,
  subject,
  html,
  text,
}) {
  return transporter.sendMail({
    from:
      process.env.EMAIL_FROM ||
      process.env.SMTP_USER,

    to,

    subject,

    text,

    html,
  });
}

module.exports = {
  verifyEmailConnection,
  sendEmail,
};