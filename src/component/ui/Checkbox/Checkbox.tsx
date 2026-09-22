import { cn } from "@sglara/cn";
import { Check } from "lucide-react";
import React, {
  Dispatch,
  SetStateAction,  
  useEffect,
  useState,
} from "react";

const Checkbox = ({
  className,
  id,
  selectedImages,
  setSelectedImages,
}: {
  setSelectedImages?: Dispatch<SetStateAction<[number]>>;
  checked?: boolean;
  className?: string;
  selectedImages: [number];
  id: number;
}) => {
  const [check, setCheck] = useState(false);
  useEffect(() => {
    if (check && setSelectedImages && !selectedImages.includes(id)) {
      const items = selectedImages ?? [];
      items.push(id);
      console.log(items);

      setSelectedImages(items);
    }
  }, [check]);

  useEffect(() => {
    if (selectedImages.includes(id)) {
      setCheck(true);
    }
  }, []);
  return (
    <div className={cn(className)}>
      <button
        type="button"
        onClick={() => setCheck((prev) => !prev)}
        className={cn(
          "w-4 h-4 border border-gray-2/20  rounded-sm flex items-center justify-center before:absolute before:w-full before:h-full before:top-0 before:left-0",
          check ? "bg-accent-100" : "bg-white"
        )}
      >
        {check ? <Check className="w-3 h-3" /> : ""}
      </button>
    </div>
  );
};

export default Checkbox;
