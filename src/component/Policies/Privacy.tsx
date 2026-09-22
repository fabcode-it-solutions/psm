import React from "react";

interface PolicySection {
  title: string;
  content?: string;
  list?: string[];
}

const sections: PolicySection[] = [
  {
    title: "Information We Collect",
    list: [
      "Personal information you provide (name, email, phone, etc.)",
      "Account activity and transaction history",
      "Device and usage data for analytics",
    ],
  },
  {
    title: "How We Use Your Information",
    list: [
      "To provide and improve our services",
      "To communicate with you about your account and transactions",
      "To prevent fraud and maintain platform security",
    ],
  },
  {
    title: "Data Sharing",
    content:
      "We do not sell your personal information. We may share data with service providers who assist us in operating our platform and with legal authorities when required.",
  },
  {
    title: "Cookies & Tracking",
    content:
      "We use cookies and similar technologies to enhance your experience, analyze trends, and manage the platform efficiently.",
  },
  {
    title: "Your Rights",
    list: [
      "Access and request a copy of your personal data",
      "Request corrections to inaccurate data",
      "Request deletion of your personal data, subject to legal obligations",
    ],
  },
  {
    title: "Changes to This Policy",
    content:
      "We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated date.",
  },
];

const HelpBox = ({ email }: { email: string }) => (
  <div className="mt-10 p-4 bg-blue-50 border rounded-lg">
    <h2 className="font-semibold text-dark-blue-cm">Need Help ?</h2>
    <p className="text-gray-700">
      For privacy-related concerns, contact us at{" "}
      <a href={`mailto:${email}`} className="text-accent-100 hover:underline">
        {email}
      </a>
      .
    </p>
  </div>
);

const Privacy = () => {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 text-gray-700">
      <h1 className="text-3xl font-bold mb-6 text-[#09132C]">Privacy Policy</h1>
      <p className="text-gray-600 mb-8">
        Your privacy is important to us. This Privacy Policy explains how{" "}
        <span className="font-semibold">Overlap</span> collects, uses, and protects
        your information.
      </p>

      <div className="space-y-6">
        {sections.map((section, index) => (
          <section key={index}>
            <h2 className="text-xl font-semibold mb-2">{section.title}</h2>
            {section.content && <p>{section.content}</p>}
            {section.list && (
              <ul className="list-disc list-inside space-y-2">
                {section.list.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <HelpBox email="support@overlap.com" />
    </div>
  );
};

export default Privacy;
