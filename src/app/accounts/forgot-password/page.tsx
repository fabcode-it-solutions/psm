import ForgotPassword from "@/component/sections/auth/forgot-password";
import { findUserByEmail } from "@/models/user.model";
import { Suspense } from "react";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const rawAuthO = (await searchParams).authO;
  const authO = Array.isArray(rawAuthO) ? rawAuthO[0] : rawAuthO;

  const existing = await findUserByEmail({ passwordToken: authO as string });

  return (
    <Suspense>
      <ForgotPassword
        user={
          !authO
            ? null
            : {
                isToken: !existing ? false : true,
                ...(existing?.passwordTokenExpire &&
                  authO && {
                    passwordTokenExpire: existing?.passwordTokenExpire
                      ? existing?.passwordTokenExpire > new Date()
                      : false,
                  }),
                email: existing?.email,
                authO: authO,
                id: existing?.id,
              }
        }
      />
    </Suspense>
  );
}
