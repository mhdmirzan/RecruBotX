import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Briefcase, Play, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../apiConfig";

const DemoInterviewModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);


  const [formData, setFormData] = useState({
    jobTitle: "Software Engineer",
    candidateName: ""
  });

  const jobRoles = [
    "Software Engineer",
    "Product Manager",
    "Marketing Specialist",
    "Financial Analyst",
    "HR Representative",
    "Sales Executive"
  ];

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const submitData = new FormData();
      submitData.append("job_title", formData.jobTitle);
      submitData.append("candidate_name", formData.candidateName || "Demo User");

      const response = await fetch(`${API_BASE_URL}/interview/start-demo`, {
        method: "POST",
        body: submitData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to start demo interview");
      }

      // Pre-close so we don't see it when pressing back
      onClose();

      navigate("/candidate/interview-room", {
        state: {
          sessionId: data.session_id,
          candidateName: data.candidate_name,
          jobTitle: data.job_title,
          isDemo: true
        }
      });
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0a2a5e] to-[#0d3b82] p-6 flex justify-between items-start text-white relative">
            <div>
              <h2 className="text-2xl font-bold mb-1">Try Demo Interview</h2>
              <p className="text-blue-100 text-sm">Experience a 3-minute AI interview.</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Role to Interview For</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-[#0a2a5e] focus:border-[#0a2a5e] bg-white shadow-sm appearance-none"
                  >
                    {jobRoles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Name (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="candidateName"
                    value={formData.candidateName}
                    onChange={handleInputChange}
                    placeholder="E.g., John Doe"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-[#0a2a5e] focus:border-[#0a2a5e] shadow-sm"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl shadow-lg font-bold text-white bg-gradient-to-r from-[#0a2a5e] to-[#0d3b82] hover:from-[#061a3d] hover:to-[#0a2a5e] focus:ring-2 focus:ring-offset-2 focus:ring-[#0a2a5e] transition-all ${isLoading ? "opacity-75 cursor-not-allowed" : "hover:-translate-y-0.5"}`}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Starting...
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 fill-current" />
                      Start Interview
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DemoInterviewModal;
