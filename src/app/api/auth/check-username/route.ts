/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema/auth";
import {
  adjectives,
  Config,
  names,
  uniqueNamesGenerator,
} from "unique-names-generator";

const NODE_ENV = process.env.NODE_ENV;

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    let username = searchParams.get("q");

    if (!username) {
      return NextResponse.json(
        { error: "Username is required." },
        { status: 400 }
      );
    }

    let isUnique = false;
    let isExisting = false;

    while (!isUnique) {
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (!existingUser) {
        isUnique = true;
      } else {
        const config: Config = {
          dictionaries: [names, adjectives],
          style: "capital",
          separator: "",
        };
        username = uniqueNamesGenerator(config);
        isExisting = true;
      }
    }

    return NextResponse.json({ username, isExisting }, { status: 200 });
  } catch (error: any) {
    if (NODE_ENV === "development") {
      console.log(error);
    }
    return NextResponse.json(
      { message: "Server Error", error: error.message },
      { status: 500 }
    );
  }
}
