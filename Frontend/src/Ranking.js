import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    LogOut,
    PlusCircle,
    TrendingUp,
    BarChart3,
    Cog,
    Eye
} from "lucide-react";

const Ranking = () => {
    const navigate = useNavigate();
    const [recruiterData, setRecruiterData] = useState(null);
    const [selectedJob, setSelectedJob] = useState("");
    const [jobPostings, setJobPostings] = useState([]);
    const [rankings, setRankings] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("recruiterUser");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setRecruiterData(user);
            // Fetch job postings for this recruiter
            fetchJobPostings(user.id);
        } else {
            navigate("/signin/recruiter");
        }
    }, [navigate]);

    const fetchJobPostings = async (recruiterId) => {
        try {
            const response = await fetch(`http://localhost:8000/api/jobs/recruiter/${recruiterId}`);
            const data = await response.json();
            setJobPostings(data);

            // Auto-select first job if available
            if (data.length > 0) {
                setSelectedJob(data[0].id);
                fetchRankings(data[0].id);
            }
        } catch (error) {
            console.error("Error fetching job postings:", error);
        }
    };

    const fetchRankings = async (jobId) => {
        if (!jobId) return;

        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/api/rankings/job/${jobId}`);
            const data = await response.json();
            setRankings(data);
        } catch (error) {
            console.error("Error fetching rankings:", error);
            setRankings([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleJobChange = (e) => {
        const jobId = e.target.value;
        setSelectedJob(jobId);
        fetchRankings(jobId);
    };

    const handleLogout = () => {
        localStorage.removeItem("recruiterUser");
        navigate("/recruiter");
    };

    const getCurrentDate = () => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date().toLocaleDateString('en-US', options);
    };

    const getRankBadgeColor = (rank) => {
        switch (rank) {
            default: return "bg-gray-100 text-gray-600";
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Shortlisted": return "text-green-600 bg-green-50";
            case "Review": return "text-yellow-600 bg-yellow-50";
            case "Not Selected": return "text-red-600 bg-red-50";
            default: return "text-gray-600 bg-gray-50";
        }
    };

    if (!recruiterData) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
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
                        <Cog className="w-5 h-5" /> Settings
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
            <main className="flex-1 h-screen flex flex-col overflow-hidden py-6 px-10">
                {/* Header */}
                <div className="mb-4 flex-shrink-0 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Candidate Rankings</h2>
                        <p className="text-gray-500 text-md mt-1 py-4">{getCurrentDate()}</p>
                    </div>

                    {/* User Profile - Top Right */}
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <h3 className="font-bold text-gray-800">
                                {recruiterData.firstName} {recruiterData.lastName}
                            </h3>
                            <p className="text-sm text-gray-500">{recruiterData.email}</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg overflow-hidden">
                            {recruiterData.profileImage ? (
                                <img src={recruiterData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <>{recruiterData.firstName?.charAt(0)}{recruiterData.lastName?.charAt(0)}</>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-lg p-8 w-full">
                        {/* Job Selection Dropdown */}
                        <div className="mb-6">
                            <label className="block font-medium text-gray-700 mb-2">
                                Select Interview Field
                            </label>
                            <select
                                value={selectedJob}
                                onChange={handleJobChange}
                                className="w-64 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            >
                                {jobPostings.length === 0 ? (
                                    <option value="">No jobs available</option>
                                ) : (
                                    jobPostings.map((job) => (
                                        <option key={job.id} value={job.id}>
                                            {job.interviewField} - {job.positionLevel}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>

                        {/* Rankings Table */}
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                            {/* Table Header */}
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                <h3 className="font-semibold text-gray-800">
                                    Candidate Rankings - {jobPostings.find(j => j.id === selectedJob)?.interviewField || "Select a job"}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">Ranked by interview performance score</p>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                {isLoading ? (
                                    <div className="text-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                        <p className="text-gray-600">Loading rankings...</p>
                                    </div>
                                ) : rankings.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-gray-600">No candidates ranked yet for this job.</p>
                                    </div>
                                ) : (
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Rank</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Candidate Name</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Score</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Completion</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Interview Status</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {rankings.map((candidate, index) => (
                                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${getRankBadgeColor(candidate.rank)}`}>
                                                            {candidate.rank}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-800 font-medium">{candidate.candidateName}</td>
                                                    <td className="px-6 py-4 text-gray-700">{candidate.score}</td>
                                                    <td className="px-6 py-4 text-gray-700">{candidate.completion}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(candidate.interviewStatus)}`}>
                                                            {candidate.interviewStatus}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-700">{candidate.date}</td>
                                                    <td className="px-6 py-4">
                                                        <button
                                                            onClick={() => navigate(`/recruiter/report/${candidate.id}`)}
                                                            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            View Report
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Ranking;
