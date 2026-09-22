import React from "react";
import Image from "next/image";

type Header = {
  label: string;
  key: keyof Listing;
  width: string | number;
};

type Listing = {
  id: string;
  title: string;
  image: string;
  limitedPrice?: string;
  myOffer?: string;
  code: string;
  date: string;
  status: string;
  orderNumber?: string;
};

interface ListingTableProps {
  headers: Header[];
  listings: Listing[];
  onRowClick?: (item: Listing) => void;

}

const ListingTable: React.FC<ListingTableProps> = ({ headers, listings , onRowClick }) => {
  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "Published":
        return "#54DC00";
      case "Waiting For Approval":
      case "Approved":
        return "#CDD2C8";
      default:
        return "#002029";
    }
  };
  const getStatusTextColor = (status: string) => {
    if (status === "Published" || status === "Waiting For Approval") {
      return "#002029";
    }
    return "#FFFFFF";
  };

  const getSvgFillColor = (status: string) => {
    if (status === "Published" || status === "Waiting For Approval") {
      return "#002029";
    }
    return "white";
  };
  return (
    <section className="max-w-[1272px] w-full mx-auto  my-[30px] max-tab-lg:my-[30px] max-des-xs:px-4">
      <div className="flex justify-between bg-[#FFFFFF] border-[1.5px] border-[#F7F7F7] rounded-t-[8px] h-[77px] max-tab-lg:hidden mb-[2px]">
        {headers.map(({ label, width }) => (
          <div
            key={label}
            className="py-[27.5px] px-[16px] flex min-h-[77px]"
            style={{ width }}
          >
            <h2 className="text-[#828282] font-medium text-base leading-[1.2]">
              {label}
            </h2>
          </div>
        ))}
      </div>
      <div className="flex max-tab-lg:flex-row max-tab-lg:w-full max-tab-lg:overflow-x-scroll flex-col gap-[2px]">
        {listings.map((item) => (
          <div
            key={item.id}
            onClick={() => onRowClick?.(item)}
            className="flex bg-[#FFFFFF] cursor-pointer justify-between mb-[2px] max-tab-lg:flex-wrap max-tab-lg:mb-3 max-tab-lg:min-w-[300px] max-tab-lg:mr-[16px]"
          >
            {headers.map(({ key, width, label }) => {
              if (key === "title") {
                return (
                  <div
                    key={key}
                    className="py-[19.5px] px-[16px] flex gap-[16px] max-tab-lg:!w-full  max-tab-lg:flex-col max-tab-lg:pb-[15px]"
                    style={{ width }}
                  >
                    <div className="relative rounded-[7px] overflow-hidden">
                      <Image
                        src={item.image}
                        alt=""
                        width={75}
                        height={68}
                        className="min-h-[68px] object-cover max-tab-lg:w-full"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60" />
                    </div>
                    <span className="flex flex-col max-w-[178px] gap-1 max-tab-lg:max-w-full">
                      <h2 className="text-[#23201C] font-medium text-base leading-[1.38]">
                        {item.title}
                      </h2>
                      <p className="text-[16px] text-[#23201C] opacity-[60%] leading-[1.38]">
                        ID: {item.id}
                      </p>
                    </span>
                  </div>
                );
              }

              if (key === "status") {
                return (
                  <div
                    key={key}
                    className="px-[16px] items-center flex max-tab-lg:!w-full "
                    style={{ width }}
                  >
                    <button
                      className="py-[8px] px-4 max-tab-lg:hidden rounded-[20px] flex gap-2.5 items-center"
                      style={{ backgroundColor: getStatusBgColor(item.status) }}
                    >
                      <svg
                        width="9"
                        height="9"
                        viewBox="0 0 9 9"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          x="0.2"
                          y="0.5"
                          width="8"
                          height="8"
                          rx="4"
                          fill={getSvgFillColor(item.status)}
                        />
                      </svg>
                      <h2
                        className="font-medium text-base leading-[1.4] font-sofia-sans"
                        style={{ color: getStatusTextColor(item.status) }}
                      >
                        {item.status}
                      </h2>
                    </button>
                  </div>
                );
              }
              const value = item[key];
              if (!value) return null;
              return (
                <div
                  key={key}
                  className="px-[16px] items-center flex max-tab-lg:!w-full "
                  style={{ width }}
                >
                  <h2 className="text-[#23201C] font-medium text-base leading-[1.4] max-tab-lg:hidden">
                    {value}
                  </h2>
                  <span className="text-[#23201C] font-medium text-base leading-[1.4] flex gap-[20px] lg:hidden pb-[10px] max-tab-lg:w-full justify-between">
                    <p className="text-[#828282]">{label}</p> {value}
                  </span>
                </div>
              );
            })}
            <button
              className="py-[8px] px-4 lg:hidden rounded-[20px] flex gap-2.5 items-center mx-[16px]"
              style={{ backgroundColor: getStatusBgColor(item.status) }}
            >
              <svg
                width="9"
                height="9"
                viewBox="0 0 9 9"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="0.2"
                  y="0.5"
                  width="8"
                  height="8"
                  rx="4"
                  fill={getSvgFillColor(item.status)}
                />
              </svg>
              <h2
                className="font-medium text-base leading-[1.4] font-sofia-sans"
                style={{ color: getStatusTextColor(item.status) }}
              >
                {item.status}
              </h2>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ListingTable;
