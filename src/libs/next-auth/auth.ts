import { v4 as uuidv4 } from "uuid";
import {
  createOrUpdateUser,
  findUserByEmail,
  updateUser,
} from "@/models/user.model";
import type { AuthOptions } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isVerified?: boolean;
      role?: string;
      id?: number;
    };
    accessToken?: string;
    otp?: string;
    otpExpires?: number;
  }
  interface User {
    otp?: string;
    otpExpires?: number;
    role?: string;
  }
}
import CredentialsProvider from "next-auth/providers/credentials";
import FacebookProvider from "next-auth/providers/facebook";
import GoogleProvider from "next-auth/providers/google";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { sendOTPEmail } from "@/actions/mailer";
import { adminBlockUser, users } from "@/db/schema/auth";
import { db } from "@/db/db";
import { and, eq, gt } from "drizzle-orm";
import { getCachedUser, setCachedUser } from "./session-cache";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id: "email-password",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error("Email is required");
        }
         const [user] = await db
                .select()
                .from(users)
                .where(eq(users.email, credentials?.email))
                .limit(1);

        if (!user) {
          throw new Error("No user found or password not set");
        }
        return {
          id: user.id.toString(),
          email: user.email,
          name: user.anonymous
            ? user?.anonymousName
            : user.username || user.firstName || user.lastName || "Anonymous",
          image: user.profileImage ?? undefined,
          role: user?.role ?? "user",
          isVerified: user.isVerified ?? false,
        };
      },
    }),
    CredentialsProvider({
      id: "email-otp",
      name: "Email OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" },
        token: { label: "Token", type: "text" },
        action: { label: "Action", type: "text" },
        otpToken: { label: "otpToken", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.action) {
          return null;
        }

        const email = credentials.email.toLowerCase().trim();

        if (credentials.action === "send") {
          try {
            const otp = crypto.randomInt(100000, 999999).toString();
            const expires = Date.now() + 5 * 60 * 1000;
            const token = uuidv4();
            await sendOTPEmail(email, otp);
            const hashedOtp = bcrypt.hashSync(otp, 10);
            return {
              id: token,
              email: email,
              token: token,
              otp: hashedOtp,
              otpExpires: expires,
            };
          } catch (error) {
            console.error("Failed to send OTP:", error);
            return null;
          }
        }

        if (credentials.action === "verify") {
          if (!credentials.otp) {
            return null;
          }
          const verify = await bcrypt.compare(
            credentials.otp,
            credentials?.otpToken
          );

          if (verify) {
            await updateUser({ email: email }, { isVerified: true });
          }

          return {
            id: uuidv4(),
            email: email,
            image: null,
            isVerified: true,
          };
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
  const accessToken = uuidv4();
  
  // Import at top of file
  // import { getCachedUser, setCachedUser } from './session-cache';
  
  if (token?.email) {
    // Try cache first
    const cachedData = getCachedUser(token.email);
    
    // If not cached or new login, query database
    if (!cachedData || user) {
      try {
        const checker = await findUserByEmail({ email: token.email });
        
        if (checker) {
          // Check if blocked
          const [isBlocked] = await db
            .select()
            .from(adminBlockUser)
            .where(
              and(
                eq(adminBlockUser.userId, checker.id),
                gt(adminBlockUser.blockTime, new Date())
              )
            )
            .limit(1);
          
          if (isBlocked) {
            return {
              exp: Math.floor(Date.now() / 1000) - 10,
            };
          }
          
          // Cache the data
          const newCacheData = {
            id: checker.id,
            isBlocked: false,
            role: checker.role || 'user',
            isVerified: checker.isVerified,
          };
          if (token.email) {
            setCachedUser(token.email, newCacheData);
          }
          
          // Update token
          token.id = checker.id;
          token.role = checker.role;
          token.isVerified = checker.isVerified;
          token.name = checker.username || checker.firstName || checker.lastName;
          token.image = checker.profileImage;
        }
      } catch (error) {
        console.error("❌ JWT callback error:", error);
        // Don't logout on transient errors
      }
    } else {
      // Use cached data
      token.id = cachedData.id;
      token.role = cachedData.role;
      token.isVerified = cachedData.isVerified;
    }
  }
  
  // OAuth provider handling
  if (user?.image && user.email) {
    const savedUser = await createOrUpdateUser({
      email: user.email,
      name: user.name,
      image: user.image,
      accessToken,
    });
    token.name = savedUser.username || savedUser.firstName || savedUser.lastName;
    token.image = savedUser.profileImage;
    token.isVerified = savedUser.isVerified;
    token.role = savedUser.role;
    token.id = savedUser.id || user?.id;
  }

  token.accessToken = accessToken;
  
  if (user?.email) {
    token.email = user.email;
  }
  
  if (user?.otp) {
    token.otp = user.otp;
  }
  
  if (user?.otpExpires) {
    token.otpExpires = user.otpExpires;
  }
  
  if (user?.role) {
    token.role = user.role;
  }
  
  return token;
},
    async session({ session, token }) {
      if (token && session.user) {
        session.user.name = token.name;
        if (token.id) {
          session.user.id = Number(token.id);
        }
        if (typeof token.isVerified === "boolean") {
          session.user.isVerified = token.isVerified;
        }
        session.user.email = token.email;
        session.accessToken =
          typeof token.accessToken === "string" ? token.accessToken : undefined;
        if (token.role) {
          session.user.role = token.role as string;
        }
        if (typeof token.otp === "string") {
          session.otp = token.otp;
          session.otpExpires =
            typeof token.otpExpires === "number" ? token.otpExpires : undefined;
        }
      }

      return session;
    },
    async signIn({ account }) {
      if (
        ["email-otp", "email-password", "google", "facebook"].includes(
          account?.provider ?? ""
        )
      ) {
        return true;
      }
      return false;
    },
  },
  pages: {
    signIn: "/accounts/sign-in",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
