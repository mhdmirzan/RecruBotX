import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, NavLink } from "react-router-dom";
import {
  Users,
  Briefcase,
  Video,
  BarChart3,
  PlusCircle,
  FileText,
  LayoutDashboard,
  TrendingUp,
  Settings,
  LogOut,
  X,
  Trash2
} from "lucide-react";
import API_BASE_URL from "./apiConfig";

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const [recruiterData, setRecruiterData] = useState(null);
  const [jobPostings, setJobPostings] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    activeJobs: 0,
    totalCandidates: 0,
    aiInterviews: 0,
    cvsScreened: 0
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("recruiterUser");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setRecruiterData(user);
      fetchJobPostings(user.id);
    } else {
      navigate("/recruiter/signin");
    }
  }, [navigate]);

  const fetchJobPostings = async (recruiterId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/recruiter/${recruiterId}`);
      if (!response.ok) throw new Error("Failed to fetch job postings");
      const data = await response.json();

      // Sort by creation date (most recent first) and get top 6
      const sortedJobs = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setJobPostings(sortedJobs.slice(0, 6));

      // Update stats - now using cvFilesCount from backend (Reference Pattern)
      setDashboardStats({
        activeJobs: data.length,
        totalCandidates: data.reduce((sum, job) => sum + (job.cvFilesCount || 0), 0),
        aiInterviews: data.filter(job => (job.cvFilesCount || 0) > 0).length,
        cvsScreened: data.reduce((sum, job) => sum + (job.cvFilesCount || 0), 0)
      });
    } catch (error) {
      console.error("Error fetching job postings:", error);
    }
  };

  const handleViewJob = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("recruiterUser");
    navigate("/recruiter/signin");
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this job posting? This action cannot be undone.")) {
      try {
        const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
          method: 'DELETE',
        });
        const data = await response.json();

        if (data.success) {
          // Refresh job postings and stats
          fetchJobPostings(recruiterData.id);
        } else {
          alert("Failed to delete job posting: " + (data.message || "Unknown error"));
        }
      } catch (error) {
        console.error("Error deleting job posting:", error);
        alert("An error occurred while deleting the job posting.");
      }
    }
  };

  if (!recruiterData) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden fixed inset-0">
      {/* Sidebar */}
      <aside className="w-72 h-screen bg-white shadow-xl flex flex-col p-6 border-r border-gray-200 flex-shrink-0">
        <div className="mb-8 text-center flex-shrink-0">
          <h1 className="text-3xl font-bold text-blue-600">RecruBotX</h1>
        </div>

        <nav className="flex flex-col space-y-4 text-gray-700 flex-shrink-0">
          <NavLink
            to="/recruiter/dashboard"
            className={({ isActive }) =>
              `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </NavLink>

          <NavLink
            to="/recruiter/job-posting"
            className={({ isActive }) =>
              `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
              }`
            }
          >
            <PlusCircle className="w-5 h-5" /> Job Posting
          </NavLink>

          <NavLink
            to="/recruiter/ranking"
            className={({ isActive }) =>
              `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
              }`
            }
          >
            <TrendingUp className="w-5 h-5" /> Ranking
          </NavLink>

          <NavLink
            to="/recruiter/evaluation"
            className={({ isActive }) =>
              `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
              }`
            }
          >
            <BarChart3 className="w-5 h-5" /> Evaluation
          </NavLink>

          <NavLink
            to="/recruiter/settings"
            className={({ isActive }) =>
              `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
              }`
            }
          >
            <Settings className="w-5 h-5" /> Settings
          </NavLink>
        </nav>

        <div className="mt-auto flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 rounded-xl text-white hover:from-red-600 hover:to-red-700 transition-all shadow-md"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen flex flex-col overflow-hidden py-8 px-8">
        {/* Welcome Banner with User Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 mb-6 text-white shadow-lg flex-shrink-0"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Welcome back, {recruiterData.firstName}!</h2>
              <p className="text-blue-100 mt-1">Manage your hiring pipeline and find the best talent efficiently.</p>
            </div>

            {/* User Profile - Inside Banner */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <h3 className="font-bold text-white">
                  {recruiterData.firstName} {recruiterData.lastName}
                </h3>
                <p className="text-sm text-blue-200">{recruiterData.email}</p>
              </div>
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-blue-900 font-bold text-xl shadow-lg overflow-hidden">
                {recruiterData.profileImage ? (
                  <img src={recruiterData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <>{recruiterData.firstName?.charAt(0)}{recruiterData.lastName?.charAt(0)}</>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards - Fixed */}
        <div className="grid grid-cols-4 gap-6 mb-6 flex-shrink-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Active Jobs</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">{dashboardStats.activeJobs}</h3>
              </div>
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                <Briefcase className="w-7 h-7 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Candidates</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">{dashboardStats.totalCandidates}</h3>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                <Users className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">AI Interviews</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">{dashboardStats.aiInterviews}</h3>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <Video className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">CVs Screened</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">{dashboardStats.cvsScreened}</h3>
              </div>
              <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center">
                <FileText className="w-7 h-7 text-pink-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Job Postings - Fixed height container with scrollable content */}
        <div className="bg-white rounded-2xl shadow-lg flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 p-6 pb-4 flex-shrink-0 border-b border-gray-100">
            <Briefcase className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-800">Recent Job Postings</h3>
          </div>

          {jobPostings.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-500 p-6">
              <div className="text-center">
                <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No job postings yet</p>
                <p className="text-sm mt-2">Create your first job posting to get started!</p>
                <button
                  onClick={() => navigate('/recruiter/job-posting')}
                  className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
                >
                  Create Job Posting
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {jobPostings.map((job, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-300 transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 text-lg mb-1">
                          {job.interviewField}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {job.positionLevel} • {job.cvFilesCount || 0} Candidates
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                      <span className="text-xs text-gray-400 flex-1">
                        {new Date(job.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewJob(job)}
                          className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border border-blue-100"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job.id || job._id)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all border border-red-100"
                          title="Delete Job Posting"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal for Job Details */}
      {isModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={closeModal}
          ></motion.div>

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedJob.interviewField}</h2>
                  <p className="text-blue-100">{selectedJob.positionLevel}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Job Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <p className="text-sm text-gray-600 mb-1 font-medium">Interview Field</p>
                  <p className="font-bold text-gray-800 text-lg">{selectedJob.interviewField}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <p className="text-sm text-gray-600 mb-1 font-medium">Position Level</p>
                  <p className="font-bold text-gray-800 text-lg">{selectedJob.positionLevel}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <p className="text-sm text-gray-600 mb-1 font-medium">Number of Questions</p>
                  <p className="font-bold text-gray-800 text-lg">{selectedJob.numberOfQuestions}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <p className="text-sm text-gray-600 mb-1 font-medium">Top N CVs</p>
                  <p className="font-bold text-gray-800 text-lg">{selectedJob.topNCvs}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <p className="text-sm text-gray-600 mb-1 font-medium">Total CVs Uploaded</p>
                  <p className="font-bold text-gray-800 text-lg">{selectedJob.cvFilesCount || 0}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <p className="text-sm text-gray-600 mb-1 font-medium">Created Date</p>
                  <p className="font-bold text-gray-800 text-lg">
                    {new Date(selectedJob.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Job Description */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Job Description
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedJob.jobDescription}
                  </p>
                </div>
              </div>

              {/* Action Buttons - Right Aligned */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    navigate('/recruiter/ranking');
                    closeModal();
                  }}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md flex items-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  View Rankings
                </button>
                <button
                  onClick={() => {
                    navigate('/recruiter/evaluation');
                    closeModal();
                  }}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  View Evaluations
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard;
