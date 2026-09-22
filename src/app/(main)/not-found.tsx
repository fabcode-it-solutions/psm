// app/not-found.tsx
import React from "react";
import Header from "@/layouts/header/Header";
import Wrapper from "@/app/accounts/Wrapper/Wrapper";
import NotFoundContent from "@/component/global/NotFoundContent";

const NotFound: React.FC = () => {
  return (
    <>
      <main
        className="flex-grow flex justify-center items-center"
        style={{
          backgroundImage: "url('/assets/images/sign-pattren.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <NotFoundContent />
      </main>
    </>
  );
};

export default NotFound;
