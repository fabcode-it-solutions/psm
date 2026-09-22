import * as Toggle from "@radix-ui/react-toggle";

interface ToggleButtonProps {
  onPressedChange: (pressed: boolean) => void;
  pressed: boolean;
}

export default function ToggleButton({
  onPressedChange,
  pressed,
}: ToggleButtonProps) {
  return (
    <Toggle.Root
      pressed={pressed}
      onPressedChange={onPressedChange}
      className="group w-10 h-5 bg-[#E0E0E0] rounded-full relative transition-colors duration-400 cursor-pointer
                 data-[state=on]:bg-accent-100"
      aria-label="Toggle"
    >
      <div
        className="absolute top-0.5 bottom-0.5 right-[22px] w-4 bg-white rounded-full shadow 
                   transition-all duration-400 group-data-[state=on]:left-auto group-data-[state=on]:right-0.5"
      />
    </Toggle.Root>
  );
}
