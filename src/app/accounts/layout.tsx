import React from "react";
import Wrapper from "./Wrapper/Wrapper";
import Header from "@/layouts/header/Header";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
  <>
      <Header />
      <main
        className="flex-grow flex justify-center items-center md:min-h-[calc(100vh-180px)] relative"
        style={{
          backgroundImage: "url('/assets/images/sign-pattren.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Wrapper>{children}</Wrapper>
        
      </main>
      
  </>
  );
}
