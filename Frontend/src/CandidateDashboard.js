import React, { useState, useEffect } from "react";
import { LogOut, FileText, Mic, Search, LayoutDashboard, Cog, Briefcase, Calendar, MapPin, CheckCircle, Clock, Send, ArrowRight, ChevronRight, Zap, DollarSign, Home, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "./utils/userDatabase";
import API_BASE_URL from "./apiConfig";

const CandidateDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Filter states
  const [interviewField, setInterviewField] = useState("all");
  const [position, setPosition] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  // Job postings from database
  const [jobPostings, setJobPostings] = useState([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);

  // Mock recent activities (top 3)
  const [recentActivities] = useState([
    {
      id: 1,
      action: "Application Submitted",
      description: "Applied to Software Engineer at Tech Corp",
      date: new Date("2024-12-28T14:30:00"),
      type: "application",
      icon: Send
    },
    {
      id: 2,
      action: "Interview Scheduled",
      description: "Technical interview with Data Solutions Inc",
      date: new Date("2024-12-27T10:15:00"),
      type: "interview",
      icon: Calendar
    },
    {
      id: 3,
      action: "Resume Updated",
      description: "Updated resume with new skills and experience",
      date: new Date("2024-12-26T16:45:00"),
      type: "update",
      icon: CheckCircle
    }
  ]);

  // Fetch job postings from database
  useEffect(() => {
    const fetchJobPostings = async () => {
      try {
        setIsLoadingJobs(true);
        // Fetch all job postings from all recruiters
        const response = await fetch(`${API_BASE_URL}/jobs/all`);
        if (!response.ok) {
          throw new Error('Failed to fetch jobs');
        }
        const data = await response.json();

        // Transform data to match our format
        const transformedJobs = data.map(job => ({
          id: job._id || job.id,
          company: `${job.interviewField} Position`,
          position: job.positionLevel,
          interviewField: job.interviewField,
          workModel: job.workModel,
          status: job.status,
          location: job.location,
          salaryRange: job.salaryRange,
          appliedDate: new Date(job.createdAt),
          isActive: job.isActive,
          jobDescription: job.jobDescription // Added jobDescription
        }));

        setJobPostings(transformedJobs);
      } catch (error) {
        console.error('Error fetching job postings:', error);
        // Keep empty array on error
        setJobPostings([]);
      } finally {
        setIsLoadingJobs(false);
      }
    };

    fetchJobPostings();
  }, []); // Fetch on mount

  // Get current user on component mount
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      // Redirect to login if not authenticated
      navigate("/signin/candidate");
    } else {
      setUser(currentUser);
    }
  }, [navigate]);


  // ✅ Logout Handler
  const handleLogout = () => {
    logoutUser();
    navigate("/signin/candidate");
  };

  // ✅ Start Interview Handler
  const handleStartInterview = () => {
    navigate("/candidate/interview");
  };

  // ✅ CV Screening Handler
  const handleCVScreening = () => {
    navigate("/candidate/analyze-resume");
  };

  // ✅ Create Resume Handler
  const handleCreateResume = () => {
    navigate("/candidate/resume/choose-template");
  };

  // Filter and sort job postings
  const getFilteredAndSortedJobs = () => {
    let filtered = [...jobPostings];

    // Apply interview field filter
    if (interviewField !== "all") {
      filtered = filtered.filter(job => {
        const jobFieldSlug = job.interviewField?.toLowerCase().replace(/\s+/g, '-');
        return jobFieldSlug === interviewField;
      });
    }

    // Apply position filter
    if (position !== "all") {
      filtered = filtered.filter(job => {
        const jobPosSlug = job.position?.toLowerCase().replace(/\s+/g, '-');
        return jobPosSlug === position;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "name") {
        return a.company.localeCompare(b.company);
      } else if (sortBy === "date-asc") {
        return a.appliedDate - b.appliedDate;
      } else { // date-desc
        return b.appliedDate - a.appliedDate;
      }
    });

    return filtered;
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "Full-time": return "bg-blue-100 text-blue-700";
      case "Part-time": return "bg-green-100 text-green-700";
      case "Contract": return "bg-yellow-100 text-yellow-700";
      case "Active": return "bg-green-100 text-green-700";
      case "Closed": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  // Get activity icon color
  const getActivityIconColor = (type) => {
    switch (type) {
      case "application": return "bg-blue-100 text-blue-600";
      case "interview": return "bg-green-100 text-green-600";
      case "update": return "bg-purple-100 text-purple-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  // Format relative time
  const getRelativeTime = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  // Show loading state while checking authentication
  if (!user) {
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
      {/* Sidebar - Always Visible, No Scroll */}
      <aside className="w-72 h-screen bg-white shadow-xl flex flex-col p-6 border-r border-gray-200 flex-shrink-0">

        {/* Logo */}
        <div className="mb-8 text-center flex-shrink-0">
          <h1 className="text-3xl font-bold text-blue-600">RecruBotX</h1>
        </div>

        <nav className="flex flex-col space-y-4 text-gray-700 flex-shrink-0">
          <NavLink
            to="/candidate/dashboard"
            className={({ isActive }) =>
              `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"}`
            }
          >
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </NavLink>

          <button
            onClick={handleStartInterview}
            className="font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 text-left"
          >
            <Mic className="w-5 h-5" /> Start Interview
          </button>

          <button
            onClick={handleCreateResume}
            className="font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 text-left"
          >
            <FileText className="w-5 h-5" /> Create Resume
          </button>

          <button
            onClick={handleCVScreening}
            className="font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 text-left"
          >
            <Search className="w-5 h-5" /> CV Screening
          </button>

          <NavLink
            to="/candidate/settings"
            className={({ isActive }) =>
              `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"}`
            }
          >
            <Cog className="w-5 h-5" /> Settings
          </NavLink>
        </nav>

        {/* Bottom Section - Logout Only */}
        <div className="mt-auto flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 rounded-xl text-white hover:from-red-600 hover:to-red-700 transition-all shadow-md"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content - Non-scrollable */}
      <main className="flex-1 h-screen flex flex-col overflow-hidden py-8 px-8">
        {/* Welcome Banner with User Profile */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-lg mb-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">

              <div>
                <h3 className="text-2xl font-bold">
                  Welcome back, {user.firstName}!
                </h3>
                <p className="mt-1 text-blue-100">Ready to ace your next interview? Let's get started.</p>

              </div>
            </div>

            {/* User Profile - Inside Banner */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <h3 className="font-bold text-white">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm text-blue-200">{user.email}</p>
              </div>
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-blue-900 font-bold text-xl shadow-lg overflow-hidden">
                {user.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Grid Layout */}
        <div className="flex-1 grid grid-cols-5 gap-6 overflow-hidden">
          {/* LEFT SECTION - Job Applications (60% - 3 columns) */}
          <div className="col-span-3 flex flex-col overflow-hidden">
            <div className="bg-white rounded-2xl shadow-lg p-6 h-full flex flex-col overflow-hidden">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Job Applications</h3>

              {/* Filters Section */}
              <div className="mb-4 grid grid-cols-3 gap-4">
                {/* Interview Field Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interview Field
                  </label>
                  <select
                    value={interviewField}
                    onChange={(e) => setInterviewField(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700"
                  >
                    <option value="all">All Fields</option>
                    <option value="software-engineering">Software Engineering</option>
                    <option value="data-science">Data Science</option>
                    <option value="product-management">Product Management</option>
                    <option value="ui-ux-design">UI/UX Design</option>
                    <option value="marketing">Marketing</option>
                    <option value="sales">Sales</option>
                    <option value="finance">Finance</option>
                    <option value="human-resources">Human Resources</option>
                  </select>
                </div>

                {/* Position Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position Level
                  </label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700"
                  >
                    <option value="all">All Levels</option>
                    <option value="intern">Intern</option>
                    <option value="junior">Junior</option>
                    <option value="mid-level">Mid-level</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Lead</option>
                    <option value="manager">Manager</option>
                    <option value="director">Director</option>
                  </select>
                </div>

                {/* Sort By Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700"
                  >
                    <option value="name">Name (A-Z)</option>
                    <option value="date-asc">Date (Oldest First)</option>
                    <option value="date-desc">Date (Newest First)</option>
                  </select>
                </div>
              </div>

              {/* Job Postings List */}
              <div className="flex-1 overflow-y-auto space-y-3">
                {isLoadingJobs ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading your applications...</p>
                  </div>
                ) : getFilteredAndSortedJobs().length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg font-medium">No job applications found</p>
                    <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
                  </div>
                ) : (
                  getFilteredAndSortedJobs().map((job) => (
                    <div
                      key={job.id}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 text-lg">{job.company}</h4>
                          <p className="text-blue-600 font-medium">{job.position}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                      </div>

                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600 flex-1">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Home className="w-4 h-4 text-blue-500" />
                            <span>{job.workModel}</span>
                          </div>
                          <div className="flex items-center gap-1 text-green-600 font-medium">
                            <DollarSign className="w-4 h-4" />
                            <span>{job.salaryRange}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <span>{job.appliedDate.toLocaleDateString()}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedJob(job);
                            setShowJobModal(true);
                          }}
                          className="flex items-center gap-0.5 text-blue-500 hover:text-blue-600 transition-all group whitespace-nowrap text-[13px] font-semibold"
                        >
                          More
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.4 transition-transform translate-y-[2px]" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SECTION (40% - 2 columns) */}
          <div className="col-span-2 flex flex-col gap-6 overflow-hidden">
            {/* CV Screening Info Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 flex-shrink-0 border border-blue-100">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">Get CV Recommendations</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Analyze your resume against job descriptions and get AI-powered recommendations to improve your chances.
                  </p>
                </div>
              </div>

              <button
                onClick={handleCVScreening}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
              >
                <span>Go to CV Screening</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Recent Activity Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 flex-1 overflow-hidden flex flex-col">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h3>
              <div className="flex-1 overflow-y-auto space-y-4">
                {recentActivities.map((activity) => {
                  const IconComponent = activity.icon;
                  return (
                    <div
                      key={activity.id}
                      className="flex gap-3 pb-4 border-b border-gray-100 last:border-0"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityIconColor(activity.type)}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-sm">{activity.action}</h4>
                        <p className="text-gray-600 text-xs mt-1">{activity.description}</p>
                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{getRelativeTime(activity.date)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Job Details Modal */}
      {showJobModal && selectedJob && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop with Blur */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setShowJobModal(false)}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-8 text-white relative">
              <button
                onClick={() => setShowJobModal(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div>
                <h2 className="text-3xl font-bold mb-2">{selectedJob.company}</h2>
                <div className="flex flex-wrap gap-3 items-center">
                  <span className="text-xl text-blue-200 font-medium">{selectedJob.position}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(selectedJob.status)}`}>
                    {selectedJob.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Location</span>
                  <div className="flex items-center gap-2 text-gray-800 font-medium">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    {selectedJob.location}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Salary</span>
                  <div className="flex items-center gap-2 text-gray-800 font-medium">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    {selectedJob.salaryRange}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Model</span>
                  <div className="flex items-center gap-2 text-gray-800 font-medium">
                    <Home className="w-5 h-5 text-blue-600" />
                    {selectedJob.workModel}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Posted</span>
                  <div className="flex items-center gap-2 text-gray-800 font-medium">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    {selectedJob.appliedDate.toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Job Description Section */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-xl font-bold text-gray-800 border-b pb-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  Job Description
                </h3>
                <div
                  className="prose max-w-none text-gray-700 leading-relaxed custom-job-content"
                  dangerouslySetInnerHTML={{ __html: selectedJob.jobDescription || '<p class="text-gray-400 italic">No description provided for this position.</p>' }}
                />
              </div>
            </div>

            {/* Footer with Apply Button */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-center">
              <button
                onClick={() => {
                  setShowJobModal(false);
                  navigate("/candidate/interview");
                }}
                className="group relative flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-3 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0"
              >
                <span>Apply</span>
                <Send className="w-5 h-5 group-hover:translate-x-[0.3px] group-hover:-translate-y-[0.3px] transition-transform" />
              </button>
            </div>
          </div>

          <style dangerouslySetInnerHTML={{
            __html: `
            .custom-job-content ul {
              list-style-type: disc !important;
              padding-left: 1.5rem !important;
              margin-top: 1rem !important;
              margin-bottom: 1rem !important;
            }
            .custom-job-content li {
              margin-bottom: 0.5rem !important;
            }
            .custom-job-content b, .custom-job-content strong {
              font-weight: 700 !important;
            }
          `}} />
        </div>
      )}
    </div>
  );
};

export default CandidateDashboard;
