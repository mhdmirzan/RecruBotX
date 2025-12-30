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
    Cog
} from "lucide-react";

const JobPosting = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [recruiterData, setRecruiterData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const [formData, setFormData] = useState({
        interviewField: "",
        positionLevel: "",
        numberOfQuestions: "",
        topNCvs: "",
        cvFiles: [],
        jobDescription: ""
    });

    useEffect(() => {
        const storedUser = localStorage.getItem("recruiterUser");
        if (storedUser) {
            setRecruiterData(JSON.parse(storedUser));
        } else {
            navigate("/signin/recruiter");
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("recruiterUser");
        navigate("/recruiter");
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        setErrorMessage("");
        setSuccessMessage("");
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const filePromises = files.map(file => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve(reader.result);
                    };
                    reader.readAsDataURL(file);
                });
            });

            Promise.all(filePromises).then(base64Files => {
                setFormData(prev => ({
                    ...prev,
                    cvFiles: [...prev.cvFiles, ...base64Files]
                }));
            });
        }
    };

    const removeFile = (index) => {
        setFormData(prev => ({
            ...prev,
            cvFiles: prev.cvFiles.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");

        // Validation
        if (!formData.interviewField || !formData.positionLevel || !formData.numberOfQuestions || !formData.topNCvs) {
            setErrorMessage("Please fill in all required fields");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:8000/api/jobs/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    recruiterId: recruiterData.id,
                    interviewField: formData.interviewField,
                    positionLevel: formData.positionLevel,
                    numberOfQuestions: parseInt(formData.numberOfQuestions),
                    topNCvs: parseInt(formData.topNCvs),
                    cvFiles: formData.cvFiles,
                    jobDescription: formData.jobDescription
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Failed to create job posting");
            }

            setSuccessMessage("Job posting created successfully!");

            // Reset form
            setFormData({
                interviewField: "",
                positionLevel: "",
                numberOfQuestions: "",
                topNCvs: "",
                cvFiles: [],
                jobDescription: ""
            });

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                navigate("/recruiter/dashboard");
            }, 2000);
        } catch (error) {
            console.error("Error:", error);
            setErrorMessage(error.message || "Failed to create job posting");
        } finally {
            setIsLoading(false);
        }
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
                        <h2 className="text-3xl font-bold text-gray-800">Job Posting</h2>
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

                {/* Success/Error Messages */}
                {successMessage && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex-shrink-0">
                        {successMessage}
                    </div>
                )}

                {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex-shrink-0">
                        {errorMessage}
                    </div>
                )}

                {/* Form Content - Scrollable */}
                <div className="flex-1 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-lg p-8 w-full">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Row 1 */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block font-medium text-gray-700 mb-2">
                                        Interview Field <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="interviewField"
                                        value={formData.interviewField}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        required
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
                                        name="positionLevel"
                                        value={formData.positionLevel}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        required
                                    >
                                        <option value="">Select a field...</option>
                                        <option value="Intern">Intern</option>
                                        <option value="Junior">Junior</option>
                                        <option value="Mid-level">Mid-level</option>
                                        <option value="Senior">Senior</option>
                                        <option value="Lead">Lead</option>
                                        <option value="Manager">Manager</option>
                                        <option value="Director">Director</option>
                                    </select>
                                </div>
                            </div>

                            {/* Row 2 */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block font-medium text-gray-700 mb-2">
                                        Number of Questions <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="numberOfQuestions"
                                        value={formData.numberOfQuestions}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        required
                                    >
                                        <option value="">Select a field...</option>
                                        <option value="5">5 Questions</option>
                                        <option value="10">10 Questions</option>
                                        <option value="15">15 Questions</option>
                                        <option value="20">20 Questions</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-medium text-gray-700 mb-2">
                                        Top N CVs <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="topNCvs"
                                        value={formData.topNCvs}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        required
                                    >
                                        <option value="">Select a field...</option>
                                        <option value="5">Top 5</option>
                                        <option value="10">Top 10</option>
                                        <option value="15">Top 15</option>
                                        <option value="20">Top 20</option>
                                        <option value="25">Top 25</option>
                                    </select>
                                </div>
                            </div>

                            {/* Row 3 - File Upload and Job Description */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block font-medium text-gray-700 mb-2">
                                        <Upload className="w-4 h-4 inline mr-2" />
                                        Upload CVs (Multiple)
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-all cursor-pointer">
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
                                            className="text-blue-600 hover:text-blue-700"
                                        >
                                            <Upload className="w-8 h-8 mx-auto mb-2" />
                                            <p className="text-sm">Click to upload CVs (.pdf / .doc / .docx)</p>
                                            <p className="text-xs text-gray-500 mt-1">You can select multiple files</p>
                                        </button>
                                    </div>

                                    {/* File Count */}
                                    {formData.cvFiles.length > 0 && (
                                        <div className="mt-4">
                                            <p className="text-sm font-medium text-green-600">
                                                ✓ {formData.cvFiles.length} file(s) uploaded
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block font-medium text-gray-700 mb-2">
                                        <FileText className="w-4 h-4 inline mr-2" />
                                        Job Description (Optional)
                                    </label>
                                    <textarea
                                        name="jobDescription"
                                        value={formData.jobDescription}
                                        onChange={handleInputChange}
                                        placeholder="Paste the job description here to analyze compatibility with your CV."
                                        className="w-full h-40 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-center pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`px-8 py-3 rounded-xl font-semibold text-white transition-all shadow-lg ${isLoading
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700"
                                        }`}
                                >
                                    {isLoading ? "Creating..." : "Create Job Posting"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default JobPosting;
