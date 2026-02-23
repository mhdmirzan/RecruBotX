import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    LogOut,
    PlusCircle,
    Search,
    Settings,
    Megaphone,
    Send,
    Download,
    Trash2,
    ChevronDown,
    ChevronUp,
    Loader2,
    Image as ImageIcon,
    CheckCircle,
    X,
    Plus,
    AlertCircle,
    Sparkles,
    Linkedin,
    Zap,
} from "lucide-react";
import API_BASE_URL from "./apiConfig";

const Advertisement = () => {
    const navigate = useNavigate();
    const [recruiterData, setRecruiterData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [generatedAd, setGeneratedAd] = useState(null);
    const [pastAds, setPastAds] = useState([]);
    const [showPastAds, setShowPastAds] = useState(false);
    const [activeTab, setActiveTab] = useState("create"); // 'create' or 'history'

    // Form State
    const [formData, setFormData] = useState({
        jobTitle: "",
        companyName: "",
        companyDescription: "",
        location: "",
        employmentType: "",
        workMode: "",
        urgentHiring: false,
        responsibilities: [""],
        requirements: [""],
        salaryRange: "",
        salaryConfidential: false,
        benefits: [""],
        certifications: [""],
        deadline: "",
        contactEmail: "",
        applicationLink: "",
        phone: "",
        primaryColor: "#0a2a5e",
        secondaryColor: "#2b4c8c",
        adSize: "linkedin_post",   // fixed — LinkedIn only
    });

    useEffect(() => {
        const storedUser = localStorage.getItem("recruiterUser");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setRecruiterData(user);
            fetchPastAds(user.id);
        } else {
            navigate("/recruiter/signin");
        }
    }, [navigate]);

    const fetchPastAds = async (recruiterId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/advertisements/recruiter/${recruiterId}`);
            if (response.ok) {
                const data = await response.json();
                setPastAds(data.advertisements || []);
            }
        } catch (error) {
            console.error("Error fetching past ads:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("recruiterUser");
        navigate("/recruiter/signin");
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
        setErrorMessage("");
        setSuccessMessage("");
    };

    // Dynamic list handlers
    const handleListChange = (field, index, value) => {
        const updated = [...formData[field]];
        updated[index] = value;
        setFormData({ ...formData, [field]: updated });
    };

    const addListItem = (field) => {
        setFormData({ ...formData, [field]: [...formData[field], ""] });
    };

    const removeListItem = (field, index) => {
        const updated = formData[field].filter((_, i) => i !== index);
        if (updated.length === 0) updated.push("");
        setFormData({ ...formData, [field]: updated });
    };

    const validateForm = () => {
        if (!formData.jobTitle.trim()) {
            setErrorMessage("Job Title is required.");
            return false;
        }
        if (!formData.companyName.trim()) {
            setErrorMessage("Company Name is required.");
            return false;
        }
        return true;
    };

    const handleGenerate = async () => {
        if (!validateForm()) return;
        setIsLoading(true);
        setErrorMessage("");
        setSuccessMessage("");
        setGeneratedAd(null);

        try {
            // Filter out empty list items
            const cleanedData = {
                ...formData,
                recruiterId: recruiterData.id,
                responsibilities: formData.responsibilities.filter((r) => r.trim()),
                requirements: formData.requirements.filter((r) => r.trim()),
                benefits: formData.benefits.filter((b) => b.trim()),
                certifications: formData.certifications.filter((c) => c.trim()),
            };

            const response = await fetch(`${API_BASE_URL}/advertisements/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(cleanedData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Failed to generate advertisement");
            }

            setGeneratedAd(data);
            setSuccessMessage("Advertisement generated successfully!");
            fetchPastAds(recruiterData.id);
        } catch (error) {
            console.error("Error:", error);
            setErrorMessage(error.message || "Failed to generate advertisement");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAd = async (adId) => {
        if (!recruiterData) return;
        if (!window.confirm("Delete this advertisement?")) return;
        try {
            const response = await fetch(`${API_BASE_URL}/advertisements/${adId}?recruiterId=${encodeURIComponent(recruiterData.id)}`, {
                method: "DELETE",
            });
            if (response.ok) {
                fetchPastAds(recruiterData.id);
                setSuccessMessage("Advertisement deleted.");
            }
        } catch (error) {
            setErrorMessage("Failed to delete advertisement.");
        }
    };

    const handleDownloadImage = (imageBase64, jobTitle) => {
        const link = document.createElement("a");
        link.href = imageBase64;
        link.download = `${jobTitle.replace(/\s+/g, "_")}_advertisement.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Render a dynamic list field
    const renderListField = (field, label, placeholder) => (
        <div className="mb-5">
            <label className="block font-medium text-gray-700 mb-2 text-sm">{label}</label>
            <div className="space-y-2">
                {formData[field].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={item}
                            onChange={(e) => handleListChange(field, idx, e.target.value)}
                            placeholder={placeholder}
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0a2a5e] outline-none text-sm transition-all hover:border-gray-400"
                        />
                        <button
                            type="button"
                            onClick={() => removeListItem(field, idx)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Remove"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={() => addListItem(field)}
                    className="text-sm text-[#0a2a5e] hover:text-[#0d3b82] font-medium flex items-center gap-1 mt-1 px-2 py-1 rounded-lg hover:bg-[#0a2a5e]/5 transition-all"
                >
                    <Plus className="w-4 h-4" /> Add {label.replace(/s$/, "")}
                </button>
            </div>
        </div>
    );

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
                    <NavLink to="/recruiter/advertisement" className={({ isActive }) => `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-[#0a2a5e]/10 text-[#0a2a5e]" : "text-gray-700 hover:bg-[#0a2a5e]/5 hover:text-[#0a2a5e]"}`}><Megaphone className="w-5 h-5" /> Advertisement</NavLink>
                    <NavLink to="/recruiter/settings" className={({ isActive }) => `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-[#0a2a5e]/10 text-[#0a2a5e]" : "text-gray-700 hover:bg-[#0a2a5e]/5 hover:text-[#0a2a5e]"}`}><Settings className="w-5 h-5" /> Settings</NavLink>
                </nav>

                <div className="mt-auto flex-shrink-0">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 rounded-xl text-white hover:from-red-600 hover:to-red-700 transition-all shadow-md"><LogOut className="w-5 h-5" /> Logout</button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-screen flex flex-col overflow-hidden py-6 px-8">
                {/* Header */}
                <div className="mb-4 flex-shrink-0 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-[#0a2a5e] flex items-center gap-3">
                            <Megaphone className="w-8 h-8" />
                            Job Advertisement
                        </h2>
                        <p className="text-gray-500 text-md mt-1 py-2">
                            Generate professional job advertisements powered by AI.
                        </p>
                    </div>
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

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-4 flex-shrink-0">
                    <button
                        onClick={() => setActiveTab("create")}
                        className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${activeTab === "create"
                            ? "bg-[#0a2a5e] text-white shadow-lg"
                            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                            }`}
                    >
                        <Sparkles className="w-4 h-4" /> Create New
                    </button>
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${activeTab === "history"
                            ? "bg-[#0a2a5e] text-white shadow-lg"
                            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                            }`}
                    >
                        <ImageIcon className="w-4 h-4" /> History ({pastAds.length})
                    </button>
                </div>

                {/* Messages */}
                {successMessage && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 flex-shrink-0 flex items-center gap-2 text-sm">
                        <CheckCircle className="w-5 h-5" /> {successMessage}
                    </div>
                )}
                {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex-shrink-0 flex items-center gap-2 text-sm">
                        <AlertCircle className="w-5 h-5" /> {errorMessage}
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-hidden flex gap-6">
                    {activeTab === "create" ? (
                        <>
                            {/* Left: Form */}
                            <div className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col overflow-hidden">
                                <div className="p-5 border-b border-gray-100 flex-shrink-0">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <PlusCircle className="w-5 h-5 text-[#0a2a5e]" />
                                        Advertisement Details
                                    </h3>
                                    <p className="text-gray-400 text-xs mt-1">Fill in the job details to generate a professional advertisement image.</p>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6">
                                    {/* Platform badge — LinkedIn fixed */}
                                    <div className="mb-6 flex items-center gap-3 p-3 bg-[#0077B5]/8 border border-[#0077B5]/25 rounded-xl">
                                        <div className="bg-[#0077B5] p-2 rounded-lg">
                                            <Linkedin className="w-5 h-5 text-white fill-white" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#0077B5] text-sm">LinkedIn Post</p>
                                            <p className="text-xs text-gray-500">1080 × 1350 px · AI-generated image</p>
                                        </div>
                                        <span className="ml-auto px-2 py-0.5 bg-[#0077B5]/15 text-[#0077B5] text-xs font-semibold rounded-full border border-[#0077B5]/30">Fixed</span>
                                    </div>

                                    {/* Job Info */}
                                    <div className="grid grid-cols-2 gap-4 mb-5">
                                        <div>
                                            <label className="block font-medium text-gray-700 mb-2 text-sm">Job Title <span className="text-red-500">*</span></label>
                                            <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleInputChange} placeholder="e.g. Senior Software Engineer" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0a2a5e] outline-none text-sm transition-all hover:border-gray-400" />
                                        </div>
                                        <div>
                                            <label className="block font-medium text-gray-700 mb-2 text-sm">Company Name <span className="text-red-500">*</span></label>
                                            <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="e.g. Acme Corp" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0a2a5e] outline-none text-sm transition-all hover:border-gray-400" />
                                        </div>
                                    </div>

                                    <div className="mb-5">
                                        <label className="block font-medium text-gray-700 mb-2 text-sm">Company Description</label>
                                        <textarea name="companyDescription" value={formData.companyDescription} onChange={handleInputChange} placeholder="Brief description of the company (max 25 words)" maxLength={200} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0a2a5e] outline-none text-sm h-16 resize-none transition-all hover:border-gray-400" />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 mb-5">
                                        <div>
                                            <label className="block font-medium text-gray-700 mb-2 text-sm">Location</label>
                                            <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="e.g. New York, NY" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0a2a5e] outline-none text-sm transition-all hover:border-gray-400" />
                                        </div>
                                        <div>
                                            <label className="block font-medium text-gray-700 mb-2 text-sm">Employment Type</label>
                                            <select name="employmentType" value={formData.employmentType} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0a2a5e] outline-none text-sm transition-all hover:border-gray-400">
                                                <option value="">Select...</option>
                                                <option value="Full-time">Full-time</option>
                                                <option value="Part-time">Part-time</option>
                                                <option value="Contract">Contract</option>
                                                <option value="Internship">Internship</option>
                                                <option value="Freelance">Freelance</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block font-medium text-gray-700 mb-2 text-sm">Work Mode</label>
                                            <select name="workMode" value={formData.workMode} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0a2a5e] outline-none text-sm transition-all hover:border-gray-400">
                                                <option value="">Select...</option>
                                                <option value="Remote">Remote</option>
                                                <option value="Onsite">Onsite</option>
                                                <option value="Hybrid">Hybrid</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Urgent & Salary */}
                                    <div className="grid grid-cols-2 gap-4 mb-5">
                                        <div>
                                            <label className="block font-medium text-gray-700 mb-2 text-sm">Salary Range</label>
                                            <input type="text" name="salaryRange" value={formData.salaryRange} onChange={handleInputChange} placeholder="e.g. $80,000 - $120,000" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0a2a5e] outline-none text-sm transition-all hover:border-gray-400" disabled={formData.salaryConfidential} />
                                        </div>
                                        <div className="flex items-end gap-6 pb-1">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" name="salaryConfidential" checked={formData.salaryConfidential} onChange={handleInputChange} className="w-4 h-4 accent-[#0a2a5e] rounded" />
                                                <span className="text-sm text-gray-700">Confidential Salary</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input type="checkbox" name="urgentHiring" checked={formData.urgentHiring} onChange={handleInputChange} className="w-4 h-4 accent-amber-500 rounded" />
                                                <span className="text-sm text-gray-700 font-medium flex items-center gap-1.5 group-hover:text-amber-600 transition-colors">
                                                    <Zap className={`w-4 h-4 ${formData.urgentHiring ? "text-amber-500 fill-amber-500" : "text-gray-400"}`} /> Urgent Hiring
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Dynamic Lists */}
                                    {renderListField("responsibilities", "Responsibilities", "e.g. Lead a team of 5 engineers")}
                                    {renderListField("requirements", "Requirements", "e.g. 5+ years experience in React")}
                                    {renderListField("benefits", "Benefits", "e.g. Health insurance, remote work")}
                                    {renderListField("certifications", "Company Certifications", "e.g. ISO 9001 Certified")}

                                    {/* Contact */}
                                    <div className="grid grid-cols-2 gap-4 mb-5">
                                        <div>
                                            <label className="block font-medium text-gray-700 mb-2 text-sm">Application Deadline</label>
                                            <input type="date" name="deadline" value={formData.deadline} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0a2a5e] outline-none text-sm transition-all hover:border-gray-400" />
                                        </div>
                                        <div>
                                            <label className="block font-medium text-gray-700 mb-2 text-sm">Contact Email</label>
                                            <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleInputChange} placeholder="hr@company.com" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0a2a5e] outline-none text-sm transition-all hover:border-gray-400" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-5">
                                        <div>
                                            <label className="block font-medium text-gray-700 mb-2 text-sm">Application Link</label>
                                            <input type="url" name="applicationLink" value={formData.applicationLink} onChange={handleInputChange} placeholder="https://company.com/apply" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0a2a5e] outline-none text-sm transition-all hover:border-gray-400" />
                                        </div>
                                        <div>
                                            <label className="block font-medium text-gray-700 mb-2 text-sm">Phone</label>
                                            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+1 (555) 123-4567" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0a2a5e] outline-none text-sm transition-all hover:border-gray-400" />
                                        </div>
                                    </div>

                                    {/* Color Pickers */}
                                    <div className="grid grid-cols-2 gap-4 mb-5">
                                        <div>
                                            <label className="block font-medium text-gray-700 mb-2 text-sm">Primary Color</label>
                                            <div className="flex items-center gap-3">
                                                <input type="color" name="primaryColor" value={formData.primaryColor} onChange={handleInputChange} className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer" />
                                                <input type="text" value={formData.primaryColor} onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block font-medium text-gray-700 mb-2 text-sm">Secondary Color</label>
                                            <div className="flex items-center gap-3">
                                                <input type="color" name="secondaryColor" value={formData.secondaryColor} onChange={handleInputChange} className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer" />
                                                <input type="text" value={formData.secondaryColor} onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm" />
                                            </div>
                                        </div>
                                    </div>


                                </div>

                                {/* Footer */}
                                <div className="p-5 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 flex-shrink-0">
                                    <button
                                        onClick={handleGenerate}
                                        disabled={isLoading}
                                        className="px-8 py-3 bg-gradient-to-r from-[#0a2a5e] to-[#2b4c8c] hover:from-[#061a3d] hover:to-[#1a3668] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" /> Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-5 h-5" /> Generate Advertisement
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Right: Preview */}
                            <div className="w-[480px] bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col overflow-hidden flex-shrink-0">
                                <div className="p-5 border-b border-gray-100 flex-shrink-0 flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <ImageIcon className="w-5 h-5 text-[#0a2a5e]" /> Preview
                                    </h3>
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#0077B5]/10 text-[#0077B5] border border-[#0077B5]/20 flex items-center gap-1.5">
                                        <Linkedin className="w-3.5 h-3.5 fill-current" /> LinkedIn Post
                                    </span>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center">
                                    {isLoading ? (
                                        <div className="text-center">
                                            <Loader2 className="w-16 h-16 text-[#0a2a5e] animate-spin mx-auto mb-4" />
                                            <p className="text-gray-500 font-medium">Generating your advertisement...</p>
                                            <p className="text-gray-400 text-sm mt-1">This may take 10-15 seconds</p>
                                        </div>
                                    ) : generatedAd?.imageBase64 ? (
                                        <div className="w-full">
                                            {/* Size info */}
                                            <div className="mb-3 flex items-center justify-between">
                                                <span className="text-xs font-bold text-[#0077B5] bg-[#0077B5]/8 px-3 py-1 rounded-full border border-[#0077B5]/20">
                                                    {generatedAd.canvasWidth} × {generatedAd.canvasHeight} px
                                                </span>
                                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                                    <Linkedin className="w-3 h-3 fill-gray-400" /> LinkedIn · AI Generated
                                                </span>
                                            </div>
                                            <img
                                                src={generatedAd.imageBase64}
                                                alt="Generated Advertisement"
                                                className="w-full rounded-xl shadow-md border border-gray-200"
                                            />
                                            <div className="mt-4 flex gap-2 justify-center">
                                                <button
                                                    onClick={() => handleDownloadImage(generatedAd.imageBase64, formData.jobTitle || "advertisement")}
                                                    className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all flex items-center gap-2 text-sm shadow-md"
                                                >
                                                    <Download className="w-4 h-4" /> Download Image
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            <Megaphone className="w-20 h-20 mx-auto mb-4 opacity-20" />
                                            <p className="font-medium text-lg">No Preview Yet</p>
                                            <p className="text-sm mt-1">Fill in the form and click "Generate" to create your advertisement</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        /* History Tab */
                        <div className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col overflow-hidden">
                            <div className="p-5 border-b border-gray-100 flex-shrink-0">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5 text-[#0a2a5e]" />
                                    Past Advertisements ({pastAds.length})
                                </h3>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6">
                                {pastAds.length === 0 ? (
                                    <div className="text-center text-gray-400 py-16">
                                        <Megaphone className="w-20 h-20 mx-auto mb-4 opacity-20" />
                                        <p className="font-medium text-lg">No advertisements yet</p>
                                        <p className="text-sm mt-1">Create your first advertisement to see it here</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {pastAds.map((ad) => (
                                            <div key={ad._id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all group">
                                                <div className="aspect-[1080/1350] bg-gray-50 relative overflow-hidden">
                                                    {ad.imageBase64 ? (
                                                        <img
                                                            src={ad.imageBase64}
                                                            alt="Advertisement"
                                                            className="w-full h-full object-contain"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                                                            <ImageIcon className="w-12 h-12" />
                                                            <span className="text-[10px] font-medium uppercase tracking-wider">No Preview Available</span>
                                                        </div>
                                                    )}
                                                    {/* Overlay on hover */}
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                                                        <button
                                                            onClick={() => handleDownloadImage(ad.imageBase64, ad.refined?.refined_title || "ad")}
                                                            className="p-3 bg-white rounded-full text-green-600 hover:bg-green-50 shadow-lg transition-all"
                                                            title="Download"
                                                        >
                                                            <Download className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteAd(ad._id)}
                                                            className="p-3 bg-white rounded-full text-red-600 hover:bg-red-50 shadow-lg transition-all"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="p-4 border-t border-gray-100 bg-white">
                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                        <h4 className="font-bold text-gray-800 text-sm truncate flex-1">
                                                            {ad.refined?.refined_title || ad.jobTitle || "Untitled Position"}
                                                        </h4>
                                                        <Linkedin className="w-3.5 h-3.5 text-[#0077B5] fill-current flex-shrink-0 mt-0.5" />
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-xs font-medium text-gray-500 truncate">
                                                            {ad.refined?.refined_company || ad.companyName || ""}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400">
                                                            {new Date(ad.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Advertisement;
