import IconQuestionCircle from "@/assets/icons/IconQuestionCircle";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

interface TooltipProps {
  content: string;
  label?: string;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  alignOffset?: number;
}

export function Tooltip({
  content,
  label,
  side = "top",
  sideOffset = 18,
  alignOffset = -16,
}: TooltipProps) {

  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          <span className="cursor-pointer">
            <IconQuestionCircle />
          </span>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={sideOffset}
            align="start"
            alignOffset={alignOffset}
            className="z-50 rounded bg-white !cursor-pointer relative text-xs font-medium px-[14px] py-[13px] text-[#002029] shadow-[0_1px_3px_rgba(0,0,0,0.05)] max-w-[216px]"
          >
            {content}

            <span className="absolute -bottom-2.5 left-3.5">
              <svg
                width="20"
                height="10"
                viewBox="0 0 20 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M10 10L19.5263 0.25H0.473721L10 10Z" fill="#fff" />
              </svg>
            </span>
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>

      <span className="text-gray-5 font-supreme font-medium text-sm leading-4 tracking-normal">
        {label}
      </span>
    </TooltipPrimitive.Provider>
  );
}
