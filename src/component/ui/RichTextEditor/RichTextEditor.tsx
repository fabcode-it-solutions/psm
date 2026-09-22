"use client";
import { FormFieldError } from "@/types/parts.types";
import dynamic from "next/dynamic";
const JoditEditor = dynamic(() => import("jodit-react"), {
  ssr: false,
});
import { useEffect, useMemo, useRef, useState } from "react";

const RichTextEditor = ({
  placeholder = "Please enter description",
  error,
  label,
  helpText,
  required = false,
  value,
  onChange
}: {
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: FormFieldError;
  label?: string;
  helpText?: string;
  required?: boolean;
  value?: string;
}) => {
  const editor = useRef(null);
  const [content, setContent] = useState("");
  const config = useMemo(
    () => ({
      readonly: false,
      height: 400,
      theme: "dark",
      placeholder,
      buttons:
        "fontsize,bold,italic,underline,link,strikethrough,eraser,ul,ol,paragraph,lineHeight,paste",
    }),
    [placeholder]
  );
  useEffect(() => {
    if (value) {
      setContent(value);
    } else {
      setContent("");
    }
  }, [value]);
  return (
    <div>
      {label && (
        <label className={`block text-sm  mb-2 font-sofia-sans text-light-100`}>
          {label} {required && "*"}
        </label>
      )}
      <JoditEditor
        ref={editor}
        value={content}
        tabIndex={1}
        config={config}
        onChange={(newContent) => {
          setContent(newContent);
          if(onChange){
            onChange(newContent)
          }
        }}
      />
      {error?.message && (
        <div className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <p className="text-red-500 text-xs">{error.message}</p>
        </div>
      )}
      {!error?.message && helpText && (
        <p className="text-xs mt-2 text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

export default RichTextEditor;
