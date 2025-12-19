import { sendMail } from "../utils/mailer";

const APP_URL = process.env.APP_URL || "https://your-club-app.com"; // Add this to your .env (e.g., your frontend URL)

export class MailerService {
  static async sendApprovalEmail(username: string, email: string) {
    try {
      await sendMail({
        to: email,
        subject: "🎉 Welcome to the Robotics Club – Membership Approved!",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8" />
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                .header { background: #1a5fb4; color: white; padding: 30px; text-align: center; }
                .header h1 { margin: 0; font-size: 28px; }
                .content { padding: 30px; }
                .btn {
                  display: inline-block;
                  background: #1a5fb4;
                  color: white;
                  padding: 14px 28px;
                  text-decoration: none;
                  border-radius: 6px;
                  font-weight: bold;
                  margin: 20px 0;
                }
                .footer { background: #f0f0f0; padding: 20px; text-align: center; font-size: 14px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Robotics Club</h1>
                  <p>Welcome to the team! 🚀</p>
                </div>
                <div class="content">
                  <p>Dear <strong>${username}</strong>,</p>

                  <p>Great news! Your membership request has been <strong>approved</strong> by our admin team.</p>

                  <p>You are now an official member of the Robotics Club! This means you can:</p>
                  <ul>
                    <li>Showcase your personal robotics projects</li>
                    <li>Publish blog posts about your builds and learnings</li>
                    <li>Participate in discussions and events</li>
                    <li>Connect with fellow robotics enthusiasts</li>
                  </ul>

                  <p style="text-align: center;">
                    <a href="${APP_URL}" class="btn">Log In & Explore Your Dashboard</a>
                  </p>

                  <p>We're thrilled to have you on board. Get started by sharing your first project or post!</p>

                  <p>Best regards,<br /><strong>The Robotics Club Team</strong></p>
                </div>
                <div class="footer">
                  <p>© 2025 Robotics Club | Building the future, one robot at a time.</p>
                  <p>If you have any questions, just reply to this email.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });
      console.log(`Approval email SENT to ${email}`);
    } catch (error: any) {
      console.error(
        `Failed to send approval email to ${email}:`,
        error.message || error
      );
    }
  }

  static async sendRejectionEmail(username: string, email: string) {
    try {
      await sendMail({
        to: email,
        subject: "Robotics Club Membership Request Update",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8" />
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                .header { background: #d32f2f; color: white; padding: 30px; text-align: center; }
                .header h1 { margin: 0; font-size: 28px; }
                .content { padding: 30px; }
                .footer { background: #f0f0f0; padding: 20px; text-align: center; font-size: 14px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Robotics Club</h1>
                  <p>Membership Update</p>
                </div>
                <div class="content">
                  <p>Dear <strong>${username}</strong>,</p>

                  <p>Thank you for your interest in joining the Robotics Club and for taking the time to apply.</p>

                  <p>After careful review, we regret to inform you that your membership request was <strong>not approved</strong> at this time.</p>

                  <p>This decision was not made lightly — we receive many applications and have limited capacity this semester.</p>

                  <p>We encourage you to:</p>
                  <ul>
                    <li>Continue building awesome robotics projects</li>
                    <li>Stay engaged with the community through public posts and events</li>
                    <li>Reapply in the next application cycle if you're still interested</li>
                  </ul>

                  <p>If you'd like feedback or have questions about the decision, feel free to reply to this email — we're happy to help.</p>

                  <p>Thank you again for your enthusiasm.<br />
                  <strong>The Robotics Club Team</strong></p>
                </div>
                <div class="footer">
                  <p>© 2025 Robotics Club | Keep building and learning!</p>
                  <p>Questions? Just reply to this email.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });
      console.log(`Rejection email SENT to ${email}`);
    } catch (error: any) {
      console.error(
        `Failed to send rejection email to ${email}:`,
        error.message || error
      );
    }
  }
}
