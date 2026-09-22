"use client";
import React, { useEffect, useRef, useState } from "react";
import type { FormFieldError } from "../../../types/parts.types";
import Link from "next/link";
import { Check, PlusCircle } from "lucide-react";
import { getSlug } from "@/utils/getSlug";

export interface Option {
  label: string;
  value: string;
}

interface FormFieldProps {
  label?: string;
  value?: string | string[];
  error?: FormFieldError;
  required?: boolean;
  helpText?: string;
  name?: string;
  className?: string;
  placeholder?: string;
  type?: "text" | "number" | "tel" | "email" | "password" | "url";

  onChange?: (value: string) => void;
  mode?: "light" | "dark";
  options?: Option[];
  selectMode?: "single" | "multiple";
  href?: string;
  setSelected?: (val: Option[]) => void;
  limit?: number;
  enableEnter?: boolean;
  openOptions?: boolean;
  values?: Option[];
  resetAllValues?: () => void;
}

export const TagSelect: React.FC<FormFieldProps> = ({
  label,
  value,
  error,
  required = false,
  helpText,
  className = "",
  name,
  onChange,
  type,
  placeholder,

  mode = "dark",
  options = [],
  selectMode = "single",
  href,
  setSelected,
  limit,
  enableEnter = false,
  openOptions = false,
  values,
  resetAllValues,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [innerErrors, setInnerErrors] = useState<FormFieldError>();
  const [showDropdown, setShowDropdown] = useState(false);
  const isMultiple = selectMode === "multiple";
  const [selectedValues, setSelectedValues] = useState<Option[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  useEffect(() => {
    if (!values) return;

    setSelectedValues((prev) => {
      const same =
        prev.length === values.length &&
        prev.every((v, i) => v.value === values[i].value);

      return same ? prev : values;
    });
  }, [values]);
  const handleSelect = (option: Option) => {
    if (
      limit &&
      selectedValues.length >= limit &&
      !selectedValues.some((o) => o.value === option.value)
    ) {
      setInnerErrors({
        type: "Error",
        message: "You have reached the maximum number of " + label,
      });
      return null;
    }

    if (isMultiple) {
      setSelectedValues((prev) => {
        const exists = prev.some((o) => o.value === option.value);
        return exists
          ? prev.filter((o) => o.value !== option.value)
          : [...prev, option];
      });
    } else {
      setSelectedValues([option]);
    }
    if(selectMode == 'single'){
      setShowDropdown(false)
    }
    setInputValue("");
  };

  useEffect(() => {
    if (selectedValues && setSelected) {
      setSelected(selectedValues);
    }
  }, [selectedValues]);
  const handleRemoveTag = (val: string) => {
    if (isMultiple) {
      setSelectedValues((prev) => prev.filter((o) => o.value !== val));
    } else {
      setSelectedValues((prev) =>
        prev.length > 0 && prev[0].value === val ? [] : prev
      );
    }
  };

  const filteredOptions = options;

  return (
    <div className={`flex flex-col relative ${className}`} ref={containerRef}>
      {label && (
        <label
          className={`text-sm mb-2 font-sofia-sans flex items-center justify-between ${
            mode === "light" ? "text-dark-blue-cm" : "text-gray-4"
          }`}
        >
          {label} {required && "*"}{" "}
          {selectMode == "multiple" && selectedValues.length > 1 && (
            <button
              type="button"
              onClick={() => {
                setSelectedValues([]);
                if (resetAllValues) {
                  resetAllValues();
                }
              }}
              className="flex items-center gap-2 px-2 py-1 bg-accent-100/20 text-accent-100 text-xs rounded-lg hover:bg-accent-100/30 transition-colors font-sofia-sans font-medium"
            >
              ✕ Clear All
            </button>
          )}
        </label>
      )}

      <div className="relative">
        {/* Input */}
        <input
          type={type || "text"}
          name={name}
          value={isMultiple ? inputValue : value || inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowDropdown(true);
            if (onChange) {
              onChange(e.target.value);
            }
          }}
          onFocusCapture={() => {
            if (openOptions) {
              setShowDropdown(true);
            }
          }}
          onKeyDown={(e) => {
            if (e.key == "Escape" || e.keyCode == 27) {
              setShowDropdown(false);
            }
            if (enableEnter) {
              if (
                e.key === "Enter" ||
                e.keyCode == 13 ||
                e.key === "Tab" ||
                e.keyCode == 9
              ) {
                handleSelect({
                  label: inputValue,
                  value: inputValue,
                });
              }
            }
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder || ""}
          className={`w-full px-3 py-2 border border-gray-5/20 rounded-lg focus:ring-1 focus:ring-accent-100 focus:border-transparent font-sofia-sans
            ${error?.message ? "!border-red-500" : ""}
            ${
              mode === "light"
                ? "bg-light-300 text-dark-blue-cm"
                : "bg-gray-5/10 text-light-100"
            }`}
        />

        {/* Dropdown */}
        {(openOptions ? showDropdown : inputValue) &&
          showDropdown &&
          filteredOptions.length > 0 && (
            <div
              className={`border rounded-lg absolute w-full top-full ${
                mode === "light"
                  ? "bg-light-300 text-dark-blue-cm border-light-100"
                  : "bg-[#0b2830] text-light-100 border-gray-5/20"
              } mt-1 max-h-40 overflow-auto shadow-lg z-10`}
            >
              {filteredOptions.length > 0 &&
                filteredOptions.map((opt) => (
                  <div
                    key={`${getSlug(opt.label)}----${opt.value}`}
                    onClick={() => handleSelect(opt)}
                    className="px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-accent-100/10"
                  >
                    <span className="relative block">
                      <input
                        type="checkbox"
                        checked={selectedValues.includes(opt) || false}
                        className={`w-4 h-4  block border border-gray-5/20 rounded-xs appearance-none ${
                          selectedValues.includes(opt)
                            ? "bg-accent-100"
                            : "bg-gray-5/10"
                        }`}
                        onChange={() => ""}
                      />
                      {selectedValues.includes(opt) && (
                        <Check className="absolute block inset-0 w-3 h-3 top-1/2 left-1/2 -translate-1/2 text-dark-100" />
                      )}
                    </span>
                    {opt.label}
                  </div>
                ))}
            </div>
          )}

        {inputValue && showDropdown && href && options.length == 0 && (
          <div
            className={`border rounded-lg absolute w-full top-full ${
              mode === "light"
                ? "bg-light-300 text-dark-blue-cm border-light-100"
                : "bg-[#0b2830] text-light-100 border-gray-5/20"
            } mt-1 max-h-40 overflow-auto shadow-lg z-10`}
          >
            <div className="px-3 py-2  text-center text-gray-4">Not Found</div>
            <Link
              href={href || ""}
              className="flex items-center gap-2 hover:bg-accent-100/10 p-2 justify-center text-gray-4 border-t border-gray-5/20"
            >
              <PlusCircle /> Add {label}
            </Link>
          </div>
        )}
      </div>
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap my-1 gap-2">
          {selectedValues.map((val) => {
            return (
              <span
                key={`${getSlug(val.label)}----${val.value}`}
                className="flex items-center gap-1 bg-accent-100/20 text-accent-100 px-2 py-1 rounded-lg text-sm"
              >
                {val?.label}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(val.value)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </span>
            );
          })}
        </div>
      )}
      {error?.message ||
        (innerErrors?.message && (
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <p className="text-red-500 text-xs">
              {(error && error.message) || innerErrors?.message}
            </p>
          </div>
        ))}
      {!error?.message && !innerErrors?.message && helpText && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  );
};
