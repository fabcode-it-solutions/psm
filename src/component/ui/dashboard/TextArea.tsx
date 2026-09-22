import { FormFieldError } from "@/types/parts.types";
import React, { useRef, useEffect } from "react";

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: FormFieldError;
  className?: string;
  label?: string;
  helpText?: string;
  autoResize?: boolean;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    { error, className = "", label, helpText, autoResize = true, ...props },
    ref
  ) => {
    const innerRef = useRef<HTMLTextAreaElement | null>(null);

    // merge external and internal refs
    const setRefs = (el: HTMLTextAreaElement) => {
      innerRef.current = el;
      if (typeof ref === "function") {
        ref(el);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current =
          el;
      }
    };

    const resize = () => {
      if (innerRef.current && autoResize) {
        innerRef.current.style.height = "auto"; // reset
        innerRef.current.style.height = `${innerRef.current.scrollHeight}px`; // adjust
      }
    };

    useEffect(() => {
      resize();
    }, [props.value]); // run whenever value changes

    return (
      <div>
        {label && (
          <label className="block text-sm text-light-100 mb-2 font-sofia-sans">
            {label}
          </label>
        )}

        <textarea
          ref={setRefs}
          className={`
            w-full px-3 py-2 bg-gray-5/10 border border-gray-5/20 rounded-lg 
            text-light-100 focus:ring-1 focus:ring-accent-100 focus:border-transparent 
            font-sofia-sans resize-none max-h-[216px]
            ${error?.message ? "border-red-500" : ""}
            ${className}
          `}
          onInput={resize}
          {...props}
        />
        {error?.message && (
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <p className="text-red-500 text-xs">{error.message}</p>
          </div>
        )}
        {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";
