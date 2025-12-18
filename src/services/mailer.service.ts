import { sendMail as sendMailUtil } from "../utils/mailer";

export class MailerService {
  static async sendApprovalEmail(username: string, email: string) {
    return sendMailUtil({
      to: email,
      subject: "Membership Approved - Welcome to the Robotics Club!",
      html: `
        <p>Hi <b>${username}</b>,</p>
        <p>Congratulations! Your membership has been approved. Welcome to the Robotics Club! We’re excited to have you on board.</p>
        <p>Explore the posts, participate in discussions, and let’s build amazing projects together!</p>
      `,
    });
  }

  static async sendRejectionEmail(username: string, email: string) {
    return sendMailUtil({
      to: email,
      subject: "Membership Request Status - Robotics Club",
      html: `
        <p>Hi <b>${username}</b>,</p>
        <p>Your membership request has unfortunately been rejected. If you believe this is an error or want to discuss eligibility, please contact the admin team.</p>
        <p>Regards,<br/>Robotics Club</p>
      `,
    });
  }
}
