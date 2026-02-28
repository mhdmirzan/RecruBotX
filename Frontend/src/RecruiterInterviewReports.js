import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Users,
    FileText,
    ExternalLink,
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
            const response = await fetch(`${API_BASE_URL}/interview/sessions/${jobId}`);
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

    const handleViewCV = (sessionId) => {
        window.open(`${API_BASE_URL}/interview/cv-file/${sessionId}`, "_blank");
    };

    const formatDate = (isoStr) => {
        if (!isoStr) return "—";
        return new Date(isoStr).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getScoreDisplay = (score, status) => {
        if (score === null || score === undefined) {
            return status === "In Progress"
                ? <span className="text-yellow-600 font-semibold text-xs">In Progress</span>
                : <span className="text-gray-400 text-xs">Pending</span>;
        }
        const num = Math.round(score);
        const color =
            num >= 80 ? "text-green-700 bg-green-50 border-green-200"
            : num >= 60 ? "text-yellow-700 bg-yellow-50 border-yellow-200"
            : "text-red-700 bg-red-50 border-red-200";
        return (
            <span className={`inline-block px-2.5 py-1 rounded-lg text-sm font-bold border ${color}`}>
                {num}/100
            </span>
        );
    };

    if (!recruiterData) return null;

    return (
        <div className="h-screen w-screen flex bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden fixed inset-0">
            <RecruiterSidebar />

            <main className="flex-1 h-screen flex flex-col overflow-hidden py-8 px-8">
                {/* Header */}
                <div className="mb-6 flex items-center gap-4 flex-shrink-0">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-[#0a2a5e]">Interview Reports</h2>
                        <p className="text-gray-500 text-sm mt-0.5">
                            {jobDetails
                                ? `${jobDetails.interviewField} (${jobDetails.positionLevel})`
                                : "Loading..."}
                        </p>
                    </div>
                </div>

                {/* Table card */}
                <div className="bg-white rounded-2xl shadow-md flex-1 overflow-hidden flex flex-col">
                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a2a5e]"></div>
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <Users className="w-16 h-16 mb-4 opacity-30" />
                            <p className="text-lg font-medium">No applicants yet</p>
                            <p className="text-sm mt-1">Candidates who start the interview will appear here.</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 bg-[#0a2a5e] text-white z-10">
                                    <tr>
                                        <th className="px-5 py-3.5 text-left font-semibold w-12">#</th>
                                        <th className="px-5 py-3.5 text-left font-semibold">Candidate Name</th>
                                        <th className="px-5 py-3.5 text-left font-semibold">Email Address</th>
                                        <th className="px-5 py-3.5 text-left font-semibold">Phone Number</th>
                                        <th className="px-5 py-3.5 text-left font-semibold">Date Applied</th>
                                        <th className="px-5 py-3.5 text-left font-semibold">Avg Score</th>
                                        <th className="px-5 py-3.5 text-center font-semibold">CV</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {reports.map((report, idx) => (
                                        <tr
                                            key={report._id || report.sessionId}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-5 py-4 text-gray-400 font-medium">{idx + 1}</td>
                                            <td className="px-5 py-4 font-semibold text-gray-800">
                                                {report.candidateName || "—"}
                                            </td>
                                            <td className="px-5 py-4 text-gray-600">
                                                {report.emailAddress || "—"}
                                            </td>
                                            <td className="px-5 py-4 text-gray-600">
                                                {report.phoneNumber || "—"}
                                            </td>
                                            <td className="px-5 py-4 text-gray-500">
                                                {formatDate(report.dateApplied)}
                                            </td>
                                            <td className="px-5 py-4">
                                                {getScoreDisplay(report.avgScore, report.status)}
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                {report.cvFilePath ? (
                                                    <button
                                                        onClick={() => handleViewCV(report.sessionId)}
                                                        title="View CV"
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0a2a5e] bg-blue-50 hover:bg-blue-100 border border-[#0a2a5e]/20 transition-colors"
                                                    >
                                                        <FileText className="w-3.5 h-3.5" />
                                                        View
                                                        <ExternalLink className="w-3 h-3 opacity-60" />
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-300 text-xs">No CV</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Footer count */}
                    {!isLoading && reports.length > 0 && (
                        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex-shrink-0">
                            <p className="text-xs text-gray-400">
                                {reports.length} applicant{reports.length !== 1 ? "s" : ""} found
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default RecruiterInterviewReports;
