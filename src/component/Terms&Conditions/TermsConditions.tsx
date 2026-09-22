import React from "react";

interface PolicySection {
  title: string;
  content?: string;
  list?: string[];
}

const sections: PolicySection[] = [
  {
    title: "Acceptance of Terms",
    content:
      "By using the Overlap platform, you agree to comply with these Terms and Conditions. If you do not agree, please do not use our services.",
  },
  {
    title: "Account Responsibilities",
    list: [
      "You are responsible for maintaining the confidentiality of your account credentials.",
      "You agree to provide accurate information when creating an account.",
      "You are responsible for all activities under your account.",
    ],
  },
  {
    title: "Listings and Transactions",
    list: [
      "All items listed must be accurately described.",
      "Overlap is a platform for connecting buyers and sellers; we are not responsible for transactions or disputes.",
      "Sellers must comply with all applicable laws and regulations.",
    ],
  },
  {
    title: "Prohibited Activities",
    list: [
      "Posting illegal or counterfeit items.",
      "Attempting to harm or disrupt the platform.",
      "Using the platform for fraudulent purposes.",
    ],
  },
  {
    title: "Limitation of Liability",
    content:
      "Overlap is not liable for any direct, indirect, or consequential damages arising from the use of the platform, including disputes between buyers and sellers.",
  },
  {
    title: "Modifications to Terms",
    content:
      "We may update these Terms and Conditions from time to time. Changes will be effective upon posting on this page. Continued use of the platform constitutes acceptance of the updated terms.",
  },
  {
    title: "Governing Law",
    content:
      "These Terms and Conditions are governed by the laws of the country in which Overlap operates, without regard to conflict of law principles.",
  },
];

const HelpBox = ({ email }: { email: string }) => (
  <div className="mt-10 p-4 bg-blue-50 border rounded-lg">
    <h2 className="font-semibold text-dark-blue-cm">Need Help ?</h2>
    <p className="text-gray-700">
      For any questions regarding these Terms & Conditions, contact us at{" "}
      <a href={`mailto:${email}`} className="text-accent-100 hover:underline">
        {email}
      </a>
      .
    </p>
  </div>
);

const TermsConditions = () => {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 text-gray-700">
      <h1 className="text-3xl font-bold mb-6 text-[#09132C]">Terms & Conditions</h1>
      <p className="text-gray-600 mb-8">
        These Terms and Conditions govern your use of the <span className="font-semibold">Overlap</span> platform.
        Please read them carefully before using our services.
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

export default TermsConditions;
