"use server";
import {
  TransactionalEmailsApi,
  TransactionalEmailsApiApiKeys,
} from "@getbrevo/brevo";


interface MailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail({ to, subject, html }: MailOptions) {
  try {
    const emailApi = new TransactionalEmailsApi();
    emailApi.setApiKey(
      TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY!
    );
  
    const email = {
      to: [{ email: to }],
      subject,
      htmlContent:html,
      sender: { email: "thefabcodeuser9@gmail.com", name: "Developer" },
    };
    const result = await emailApi.sendTransacEmail(email);
  
    return result;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Email sending failed");
  }
}

export async function sendOTPEmail(email: string, otp: string) {
  const htmlContent = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <h2 style="color: #333; text-align: center;">Your Verification Code</h2>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <h1 style="color: #2563eb; font-size: 32px; letter-spacing: 8px; margin: 0;">${otp}</h1>
      </div>
      <p style="color: #666; text-align: center;">
        Enter this code to complete your verification. This code will expire in 5 minutes.
      </p>
      <p style="color: #999; font-size: 12px; text-align: center;">
        If you didn't request this code, please ignore this email.
      </p>
    </div>
  `;

  try {
    await sendEmail({
      to: email,
      subject: "Your Login OTP",
      html: htmlContent,
    });    
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    throw new Error("Failed to send verification email");
  }
}
