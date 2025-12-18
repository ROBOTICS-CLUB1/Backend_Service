import nodemailer from "nodemailer";

interface MailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: Number(process.env.MAIL_PORT) === 465,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

transporter
  .verify()
  .then(() => {
    console.log("Mailer connected successfully");
  })
  .catch((err) => {
    console.error("Mailer connection failed:", err);
  });

export const sendMail = async (options: MailOptions) => {
  return transporter.sendMail({
    from: process.env.MAIL_FROM,
    ...options,
  });
};
