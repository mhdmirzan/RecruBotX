// src/components/Security.jsx
import React from "react";
import { motion } from "framer-motion";
import { Shield, FileCheck, Lock, Cloud, BadgeCheck, Scale } from "lucide-react";
import bgImage from "../../assets/images/home/background.png";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const securityFeatures = [
  {
    icon: Shield,
    h: "End-to-End Encryption",
    p: "All video interviews and candidate data are protected with robust end-to-end encryption, ensuring secure transmission and storage.",
  },
  {
    icon: FileCheck,
    h: "GDPR & Data Compliance",
    p: "RecruBotX complies with global data protection laws including GDPR to safeguard privacy and maintain legal integrity.",
  },
  {
    icon: Lock,
    h: "Role-Based Access Control",
    p: "Only authorized personnel can access sensitive information via advanced role-based permissions and authentication.",
  },
  {
    icon: Cloud,
    h: "Secure Cloud Infrastructure",
    p: "Hosted on trusted cloud providers with audits, backups, high availability, and disaster recovery.",
  },
];

const Security = () => {
  return (
    <section
      id="security"
      className="relative w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1f44]/90 via-[#0a2a5e]/85 to-[#1a3a6e]/90" />

      <div className="max-w-7xl mx-auto px-6 md:px-16 py-20 relative z-10">
        {/* Header */}
        <motion.div className="text-center mb-12" {...fadeInUp}>
          <span className="inline-block px-4 py-1.5 bg-[#0a1f44]/50 backdrop-blur-sm border border-blue-400/20 rounded-full text-cyan-300 text-sm font-medium mb-4">
            <Shield className="w-4 h-4 inline-block mr-2 -mt-0.5" />
            Enterprise Security
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            What about{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              security?
            </span>
          </h2>
          <p className="text-lg text-blue-200/70 max-w-2xl mx-auto">
            Your data is protected by industry-leading security measures
          </p>
        </motion.div>

        {/* Security Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {securityFeatures.map((c, i) => {
            const IconComponent = c.icon;
            return (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="group bg-white/95 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-300 p-7 relative overflow-hidden"
              >
                {/* Unified Theme accent line */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-[#0a2a5e]/80`} />

                {/* Icon and content */}
                <div className="flex items-start gap-5">
                  <div
                    className={`flex-shrink-0 w-14 h-14 bg-[#0a2a5e]/5 border border-[#0a2a5e]/10 rounded-xl flex items-center justify-center group-hover:bg-[#0a2a5e]/10 transition-all duration-300`}
                  >
                    <IconComponent className="w-7 h-7 text-[#0a2a5e]" strokeWidth={1.8} />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-bold text-xl mb-2 group-hover:text-[#0a2a5e] transition-colors duration-300">
                      {c.h}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{c.p}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Legal & Ethics Banner - Clean Centered Design */}
        <motion.div
          className="mt-12 bg-gradient-to-r from-white/10 via-white/15 to-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          {/* Single centered icon */}
          <div className="w-16 h-16 bg-[#0a1f44] border border-blue-400/20 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-5">
            <BadgeCheck className="w-8 h-8 text-blue-300" strokeWidth={1.8} />
          </div>

          {/* Main heading */}
          <h3 className="text-2xl font-bold text-white mb-2">
            Legal & Ethical AI Interviewer
          </h3>

          {/* Description */}
          <p className="text-blue-200/80 max-w-2xl mx-auto mb-6">
            RecruBotX is fully compliant with global data protection laws, ensuring fair hiring practices
            and strict adherence to GDPR and privacy regulations.
          </p>

          {/* Trust badges row */}
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#0a1f44]/50 border border-blue-400/20 rounded-full">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span className="text-blue-100 text-sm font-medium">GDPR Certified</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-[#0a1f44]/50 border border-blue-400/20 rounded-full">
              <Scale className="w-4 h-4 text-cyan-400" />
              <span className="text-blue-100 text-sm font-medium">Legally Compliant</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-[#0a1f44]/50 border border-blue-400/20 rounded-full">
              <BadgeCheck className="w-4 h-4 text-cyan-400" />
              <span className="text-blue-100 text-sm font-medium">Ethical AI</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Security;
