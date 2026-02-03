import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    LogOut,
    PlusCircle,
    TrendingUp,
    BarChart3,
    Search,
    Cog
} from "lucide-react";
import API_BASE_URL from "./apiConfig";

const JobPosting = () => {
    const navigate = useNavigate();
    const [recruiterData, setRecruiterData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const [formData, setFormData] = useState({
        interviewField: "",
        positionLevel: "",
        workModel: "",
        status: "",
        location: "",
        salaryRange: ""
    });

    const [jobPostings, setJobPostings] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState("");

    useEffect(() => {
        const storedUser = localStorage.getItem("recruiterUser");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setRecruiterData(user);
            fetchJobPostings(user.id);
        } else {
            navigate("/recruiter/signin");
        }
    }, [navigate]);

    const fetchJobPostings = async (recruiterId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/jobs/recruiter/${recruiterId}`);
            if (response.ok) {
                const data = await response.json();
                setJobPostings(data);
            }
        } catch (error) {
            console.error("Error fetching jobs:", error);
        }
    };

    const handleJobSelect = (e) => {
        const jobId = e.target.value;
        setSelectedJobId(jobId);

        if (jobId) {
            const selectedJob = jobPostings.find(job => job.id === jobId);
            if (selectedJob) {
                setFormData(prev => ({
                    ...prev,
                    interviewField: selectedJob.interviewField || "",
                    positionLevel: selectedJob.positionLevel || "",
                    workModel: selectedJob.workModel || "",
                    status: selectedJob.status || "",
                    location: selectedJob.location || "",
                    salaryRange: selectedJob.salaryRange || ""
                }));
            }
        } else {
            setFormData({
                interviewField: "",
                positionLevel: "",
                workModel: "",
                status: "",
                location: "",
                salaryRange: ""
            });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("recruiterUser");
        navigate("/recruiter/signin");
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");

        // Validation
        if (!formData.interviewField || !formData.positionLevel || !formData.workModel || !formData.status || !formData.location || !formData.salaryRange) {
            setErrorMessage("Please fill in all required fields");
            return;
        }

        setIsLoading(true);

        try {
            const url = selectedJobId
                ? `${API_BASE_URL}/jobs/${selectedJobId}`
                : `${API_BASE_URL}/jobs/create`;

            const method = selectedJobId ? "PUT" : "POST";

            const payload = {
                recruiterId: recruiterData.id,
                interviewField: formData.interviewField,
                positionLevel: formData.positionLevel,
                workModel: formData.workModel,
                status: formData.status,
                location: formData.location,
                salaryRange: formData.salaryRange,
                // Hidden defaults required by backend
                numberOfQuestions: 5,
                topNCvs: 5,
                cvFiles: [],
                jobDescription: ""
            };

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Failed to save job posting");
            }

            setSuccessMessage(selectedJobId ? "Job posting updated successfully!" : "Job posting created successfully!");

            if (!selectedJobId) {
                setFormData({
                    interviewField: "",
                    positionLevel: "",
                    workModel: "",
                    status: "",
                    location: "",
                    salaryRange: ""
                });
            }

            setTimeout(() => {
                navigate("/recruiter/dashboard");
            }, 2000);
        } catch (error) {
            console.error("Error:", error);
            setErrorMessage(error.message || "Failed to save job posting");
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a2a5e] mx-auto mb-4"></div>
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
                    <NavLink to="/recruiter/dashboard" className={({ isActive }) => `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-[#0a2a5e]/10 text-[#0a2a5e]" : "text-gray-700 hover:bg-[#0a2a5e]/5 hover:text-[#0a2a5e]"}`}><LayoutDashboard className="w-5 h-5" /> Dashboard</NavLink>
                    <NavLink to="/recruiter/job-posting" className={({ isActive }) => `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-[#0a2a5e]/10 text-[#0a2a5e]" : "text-gray-700 hover:bg-[#0a2a5e]/5 hover:text-[#0a2a5e]"}`}><PlusCircle className="w-5 h-5" /> Job Posting</NavLink>
                    <NavLink to="/recruiter/cv-screening" className={({ isActive }) => `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-[#0a2a5e]/10 text-[#0a2a5e]" : "text-gray-700 hover:bg-[#0a2a5e]/5 hover:text-[#0a2a5e]"}`}><Search className="w-5 h-5" /> CV Screening</NavLink>
                    <NavLink to="/recruiter/ranking" className={({ isActive }) => `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-[#0a2a5e]/10 text-[#0a2a5e]" : "text-gray-700 hover:bg-[#0a2a5e]/5 hover:text-[#0a2a5e]"}`}><TrendingUp className="w-5 h-5" /> Ranking</NavLink>
                    <NavLink to="/recruiter/evaluation" className={({ isActive }) => `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-[#0a2a5e]/10 text-[#0a2a5e]" : "text-gray-700 hover:bg-[#0a2a5e]/5 hover:text-[#0a2a5e]"}`}><BarChart3 className="w-5 h-5" /> Evaluation</NavLink>
                    <NavLink to="/recruiter/settings" className={({ isActive }) => `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-[#0a2a5e]/10 text-[#0a2a5e]" : "text-gray-700 hover:bg-[#0a2a5e]/5 hover:text-[#0a2a5e]"}`}><Cog className="w-5 h-5" /> Settings</NavLink>
                </nav>

                <div className="mt-auto flex-shrink-0">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 rounded-xl text-white hover:from-red-600 hover:to-red-700 transition-all shadow-md"><LogOut className="w-5 h-5" /> Logout</button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-screen flex flex-col overflow-hidden py-6 px-10">
                {/* Header */}
                <div className="mb-4 flex-shrink-0 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Job Posting</h2>
                        <p className="text-gray-500 text-md mt-1 py-4">Create and manage your job requisitions efficiently.</p>
                    </div>
                    {/* User Profile */}
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <h3 className="font-bold text-gray-800">{recruiterData.firstName} {recruiterData.lastName}</h3>
                            <p className="text-sm text-gray-500">{recruiterData.email}</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-[#0a2a5e] to-[#2b4c8c] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg overflow-hidden">
                            {recruiterData.profileImage ? (<img src={recruiterData.profileImage} alt="Profile" className="w-full h-full object-cover" />) : (<>{recruiterData.firstName?.charAt(0)}{recruiterData.lastName?.charAt(0)}</>)}
                        </div>
                    </div>
                </div>

                {/* Messages */}
                {successMessage && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex-shrink-0">{successMessage}</div>}
                {errorMessage && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex-shrink-0">{errorMessage}</div>}

                {/* Form Content */}
                <div className="flex-1 overflow-hidden">
                    <div className="bg-white rounded-2xl shadow-lg p-6 w-full h-full overflow-y-auto">
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* SELECT JOB ID ROW */}
                            <div className="mb-6">
                                <label className="block font-medium text-gray-700 mb-2">
                                    Select Job to Post <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedJobId}
                                    onChange={handleJobSelect}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0a2a5e] focus:border-transparent outline-none transition-all"
                                    required
                                >
                                    <option value="">-- Select a Job from Screening --</option>
                                    {jobPostings.map((job) => (
                                        <option key={job.id} value={job.id}>
                                            ID: {job.id ? job.id.substring(0, 8).toUpperCase() : 'N/A'} - {job.interviewField} ({job.positionLevel})
                                        </option>
                                    ))}
                                </select>
                                {jobPostings.length === 0 && (
                                    <p className="text-sm text-amber-600 mt-2">
                                        No pending jobs found. Please screen CVs first to create a job batch.
                                    </p>
                                )}
                            </div>

                            {/* Row 1 - 3 Columns */}
                            <div className="grid grid-cols-3 gap-8">
                                <div>
                                    <label className="block font-medium text-gray-700 mb-2">
                                        Interview Field <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="interviewField"
                                        value={formData.interviewField}
                                        onChange={handleInputChange}
                                        disabled={true}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed outline-none"
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
                                        disabled={true}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed outline-none"
                                        required
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
                                        Work Model <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="workModel"
                                        value={formData.workModel}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        required
                                    >
                                        <option value="">Select work model...</option>
                                        <option value="Remote">Remote</option>
                                        <option value="Onsite">Onsite</option>
                                        <option value="Hybrid">Hybrid</option>
                                    </select>
                                </div>
                            </div>

                            {/* Row 2 - 3 Columns */}
                            <div className="grid grid-cols-3 gap-8">
                                <div>
                                    <label className="block font-medium text-gray-700 mb-2">
                                        Status <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        required
                                    >
                                        <option value="">Select status...</option>
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Contract">Contract</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-medium text-gray-700 mb-2">
                                        Location <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        placeholder="e.g., New York, NY"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-medium text-gray-700 mb-2">
                                        Salary Range <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="salaryRange"
                                        value={formData.salaryRange}
                                        onChange={handleInputChange}
                                        placeholder="e.g., $70k - $150k"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        required
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
                                        : "bg-[#0a2a5e] hover:bg-[#061a3d]"
                                        }`}
                                >
                                    {isLoading ? "Saving..." : (selectedJobId ? "Update Job Posting" : "Create Job Posting")}
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
