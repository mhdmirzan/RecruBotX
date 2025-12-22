import React from "react";
import { useNavigate } from "react-router-dom";

const CandidateResumeBuilder = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-xl w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Build Your ATS-Friendly Resume
        </h1>

        <p className="text-gray-600 mb-8">
          Create a professional resume that passes ATS systems and impresses recruiters.
        </p>

        <button
          onClick={() => navigate("/candidate/resume/onboarding")}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Start Building Resume →
        </button>
      </div>
    </div>
  );
};

export default CandidateResumeBuilder;
