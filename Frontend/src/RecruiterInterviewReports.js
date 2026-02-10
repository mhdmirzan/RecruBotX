import React, { useState, useEffect } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    LogOut,
    PlusCircle,
    TrendingUp,
    BarChart3,
    Search,
    Settings,
    ArrowLeft,
    FileText,
    Video,
    CheckCircle,
    XCircle,
    Download,
    Play
} from "lucide-react";
import API_BASE_URL from "./apiConfig";

const RecruiterInterviewReports = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [recruiterData, setRecruiterData] = useState(null);
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [jobDetails, setJobDetails] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("recruiterUser");
        if (storedUser) {
            setRecruiterData(JSON.parse(storedUser));
            fetchJobDetails();
            fetchReports();
        } else {
            navigate("/recruiter/signin");
        }
    }, [jobId, navigate]);

    const fetchJobDetails = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
            if (response.ok) {
                const data = await response.json();
                setJobDetails(data);
            }
        } catch (error) {
            console.error("Error fetching job details:", error);
        }
    };

    const fetchReports = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${API_BASE_URL}/voice-interview/reports/${jobId}`);
            if (response.ok) {
                const data = await response.json();
                setReports(data.reports || []);
            }
        } catch (error) {
            console.error("Error fetching reports:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("recruiterUser");
        navigate("/recruiter/signin");
    };

    if (!recruiterData) return null;

    return (
        <div className="h-screen w-screen flex bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden fixed inset-0">
            {/* Sidebar */}
            <aside className="w-72 h-screen bg-white shadow-xl flex flex-col p-6 border-r border-gray-200 flex-shrink-0">
                <div className="mb-8 text-center flex-shrink-0">
                    <h1 className="text-3xl font-bold text-[#0a2a5e]">RecruBotX</h1>
                </div>

                <nav className="flex flex-col space-y-4 text-gray-700 flex-shrink-0">
                    <NavLink to="/recruiter/dashboard" className="font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 hover:bg-[#0a2a5e]/5 hover:text-[#0a2a5e]">
                        <LayoutDashboard className="w-5 h-5" /> Dashboard
                    </NavLink>
                    <NavLink to="/recruiter/job-posting" className="font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 hover:bg-[#0a2a5e]/5 hover:text-[#0a2a5e]">
                        <PlusCircle className="w-5 h-5" /> Job Posting
                    </NavLink>
                    <NavLink to="/recruiter/cv-screening" className="font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 hover:bg-[#0a2a5e]/5 hover:text-[#0a2a5e]">
                        <Search className="w-5 h-5" /> CV Screening
                    </NavLink>
                    <NavLink to="/recruiter/ranking" className="font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 hover:bg-[#0a2a5e]/5 hover:text-[#0a2a5e]">
                        <TrendingUp className="w-5 h-5" /> Ranking
                    </NavLink>
                    <NavLink to="/recruiter/evaluation" className="font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 bg-[#0a2a5e]/10 text-[#0a2a5e]">
                        <BarChart3 className="w-5 h-5" /> Evaluation
                    </NavLink>
                    <NavLink to="/recruiter/settings" className="font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 hover:bg-[#0a2a5e]/5 hover:text-[#0a2a5e]">
                        <Settings className="w-5 h-5" /> Settings
                    </NavLink>
                </nav>

                <div className="mt-auto flex-shrink-0">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 rounded-xl text-white hover:from-red-600 hover:to-red-700 transition-all shadow-md">
                        <LogOut className="w-5 h-5" /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-screen flex flex-col overflow-hidden py-8 px-8">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/recruiter/dashboard")}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 text-gray-600" />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                Interview Reports
                            </h2>
                            <p className="text-gray-500">
                                {jobDetails ? `${jobDetails.interviewField} (${jobDetails.positionLevel})` : "Loading job details..."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-2xl shadow-lg flex-1 overflow-hidden flex flex-col">
                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a2a5e]"></div>
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                            <Video className="w-16 h-16 mb-4 text-gray-300" />
                            <p className="text-lg font-medium">No completed interviews yet</p>
                            <p className="text-sm">Reports will appear here once candidates complete their AI interviews.</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid gap-4">
                                {reports.map((report) => (
                                    <div
                                        key={report._id}
                                        className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${report.avg_score >= 80 ? 'bg-green-500' :
                                                report.avg_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}>
                                                {Math.round(report.avg_score)}%
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-800 text-lg">{report.candidate_name}</h3>
                                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <FileText className="w-4 h-4" />
                                                        {report.email_address}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{new Date(report.completed_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500 uppercase font-semibold">Performance</p>
                                                <p className={`font-bold ${report.avg_score >= 80 ? 'text-green-600' :
                                                    report.avg_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                                                    }`}>
                                                    {report.performance_level}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => navigate(`/recruiter/interview-report/${report._id}`)}
                                                className="flex items-center gap-2 bg-[#0a2a5e] text-white px-4 py-2 rounded-lg hover:bg-[#061a3d] transition-colors"
                                            >
                                                View Report
                                                <ArrowLeft className="w-4 h-4 rotate-180" />
                                            </button>
                                        </div>
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

export default RecruiterInterviewReports;
