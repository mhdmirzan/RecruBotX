import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    LogOut,
    PlusCircle,
    TrendingUp,
    BarChart3,
    Cog,
    Search,
    Filter,
    ArrowUpDown,
    Eye
} from "lucide-react";
import { motion } from "framer-motion";
import API_BASE_URL from "./apiConfig";

const Ranking = () => {
    const navigate = useNavigate();
    const [recruiterData, setRecruiterData] = useState(null);
    const [selectedJob, setSelectedJob] = useState("all");
    const [jobPostings, setJobPostings] = useState([]);
    const [rankings, setRankings] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("score-desc");

    useEffect(() => {
        const storedUser = localStorage.getItem("recruiterUser");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setRecruiterData(user);
            fetchJobPostings(user.id);
            fetchRankings(user.id);
        } else {
            navigate("/recruiter/signin");
        }
    }, [navigate]);

    const fetchJobPostings = async (recruiterId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/jobs/recruiter/${recruiterId}`);
            if (!response.ok) throw new Error("Failed to fetch jobs");
            const data = await response.json();
            setJobPostings(data);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        }
    };

    const fetchRankings = async (recruiterId) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/rankings/recruiter/${recruiterId}`);
            if (!response.ok) throw new Error("Failed to fetch rankings");
            const data = await response.json();
            setRankings(data);
        } catch (error) {
            console.error("Error fetching rankings:", error);
            setRankings([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewReport = (rankingId) => {
        navigate(`/recruiter/report/${rankingId}`);
    };

    const handleLogout = () => {
        localStorage.removeItem("recruiterUser");
        navigate("/recruiter/signin");
    };

    const getProcessedRankings = () => {
        let result = rankings.filter(ranking => {
            const matchesJob = selectedJob === "all" || ranking.jobPostingId === selectedJob;
            const matchesSearch = ranking.candidateName.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesJob && matchesSearch;
        });

        // Apply Sorting
        result.sort((a, b) => {
            const scoreA = parseFloat(a.score) || 0;
            const scoreB = parseFloat(b.score) || 0;

            switch (sortBy) {
                case "score-desc":
                    return scoreB - scoreA;
                case "score-asc":
                    return scoreA - scoreB;
                case "name-asc":
                    return a.candidateName.localeCompare(b.candidateName);
                case "name-desc":
                    return b.candidateName.localeCompare(a.candidateName);
                default:
                    return 0;
            }
        });

        return result;
    };

    const processedRankings = getProcessedRankings();

    if (!recruiterData) return null;

    return (
        <div className="h-screen w-screen flex bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden fixed inset-0">
            {/* Sidebar */}
            <aside className="w-72 h-screen bg-white shadow-xl flex flex-col p-6 border-r border-gray-200 flex-shrink-0">
                <div className="mb-8 text-center flex-shrink-0">
                    <h1 className="text-3xl font-bold text-blue-600">RecruBotX</h1>
                </div>

                <nav className="flex flex-col space-y-4 text-gray-700 flex-shrink-0">
                    <NavLink to="/recruiter/dashboard" className={({ isActive }) => `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"}`}><LayoutDashboard className="w-5 h-5" /> Dashboard</NavLink>
                    <NavLink to="/recruiter/job-posting" className={({ isActive }) => `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"}`}><PlusCircle className="w-5 h-5" /> Job Posting</NavLink>
                    <NavLink to="/recruiter/ranking" className={({ isActive }) => `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"}`}><TrendingUp className="w-5 h-5" /> Ranking</NavLink>
                    <NavLink to="/recruiter/evaluation" className={({ isActive }) => `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"}`}><BarChart3 className="w-5 h-5" /> Evaluation</NavLink>
                    <NavLink to="/recruiter/settings" className={({ isActive }) => `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"}`}><Cog className="w-5 h-5" /> Settings</NavLink>
                </nav>

                <div className="mt-auto flex-shrink-0">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 rounded-xl text-white hover:from-red-600 hover:to-red-700 transition-all shadow-md mt-4"><LogOut className="w-5 h-5" /> Logout</button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-screen flex flex-col overflow-hidden py-8 px-10">
                <div className="mb-8 flex justify-between items-center flex-shrink-0">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Candidate Rankings</h2>
                        <p className="text-gray-500 text-md mt-1 py-4">View and compare candidates across all your job postings.</p>
                    </div>

                    {/* User Profile */}
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <h3 className="font-bold text-gray-800">{recruiterData.firstName} {recruiterData.lastName}</h3>
                            <p className="text-sm text-gray-500">{recruiterData.email}</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {recruiterData.firstName.charAt(0)}{recruiterData.lastName.charAt(0)}
                        </div>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="mb-6 flex gap-4 items-center flex-shrink-0">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search candidates..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <select
                            value={selectedJob}
                            onChange={(e) => setSelectedJob(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm bg-white"
                        >
                            <option value="all">All Jobs</option>
                            {jobPostings.map(job => (
                                <option key={job.id} value={job.id}>{job.interviewField}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <ArrowUpDown className="w-4 h-4 text-gray-500" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm bg-white"
                        >
                            <option value="score-desc">Highest Score</option>
                            <option value="score-asc">Lowest Score</option>
                            <option value="name-asc">Name (A-Z)</option>
                            <option value="name-desc">Name (Z-A)</option>
                        </select>
                    </div>
                </div>

                {/* Rankings Table/List */}
                <div className="flex-1 overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col">
                    <div className="grid grid-cols-7 gap-4 p-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-600 text-sm flex-shrink-0">
                        <div className="col-span-2">Candidate Name</div>
                        <div>Rank</div>
                        <div>Score</div>
                        <div>Completion</div>
                        <div>Interview Status</div>
                        <div className="text-right pr-4">Actions</div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : processedRankings.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <TrendingUp className="w-16 h-16 mb-4 opacity-20" />
                                <p className="text-lg">No rankings found</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 font-poppins">
                                {processedRankings.map((ranking, index) => (
                                    <motion.div
                                        key={ranking.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="grid grid-cols-7 gap-4 p-4 items-center hover:bg-blue-50 transition-all group"
                                    >
                                        <div className="col-span-2">
                                            <p className="font-bold text-gray-800">{ranking.candidateName}</p>
                                            <p className="text-xs text-gray-500">{ranking.date}</p>
                                        </div>
                                        <div>
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                                                #{ranking.rank}
                                            </span>
                                        </div>
                                        <div className="font-bold text-gray-700">{ranking.score}</div>
                                        <div className="text-sm font-semibold text-blue-600">{ranking.completion}</div>
                                        <div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${ranking.interviewStatus === 'Selected' || ranking.interviewStatus === 'Shortlisted' ? 'bg-green-100 text-green-700' : ranking.interviewStatus.includes('In Progress') ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                                {ranking.interviewStatus}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <button
                                                onClick={() => handleViewReport(ranking.id)}
                                                className="p-2 text-blue-600 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-blue-200"
                                                title="View Report"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Ranking;
