import React from "react";

interface SearchInputProps {
  query: string;
  onQueryChange: (value: string) => void;
  placeholder?: string;
}

export const SearchInput = React.memo<SearchInputProps>(
  ({
    query,
    onQueryChange,
    placeholder = "Search for Car, Manufacturer, Parts, Users...",
  }) => {
    return (
      <div className="flex relative md:flex-row items-center bg-white rounded-[6px] shadow-md">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-5 top-1/2 -translate-y-1/2"
        >
          <path
            d="M10 2.5C14.1421 2.5 17.5 5.85786 17.5 10C17.5 11.7101 16.9276 13.2866 15.964 14.5483L20.7071 19.2929C21.0976 19.6834 21.0976 20.3166 20.7071 20.7071C20.3466 21.0676 19.7794 21.0953 19.3871 20.7903L19.2929 20.7071L14.5483 15.964C13.2866 16.9276 11.7101 17.5 10 17.5C5.85786 17.5 2.5 14.1421 2.5 10C2.5 5.85786 5.85786 2.5 10 2.5ZM10 4.5C6.96243 4.5 4.5 6.96243 4.5 10C4.5 13.0376 6.96243 15.5 10 15.5C13.0376 15.5 15.5 13.0376 15.5 10C15.5 6.96243 13.0376 4.5 10 4.5Z"
            fill="#002029"
          />
        </svg>

        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="flex-1 px-6 py-3 h-[58px] pl-[68px] max-mb-md:min-w-[90px] max-mb-sm:pl-[51px] max-tab-lg:pl-[62px] text-dark-blue-cm placeholder:text-dark-blue-cm outline-none font-poppins text-sm font-normal leading-[21px]"
        />

        <button className="bg-accent-100 max-tab-lg:text-sm max-tab-sm:min-w-[100px] text-dark-blue-cm font-bold text-base leading-6 min-w-[209px] py-2.5 rounded-[8px] mr-1 gap-1 flex items-center justify-center">
          Search Results
          <svg
            width="25"
            height="24"
            viewBox="0 0 25 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="max-tab-sm:hidden"
          >
            <path
              d="M14.2045 4.28401C13.8111 3.89639 13.178 3.90108 12.7904 4.29449C12.4027 4.68789 12.4074 5.32104 12.8008 5.70866L18.1712 11.0001H4.5C3.94771 11.0001 3.5 11.4478 3.5 12.0001C3.5 12.5523 3.94772 13.0001 4.5 13.0001H18.1646L12.8008 18.2849C12.4074 18.6726 12.4027 19.3057 12.7904 19.6991C13.178 20.0925 13.8111 20.0972 14.2045 19.7096L21.1287 12.8872C21.6256 12.3976 21.6256 11.596 21.1287 11.1064L14.2045 4.28401Z"
              fill="#002029"
            />
          </svg>
        </button>
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";
