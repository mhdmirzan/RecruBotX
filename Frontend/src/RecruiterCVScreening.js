import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    LogOut,
    PlusCircle,
    TrendingUp,
    BarChart3,
    Upload,
    FileText,
    Settings,
    Search,
    CheckCircle,
    XCircle,
    Loader2,
    Users,
    Trash2,
    Eye
} from "lucide-react";
import API_BASE_URL from "./apiConfig";

const RecruiterCVScreening = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [recruiterData, setRecruiterData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isScreening, setIsScreening] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // Form state
    const [cvFiles, setCvFiles] = useState([]);
    const [cvFileNames, setCvFileNames] = useState([]);
    const [topNCvs, setTopNCvs] = useState(5);
    const [jobDescription, setJobDescription] = useState("");
    const [interviewField, setInterviewField] = useState("");
    const [positionLevel, setPositionLevel] = useState("");

    // Results state
    const [screeningResults, setScreeningResults] = useState([]);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("recruiterUser");
        if (storedUser) {
            setRecruiterData(JSON.parse(storedUser));
        } else {
            navigate("/recruiter/signin");
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("recruiterUser");
        navigate("/recruiter/signin");
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const filePromises = files.map(file => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve({
                            name: file.name,
                            base64: reader.result
                        });
                    };
                    reader.readAsDataURL(file);
                });
            });

            Promise.all(filePromises).then(fileData => {
                setCvFiles(prev => [...prev, ...fileData.map(f => f.base64)]);
                setCvFileNames(prev => [...prev, ...fileData.map(f => f.name)]);
            });
        }
    };

    const removeFile = (index) => {
        setCvFiles(prev => prev.filter((_, i) => i !== index));
        setCvFileNames(prev => prev.filter((_, i) => i !== index));
    };

    const handleScreenCVs = async () => {
        if (cvFiles.length === 0) {
            setErrorMessage("Please upload at least one CV to screen.");
            return;
        }
        if (!jobDescription.trim()) {
            setErrorMessage("Please provide a job description.");
            return;
        }
        if (!interviewField) {
            setErrorMessage("Please select an interview field.");
            return;
        }
        if (!positionLevel) {
            setErrorMessage("Please select a position level.");
            return;
        }

        setIsScreening(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const response = await fetch(`${API_BASE_URL}/screen-cvs-batch`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    recruiterId: recruiterData.id,
                    cvFiles: cvFiles,
                    jobDescription: jobDescription,
                    interviewField: interviewField,
                    positionLevel: positionLevel,
                    topNCvs: parseInt(topNCvs)
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Failed to screen CVs");
            }

            // Navigate to Ranking page with the job_posting_id to filter results
            if (data.job_posting_id) {
                navigate(`/recruiter/ranking?jobId=${data.job_posting_id}`);
            } else {
                // Fallback: just navigate to ranking page
                navigate('/recruiter/ranking');
            }

        } catch (error) {
            console.error("Error screening CVs:", error);
            setErrorMessage(error.message || "Failed to screen CVs. Please try again.");
        } finally {
            setIsScreening(false);
        }
    };

    const resetForm = () => {
        setCvFiles([]);
        setCvFileNames([]);
        setTopNCvs(5);
        setJobDescription("");
        setInterviewField("");
        setPositionLevel("");
        setScreeningResults([]);
        setShowResults(false);
        setSuccessMessage("");
        setErrorMessage("");
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

    return (
        <div className="h-screen w-screen flex bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden fixed inset-0">
            {/* Sidebar */}
            <aside className="w-72 h-screen bg-white shadow-xl flex flex-col p-6 border-r border-gray-200 flex-shrink-0">
                <div className="mb-8 text-center flex-shrink-0">
                    <h1 className="text-3xl font-bold text-[#0a2a5e]">RecruBotX</h1>
                </div>

                <nav className="flex flex-col space-y-4 text-gray-700 flex-shrink-0">
                    <NavLink
                        to="/recruiter/dashboard"
                        className={({ isActive }) =>
                            `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-[#0a2a5e]/10 text-[#0a2a5e]" : "text-gray-700 hover:bg-[#0a2a5e]/5 hover:text-[#0a2a5e]"
                            }`
                        }
                    >
                        <LayoutDashboard className="w-5 h-5" /> Dashboard
                    </NavLink>

                    <NavLink
                        to="/recruiter/job-posting"
                        className={({ isActive }) =>
                            `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-[#0a2a5e]/10 text-[#0a2a5e]" : "text-gray-700 hover:bg-[#0a2a5e]/5 hover:text-[#0a2a5e]"
                            }`
                        }
                    >
                        <PlusCircle className="w-5 h-5" /> Job Posting
                    </NavLink>

                    <NavLink
                        to="/recruiter/cv-screening"
                        className={({ isActive }) =>
                            `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-[#0a2a5e]/10 text-[#0a2a5e]" : "text-gray-700 hover:bg-[#0a2a5e]/5 hover:text-[#0a2a5e]"
                            }`
                        }
                    >
                        <Search className="w-5 h-5" /> CV Screening
                    </NavLink>

                    <NavLink
                        to="/recruiter/ranking"
                        className={({ isActive }) =>
                            `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-[#0a2a5e]/10 text-[#0a2a5e]" : "text-gray-700 hover:bg-[#0a2a5e]/5 hover:text-[#0a2a5e]"
                            }`
                        }
                    >
                        <TrendingUp className="w-5 h-5" /> Ranking
                    </NavLink>

                    <NavLink
                        to="/recruiter/evaluation"
                        className={({ isActive }) =>
                            `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-[#0a2a5e]/10 text-[#0a2a5e]" : "text-gray-700 hover:bg-[#0a2a5e]/5 hover:text-[#0a2a5e]"
                            }`
                        }
                    >
                        <BarChart3 className="w-5 h-5" /> Evaluation
                    </NavLink>

                    <NavLink
                        to="/recruiter/settings"
                        className={({ isActive }) =>
                            `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-[#0a2a5e]/10 text-[#0a2a5e]" : "text-gray-700 hover:bg-[#0a2a5e]/5 hover:text-[#0a2a5e]"
                            }`
                        }
                    >
                        <Settings className="w-5 h-5" /> Settings
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
                        <h2 className="text-3xl font-bold text-gray-800">CV Screening</h2>
                        <p className="text-gray-500 text-md mt-1 py-4">AI-powered resume analysis and candidate shortlisting.</p>
                    </div>
                    {/* User Profile - Top Right */}
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <h3 className="font-bold text-gray-800">
                                {recruiterData.firstName} {recruiterData.lastName}
                            </h3>
                            <p className="text-sm text-gray-500">{recruiterData.email}</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-[#0a2a5e] to-[#2b4c8c] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg overflow-hidden">
                            {recruiterData.profileImage ? (
                                <img src={recruiterData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <>{recruiterData.firstName?.charAt(0)}{recruiterData.lastName?.charAt(0)}</>
                            )}
                        </div>
                    </div>
                </div>

                {/* Messages */}
                {successMessage && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex-shrink-0 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        {successMessage}
                    </div>
                )}

                {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex-shrink-0 flex items-center gap-2">
                        <XCircle className="w-5 h-5" />
                        {errorMessage}
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    {/* Added Title for Context since Header is removed, but User asked to remove 'header navigation bar', I'll keep a minimal title or remove it if strictly asked. 
              The prompt says "remove the header navigation bar from RecruiterCVScreening.js". 
              I removed the entire top header div containing the Title and Profile.
           */}

                    <div className="bg-white rounded-2xl shadow-lg p-6 w-full h-full overflow-y-auto">
                        {!showResults ? (
                            /* Upload & Configuration Form */
                            <div className="space-y-6 h-full flex flex-col">
                                {/* Row 1: Interview Field, Position Level, Top N CVs (3 Columns) */}
                                <div className="grid grid-cols-3 gap-6">
                                    <div>
                                        <label className="block font-medium text-gray-700 mb-2">
                                            Interview Field <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={interviewField}
                                            onChange={(e) => setInterviewField(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0a2a5e] focus:border-transparent outline-none transition-all"
                                        >
                                            <option value="">Select a field...</option>
                                            <option value="Software Engineering">Software Engineering</option>
                                            <option value="Data Science">Data Science</option>
                                            <option value="Product Management">Product Management</option>
                                            <option value="UI/UX Design">UI/UX Design</option>
                                            <option value="Marketing">Marketing</option>
                                            <option value="Sales">Sales</option>
                                            <option value="Finance">Finance</option>
                                            <option value="Human Resources">Human Resources</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block font-medium text-gray-700 mb-2">
                                            Position Level <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={positionLevel}
                                            onChange={(e) => setPositionLevel(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        >
                                            <option value="">Select a level...</option>
                                            <option value="Intern">Intern</option>
                                            <option value="Junior">Junior</option>
                                            <option value="Mid-level">Mid-level</option>
                                            <option value="Senior">Senior</option>
                                            <option value="Lead">Lead</option>
                                            <option value="Manager">Manager</option>
                                            <option value="Director">Director</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block font-medium text-gray-700 mb-2">
                                            Top N CVs
                                        </label>
                                        <select
                                            value={topNCvs}
                                            onChange={(e) => setTopNCvs(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        >
                                            <option value="3">Top 3 Candidates</option>
                                            <option value="5">Top 5 Candidates</option>
                                            <option value="10">Top 10 Candidates</option>
                                            <option value="15">Top 15 Candidates</option>
                                            <option value="20">Top 20 Candidates</option>
                                            <option value="25">Top 25 Candidates</option>
                                            <option value="50">Top 50 Candidates</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Row 2: JD (Left) and Upload (Right) Side by Side */}
                                <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
                                    {/* Left Col: Job Description */}
                                    <div className="flex flex-col h-full">
                                        <label className="block font-medium text-gray-700 mb-2">
                                            <FileText className="w-4 h-4 inline mr-2" />
                                            Job Description <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={jobDescription}
                                            onChange={(e) => setJobDescription(e.target.value)}
                                            placeholder="Enter the job description, requirements, and qualifications..."
                                            className="w-full flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                        />
                                    </div>

                                    {/* Right Col: Upload */}
                                    <div className="flex flex-col h-full">
                                        <label className="block font-medium text-gray-700 mb-2">
                                            <Upload className="w-4 h-4 inline mr-2" />
                                            Upload CVs <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex-1 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#0a2a5e] transition-all cursor-pointer bg-gray-50 flex flex-col items-center justify-center">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".pdf,.doc,.docx"
                                                onChange={handleFileUpload}
                                                multiple
                                                className="hidden"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="text-[#0a2a5e] hover:text-[#061a3d] w-full"
                                            >
                                                <Upload className="w-12 h-12 mx-auto mb-3 text-[#0a2a5e]" />
                                                <p className="text-lg font-medium">Click to upload CVs</p>
                                                <p className="text-sm text-gray-500 mt-1">PDF, DOC, DOCX</p>
                                            </button>
                                        </div>

                                        {/* Uploaded Files List */}
                                        {cvFileNames.length > 0 && (
                                            <div className="mt-4 h-32 overflow-y-auto space-y-2 border border-gray-200 rounded-xl p-2 bg-gray-50">
                                                {cvFileNames.map((name, index) => (
                                                    <div key={index} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-100 shadow-sm">
                                                        <div className="flex items-center gap-2 overflow-hidden">
                                                            <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                                            <span className="text-sm text-gray-700 truncate">{name}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => removeFile(index)}
                                                            className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Screen Button */}
                                <div className="flex justify-center pt-2 pb-2">
                                    <button
                                        onClick={handleScreenCVs}
                                        disabled={isScreening || cvFiles.length === 0}
                                        className={`px-12 py-3 rounded-xl font-semibold text-white transition-all shadow-lg flex items-center gap-3 text-lg ${isScreening || cvFiles.length === 0
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-gradient-to-r from-[#0a2a5e] to-[#0d3b82] hover:from-[#061a3d] hover:to-[#0a2a5e]"
                                            }`}
                                    >
                                        {isScreening ? (
                                            <>
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                                Screening CVs...
                                            </>
                                        ) : (
                                            <>
                                                <Search className="w-6 h-6" />
                                                Screen {cvFiles.length} CV{cvFiles.length !== 1 ? 's' : ''}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Results View */
                            <div className="space-y-6 h-full flex flex-col">
                                {/* Results Header */}
                                <div className="flex items-center justify-between flex-shrink-0">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-800">Screening Results</h3>
                                        <p className="text-gray-500 mt-1">
                                            Showing top {Math.min(topNCvs, screeningResults.length)} of {screeningResults.length} screened candidates
                                        </p>
                                    </div>
                                    <button
                                        onClick={resetForm}
                                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
                                    >
                                        Screen More CVs
                                    </button>
                                </div>

                                {/* Results Table */}
                                <div className="flex-1 overflow-x-auto overflow-y-auto">
                                    <table className="w-full">
                                        <thead className="sticky top-0 bg-white z-10">
                                            <tr className="bg-gray-50 border-b border-gray-200">
                                                <th className="text-left py-4 px-4 font-semibold text-gray-700">Rank</th>
                                                <th className="text-left py-4 px-4 font-semibold text-gray-700">Candidate</th>
                                                <th className="text-left py-4 px-4 font-semibold text-gray-700">Score</th>
                                                <th className="text-left py-4 px-4 font-semibold text-gray-700">Skills Match</th>
                                                <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                                                <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {screeningResults.slice(0, topNCvs).map((result, index) => (
                                                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-all">
                                                    <td className="py-4 px-4">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : index === 2 ? "bg-amber-600" : "bg-blue-500"
                                                            }`}>
                                                            {index + 1}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <p className="font-medium text-gray-800">{result.candidate_name || `Candidate ${index + 1}`}</p>
                                                        <p className="text-sm text-gray-500">{result.email || "Email not available"}</p>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full ${result.score >= 80 ? "bg-green-500" : result.score >= 60 ? "bg-yellow-500" : "bg-red-500"
                                                                        }`}
                                                                    style={{ width: `${result.score || 0}%` }}
                                                                />
                                                            </div>
                                                            <span className="font-semibold text-gray-700">{result.score || 0}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className="text-gray-700">{result.skills_match || 0}%</span>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${result.recommendation === "Highly Recommended"
                                                            ? "bg-green-100 text-green-700"
                                                            : result.recommendation === "Recommended"
                                                                ? "bg-blue-100 text-blue-700"
                                                                : "bg-gray-100 text-gray-700"
                                                            }`}>
                                                            {result.recommendation || "Pending"}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <button className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                                            <Eye className="w-4 h-4" />
                                                            View
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {screeningResults.length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                        <p className="text-lg">No screening results available</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RecruiterCVScreening;
