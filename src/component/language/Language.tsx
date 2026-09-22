'use client'
import React, { useState } from "react";

const availableLanguages = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
];

const Language = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const handleLanguageChange = (code: string) => {
    setSelectedLanguage(code);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 text-gray-700">
      <h1 className="text-3xl font-bold mb-6 text-[#09132C]">Language</h1>
      <p className="text-gray-600 mb-8">
        Choose your preferred language to use <span className="font-semibold">Overlap</span>.
      </p>

      <div className="space-y-4">
        {availableLanguages.map((lang) => (
          <div
            key={lang.code}
            className={`flex items-center justify-between p-4 border rounded cursor-pointer hover:bg-gray-100 ${
              selectedLanguage === lang.code ? "bg-gray-200" : ""
            }`}
            onClick={() => handleLanguageChange(lang.code)}
          >
            <span>{lang.label}</span>
            {selectedLanguage === lang.code && (
              <span className="text-green-600 font-semibold">Selected</span>
            )}
          </div>
        ))}
      </div>

      <p className="mt-6 text-gray-500 text-sm">
        Your language preference will be applied to the platform wherever possible.
      </p>
      <p className="mt-6 text-gray-500 text-xs">
        Only <span className="text-dark-blue-cm font-bold">English </span>is available for now.
      </p>
    </div>
  );
};

export default Language;
