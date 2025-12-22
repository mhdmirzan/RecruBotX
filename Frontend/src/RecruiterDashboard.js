import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  Briefcase,
  Video,
  BarChart3,
  PlusCircle,
  FileText,
  Upload,
  CheckCircle2
} from "lucide-react";

const RecruiterDashboard = () => {
  const stats = [
    {
      title: "Active Jobs",
      value: "8",
      icon: <Briefcase className="w-6 h-6 text-indigo-600" />,
    },
    {
      title: "Total Candidates",
      value: "124",
      icon: <Users className="w-6 h-6 text-green-600" />,
    },
    {
      title: "AI Interviews",
      value: "56",
      icon: <Video className="w-6 h-6 text-blue-600" />,
    },
    {
      title: "CVs Screened",
      value: "92",
      icon: <FileText className="w-6 h-6 text-purple-600" />,
    },
  ];

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      {/* Header */}
      <motion.div
        {...fadeIn}
        className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Recruiter Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Manage hiring, interviews & CV screening
          </p>
        </div>

        <button className="mt-4 md:mt-0 flex items-center bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700">
          <PlusCircle className="w-5 h-5 mr-2" />
          Post New Job
        </button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((item, index) => (
          <motion.div
            key={index}
            {...fadeIn}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between"
          >
            <div>
              <p className="text-sm text-gray-500">{item.title}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {item.value}
              </p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              {item.icon}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Jobs */}
        <motion.div
          {...fadeIn}
          className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Job Postings
          </h2>

          <div className="space-y-4">
            {["Frontend Developer", "Backend Engineer", "UI/UX Designer"].map(
              (job, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div>
                    <h3 className="font-medium text-gray-800">{job}</h3>
                    <p className="text-sm text-gray-500">
                      12–25 Candidates • AI Screening Enabled
                    </p>
                  </div>
                  <button className="text-indigo-600 hover:underline text-sm">
                    View
                  </button>
                </div>
              )
            )}
          </div>
        </motion.div>

        {/* CV Screening */}
        <motion.div
          {...fadeIn}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            CV Screening
          </h2>

          <div className="border-2 border-dashed rounded-lg p-5 text-center hover:bg-gray-50">
            <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600 text-sm mb-2">
              Upload candidate CVs for AI screening
            </p>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm">
              Upload CVs
            </button>
          </div>

          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Screened Today</span>
              <span className="font-medium text-gray-800">14</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Shortlisted</span>
              <span className="font-medium text-green-600">6</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Rejected</span>
              <span className="font-medium text-red-500">8</span>
            </div>
          </div>

          <button className="mt-5 w-full flex items-center justify-center border border-indigo-600 text-indigo-600 py-2 rounded-lg hover:bg-indigo-50 text-sm">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Start Screening
          </button>
        </motion.div>
      </div>

      {/* Analytics */}
      <motion.div
        {...fadeIn}
        className="mt-6 bg-white rounded-xl shadow-sm p-6"
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Hiring Analytics
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Interview Completion</span>
            <span className="font-medium text-gray-800">78%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Shortlisted</span>
            <span className="font-medium text-gray-800">32%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Avg. Hiring Time</span>
            <span className="font-medium text-gray-800">5.6 days</span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center text-indigo-600">
          <BarChart3 className="w-6 h-6 mr-2" />
          <span className="font-medium cursor-pointer">
            View Full Analytics
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default RecruiterDashboard;
