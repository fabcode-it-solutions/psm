import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { users } from "@/db/schema/auth";
export async function findUserByEmail({
  email,
  passwordToken,
}: {
  email?: string;
  passwordToken?: string;
}) {
  try {
    if (email) {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      
      return user ?? null;
    }
    if (passwordToken) {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.passwordToken, passwordToken))
        .limit(1);
      if (user) {
        user.password = "";
      }
      return user ?? null;
    }
    return null;
  } catch (error) {
    console.error("Error finding user by email:", error);
    return null;
  }
}

export async function createUser({
  phoneNumber,
  email,
  password,
  isSocialLogin = false,
  profileImage,
  countryCode,
  username,
}: {
  phoneNumber?: string;
  email: string;
  password: string;
  isSocialLogin?: boolean;
  profileImage?: string;
  countryCode?: string;
  username?: string;
}) {
  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    const [user] = await db
      .insert(users)
      .values({
        phoneNumber: phoneNumber ?? null,
        email,
        password: hashedPassword,
        isVerified: false,
        isSocialLogin,
        profileImage: profileImage ?? null,
        loginType: "Email",
        countryCode,
        role: "user",
        username: username,
      })
      .returning({
        id: users.id,
        phoneNumber: users.phoneNumber,
        email: users.email,
        isSocialLogin: users.isSocialLogin,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        profileImage: users.profileImage,
        loginType: users.loginType,
        countryCode: users?.countryCode,
        role: users?.role,
        username: users?.username,
      });

    return user;
  } catch (error) {
    if (error && typeof error === "object") {
      const s = JSON.stringify(error);
      if (s.includes("users_phone_number_unique")) {
        return {
          error:
            "Phone number already exists, please use another phone number.",
        };
      }
      if (s.includes("users_username_unique")) {
        return { error: "Username already exists" };
      }
    }
    console.error("Error creating user:", error);
  }
}

export async function getUserById(id: number) {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    if (user) {
      user.password = "";
    }
    return user ?? null;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    return null;
  }
}

export async function updateUser(
  identifier: { id?: number; email?: string; passwordToken?: string },
  data: Partial<typeof users.$inferInsert>
) {
  try {
    if (!identifier.id && !identifier.email && !identifier.passwordToken) {
      throw new Error("Either 'id' or 'email' must be provided");
    }

    const whereClause = identifier.id
      ? eq(users.id, identifier.id)
      : identifier.email
      ? eq(users.email, identifier.email!)
      : eq(users.passwordToken, identifier.passwordToken!);

    const [user] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(whereClause)
      .returning();
    user.password = "";
    return user;
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update user");
  }
}

export async function createOrUpdateUser({
  email,
  name,
  image,
  accessToken,
}: {
  email: string;
  name?: string | null;
  image?: string | null;
  accessToken?: string | null;
}) {
  try {
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const existingAccessToken = [];
    if (existing) {
      if (image && existing.profileImage !== image) {
        await db
          .update(users)
          .set({ profileImage: image })
          .where(eq(users.email, email));
      }
      return existing;
    }
    if (accessToken) {
      existingAccessToken.push(accessToken);
    }

    const newUser = await db
      .insert(users)
      .values({
        email,
        password: "",
        firstName: name || "",
        username: name?.replaceAll(" ", ""),
        profileImage: image || null,
        isVerified: true,
        isSocialLogin: true,
        loginType: "Google",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    newUser[0].password = "";
    return newUser[0];
  } catch (error) {
    console.error("Error creating or updating user:", error);
    throw new Error("Failed to create or update user");
  }
}
