import React, { useState, useEffect } from "react";
import { Search, Briefcase, MapPin, DollarSign, Calendar, ChevronRight, Send, Filter, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "./utils/userDatabase";
import API_BASE_URL from "./apiConfig";
import UserProfileHeader from "./components/UserProfileHeader";
import CandidateSidebar from "./components/CandidateSidebar";

const CandidateJobs = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    // Filter states
    const [interviewField, setInterviewField] = useState("all");
    const [position, setPosition] = useState("all");
    const [sortBy, setSortBy] = useState("date-desc");
    const [searchTerm, setSearchTerm] = useState("");

    // Job postings
    const [jobPostings, setJobPostings] = useState([]);
    const [isLoadingJobs, setIsLoadingJobs] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const [showJobModal, setShowJobModal] = useState(false);

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            navigate("/candidate/signin");
        } else {
            setUser(currentUser);
            fetchJobPostings();
        }
    }, [navigate]);

    const fetchJobPostings = async () => {
        try {
            setIsLoadingJobs(true);
            const response = await fetch(`${API_BASE_URL}/jobs/all`);
            if (response.ok) {
                const data = await response.json();
                // Transform data
                const transformed = data.map(job => ({
                    id: job._id || job.id,
                    company: `${job.interviewField} Position`, // Using field as company name proxy for now
                    title: job.interviewField,
                    position: job.positionLevel,
                    interviewField: job.interviewField,
                    workModel: job.workModel,
                    status: job.status,
                    location: job.location,
                    salaryRange: job.salaryRange,
                    experienceRange: job.experienceRange,
                    industryDomain: job.industryDomain,
                    jobDescription: job.jobDescription,
                    appliedDate: new Date(job.createdAt),
                    isActive: job.isActive
                }));
                setJobPostings(transformed);
            }
        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setIsLoadingJobs(false);
        }
    };

    const getFilteredJobs = () => {
        let filtered = [...jobPostings];

        // Text Search
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(job =>
                job.title.toLowerCase().includes(lowerTerm) ||
                job.location.toLowerCase().includes(lowerTerm) ||
                job.company.toLowerCase().includes(lowerTerm)
            );
        }

        // Field Filter
        if (interviewField !== "all") {
            filtered = filtered.filter(job => {
                const slug = job.interviewField?.toLowerCase().replace(/\s+/g, '-');
                return slug === interviewField;
            });
        }

        // Position Filter
        if (position !== "all") {
            filtered = filtered.filter(job => {
                const slug = job.position?.toLowerCase().replace(/\s+/g, '-');
                return slug === position;
            });
        }

        // Sort
        filtered.sort((a, b) => {
            if (sortBy === "name") return a.title.localeCompare(b.title);
            if (sortBy === "date-asc") return a.appliedDate - b.appliedDate;
            return b.appliedDate - a.appliedDate;
        });

        return filtered;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Full-time": return "bg-blue-100 text-blue-700";
            case "Part-time": return "bg-green-100 text-green-700";
            case "Contract": return "bg-yellow-100 text-yellow-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    if (!user) return null;

    return (
        <div className="h-screen w-screen flex bg-gray-50 overflow-hidden fixed inset-0">
            {/* Sidebar */}
            <CandidateSidebar />

            {/* Main Content */}
            <main className="flex-1 h-screen flex flex-col overflow-hidden py-8 px-8">
                {/* Header */}
                <div className="mb-6 flex-shrink-0 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-[#0a2a5e]">Job Applications</h2>
                        <p className="text-gray-500 text-md mt-1 py-2">Explore and apply to open positions</p>
                    </div>

                    <UserProfileHeader user={user} />
                </div>

                {/* Filters & Content */}
                <div className="flex-1 overflow-hidden p-8 flex flex-col gap-6">

                    {/* Filter Bar */}
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-[250px] relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search jobs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-800 rounded-xl focus:ring-2 focus:ring-[#0a2a5e] focus:border-transparent outline-none"
                            />
                        </div>

                        <div className="flex gap-4">
                            <select
                                value={interviewField}
                                onChange={(e) => setInterviewField(e.target.value)}
                                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-[#0a2a5e] outline-none cursor-pointer"
                            >
                                <option value="all">All Fields</option>
                                <option value="software-engineering">Software Engineering</option>
                                <option value="data-science">Data Science</option>
                                <option value="product-management">Product Management</option>
                            </select>

                            <select
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-[#0a2a5e] outline-none cursor-pointer"
                            >
                                <option value="all">All Levels</option>
                                <option value="intern">Intern</option>
                                <option value="junior">Junior</option>
                                <option value="mid-level">Mid-level</option>
                                <option value="senior">Senior</option>
                            </select>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-[#0a2a5e] outline-none cursor-pointer"
                            >
                                <option value="date-desc">Newest First</option>
                                <option value="date-asc">Oldest First</option>
                                <option value="name">Name (A-Z)</option>
                            </select>
                        </div>
                    </div>

                    {/* Job Grid */}
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {isLoadingJobs ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a2a5e]"></div>
                            </div>
                        ) : getFilteredJobs().length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                <Briefcase className="w-16 h-16 mb-4 opacity-20" />
                                <p>No jobs found matching your criteria</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {getFilteredJobs().map(job => (
                                    <div key={job.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group flex flex-col">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-xl text-gray-800 group-hover:text-[#0a2a5e] transition-colors">{job.title}</h3>
                                                <p className="text-gray-500 font-medium">{job.position}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(job.status)}`}>
                                                {job.status}
                                            </span>
                                        </div>

                                        <div className="space-y-2 mb-6 flex-1">
                                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                                <MapPin className="w-4 h-4" /> {job.location}
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                                <Briefcase className="w-4 h-4" /> {job.workModel}
                                            </div>
                                            <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
                                                <DollarSign className="w-4 h-4" /> {job.salaryRange}
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                                <Calendar className="w-4 h-4" /> Posted {job.appliedDate.toLocaleDateString()}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => {
                                                setSelectedJob(job);
                                                setShowJobModal(true);
                                            }}
                                            className="w-full bg-gray-50 text-[#0a2a5e] py-3 rounded-xl font-semibold hover:bg-[#0a2a5e] hover:text-white transition-all flex items-center justify-center gap-2"
                                        >
                                            View Details
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Job Info Modal - Reuse from Dashboard */}
            {showJobModal && selectedJob && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowJobModal(false)}></div>
                    <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300">
                        <div className="bg-gradient-to-r from-[#0a2a5e] to-[#0d3b82] p-8 text-white relative">
                            <button onClick={() => setShowJobModal(false)} className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                            <h2 className="text-3xl font-bold mb-2">{selectedJob.title}</h2>
                            <p className="text-blue-200 text-lg">{selectedJob.position} • {selectedJob.location}</p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-xs text-gray-500 uppercase font-bold">Salary</p>
                                    <p className="font-semibold text-gray-800">{selectedJob.salaryRange}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-xs text-gray-500 uppercase font-bold">Experience</p>
                                    <p className="font-semibold text-gray-800">{selectedJob.experienceRange || "Not specified"}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-xs text-gray-500 uppercase font-bold">Domain</p>
                                    <p className="font-semibold text-gray-800">{selectedJob.industryDomain || "General"}</p>
                                </div>
                            </div>

                            <div className="prose max-w-none">
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Job Description</h3>
                                <div
                                    className="text-gray-600 leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: selectedJob.jobDescription || '<p class="text-gray-400 italic">No description provided.</p>' }}
                                />
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => {
                                    setShowJobModal(false);
                                    navigate(`/candidate/apply/${selectedJob.id}`);
                                }}
                                className="bg-[#0a2a5e] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#0d3b82] transition-colors flex items-center gap-2 shadow-lg"
                            >
                                Apply Now <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CandidateJobs;
