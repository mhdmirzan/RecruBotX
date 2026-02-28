import React, { useState, useEffect } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    LogOut,
    PlusCircle,
    Cog,
    ArrowLeft,
    FileText,
    Star,
    CheckCircle,
    XCircle,
    Download,
    Search
} from "lucide-react";
import { motion } from "framer-motion";
import API_BASE_URL from "./apiConfig";
import RecruiterSidebar from "./components/RecruiterSidebar";

const CandidateReport = () => {
    const { rankingId } = useParams();
    const navigate = useNavigate();
    const [recruiterData, setRecruiterData] = useState(null);
    const [report, setReport] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("recruiterUser");
        if (storedUser) {
            setRecruiterData(JSON.parse(storedUser));
            fetchReport(rankingId);
        } else {
            navigate("/recruiter/signin");
        }
    }, [rankingId, navigate]);

    const fetchReport = async (id) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/rankings/${id}/report`);
            if (!response.ok) throw new Error("Failed to fetch report");
            const data = await response.json();
            setReport(data);
        } catch (error) {
            console.error("Error fetching report:", error);
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
            {/* Sidebar (Same as Dashboard) */}
            <RecruiterSidebar />

            {/* Main Content */}
            <main className="flex-1 h-screen flex flex-col overflow-hidden py-8 px-10">
                {/* Header with Back Button */}
                <div className="mb-6 flex-shrink-0 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-white hover:shadow-md rounded-full transition-all text-gray-600"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800">Candidate Evaluation Report</h2>
                            <p className="text-gray-500 mt-1">Detailed performance analysis and AI insights</p>
                        </div>
                    </div>

                    <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg">
                        <Download className="w-5 h-5" /> Download PDF
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : !report ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <FileText className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-lg">Report not found</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                        {/* Summary Header Card */}
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-8 text-white">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-4xl font-bold">{report.candidateName}</h3>
                                            <span className="bg-blue-500/30 px-4 py-1 rounded-full text-sm font-bold backdrop-blur-md">Rank #{report.rank}</span>
                                        </div>
                                        <p className="text-blue-100 text-xl">{report.position}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-5xl font-black">{report.score}</p>
                                        <p className="text-blue-200 font-bold uppercase tracking-wider text-sm mt-1">Overall Match Score</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 divide-x divide-gray-100 border-b border-gray-100 bg-white">
                                <div className="p-6 text-center">
                                    <p className="text-gray-500 text-sm font-bold uppercase mb-1">CV Match</p>
                                    <p className="text-2xl font-black text-blue-600">{report.cvScore}</p>
                                </div>
                                <div className="p-6 text-center">
                                    <p className="text-gray-500 text-sm font-bold uppercase mb-1">Interview Score</p>
                                    <p className="text-2xl font-black text-indigo-600">{report.interviewScore}</p>
                                </div>
                                <div className="p-6 text-center">
                                    <p className="text-gray-500 text-sm font-bold uppercase mb-1">Soft Skills</p>
                                    <p className="text-2xl font-black text-purple-600">{report.facialRecognitionScore}</p>
                                </div>
                                <div className="p-6 text-center">
                                    <p className="text-gray-500 text-sm font-bold uppercase mb-1">Status</p>
                                    <span className={`inline-block mt-1 px-4 py-1 rounded-full text-sm font-bold ${report.interviewStatus === 'Selected' || report.interviewStatus === 'Shortlisted' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {report.interviewStatus}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                            {/* Skills Breakdown */}
                            <div className="col-span-2 space-y-6">
                                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                                    <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                        <Star className="w-5 h-5 text-yellow-500" /> Skill Proficiency
                                    </h4>
                                    <div className="grid grid-cols-1 gap-6">
                                        {report.skills.map((skill, index) => (
                                            <div key={index} className="space-y-2">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="font-bold text-gray-700">{skill.name}</span>
                                                    <span className="font-black text-blue-600">{skill.percentage}%</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-3">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${skill.percentage}%` }}
                                                        transition={{ duration: 1, delay: index * 0.1 }}
                                                        className={`h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-sm shadow-blue-200`}
                                                    ></motion.div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Detailed AI Analysis */}
                                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                                    <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-600" /> AI Insights & Recommendations
                                    </h4>
                                    <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed font-medium">
                                        {report.detailedAnalysis || "The candidate demonstrates exceptional proficiency in backend architecture and cloud infrastructure. Their interview performance was consistent with the high technical score on their CV analysis. We recommend proceeding to final rounds for architectural review."}
                                    </div>
                                    <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                                        <h5 className="font-bold text-blue-800 mb-2">Final Recommendation</h5>
                                        <p className="text-blue-700 font-medium italic">"{report.recommendations}"</p>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Info - Strengths & Weaknesses */}
                            <div className="space-y-6">
                                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                                    <h4 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-500" /> Key Strengths
                                    </h4>
                                    <ul className="space-y-4">
                                        {report.strengths.map((strength, i) => (
                                            <li key={i} className="flex gap-3 text-gray-600 bg-green-50/50 p-3 rounded-xl border border-green-100/50">
                                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm font-semibold">{strength}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                                    <h4 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                        <XCircle className="w-5 h-5 text-red-500" /> Areas of Improvement
                                    </h4>
                                    <ul className="space-y-4">
                                        {report.weaknesses.map((weakness, i) => (
                                            <li key={i} className="flex gap-3 text-gray-600 bg-red-50/50 p-3 rounded-xl border border-red-100/50">
                                                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm font-semibold">{weakness}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* CV Preview Button */}
                                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                                    <h4 className="font-bold text-gray-800 mb-4">Original Resume</h4>
                                    <button className="w-full flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 text-gray-700 py-3 rounded-xl hover:bg-white hover:shadow-md transition-all font-semibold">
                                        <FileText className="w-5 h-5" /> View PDF Resume
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CandidateReport;
