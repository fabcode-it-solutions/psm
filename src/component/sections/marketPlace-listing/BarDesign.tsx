type BarProps = {
  height: number; 
  type: "increase" | "decrease";
  label: string;
};

const Bar: React.FC<BarProps> = ({ height,  label }) => {
  const maxBarHeight = 220;

  const barHeight = Math.min(height, maxBarHeight);
  const svgBlockHeight = 45;

  const fullBlocks = Math.floor(barHeight / svgBlockHeight);
  const remainder = barHeight % svgBlockHeight;

  const renderSvgBlock = (index: number, heightOverride?: number) => (
    <div
      key={index}
      className="relative w-full overflow-hidden bg-[#002029] "
      style={{
        height: `${heightOverride ?? svgBlockHeight}px`,
        borderTopLeftRadius: index === 0 ? "6px" : "0",
        borderTopRightRadius: index === 0 ? "6px" : "0",
        
        borderBottomLeftRadius:
          index === fullBlocks && remainder === 0 ? "6px" : "0",
        borderBottomRightRadius:
          index === fullBlocks && remainder === 0 ? "6px" : "0",
      }}
    >
      <svg
        className="absolute top-0 left-0 w-full h-full rounded-b-[10px] "
        viewBox="0 0 61 64"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <rect
          opacity="0.2"
          x="89.4229"
          y="-49.7559"
          width="28.462"
          height="205.401"
          rx="6"
          transform="rotate(60 89.4229 -49.7559)"
          fill="#ffffff"
        />
      </svg>
      <svg
        className="absolute top-0 left-0 w-full h-full "
        viewBox="0 0 61 64"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <rect
          opacity="0.2"
          x="121.141"
          y="-8.6748"
          width="28.462"
          height="205.401"
          rx="6"
          transform="rotate(60 113.141 -8.6748)"
          fill="#ffffff"
        />
      </svg>
    </div>
  );

  return (
    <div className="flex flex-col items-center w-[60px]">
      <div
        className="w-full rounded-t-md rounded-b-md bg-[#E8E8E8] overflow-hidden"
        style={{ height: maxBarHeight }}
      >
        <div className="flex flex-col justify-end h-full">
          {Array.from({ length: fullBlocks }).map((_, i) =>
            renderSvgBlock(i)
          )}

          {remainder > 0 && renderSvgBlock(fullBlocks, remainder)}
        </div>
      </div>
      <div className="text-sm text-[#002029] mt-[24px]">{label}</div>
    </div>
  );
};

export default Bar;
