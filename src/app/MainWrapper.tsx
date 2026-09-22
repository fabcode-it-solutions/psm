/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useState } from "react";
import { useSession, SessionProvider } from "next-auth/react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/libs/redux/store";
import { useApiRequest } from "@/hooks/useApiRequest";
import { setUser } from "@/libs/redux/slices/authSlice";
import { InsertUsers } from "@/types";
import { CSRFInitializer } from "@/component/csrf/CsrfIntializer";
import { patchGlobalFetch } from "@/utils/globalIntercepter";

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const user = useSelector((state: RootState) => state.user.user)?.user;
  const { request } = useApiRequest();
  const dispatch = useDispatch();

  useEffect(() => {
    if (
      !user &&
      session &&
      (session?.user?.email != "undefined" || !session?.user?.email)
    ) {
      (async () => {
        const response = (await request({
          url: "/api/user?email=" + session.user.email,
          enableToast: false,
        })) as InsertUsers;
        if (response && response?.user) {
          const user = response?.user;
          localStorage.setItem("userIdOverlap", String(user.id));
          dispatch(setUser({ user }));
        }
      })();
    }

    patchGlobalFetch(); 
  }, [session]);
  return <div>{children}</div>;
};

const MainWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <CSRFInitializer/>
      <AuthWrapper>{children}</AuthWrapper>
    </SessionProvider>
  );
};

export default MainWrapper;
