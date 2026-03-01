import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Users,
    FileText,
    Download,
    Video
} from "lucide-react";
import API_BASE_URL from "./apiConfig";
import RecruiterSidebar from "./components/RecruiterSidebar";

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
            const response = await fetch(`${API_BASE_URL}/interview/reports/${jobId}`);
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

    const handleDownloadCV = (sessionId) => {
        window.open(`${API_BASE_URL}/interview/cv-file/${sessionId}`, "_blank");
    };

    if (!recruiterData) return null;

    return (
        <div className="h-screen w-screen flex bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden fixed inset-0">
            <RecruiterSidebar />

            <main className="flex-1 h-screen flex flex-col overflow-hidden py-8 px-8">
                {/* Header */}
                <div className="mb-6 flex items-center gap-4 flex-shrink-0">
                    <button
                        onClick={() => navigate("/recruiter/dashboard")}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Interview Reports</h2>
                        <p className="text-gray-500 text-sm">
                            {jobDetails
                                ? `${jobDetails.interviewField} (${jobDetails.positionLevel})`
                                : "Loading job details..."}
                        </p>
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-2xl shadow-lg flex-1 overflow-hidden flex flex-col">
                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a2a5e]"></div>
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                            <Video className="w-16 h-16 mb-4 text-gray-300" />
                            <p className="text-lg font-medium">No interviews yet</p>
                            <p className="text-sm">Reports will appear here once candidates complete their AI interviews.</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-[#0a2a5e] text-white text-sm">
                                        <th className="py-4 px-5 text-left font-semibold w-10">#</th>
                                        <th className="py-4 px-5 text-left font-semibold">Candidate Name</th>
                                        <th className="py-4 px-5 text-left font-semibold">Date Applied</th>
                                        <th className="py-4 px-5 text-left font-semibold">Avg Score</th>
                                        <th className="py-4 px-5 text-left font-semibold">Recommendation</th>
                                        <th className="py-4 px-5 text-left font-semibold">Interview Report</th>
                                        <th className="py-4 px-5 text-left font-semibold">Date Applied</th>
                                        <th className="py-4 px-5 text-left font-semibold">Avg Score</th>
                                        <th className="py-4 px-5 text-left font-semibold">CV</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map((report, index) => (
                                        <tr
                                            key={report._id}
                                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors text-sm"
                                        >
                                            <td className="py-4 px-5 text-gray-500">{index + 1}</td>
                                            <td className="py-4 px-5 font-semibold text-gray-800">
                                                {report.candidate_name || "—"}
                                            </td>
                                            <td className="py-4 px-5 text-gray-600">{report.date_applied}</td>
                                            <td className="py-4 px-5">
                                                {report.avg_score !== null && report.avg_score !== undefined ? (
                                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${report.avg_score >= 80
                                                            ? "text-green-600 border-green-400 bg-green-50"
                                                            : report.avg_score >= 60
                                                                ? "text-yellow-600 border-yellow-400 bg-yellow-50"
                                                                : "text-red-600 border-red-400 bg-red-50"
                                                        }`}>
                                                        {Math.round(report.avg_score)}/100
                                                    </span>
                                                ) : (
                                                    <span className="text-orange-500 font-medium text-xs">In Progress</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-5">
                                                {report.avg_score !== null && report.avg_score !== undefined ? (
                                                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-md ${report.avg_score >= 80 ? "bg-green-100 text-green-700" :
                                                            report.avg_score >= 60 ? "bg-blue-100 text-blue-700" :
                                                                "bg-red-100 text-red-700"
                                                        }`}>
                                                        {report.avg_score >= 80 ? "Strongly Recommended" :
                                                            report.avg_score >= 60 ? "Recommended" :
                                                                "Not Recommended"}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">—</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-5">
                                                {report.ranking_id ? (
                                                    <button
                                                        onClick={() => navigate(`/recruiter/report/${report.ranking_id}`)}
                                                        className="flex items-center gap-1 text-[#0a2a5e] hover:text-[#061a3d] font-medium transition-colors"
                                                        title="View Report"
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                        <span className="text-xs">View Report</span>
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">Processing...</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-5">
                                                {report.has_cv ? (
                                                    <button
                                                        onClick={() => handleDownloadCV(report.session_id)}
                                                        className="flex items-center gap-1 text-[#0a2a5e] hover:text-[#061a3d] font-medium transition-colors"
                                                        title="Download CV"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        <span className="text-xs">Download</span>
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">No CV</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Footer */}
                    {!isLoading && reports.length > 0 && (
                        <div className="px-5 py-3 border-t border-gray-100 text-sm text-gray-500">
                            {reports.length} applicant{reports.length !== 1 ? "s" : ""} found
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default RecruiterInterviewReports;
