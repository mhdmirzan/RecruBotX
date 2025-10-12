import React from "react";
import { motion } from "framer-motion";

// ✅ Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

// ✅ Steps Data
const howItWorksSteps = [
  {
    title: "CV Parsing & Screening",
    description:
      "Uses NLP to extract key information from resumes and filter candidates based on job-specific requirements.",
    icon: "📝",
  },
  {
    title: "Interview Scheduling",
    description:
      "Automatically schedules interviews using Google Calendar / Outlook API and sends invites via email.",
    icon: "📅",
  },
  {
    title: "Interview Session Launch",
    description:
      "Initiates a video interview using integrated platforms like Zoom, Jitsi, or Twilio Video SDK at the scheduled time.",
    icon: "🎥",
  },
  {
    title: "LLM-Powered Interviewing",
    description:
      "A large language model (LLM) agent asks dynamic, role-based questions tailored to the candidate’s profile.",
    icon: "🤖",
  },
  {
    title: "Facial Expression Analysis",
    description:
      "Uses AI tools like OpenCV, DeepFace, or MediaPipe to assess non-verbal cues such as confidence, engagement, and emotions.",
    icon: "😊",
  },
  {
    title: "Response Evaluation",
    description:
      "Analyzes verbal and visual data to generate a comprehensive evaluation report with objective scoring.",
    icon: "📊",
  },
  {
    title: "Dual Mode Support",
    description:
      "Supports real interviews for companies and practice simulations for job seekers using the same intelligent flow.",
    icon: "🔄",
  },
  {
    title: "Data Logging",
    description:
      "Stores all session data and reports in a secure database (MongoDB / PostgreSQL) for HR review, analytics, and feedback.",
    icon: "💾",
  },
];

const WorkingProcess = () => {
  return (
    <section className="bg-[#0a2a5e] text-white py-14 md:py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div className="text-center mb-10" {...fadeInUp}>
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            How It Works
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Our AI-powered system automates every step of the recruitment process
          </p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {howItWorksSteps.map((step, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="bg-white text-gray-900 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-8 text-center"
            >
              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl">
                {step.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>

              {/* Description */}
              <p className="text-gray-600 text-sm">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default WorkingProcess;
