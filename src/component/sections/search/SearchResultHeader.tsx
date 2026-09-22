import React from 'react';

interface SearchResultHeaderProps {
  query: string;
  totalResults: number;
}

export const SearchResultHeader = React.memo<SearchResultHeaderProps>(({ query, totalResults }) => {
  return (
    <h2 className="text-left text-dark-blue-cm text-lg leading-[23px] relative z-[1] font-audiowide font-normal before:w-7 before:h-full before:bg-accent-100 before:absolute before:skew-x-[-18deg] before:left-[-6px] before:top-0 before:z-[-1]">
      {totalResults === 0 ? (
        "No Result found"
      ) : (
        <span>
          Search Result For : <b>{query}</b>
        </span>
      )}
    </h2>
  );
});

SearchResultHeader.displayName = 'SearchResultHeader';