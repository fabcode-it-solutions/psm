/* eslint-disable @typescript-eslint/no-explicit-any */
import { v4 as uuidv4 } from "uuid";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { findUserByEmail, updateUser } from "@/models/user.model";
import { sendEmail } from "@/actions/mailer";
import { checkRateLimit } from "@/actions/rateLimiter";
import { RATE_LIMITS } from "@/config/rate-limit-config";

export const POST = async (request: Request) => {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const result = await checkRateLimit(ip, RATE_LIMITS.FORGOT_PASSWORD);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 429 });
    }
    const payload = await request.json();
    const { email } = payload;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }
    const userExist = await findUserByEmail({ email });
    if (!userExist) {
      return NextResponse.json(
        {
          error:
            "No account found with this email address. Please proceed to create a new account to continue.",
        },
        { status: 409 }
      );
    }
    const id = uuidv4();
    const hashedPassword = await bcrypt.hash(id, 10);
    const passwordTokenExpire = new Date(Date.now() + 10 * 60 * 1000);
    await updateUser(
      { id: userExist.id },
      { passwordToken: hashedPassword, passwordTokenExpire }
    );
    const resetLink = `http://overlap-theta.vercel.app/accounts/forgot-password?authO=${hashedPassword}`;
    await sendEmail({
      to: userExist?.email,
      subject: "Reset Password | Overlap | Verification email",
      html: `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4; padding: 20px 0;">
        <tr>
            <td align="center">
                
          
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                 
                    <tr>
                        <td style="background: #54DC00; padding: 40px 20px; text-align: center;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: white;">Reset Your Password</h1>
                        </td>
                    </tr>
                    

                    <tr>
                        <td style="padding: 40px 30px;">
                            
        
                            <p style="font-size: 18px; margin: 0 0 20px 0; color: #2c3e50; font-weight: 500;">Hello ${
                              userExist?.firstName || "User"
                            },</p>
                            
                 
                            <p style="font-size: 16px; margin: 0 0 25px 0; color: #555555;">
                                We received a request to reset the password for your account. If you made this request, click the button below to reset your password.
                            </p>
                            
 
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td align="center" style="padding: 30px 0;">
                                        <a href="${resetLink}" style="display: inline-block; background: #54DC00; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; text-align: center;">Reset My Password</a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Alternative Link -->
                            <p style="font-size: 14px; margin: 20px 0; color: #666666; text-align: center;">
                                If the button doesn't work, copy and paste this link into your browser:
                            </p>
                            <p style="font-size: 14px; margin: 0 0 25px 0; color: #54DC00; word-break: break-all; text-align: center;">
                               ${resetLink}
                            </p>
                            
                            <!-- Security Note -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0;">
                                <tr>
                                    <td style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px;">
                                        <p style="margin: 0; font-size: 14px; color: #856404;">
                                            <strong>🔒 Security Note:</strong> This link will expire in 10 min for your security. If you didn't request this password reset, please ignore this email or contact our support team.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                          
                                                       
                        </td>
                    </tr>
           
                    
                </table>
                
            </td>
        </tr>
    </table>`,
    });

    return NextResponse.json(
      {
        message:
          "We have sent you password reset email, please check your inbox or spam folder.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Server Error", error: error.message },
      { status: 500 }
    );
  }
};
