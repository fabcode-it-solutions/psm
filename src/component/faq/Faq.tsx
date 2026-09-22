"use client";
import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    question: "What is Overlap?",
    answer:
      "Overlap is a platform where you can buy, sell, and discover unique car parts, accessories, and collectibles. It’s built for enthusiasts who want to trade and upgrade easily.",
  },
  {
    question: "How do I post a new listing?",
    answer:
      "Simply log in to your account, go to your dashboard, and click on 'Post a New Listing'. Fill in the details, upload images, and publish your listing.",
  },
  {
    question: "Is Overlap free to use?",
    answer:
      "Yes, creating an account and browsing listings is free. However, there may be transaction or promotional fees depending on your activities.",
  },
  {
    question: "How do I contact a seller?",
    answer:
      "Once you find an item you’re interested in, you can message the seller directly through the chat feature inside Overlap.",
  },
  {
    question: "Can I update or delete my listing?",
    answer:
      "Yes. From your dashboard, you can manage your listings. You can edit details, update pricing, or remove them at any time.",
  },
];

const Faq = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h1>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-2xl shadow-sm p-4 bg-white"
          >
            <button
              className="w-full flex justify-between items-center text-left"
              onClick={() => toggleFaq(index)}
            >
              <span className="font-medium text-lg">{faq.question}</span>
              {openIndex === index ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
            {openIndex === index && (
              <p className="mt-3 text-gray-600">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Faq;
