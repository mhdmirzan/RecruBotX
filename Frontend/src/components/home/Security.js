// src/components/Security.jsx
import React from "react";
import bgImage from "../../assets/images/home/background.png";


const Security = () => {
  return (
    <section
      id="security"
      className="relative w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-16">
        <h2 className="text-white text-3xl font-bold text-center mb-10">
          What about security?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              h: "End-to-End Encryption",
              p: "All video interviews and candidate data are protected with robust end-to-end encryption, ensuring secure transmission and storage.",
            },
            {
              h: "GDPR & Data Compliance",
              p: "RecruBotX complies with global data protection laws including GDPR to safeguard privacy and maintain legal integrity.",
            },
            {
              h: "Role-Based Access Control",
              p: "Only authorized personnel can access sensitive information via advanced role-based permissions and authentication.",
            },
            {
              h: "Secure Cloud Infrastructure",
              p: "Hosted on trusted cloud providers with audits, backups, high availability, and disaster recovery.",
            },
          ].map((c, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-6">
              <h3 className="text-gray-900 font-bold text-xl mb-2">{c.h}</h3>
              <p className="text-gray-600">{c.p}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mt-10">
          <p className="text-[#4154F1] font-extrabold text-lg text-center md:text-left">
            RECRUBOTX IS LEGAL AND ETHICAL <br /> AI INTERVIEWER SOFTWARE
          </p>
          <p className="text-[#4154F1] text-sm text-center md:text-right max-w-lg">
            RecruBotX is ethical and legally compliant AI software, ensuring
            fair hiring practices and strict adherence to data protection
            regulations.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Security;
