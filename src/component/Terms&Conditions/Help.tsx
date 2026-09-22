import React from "react";

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "How do I create an account on Overlap?",
    answer:
      "Click on the Sign Up button on the homepage and provide the required details. Verify your email to activate your account.",
  },
  {
    question: "How can I list an item for sale?",
    answer:
      "Navigate to 'Sell on Overlap', add the item details, upload images, and post your listing. Make sure all information is accurate.",
  },
  {
    question: "What is the refund process?",
    answer:
      "You can request a refund within 7 days of delivery for items that are damaged, defective, or not as described. Refunds are subject to seller approval and platform policies.",
  },
  {
    question: "How do I contact support?",
    answer:
      "You can reach our support team via email at support@overlap.com or use the contact form available on the Help page.",
  },
];

const ContactBox = ({ email }: { email: string }) => (
  <div className="mt-10 p-4 bg-blue-50 border rounded-lg">
    <h2 className="font-semibold text-dark-blue-cm">Need More Help ?</h2>
    <p className="text-gray-700">
      Contact our support team at{" "}
      <a href={`mailto:${email}`} className="text-accent-100 hover:underline">
        {email}
      </a>{" "}
      or use the contact form on our platform.
    </p>
  </div>
);

const Help = () => {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 text-gray-700">
      <h1 className="text-3xl font-bold mb-6 text-[#09132C]">Help & Support</h1>
      <p className="text-gray-600 mb-8">
        Find answers to common questions or contact our support team for assistance on <span className="font-semibold">Overlap</span>.
      </p>

      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <section key={index} className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-2">{faq.question}</h2>
            <p className="text-gray-700">{faq.answer}</p>
          </section>
        ))}
      </div>

      <ContactBox email="support@overlap.com" />
    </div>
  );
};

export default Help;
