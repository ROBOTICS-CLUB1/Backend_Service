import nodemailer from "nodemailer";

interface MailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify().then(() => {
  console.log("Mailer is ready");
}).catch(err => {
  console.error("Mailer connection error:", err);
});

export const sendMail = async (options: MailOptions) => {
  try {
    const info = await transporter.sendMail({
      from: `"Robotics Club" <${process.env.SMTP_USER}>`,
      ...options,
    });
    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (err) {
    console.error("Error sending email:", err);
    throw err;
  }
};
