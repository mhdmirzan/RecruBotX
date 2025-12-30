import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Download,
    User,
    FileText,
    TrendingUp,
    TrendingDown,
    Calendar,
    Award,
    CheckCircle
} from "lucide-react";

const CandidateReport = () => {
    const navigate = useNavigate();
    const { rankingId } = useParams();
    const [report, setReport] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchReport();
    }, [rankingId]);

    const fetchReport = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/api/rankings/${rankingId}/report`);
            const data = await response.json();
            setReport(data);
        } catch (error) {
            console.error("Error fetching report:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/rankings/evaluations/${report.evaluationId}/download`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${report.candidateName.replace(' ', '_')}_Evaluation_Report.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Error downloading report:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading report...</p>
                </div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <p className="text-gray-600">Report not found</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Rankings
                    </button>
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md"
                    >
                        <Download className="w-5 h-5" />
                        Download Report
                    </button>
                </div>

                {/* Candidate Overview Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                                {report.candidateName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">{report.candidateName}</h1>
                                <p className="text-gray-500 mt-1">{report.position}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-4xl font-bold text-green-600">{report.score}</div>
                            <p className="text-sm text-gray-500 mt-1">Overall Score</p>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-4 gap-4 mt-8">
                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                            <Award className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-gray-800">#{report.rank}</div>
                            <p className="text-sm text-gray-500">Rank</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                            <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-gray-800">{report.completion}</div>
                            <p className="text-sm text-gray-500">Completion</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                            <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                            <div className="text-lg font-bold text-gray-800">{report.date}</div>
                            <p className="text-sm text-gray-500">Interview Date</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                            <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${report.interviewStatus === 'Shortlisted' ? 'bg-green-100 text-green-700' :
                                report.interviewStatus === 'Review' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                {report.interviewStatus}
                            </div>
                            <p className="text-sm text-gray-500 mt-2">Status</p>
                        </div>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Skills Assessment */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                Skills Assessment
                            </h2>
                            <div className="space-y-4">
                                {report.skills && report.skills.map((skill, index) => (
                                    <div key={index}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                                            <span className="text-sm font-bold text-gray-800">{skill.percentage}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className={`${skill.color} h-3 rounded-full transition-all duration-500`}
                                                style={{ width: `${skill.percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Strengths */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                                Strengths
                            </h2>
                            <ul className="space-y-3">
                                {report.strengths && report.strengths.map((strength, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700">{strength}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Weaknesses */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <TrendingDown className="w-5 h-5 text-red-600" />
                                Areas for Improvement
                            </h2>
                            <ul className="space-y-3">
                                {report.weaknesses && report.weaknesses.map((weakness, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                                        </div>
                                        <span className="text-gray-700">{weakness}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* CV Summary */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-600" />
                                CV Summary
                            </h2>
                            <div className="prose prose-sm max-w-none">
                                <p className="text-gray-700 whitespace-pre-wrap">{report.cvSummary}</p>
                            </div>
                        </div>

                        {/* Job Description */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-purple-600" />
                                Job Description
                            </h2>
                            <div className="prose prose-sm max-w-none">
                                <p className="text-gray-700 whitespace-pre-wrap">{report.jobDescription}</p>
                            </div>
                        </div>

                        {/* Detailed Analysis */}
                        {report.detailedAnalysis && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-indigo-600" />
                                    Detailed Analysis
                                </h2>
                                <div className="prose prose-sm max-w-none">
                                    <p className="text-gray-700 whitespace-pre-wrap">{report.detailedAnalysis}</p>
                                </div>
                            </div>
                        )}

                        {/* Recommendations */}
                        {report.recommendations && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-yellow-600" />
                                    Recommendations
                                </h2>
                                <div className="prose prose-sm max-w-none">
                                    <p className="text-gray-700 whitespace-pre-wrap">{report.recommendations}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateReport;
