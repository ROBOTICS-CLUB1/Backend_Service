import { sendMail } from "../utils/mailer";

export class MailerService {
  static sendApprovalEmail(username: string, email: string) {
    return sendMail({
      to: email,
      subject: "Welcome to the Robotics Club 🎉",
      html: `
        <p>Hi <strong>${username}</strong>,</p>

        <p>Your membership request has been <strong>approved</strong>.</p>

        <p>You are now an official member of the Robotics Club. You can log in, participate in discussions, and contribute to club activities.</p>

        <p>We’re glad to have you on board.</p>

        <p>— Robotics Club Team</p>
      `,
    });
  }

  static sendRejectionEmail(username: string, email: string) {
    return sendMail({
      to: email,
      subject: "Membership Request Update",
      html: `
        <p>Hi <strong>${username}</strong>,</p>

        <p>Your request to join the Robotics Club has been reviewed.</p>

        <p>Unfortunately, it was not approved at this time.</p>

        <p>If you believe this decision was made in error or would like more information, please reach out to the admin team.</p>

        <p>— Robotics Club Team</p>
      `,
    });
  }
}
