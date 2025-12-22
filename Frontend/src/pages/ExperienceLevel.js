import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Briefcase, Layers, Crown } from "lucide-react";

const levels = [
  {
    title: "Student",
    desc: "Currently studying or fresh graduate",
    icon: GraduationCap,
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    title: "Entry Level",
    desc: "0–2 years of professional experience",
    icon: Briefcase,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Mid Level",
    desc: "2–5 years of industry experience",
    icon: Layers,
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    title: "Senior",
    desc: "5+ years, leadership or expert roles",
    icon: Crown,
    gradient: "from-orange-500 to-rose-500",
  },
];

const ExperienceLevel = () => {
  const navigate = useNavigate();
  const [level, setLevel] = useState(null);

  const handleNext = () => {
    if (!level) return alert("Please select your experience level");
    navigate("/candidate/resume/choose-template");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-10"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900">
            What’s your experience level?
          </h1>
          <p className="text-gray-500 mt-3">
            We’ll personalize your resume based on your career stage
          </p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {levels.map((item) => {
            const Icon = item.icon;
            const isActive = level === item.title;

            return (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                key={item.title}
                onClick={() => setLevel(item.title)}
                className={`relative p-6 rounded-2xl border text-left transition-all overflow-hidden group
                  ${
                    isActive
                      ? "border-transparent shadow-xl"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
              >
                {/* Gradient background */}
                {isActive && (
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-10`}
                  />
                )}

                <div className="relative flex items-start gap-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-r ${item.gradient} text-white shadow-lg`}
                  >
                    <Icon size={24} />
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {item.desc}
                    </p>
                  </div>
                </div>

                {isActive && (
                  <span className="absolute top-4 right-4 text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                    Selected
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Step 2 of 5 · Resume Builder
          </p>
          <button
            onClick={handleNext}
            className="px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 transition"
          >
            Continue →
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ExperienceLevel;