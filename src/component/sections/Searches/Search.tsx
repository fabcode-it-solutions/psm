"use client";
import React from "react";
import PredictiveSearch from "../search/predictive-search/PredictiveSearch";
import { useSearchParams } from "next/navigation";
import Container from "@/component/ui/Container/Container";

const Search = () => {
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get("q") || "";

  return (
    <section>
      <div className="w-full flex justify-center py-8">
        <Container>
          <PredictiveSearch fullPage={true} initialQuery={queryFromUrl} />
        </Container>
      </div>
    </section>
  );
};

export default Search;
