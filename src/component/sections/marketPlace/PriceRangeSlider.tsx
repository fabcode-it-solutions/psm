import React, { useState } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
interface PriceRangeSliderProps {
  min?: number;
  max?: number;
  defaultValue?: [number, number];
  onChange?: (range: number[]) => void;
}

const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  min = 0,
  max = 4500,
  defaultValue,
  onChange = () => {},
}) => {
  const [range, setRange] = useState<number[]>(defaultValue ?? [min, max]);

  const leftPercent = ((range[0] - min) / (max - min)) * 100;
  const rightPercent = ((range[1] - min) / (max - min)) * 100;
  const rangeWidthPercent = rightPercent - leftPercent;
  const svgWidth = 258;
  const clipX = (svgWidth * leftPercent) / 100;
  const clipWidth = (svgWidth * rangeWidthPercent) / 100;

  const handleInputChange = (index: number, value: string) => {
    let val = Number(value);
    if (isNaN(val)) return;

    if (index === 0) {
      val = Math.min(Math.max(val, min), range[1]);
    } else {
      val = Math.max(Math.min(val, max), range[0]);
    }

    const newRange: number[] = [...range];
    newRange[index] = val;
    setRange(newRange);
    // onChange(newRange);
  };
  return (
    <>
      <div className="mx-auto relative select-none w-[300px] max-sm:w-[250px]">
        <svg
          width={svgWidth}
          height={88}
          viewBox="0 0 258 88"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: "block", width: "100%", height: "88px" }}
        >
          <defs>
            <linearGradient
              id="activeRangeGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="88"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#54DC0080" />
              <stop stopColor="#54DC0080" />
            </linearGradient>

            <clipPath id="rangeClip">
              <rect x={clipX} y="0" width={clipWidth} height="88" />
            </clipPath>
          </defs>

          <path
            d="M6.91817 58.2755L4.97649 68.1837L0.604492 88H6.91817H18.5682H32.16H43.8101H57.4019H70.9936H84.5854H98.1771H111.769H123.419H137.011H150.602H164.194H177.786H189.436H203.028H216.62H230.211H243.803H257.395C251.57 83.0459 247.686 65.2113 243.803 65.2113C237.978 65.2113 234.095 71.1561 230.211 63.2296C226.328 55.3031 220.503 31.5235 216.62 25.5787C212.736 18.643 208.853 28.5511 203.028 38.4593C199.145 48.3674 195.261 58.2755 189.436 58.2755C185.553 58.2755 181.669 48.3674 177.786 46.3858C171.961 45.395 168.078 51.3398 164.194 43.4133C160.311 35.4868 154.486 11.7072 150.602 11.7072C146.719 11.7072 140.894 35.4868 137.011 35.4868C133.127 35.4868 129.244 11.7072 123.419 3.78073C119.536 -4.14579 115.652 1.7991 111.769 8.7348C105.944 15.6705 102.06 21.6154 98.1771 25.5787C92.3521 28.5511 88.4687 28.5511 84.5854 36.4776C80.702 45.395 74.877 61.248 70.9936 65.2113C67.1102 68.1837 63.2269 58.2755 57.4019 53.3215C53.5185 48.3674 49.6351 48.3674 43.8101 51.3398C39.9267 55.3031 36.0434 61.248 32.16 55.3031C26.335 48.3674 22.4516 28.5511 18.5682 28.5511C14.6849 28.5511 8.85985 48.3674 6.91817 58.2755Z"
            fill="#E0E0E0"
          />

          <path
            clipPath="url(#rangeClip)"
            d="M6.91817 58.2755L4.97649 68.1837L0.604492 88H6.91817H18.5682H32.16H43.8101H57.4019H70.9936H84.5854H98.1771H111.769H123.419H137.011H150.602H164.194H177.786H189.436H203.028H216.62H230.211H243.803H257.395C251.57 83.0459 247.686 65.2113 243.803 65.2113C237.978 65.2113 234.095 71.1561 230.211 63.2296C226.328 55.3031 220.503 31.5235 216.62 25.5787C212.736 18.643 208.853 28.5511 203.028 38.4593C199.145 48.3674 195.261 58.2755 189.436 58.2755C185.553 58.2755 181.669 48.3674 177.786 46.3858C171.961 45.395 168.078 51.3398 164.194 43.4133C160.311 35.4868 154.486 11.7072 150.602 11.7072C146.719 11.7072 140.894 35.4868 137.011 35.4868C133.127 35.4868 129.244 11.7072 123.419 3.78073C119.536 -4.14579 115.652 1.7991 111.769 8.7348C105.944 15.6705 102.06 21.6154 98.1771 25.5787C92.3521 28.5511 88.4687 28.5511 84.5854 36.4776C80.702 45.395 74.877 61.248 70.9936 65.2113C67.1102 68.1837 63.2269 58.2755 57.4019 53.3215C53.5185 48.3674 49.6351 48.3674 43.8101 51.3398C39.9267 55.3031 36.0434 61.248 32.16 55.3031C26.335 48.3674 22.4516 28.5511 18.5682 28.5511C14.6849 28.5511 8.85985 48.3674 6.91817 58.2755Z"
            fill="url(#activeRangeGradient)"
          />
        </svg>
        <div className="mt-[-12px]">
          <Slider
            range
            min={min}
            max={max}
            value={range}
            onChange={(val: number | number[]) => {
              if (Array.isArray(val)) {
                setRange(val);
                onChange(val);
              }
            }}
            trackStyle={[{ backgroundColor: "#54DC00", height: 8 }]}
            railStyle={{ backgroundColor: "#E6E6E6", height: 8 }}
            handleStyle={[
              {
                borderColor: "#FFF",
                height: 25,
                width: 25,
                marginLeft: 12,
                marginTop: -6,
                backgroundColor: "#FFF",
                boxShadow: "0 0 8px rgba(0,0,0,0.1)",
              },
              {
                borderColor: "#FFF",
                height: 24,
                width: 24,
                marginLeft: -12,
                marginTop: -6,
                backgroundColor: "#FFF",
                boxShadow: "0 0 8px rgba(0,0,0,0.1)",
              },
            ]}
          />
        </div>
        <div className="flex justify-between pt-[14px] w-full gap-1">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="relative w-full max-w-[120px] flex items-center"
            >
              <span className="absolute left-2 text-[#002029] text-base font-sofia-sans leading-[1.188] tracking-[0.64px]">
                $
              </span>
              <input
                type="number"
                value={range[i]}
                min={min}
                max={max}
                onChange={(e) => handleInputChange(i, e.target.value)}
                className="pl-5 pr-2.5 py-[6px] border-[1px] rounded-[6px] w-full border-[#00000014] max-h-[31px] text-base font-sofia-sans font-normal leading-[1.188] tracking-[0.64px]"
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default PriceRangeSlider;
