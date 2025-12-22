import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Upload, Sparkles } from "lucide-react";

const ResumeSource = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl w-full bg-white rounded-[32px] shadow-2xl p-12"
      >
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-200 via-purple-200 to-pink-200 blur-2xl rounded-full" />
              <div className="relative w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg">
                <Sparkles size={28} />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            How would you like to create your resume?
          </h1>
          <p className="text-gray-500 mt-4 text-lg max-w-2xl mx-auto">
            Choose a starting point — you’ll be able to customize everything
            later.
          </p>
        </div>

        {/* Options */}
        <div className="grid md:grid-cols-2 gap-10">
          {/* Manual Resume */}
          <motion.div
            whileHover={{ y: -6 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/candidate/resume/builder")}
            className="group relative overflow-hidden rounded-3xl border border-gray-200 p-10 cursor-pointer transition-all hover:shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition" />

            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-6 shadow-lg">
                <FileText size={30} />
              </div>

              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                Build from scratch
              </h2>
              <p className="text-gray-600 mb-6">
                Create an ATS-friendly resume step by step using our smart
                editor.
              </p>

              <ul className="text-gray-600 space-y-2">
                <li>• ATS-optimized structure</li>
                <li>• Professional templates</li>
                <li>• Live preview & instant edits</li>
              </ul>

              <div className="mt-8 inline-flex items-center gap-2 font-semibold text-blue-600">
                Start building
                <span className="group-hover:translate-x-1 transition">→</span>
              </div>
            </div>
          </motion.div>

          {/* Upload Resume */}
          <motion.div
            whileHover={{ y: -6 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => alert("Upload resume feature coming soon")}
            className="group relative overflow-hidden rounded-3xl border border-gray-200 p-10 cursor-pointer transition-all hover:shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition" />

            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-6 shadow-lg">
                <Upload size={30} />
              </div>

              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                Upload existing resume
              </h2>
              <p className="text-gray-600 mb-6">
                Upload your resume and let RecruBotX analyze and enhance it for
                recruiters.
              </p>

              <ul className="text-gray-600 space-y-2">
                <li>• PDF & DOCX support</li>
                <li>• ATS score & insights</li>
                <li>• Smart content improvement</li>
              </ul>

              <div className="mt-8 inline-flex items-center gap-2 font-semibold text-emerald-600">
                Upload resume
                <span className="group-hover:translate-x-1 transition">→</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-16">
          Trusted by students & professionals to build job-winning resumes
        </div>
      </motion.div>
    </div>
  );
};

export default ResumeSource;