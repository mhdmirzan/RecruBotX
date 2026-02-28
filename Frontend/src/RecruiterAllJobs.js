import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    LogOut,
    PlusCircle,
    Search,
    Cog,
    ArrowLeft,
    Briefcase,
    MapPin,
    Calendar,
    Users,
    Download,
    ChevronRight,
    Loader2,
    Award,
    Eye,
    Clock,
    AlertTriangle,
    XCircle
} from "lucide-react";
import API_BASE_URL from "./apiConfig";
import RecruiterSidebar from "./components/RecruiterSidebar";

const RecruiterAllJobs = () => {
    const navigate = useNavigate();
    const [recruiterData, setRecruiterData] = useState(null);
    const [jobPostings, setJobPostings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [applicantsLoading, setApplicantsLoading] = useState(false);
    const [downloadingId, setDownloadingId] = useState(null);
    const pollingRef = useRef(null);

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
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/jobs/recruiter/${recruiterId}`);
            if (!response.ok) throw new Error("Failed to fetch job postings");
            const data = await response.json();
            // Filter out screening batches — show only real job postings
            const realJobs = data.filter(job => job.status !== "Screening");
            // Sort by creation date (most recent first)
            const sorted = realJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setJobPostings(sorted);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchApplicants = useCallback(async (jobId, showLoader = false) => {
        if (showLoader) setApplicantsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/rankings/job/${jobId}`);
            if (response.ok) {
                const data = await response.json();
                setApplicants(data);
            } else {
                setApplicants([]);
            }
        } catch (error) {
            console.error("Error fetching applicants:", error);
            setApplicants([]);
        } finally {
            if (showLoader) setApplicantsLoading(false);
        }
    }, []);

    // Auto-poll applicants every 10 s when a job is expanded
    useEffect(() => {
        if (pollingRef.current) clearInterval(pollingRef.current);
        if (selectedJob) {
            pollingRef.current = setInterval(() => {
                fetchApplicants(selectedJob.id, false);
            }, 10000);
        }
        return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
    }, [selectedJob, fetchApplicants]);

    const handleJobClick = async (job) => {
        if (selectedJob?.id === job.id) {
            setSelectedJob(null);
            setApplicants([]);
            return;
        }
        setSelectedJob(job);
        fetchApplicants(job.id, true);
    };

    const handleDownloadReport = async (applicant) => {
        if (!applicant.id) return;

        setDownloadingId(applicant.id);
        try {
            // Try to get the evaluation ID from the candidate's ranking
            const reportRes = await fetch(`${API_BASE_URL}/rankings/${applicant.id}/report`);
            if (!reportRes.ok) throw new Error("Report not found");
            const reportData = await reportRes.json();

            if (reportData.evaluationId) {
                // Download the actual PDF
                const pdfRes = await fetch(`${API_BASE_URL}/rankings/evaluations/${reportData.evaluationId}/download`);
                if (!pdfRes.ok) throw new Error("PDF not available");
                const blob = await pdfRes.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${applicant.candidateName || "Candidate"}_Report.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
            } else {
                alert("Evaluation report not yet available for this candidate.");
            }
        } catch (error) {
            console.error("Error downloading report:", error);
            alert("Could not download report. The evaluation may not be available yet.");
        } finally {
            setDownloadingId(null);
        }
    };

    const handleViewReport = (applicant) => {
        navigate(`/recruiter/report/${applicant.id}`);
    };

    const handleLogout = () => {
        localStorage.removeItem("recruiterUser");
        navigate("/recruiter/signin");
    };

    const getScoreColor = (scoreStr) => {
        const num = parseInt(scoreStr);
        if (num >= 80) return "text-green-600 bg-green-50 border-green-200";
        if (num >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
        return "text-red-600 bg-red-50 border-red-200";
    };

    const getStatusBadge = (status) => {
        const map = {
            "Pending": "bg-gray-100 text-gray-600",
            "Shortlisted": "bg-green-100 text-green-700",
            "Selected": "bg-green-100 text-green-700",
            "Rejected": "bg-red-100 text-red-700",
            "Interview Scheduled": "bg-blue-100 text-blue-700",
        };
        return map[status] || "bg-gray-100 text-gray-600";
    };

    if (!recruiterData) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a2a5e] mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen flex bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden fixed inset-0">
            {/* Sidebar */}
            <RecruiterSidebar />

            {/* Main Content */}
            <main className="flex-1 h-screen flex flex-col overflow-hidden py-8 px-8">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/recruiter/job-posting")}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 text-gray-600" />
                        </button>
                        <div>
                            <h2 className="text-3xl font-bold text-[#0a2a5e]">All Job Postings</h2>
                            <p className="text-gray-500 mt-1">
                                {jobPostings.length} job{jobPostings.length !== 1 ? "s" : ""} posted
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a2a5e]"></div>
                        </div>
                    ) : jobPostings.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                            <Briefcase className="w-16 h-16 mb-4 text-gray-300" />
                            <p className="text-lg font-medium">No job postings yet</p>
                            <p className="text-sm mt-2">Create your first job posting to get started!</p>
                            <button
                                onClick={() => navigate("/recruiter/job-posting")}
                                className="mt-4 px-6 py-3 bg-[#0a2a5e] text-white rounded-xl hover:bg-[#061a3d] transition-all"
                            >
                                Create Job Posting
                            </button>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto pr-1">
                            <div className="space-y-4">
                                {jobPostings.map((job) => (
                                    <div key={job.id}>
                                        {/* Job Card */}
                                        <div
                                            onClick={() => handleJobClick(job)}
                                            className={`bg-white rounded-2xl shadow-md border transition-all cursor-pointer hover:shadow-lg ${selectedJob?.id === job.id
                                                ? "border-[#0a2a5e] ring-2 ring-[#0a2a5e]/20"
                                                : "border-gray-100 hover:border-[#0a2a5e]/30"
                                                }`}
                                        >
                                            <div className="p-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className="text-xl font-bold text-gray-800">{job.interviewField}</h3>
                                                            <span className="px-3 py-1 bg-[#0a2a5e]/10 text-[#0a2a5e] text-xs font-semibold rounded-full">{job.positionLevel}</span>
                                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${job.status === "Full-time" ? "bg-green-50 text-green-700" : job.status === "Part-time" ? "bg-yellow-50 text-yellow-700" : "bg-blue-50 text-blue-700"}`}>{job.status}</span>
                                                        </div>
                                                        <div className="flex items-center gap-6 text-sm text-gray-500">
                                                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
                                                            <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {job.workModel}</span>
                                                            <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {job.cvFilesCount || 0} Candidate{(job.cvFilesCount || 0) !== 1 ? "s" : ""}</span>
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-4 h-4" />
                                                                {new Date(job.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className={`w-6 h-6 text-gray-400 transition-transform duration-200 ${selectedJob?.id === job.id ? "rotate-90" : ""}`} />
                                                </div>
                                            </div>

                                            {/* Deadline & Status Badges */}
                                            <div className="flex items-center gap-3 mt-3 pt-3 px-6 pb-4 border-t border-gray-100">
                                                {/* Active/Closed Badge */}
                                                {job.isActive ? (
                                                    <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full">Active</span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full flex items-center gap-1">
                                                        <XCircle className="w-3.5 h-3.5" /> Closed
                                                    </span>
                                                )}

                                                {/* Deadline */}
                                                {job.deadline ? (() => {
                                                    const dl = new Date(job.deadline);
                                                    const now = new Date();
                                                    const diff = dl - now;
                                                    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
                                                    const expired = daysLeft < 0;
                                                    const urgent = daysLeft >= 0 && daysLeft <= 3;

                                                    return (
                                                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${expired ? 'bg-red-100 text-red-700' :
                                                                urgent ? 'bg-orange-100 text-orange-700 animate-pulse' :
                                                                    'bg-blue-50 text-blue-700'
                                                            }`}>
                                                            {expired ? <XCircle className="w-3.5 h-3.5" /> : urgent ? <AlertTriangle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                                            {expired ? 'Deadline Passed' :
                                                                daysLeft === 0 ? 'Closes Today!' :
                                                                    daysLeft <= 7 ? `${daysLeft} day${daysLeft > 1 ? 's' : ''} left` :
                                                                        `Deadline: ${dl.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                                                        </div>
                                                    );
                                                })() : (
                                                    <span className="text-xs text-gray-400">No deadline</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Applicants Panel */}
                                        {selectedJob?.id === job.id && (
                                            <div className="bg-white rounded-2xl shadow-inner border border-gray-100 mt-2 overflow-hidden">
                                                <div className="bg-gradient-to-r from-[#0a2a5e] to-[#0d3b82] px-6 py-4">
                                                    <h4 className="text-white font-bold text-lg flex items-center gap-2">
                                                        <Users className="w-5 h-5" />
                                                        Applicants & Rankings
                                                    </h4>
                                                </div>

                                                {applicantsLoading ? (
                                                    <div className="flex items-center justify-center py-12">
                                                        <Loader2 className="w-8 h-8 text-[#0a2a5e] animate-spin" />
                                                    </div>
                                                ) : applicants.length === 0 ? (
                                                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                                        <Users className="w-12 h-12 mb-3 text-gray-300" />
                                                        <p className="font-medium">No applicants found</p>
                                                        <p className="text-sm mt-1">Candidates who take the interview will appear here.</p>
                                                    </div>
                                                ) : (
                                                    <div className="divide-y divide-gray-100">
                                                        {/* Table Header */}
                                                        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                            <div className="col-span-1">Rank</div>
                                                            <div className="col-span-3">Candidate</div>
                                                            <div className="col-span-2">Score</div>
                                                            <div className="col-span-2">Status</div>
                                                            <div className="col-span-1">Date</div>
                                                            <div className="col-span-3 text-right">Actions</div>
                                                        </div>

                                                        {/* Table Rows */}
                                                        {applicants.map((applicant) => (
                                                            <div key={applicant.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors">
                                                                {/* Rank */}
                                                                <div className="col-span-1">
                                                                    <div className="w-10 h-10 bg-gradient-to-br from-[#0a2a5e] to-[#2b4c8c] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                                                                        #{applicant.rank}
                                                                    </div>
                                                                </div>

                                                                {/* Candidate Name */}
                                                                <div className="col-span-3">
                                                                    <p className="font-semibold text-gray-800">{applicant.candidateName}</p>
                                                                </div>

                                                                {/* Score */}
                                                                <div className="col-span-2">
                                                                    <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold border ${getScoreColor(applicant.score)}`}>
                                                                        <Award className="w-3.5 h-3.5 inline mr-1" />
                                                                        {applicant.score}
                                                                    </span>
                                                                </div>

                                                                {/* Status */}
                                                                <div className="col-span-2">
                                                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(applicant.interviewStatus)}`}>
                                                                        {applicant.interviewStatus}
                                                                    </span>
                                                                </div>

                                                                {/* Date */}
                                                                <div className="col-span-1 text-sm text-gray-500">
                                                                    {applicant.date}
                                                                </div>

                                                                {/* Actions */}
                                                                <div className="col-span-3 flex justify-end gap-2">
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleViewReport(applicant); }}
                                                                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#0a2a5e] bg-[#0a2a5e]/5 hover:bg-[#0a2a5e]/10 rounded-lg transition-all border border-[#0a2a5e]/20"
                                                                    >
                                                                        <Eye className="w-4 h-4" />
                                                                        View
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleDownloadReport(applicant); }}
                                                                        disabled={downloadingId === applicant.id}
                                                                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#0a2a5e] to-[#0d3b82] hover:from-[#061a3d] hover:to-[#0a2a5e] rounded-lg transition-all shadow-sm disabled:opacity-50"
                                                                    >
                                                                        {downloadingId === applicant.id ? (
                                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                                        ) : (
                                                                            <Download className="w-4 h-4" />
                                                                        )}
                                                                        PDF
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default RecruiterAllJobs;
