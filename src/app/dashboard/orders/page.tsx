import React from "react";
import PageHeader from "@/component/dashboard/PageHeader";

const page = () => {
  return (
    <div className="bg-dark-100">
      <div className="mx-auto p-4">
        <PageHeader heading="Orders" describe="See all Orders" />
      </div>
    </div>
  );
};

export default page;
