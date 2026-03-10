import React, { useState, useEffect } from "react";
import { Search, Briefcase, MapPin, DollarSign, Calendar, ChevronRight, Send, X, Clock, CheckCircle2, XCircle, AlertTriangle, Users, SlidersHorizontal, Building2, Home, Heart } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "./utils/userDatabase";
import API_BASE_URL from "./apiConfig";
import CandidateSidebar from "./components/CandidateSidebar";

// Converts plain-text job descriptions into structured HTML with section headers and bullet points
const formatJobDescription = (text) => {
    if (!text || !text.trim()) {
        return '<p class="text-gray-400 italic">No description provided.</p>';
    }
    const lines = text.split('\n');
    let html = '';
    let inList = false;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) {
            if (inList) { html += '</ul>'; inList = false; }
            continue;
        }
        // Section header: line ending with colon, not starting with a bullet
        const isHeader = /^.{2,80}:$/.test(line) && !/^[-*•●▪\d]/.test(line);
        // Bullet: starts with -, *, •, ●, ▪ or a number followed by . or )
        const isBullet = /^[-*•●▪]\s+.+/.test(line) || /^\d+[.)]\s+.+/.test(line);
        if (isHeader) {
            if (inList) { html += '</ul>'; inList = false; }
            html += `<p class="font-bold text-gray-800 mt-4 mb-1.5 text-sm border-b border-gray-200 pb-1">${line.replace(/:$/, '')}</p>`;
        } else if (isBullet) {
            if (!inList) { html += '<ul class="space-y-1.5 pl-0 mb-2 mt-1">'; inList = true; }
            const content = line.replace(/^[-*•●▪]\s+/, '').replace(/^\d+[.)]\s+/, '');
            html += `<li class="flex items-start gap-2 text-gray-600 text-sm"><span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#0a2a5e] flex-shrink-0"></span><span>${content}</span></li>`;
        } else {
            if (inList) { html += '</ul>'; inList = false; }
            html += `<p class="text-gray-600 text-sm leading-relaxed mb-1.5">${line}</p>`;
        }
    }
    if (inList) html += '</ul>';
    return html || '<p class="text-gray-400 italic">No description provided.</p>';
};

const CandidateJobs = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    // Search & filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [filters, setFilters] = useState({
        company: "",
        jobPosition: "",
        dateFrom: "",
        dateTo: "",
        workModel: [],
        vacanciesMin: "",
        vacanciesMax: "",
        salaryMin: "",
        salaryMax: "",
        employmentStatus: [],
    });

    const getActiveFilterCount = () => {
        let count = 0;
        if (filters.company) count++;
        if (filters.jobPosition) count++;
        if (filters.dateFrom || filters.dateTo) count++;
        if (filters.workModel.length > 0) count++;
        if (filters.vacanciesMin || filters.vacanciesMax) count++;
        if (filters.salaryMin || filters.salaryMax) count++;
        if (filters.employmentStatus.length > 0) count++;
        return count;
    };

    const clearFilters = () => setFilters({
        company: "", jobPosition: "", dateFrom: "", dateTo: "",
        workModel: [], vacanciesMin: "", vacanciesMax: "",
        salaryMin: "", salaryMax: "", employmentStatus: [],
    });

    // Job postings
    const [jobPostings, setJobPostings] = useState([]);
    const [isLoadingJobs, setIsLoadingJobs] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const [showJobModal, setShowJobModal] = useState(false);
    const [appliedJobIds, setAppliedJobIds] = useState([]);

    // Saved Jobs — persisted per user in localStorage
    const [savedJobIds, setSavedJobIds] = useState(() => {
        try {
            const cu = getCurrentUser();
            const key = cu ? `rbx_saved_jobs_${cu.id}` : 'rbx_saved_jobs';
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : [];
        } catch { return []; }
    });
    const [showSavedPanel, setShowSavedPanel] = useState(false);

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            navigate("/candidate/signin");
        } else {
            setUser(currentUser);
            fetchJobPostings();
            fetchAppliedJobs(currentUser.id);
        }
    }, [navigate]);

    const fetchJobPostings = async () => {
        try {
            setIsLoadingJobs(true);
            const response = await fetch(`${API_BASE_URL}/jobs/all`);
            if (response.ok) {
                const data = await response.json();
                // Filter out CV Screening postings — only show real job postings
                const jobsOnly = data.filter(job => job.status !== "Screening");
                const transformed = jobsOnly.map(job => ({
                    id: job._id || job.id,
                    company: job.companyName || job.interviewField + " Company",
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
                    numberOfVacancies: job.numberOfVacancies || 1,
                    deadline: job.deadline ? new Date(job.deadline) : null,
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

    const fetchAppliedJobs = async (candidateId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/jobs/candidate/${candidateId}/applied-jobs`);
            if (response.ok) {
                const data = await response.json();
                setAppliedJobIds(data.appliedJobIds || []);
            }
        } catch (error) {
            console.error("Error fetching applied jobs:", error);
        }
    };

    // Sync saved job IDs to localStorage
    useEffect(() => {
        const cu = getCurrentUser();
        const key = cu ? `rbx_saved_jobs_${cu.id}` : 'rbx_saved_jobs';
        localStorage.setItem(key, JSON.stringify(savedJobIds));
    }, [savedJobIds]);

    const toggleSavedJob = (jobId) => setSavedJobIds(prev =>
        prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
    const isSaved = (jobId) => savedJobIds.includes(jobId);
    const removeSavedJob = (jobId) => setSavedJobIds(prev => prev.filter(id => id !== jobId));
    const getSavedJobs = () => savedJobIds.map(id => jobPostings.find(j => j.id === id)).filter(Boolean);

    const parseSalaryRange = (salaryStr) => {
        if (!salaryStr) return null;
        const nums = salaryStr.match(/\d[\d,]*/g);
        if (!nums || nums.length < 1) return null;
        const toNum = s => { const n = parseInt(s.replace(/,/g, ''), 10); return n < 1000 ? n * 1000 : n; };
        return { min: toNum(nums[0]), max: nums[1] ? toNum(nums[1]) : toNum(nums[0]) };
    };

    const getFilteredJobs = () => {
        let filtered = [...jobPostings];

        // Remove closed/expired jobs unless the candidate has already applied
        filtered = filtered.filter(job => {
            const expired = isJobExpired(job) || !job.isActive;
            return !expired || isApplied(job.id);
        });

        // Text Search
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(job =>
                job.title.toLowerCase().includes(lowerTerm) ||
                job.location.toLowerCase().includes(lowerTerm) ||
                job.company.toLowerCase().includes(lowerTerm)
            );
        }

        if (filters.company)
            filtered = filtered.filter(job => job.company?.toLowerCase().includes(filters.company.toLowerCase()));
        if (filters.jobPosition)
            filtered = filtered.filter(job =>
                job.title?.toLowerCase().includes(filters.jobPosition.toLowerCase()) ||
                job.position?.toLowerCase().includes(filters.jobPosition.toLowerCase()));
        if (filters.dateFrom)
            filtered = filtered.filter(job => job.appliedDate >= new Date(filters.dateFrom));
        if (filters.dateTo) {
            const to = new Date(filters.dateTo); to.setHours(23, 59, 59, 999);
            filtered = filtered.filter(job => job.appliedDate <= to);
        }
        if (filters.workModel.length > 0)
            filtered = filtered.filter(job => filters.workModel.some(wm => job.workModel?.toLowerCase() === wm.toLowerCase()));
        if (filters.vacanciesMin)
            filtered = filtered.filter(job => job.numberOfVacancies >= parseInt(filters.vacanciesMin, 10));
        if (filters.vacanciesMax)
            filtered = filtered.filter(job => job.numberOfVacancies <= parseInt(filters.vacanciesMax, 10));
        if (filters.salaryMin || filters.salaryMax) {
            filtered = filtered.filter(job => {
                const sr = parseSalaryRange(job.salaryRange);
                if (!sr) return true;
                if (filters.salaryMin && sr.max < parseInt(filters.salaryMin, 10)) return false;
                if (filters.salaryMax && sr.min > parseInt(filters.salaryMax, 10)) return false;
                return true;
            });
        }
        if (filters.employmentStatus.length > 0)
            filtered = filtered.filter(job => filters.employmentStatus.some(es => job.status?.toLowerCase() === es.toLowerCase()));

        filtered.sort((a, b) => b.appliedDate - a.appliedDate);
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

    const isJobExpired = (job) => {
        if (!job.deadline) return false;
        return new Date() > job.deadline;
    };

    const getDeadlineInfo = (job) => {
        if (!job.deadline) return { text: "No deadline", color: "text-gray-400", urgent: false };
        const now = new Date();
        const diff = job.deadline - now;
        const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

        if (daysLeft < 0) return { text: "Deadline passed", color: "text-red-600", urgent: true };
        if (daysLeft === 0) return { text: "Closes today!", color: "text-red-600", urgent: true };
        if (daysLeft <= 3) return { text: `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`, color: "text-orange-600", urgent: true };
        if (daysLeft <= 7) return { text: `${daysLeft} days left`, color: "text-yellow-600", urgent: false };
        return { text: job.deadline.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), color: "text-gray-600", urgent: false };
    };

    const isApplied = (jobId) => appliedJobIds.includes(jobId);

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
                        <h2 className="text-3xl font-bold text-[#0a2a5e]">Job Vacancies</h2>
                        <p className="text-gray-500 text-md mt-1 py-2">Explore and apply to open positions</p>
                    </div>
                </div>

                {/* Filters & Content */}
                <div className="flex-1 overflow-hidden p-8 flex flex-col gap-6">

                    {/* Search + Filter Bar */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by job, company, or location…"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0a2a5e]/20 focus:border-[#0a2a5e] outline-none transition-all text-sm"
                            />
                        </div>

                        {getActiveFilterCount() > 0 && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all text-sm font-medium"
                            >
                                <X className="w-3.5 h-3.5" />
                                <span>Clear</span>
                            </button>
                        )}

                        <button
                            onClick={() => setShowFilterPanel(true)}
                            className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:border-[#0a2a5e] hover:text-[#0a2a5e] hover:bg-[#0a2a5e]/5 transition-all text-sm font-medium"
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            <span>Filter</span>
                            {getActiveFilterCount() > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#0a2a5e] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {getActiveFilterCount()}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => setShowSavedPanel(true)}
                            className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-500 hover:bg-red-50/50 transition-all text-sm font-medium"
                        >
                            <Heart className="w-4 h-4" />
                            <span>Saved</span>
                            {savedJobIds.length > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {savedJobIds.length}
                                </span>
                            )}
                        </button>
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
                                {getFilteredJobs().map(job => {
                                    const expired = isJobExpired(job) || !job.isActive;
                                    const applied = isApplied(job.id);
                                    const deadlineInfo = getDeadlineInfo(job);

                                    return (
                                        <div key={job.id} className={`bg-white rounded-2xl shadow-sm border p-6 transition-shadow group flex flex-col ${expired ? 'border-gray-200 opacity-75' : 'border-gray-100 hover:shadow-md'}`}>
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1 pr-2">
                                                    <h3 className="font-bold text-xl text-gray-800 group-hover:text-[#0a2a5e] transition-colors">{job.title}</h3>
                                                    <p className="text-gray-500 font-medium">{job.position}</p>
                                                    {job.company && (
                                                        <p className="text-[#0a2a5e] text-sm font-semibold mt-0.5">{job.company}</p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    {applied && (
                                                        <span className="flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                                            <CheckCircle2 className="w-3 h-3" /> Applied
                                                        </span>
                                                    )}
                                                    {expired && !applied && (
                                                        <span className="flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                                                            <XCircle className="w-3 h-3" /> Closed
                                                        </span>
                                                    )}
                                                    {!applied && !expired && (
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(job.status)}`}>
                                                            {job.status}
                                                        </span>
                                                    )}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); toggleSavedJob(job.id); }}
                                                        title={isSaved(job.id) ? "Remove from saved" : "Save job"}
                                                        className={`w-7 h-7 flex items-center justify-center rounded-full transition-all ${
                                                            isSaved(job.id)
                                                                ? 'text-red-500 bg-red-50 hover:bg-red-100'
                                                                : 'text-gray-300 hover:text-red-400 hover:bg-red-50'
                                                        }`}
                                                    >
                                                        <Heart className={`w-4 h-4 ${isSaved(job.id) ? 'fill-current' : ''}`} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-2 mb-4 flex-1">
                                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                                    <MapPin className="w-4 h-4" /> {job.location}
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                                    <Briefcase className="w-4 h-4" /> {job.workModel}
                                                </div>
                                                <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
                                                    <DollarSign className="w-4 h-4" /> {job.salaryRange}
                                                </div>
                                                <div className="flex items-center gap-2 text-calendar-500 text-sm">
                                                    <Calendar className="w-4 h-4" /> Posted {job.appliedDate.toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-2 text-indigo-600 text-sm font-semibold">
                                                    <Users className="w-4 h-4" /> {job.numberOfVacancies} {job.numberOfVacancies === 1 ? 'Vacancy' : 'Vacancies'}
                                                </div>
                                            </div>

                                            {/* Deadline Banner */}
                                            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-4 text-sm font-semibold ${expired ? 'bg-red-50 text-red-600' :
                                                deadlineInfo.urgent ? 'bg-orange-50 text-orange-700 animate-pulse' :
                                                    'bg-gray-50 text-gray-600'
                                                }`}>
                                                {expired ? <XCircle className="w-4 h-4" /> : deadlineInfo.urgent ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                                <span>{expired ? "Deadline passed" : `Deadline: ${deadlineInfo.text}`}</span>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    setSelectedJob(job);
                                                    setShowJobModal(true);
                                                }}
                                                className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${expired ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                                                    applied ? 'bg-green-50 text-green-700 cursor-default' :
                                                        'bg-gray-50 text-[#0a2a5e] hover:bg-[#0a2a5e] hover:text-white'
                                                    }`}
                                                disabled={expired}
                                            >
                                                {applied ? <><CheckCircle2 className="w-4 h-4" /> Already Applied</> :
                                                    expired ? <><XCircle className="w-4 h-4" /> Closed</> :
                                                        <>View Details <ChevronRight className="w-4 h-4" /></>}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Saved Jobs Panel */}
            {showSavedPanel && (
                <div className="fixed inset-0 z-[200] flex justify-end">
                    <style dangerouslySetInnerHTML={{__html: `
                        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
                    `}} />
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowSavedPanel(false)} />
                    <div className="relative bg-white w-full max-w-sm h-full flex flex-col shadow-2xl" style={{ animation: 'slideInRight 0.22s ease-out' }}>

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                                    <Heart className="w-4 h-4 text-red-500 fill-current" />
                                </div>
                                <h2 className="text-base font-bold text-gray-800">Saved Jobs</h2>
                                {savedJobIds.length > 0 && (
                                    <span className="px-2 py-0.5 bg-red-500 text-white text-[11px] font-bold rounded-full">
                                        {savedJobIds.length}
                                    </span>
                                )}
                            </div>
                            <button onClick={() => setShowSavedPanel(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto theme-scrollbar p-4 space-y-3">
                            {getSavedJobs().length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                                    <Heart className="w-12 h-12 text-gray-200 mb-3" />
                                    <p className="text-gray-500 font-medium text-sm">No saved jobs yet</p>
                                    <p className="text-gray-400 text-xs mt-1">Tap the heart icon on any job card to save it here</p>
                                </div>
                            ) : (
                                getSavedJobs().map(job => {
                                    const savedExpired = isJobExpired(job) || !job.isActive;
                                    const savedApplied = isApplied(job.id);
                                    return (
                                        <div key={job.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-gray-800 text-sm truncate">{job.title}</h4>
                                                    <p className="text-gray-500 text-xs">{job.position}</p>
                                                    {job.company && <p className="text-[#0a2a5e] text-xs font-semibold truncate">{job.company}</p>}
                                                </div>
                                                <button
                                                    onClick={() => removeSavedJob(job.id)}
                                                    className="w-6 h-6 flex items-center justify-center rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                                                    title="Remove from saved"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2 mb-2">
                                                {savedApplied ? (
                                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[11px] font-bold">
                                                        <CheckCircle2 className="w-3 h-3" /> Applied
                                                    </span>
                                                ) : savedExpired ? (
                                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[11px] font-bold">
                                                        <XCircle className="w-3 h-3" /> Closed
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[11px] font-bold">
                                                        Available
                                                    </span>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                {job.location && (
                                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" /> {job.location}
                                                    </p>
                                                )}
                                                {job.salaryRange && (
                                                    <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                                                        <DollarSign className="w-3 h-3" /> {job.salaryRange}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Panel Modal */}
            {showFilterPanel && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowFilterPanel(false)} />
                    <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" style={{ animation: 'modalPop 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}>

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-[#0a2a5e]/10 flex items-center justify-center">
                                    <SlidersHorizontal className="w-4 h-4 text-[#0a2a5e]" />
                                </div>
                                <h2 className="text-base font-bold text-gray-800">Advanced Filters</h2>
                                {getActiveFilterCount() > 0 && (
                                    <span className="px-2 py-0.5 bg-[#0a2a5e] text-white text-[11px] font-bold rounded-full">
                                        {getActiveFilterCount()} active
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                {getActiveFilterCount() > 0 && (
                                    <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-700 font-semibold transition-colors">Clear All</button>
                                )}
                                <button onClick={() => setShowFilterPanel(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                                    <X className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto theme-scrollbar p-6 space-y-5">

                            {/* Company */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Company</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input type="text" placeholder="Search by company name…" value={filters.company}
                                        onChange={e => setFilters(f => ({ ...f, company: e.target.value }))}
                                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0a2a5e]/20 focus:border-[#0a2a5e] outline-none transition-all" />
                                </div>
                            </div>

                            {/* Job Position */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Job Position</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input type="text" placeholder="e.g. Software Engineer, Data Analyst…" value={filters.jobPosition}
                                        onChange={e => setFilters(f => ({ ...f, jobPosition: e.target.value }))}
                                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0a2a5e]/20 focus:border-[#0a2a5e] outline-none transition-all" />
                                </div>
                            </div>

                            {/* Date Range */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Date Posted</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1.5">From</p>
                                        <input type="date" value={filters.dateFrom}
                                            onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0a2a5e]/20 focus:border-[#0a2a5e] outline-none transition-all" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1.5">To</p>
                                        <input type="date" value={filters.dateTo}
                                            onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0a2a5e]/20 focus:border-[#0a2a5e] outline-none transition-all" />
                                    </div>
                                </div>
                            </div>

                            {/* Work Model */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Work Model</label>
                                <div className="flex flex-wrap gap-2">
                                    {["Remote", "Hybrid", "On-site", "On-field"].map(wm => (
                                        <button key={wm} type="button"
                                            onClick={() => setFilters(f => ({ ...f, workModel: f.workModel.includes(wm) ? f.workModel.filter(x => x !== wm) : [...f.workModel, wm] }))}
                                            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                                filters.workModel.includes(wm)
                                                    ? 'bg-[#0a2a5e] text-white border-[#0a2a5e] shadow-sm'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#0a2a5e] hover:text-[#0a2a5e]'
                                            }`}>{wm}</button>
                                    ))}
                                </div>
                            </div>

                            {/* No. of Vacancies */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">No. of Vacancies</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1.5">Minimum</p>
                                        <input type="number" min="1" placeholder="e.g. 1" value={filters.vacanciesMin}
                                            onChange={e => setFilters(f => ({ ...f, vacanciesMin: e.target.value }))}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0a2a5e]/20 focus:border-[#0a2a5e] outline-none transition-all" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1.5">Maximum</p>
                                        <input type="number" min="1" placeholder="e.g. 10" value={filters.vacanciesMax}
                                            onChange={e => setFilters(f => ({ ...f, vacanciesMax: e.target.value }))}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0a2a5e]/20 focus:border-[#0a2a5e] outline-none transition-all" />
                                    </div>
                                </div>
                            </div>

                            {/* Salary Range */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Salary Range <span className="font-normal text-gray-400">(annual, $)</span></label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1.5">Min ($)</p>
                                        <input type="number" min="0" step="1000" placeholder="e.g. 40000" value={filters.salaryMin}
                                            onChange={e => setFilters(f => ({ ...f, salaryMin: e.target.value }))}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0a2a5e]/20 focus:border-[#0a2a5e] outline-none transition-all" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1.5">Max ($)</p>
                                        <input type="number" min="0" step="1000" placeholder="e.g. 120000" value={filters.salaryMax}
                                            onChange={e => setFilters(f => ({ ...f, salaryMax: e.target.value }))}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0a2a5e]/20 focus:border-[#0a2a5e] outline-none transition-all" />
                                    </div>
                                </div>
                            </div>

                            {/* Employment Status */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Employment Status</label>
                                <div className="flex flex-wrap gap-2">
                                    {["Full-time", "Part-time", "Contract", "Freelance", "Internship"].map(es => (
                                        <button key={es} type="button"
                                            onClick={() => setFilters(f => ({ ...f, employmentStatus: f.employmentStatus.includes(es) ? f.employmentStatus.filter(x => x !== es) : [...f.employmentStatus, es] }))}
                                            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                                filters.employmentStatus.includes(es)
                                                    ? 'bg-[#0a2a5e] text-white border-[#0a2a5e] shadow-sm'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#0a2a5e] hover:text-[#0a2a5e]'
                                            }`}>{es}</button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-xs text-gray-400">
                                {getFilteredJobs().length} job{getFilteredJobs().length !== 1 ? "s" : ""} match
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowFilterPanel(false)}
                                    className="px-5 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors">Cancel</button>
                                <button onClick={() => setShowFilterPanel(false)}
                                    className="px-6 py-2 rounded-xl text-sm font-bold bg-[#0a2a5e] text-white hover:bg-[#0d3b82] transition-colors shadow-sm">Show Results</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Job Info Modal */}
            {showJobModal && selectedJob && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowJobModal(false)}></div>
                    <div className="relative bg-white w-full max-w-2xl max-h-[92vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col" style={{ animation: 'modalPop 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}>
                        {/* ── Header ── */}
                        <div className="bg-gradient-to-br from-[#0a2a5e] to-[#0d3b82] px-8 pt-8 pb-7 text-white relative">
                            <button onClick={() => setShowJobModal(false)} className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                            <h2 className="text-3xl font-bold leading-tight">{selectedJob.title}</h2>
                            <p className="text-blue-200 text-base mt-1">{selectedJob.position} • {selectedJob.location}</p>
                            {selectedJob.company && (
                                <p className="text-blue-100 text-sm mt-0.5 font-semibold">{selectedJob.company}</p>
                            )}
                            {selectedJob.deadline && (
                                <div className={`mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold ${isJobExpired(selectedJob) ? 'bg-red-500/25 text-red-200' :
                                        getDeadlineInfo(selectedJob).urgent ? 'bg-orange-500/25 text-orange-200' :
                                            'bg-white/15 text-blue-100'
                                    }`}>
                                    <Clock className="w-4 h-4" />
                                    {isJobExpired(selectedJob) ? "Deadline Passed" :
                                        `Deadline: ${selectedJob.deadline.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
                                </div>
                            )}
                        </div>

                        {/* ── Scrollable Body ── */}
                        <div className="flex-1 overflow-y-auto theme-scrollbar p-7 space-y-5">
                            {/* Info Cards */}
                            <div className="grid grid-cols-4 gap-3">
                                <div className="bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Salary</p>
                                    <p className="font-semibold text-gray-800 text-sm leading-snug">{selectedJob.salaryRange || "—"}</p>
                                </div>
                                <div className="bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Experience</p>
                                    <p className="font-semibold text-gray-800 text-sm leading-snug">{selectedJob.experienceRange || "—"}</p>
                                </div>
                                <div className="bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Domain</p>
                                    <p className="font-semibold text-gray-800 text-sm leading-snug">{selectedJob.industryDomain || "General"}</p>
                                </div>
                                <div className="bg-[#0a2a5e]/5 rounded-2xl px-4 py-3 border border-[#0a2a5e]/15">
                                    <p className="text-[10px] text-[#0a2a5e] uppercase tracking-widest font-bold mb-1">Vacancies</p>
                                    <p className="font-bold text-[#0a2a5e] text-xl leading-snug">{selectedJob.numberOfVacancies || 1}</p>
                                </div>
                            </div>

                            {/* Deadline Section */}
                            {selectedJob.deadline && (
                                <div className={`flex items-center gap-4 px-6 py-5 rounded-2xl border-2 ${
                                    isJobExpired(selectedJob) ? 'bg-red-50 border-red-300' :
                                    getDeadlineInfo(selectedJob).urgent ? 'bg-orange-50 border-orange-300' :
                                    'bg-[#0a2a5e]/5 border-[#0a2a5e]/20'
                                } shadow-sm`}>
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        isJobExpired(selectedJob) ? 'bg-red-200' :
                                        getDeadlineInfo(selectedJob).urgent ? 'bg-orange-200' :
                                        'bg-[#0a2a5e]/15'
                                    }`}>
                                        <Clock className={`w-6 h-6 ${
                                            isJobExpired(selectedJob) ? 'text-red-700' :
                                            getDeadlineInfo(selectedJob).urgent ? 'text-orange-700' :
                                            'text-[#0a2a5e]'
                                        }`} />
                                    </div>
                                    <div className="flex-1">
                                        <p className={`font-bold text-lg ${
                                            isJobExpired(selectedJob) ? 'text-red-800' :
                                            getDeadlineInfo(selectedJob).urgent ? 'text-orange-800' :
                                            'text-[#0a2a5e]'
                                        }`}>
                                            {isJobExpired(selectedJob) ? "Applications Closed" :
                                                `Apply before ${selectedJob.deadline.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`}
                                        </p>
                                        <p className={`text-sm mt-1 ${
                                            isJobExpired(selectedJob) ? 'text-red-600' :
                                            getDeadlineInfo(selectedJob).urgent ? 'text-orange-600' :
                                            'text-[#0a2a5e]/60'
                                        }`}>
                                            {selectedJob.deadline.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Job Description */}
                            <div>
                                <h3 className="text-base font-bold text-gray-800 mb-3">Job Description</h3>
                                <style dangerouslySetInnerHTML={{__html: `
                                    .jd-preview ul { list-style-type: disc !important; padding-left: 1.4rem !important; margin: 0.4rem 0 !important; }
                                    .jd-preview li { margin-bottom: 0.25rem !important; }
                                    .jd-preview b, .jd-preview strong { font-weight: 700 !important; }
                                    .jd-preview u { text-decoration: underline !important; }
                                `}} />
                                <div
                                    className="jd-preview text-gray-600 leading-relaxed text-sm"
                                    dangerouslySetInnerHTML={{ __html: formatJobDescription(selectedJob.jobDescription) }}
                                />
                            </div>
                        </div>

                        {/* ── Footer ── */}
                        <div className="px-7 py-5 bg-white border-t border-gray-100 flex justify-end">
                            {isApplied(selectedJob.id) ? (
                                <div className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-2xl font-bold text-sm">
                                    <CheckCircle2 className="w-4 h-4" /> Already Applied
                                </div>
                            ) : isJobExpired(selectedJob) || !selectedJob.isActive ? (
                                <div className="flex items-center gap-2 px-6 py-3 bg-red-100 text-red-700 rounded-2xl font-bold text-sm">
                                    <XCircle className="w-4 h-4" /> Job Closed
                                </div>
                            ) : (
                                <button
                                    onClick={() => { setShowJobModal(false); navigate(`/candidate/apply/${selectedJob.id}`); }}
                                    className="flex items-center gap-2 bg-[#0a2a5e] hover:bg-[#0d3b82] text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    Apply Now <Send className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CandidateJobs;
