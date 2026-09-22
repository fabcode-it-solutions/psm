import React from "react";

const LinkSignInUp = () => {
  return (
    <div className="flex justify-center gap-3 mt-4 text-sm text-[#002029]">
      <a className="hover:underline" href="/privacy">Privacy</a>|
      <a className="hover:underline" href="/terms-conditions">Terms & Conditions</a>|
      <a className="hover:underline" href="/language">Language</a>|
      <a className="hover:underline" href="/help">Help</a>
    </div>
  );
};

export default LinkSignInUp;
