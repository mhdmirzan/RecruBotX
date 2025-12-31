import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    LogOut,
    PlusCircle,
    TrendingUp,
    BarChart3,
    Cog,
    Download,
    Eye
} from "lucide-react";

const Evaluation = () => {
    const navigate = useNavigate();
    const [recruiterData, setRecruiterData] = useState(null);
    const [selectedJob, setSelectedJob] = useState("all");
    const [selectedScore, setSelectedScore] = useState("all");
    const [jobPostings, setJobPostings] = useState([]);
    const [evaluations, setEvaluations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("recruiterUser");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setRecruiterData(user);
            fetchJobPostings(user.id);
            fetchEvaluations(user.id);
        } else {
            navigate("/signin/recruiter");
        }
    }, [navigate]);

    const fetchJobPostings = async (recruiterId) => {
        try {
            const response = await fetch(`http://localhost:8000/api/jobs/recruiter/${recruiterId}`);
            const data = await response.json();
            setJobPostings(data);
        } catch (error) {
            console.error("Error fetching job postings:", error);
        }
    };

    const fetchEvaluations = async (recruiterId) => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/api/rankings/evaluations/recruiter/${recruiterId}`);
            const data = await response.json();
            setEvaluations(data);
        } catch (error) {
            console.error("Error fetching evaluations:", error);
            setEvaluations([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleJobChange = (e) => {
        setSelectedJob(e.target.value);
    };

    const handleScoreChange = (e) => {
        setSelectedScore(e.target.value);
    };

    const handleViewReport = (rankingId) => {
        if (rankingId) {
            navigate(`/recruiter/report/${rankingId}`);
        } else {
            alert("Report not available for this candidate.");
        }
    };

    const handleDownload = async (evaluationId, candidateName) => {
        try {
            const response = await fetch(`http://localhost:8000/api/rankings/evaluations/${evaluationId}/download`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${candidateName.replace(' ', '_')}_Evaluation_Report.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Error downloading report:", error);
        }
    };

    const filterEvaluations = () => {
        let filtered = [...evaluations];

        // Filter by job
        if (selectedJob !== "all") {
            filtered = filtered.filter(e => e.jobPostingId === selectedJob);
        }

        // Filter by score
        if (selectedScore !== "all") {
            filtered = filtered.filter(e => {
                const score = parseInt(e.score);
                if (selectedScore === "high") return score >= 80;
                if (selectedScore === "medium") return score >= 60 && score < 80;
                if (selectedScore === "low") return score < 60;
                return true;
            });
        }

        return filtered;
    };

    const handleLogout = () => {
        localStorage.removeItem("recruiterUser");
        navigate("/recruiter");
    };

    const getCurrentDate = () => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date().toLocaleDateString('en-US', options);
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

    const filteredEvaluations = filterEvaluations();

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
                        <h2 className="text-3xl font-bold text-gray-800">Evaluation Reports</h2>
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

                {/* Filters */}
                <div className="mb-6 flex-shrink-0 flex gap-4">
                    <div>
                        <label className="block font-medium text-gray-700 mb-2 text-sm">
                            Select Job Description
                        </label>
                        <select
                            value={selectedJob}
                            onChange={handleJobChange}
                            className="w-56 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                        >
                            <option value="all">All Jobs</option>
                            {jobPostings.map((job) => (
                                <option key={job.id} value={job.id}>
                                    {job.interviewField} - {job.positionLevel}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block font-medium text-gray-700 mb-2 text-sm">
                            Filter by Score
                        </label>
                        <select
                            value={selectedScore}
                            onChange={handleScoreChange}
                            className="w-56 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                        >
                            <option value="all">All Scores</option>
                            <option value="high">High (80-100%)</option>
                            <option value="medium">Medium (60-79%)</option>
                            <option value="low">Low (0-59%)</option>
                        </select>
                    </div>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading evaluations...</p>
                        </div>
                    ) : filteredEvaluations.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-600">No evaluation reports found.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-6">
                            {filteredEvaluations.map((evaluation, index) => (
                                <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                                    {/* Candidate Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800">{evaluation.candidateName}</h3>
                                            <p className="text-sm text-gray-500">{evaluation.position}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-2xl font-bold text-green-600">{evaluation.score}</span>
                                            <p className="text-xs text-gray-500">Score</p>
                                        </div>
                                    </div>

                                    {/* Skills Progress Bars - All Blue Theme */}
                                    <div className="space-y-3 mb-6">
                                        {evaluation.skills && evaluation.skills.map((skill, skillIndex) => (
                                            <div key={skillIndex}>
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                                                    <span className="text-sm font-semibold text-gray-800">{skill.percentage}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                    <div
                                                        className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                                                        style={{ width: `${skill.percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleViewReport(evaluation.rankingId)}
                                            className="flex-1 bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-2.5 rounded-xl font-semibold hover:from-blue-800 hover:to-indigo-800 transition-all shadow-md flex items-center justify-center gap-2"
                                        >
                                            <Eye className="w-4 h-4" />
                                            View Report
                                        </button>
                                        <button
                                            onClick={() => handleDownload(evaluation.id, evaluation.candidateName)}
                                            className="bg-gray-100 text-gray-700 py-2.5 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-all shadow-md flex items-center justify-center"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Evaluation;
