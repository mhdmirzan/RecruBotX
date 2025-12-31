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
    Cog,
    Maximize2,
    X,
    Bold,
    Italic,
    Underline,
    List
} from "lucide-react";
import API_BASE_URL from "./apiConfig";

const JobPosting = () => {
    // Internal styles for rich text rendering
    const richTextStyles = `
        .job-description-preview ul, #jdEditor ul {
            list-style-type: disc !important;
            padding-left: 1.5rem !important;
            margin-top: 0.5rem !important;
            margin-bottom: 0.5rem !important;
        }
        .job-description-preview li, #jdEditor li {
            margin-bottom: 0.25rem !important;
        }
        .job-description-preview b, .job-description-preview strong, #jdEditor b, #jdEditor strong {
            font-weight: bold !important;
        }
        .job-description-preview i, .job-description-preview em, #jdEditor i, #jdEditor em {
            font-style: italic !important;
        }
        .job-description-preview u, #jdEditor u {
            text-decoration: underline !important;
        }
        .job-description-preview {
            white-space: pre-wrap !important;
            word-break: break-word !important;
        }
    `;

    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const editorRef = useRef(null);
    const [recruiterData, setRecruiterData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [showJDModal, setShowJDModal] = useState(false);

    const [formData, setFormData] = useState({
        interviewField: "",
        positionLevel: "",
        numberOfQuestions: "",
        topNCvs: "",
        workModel: "",
        status: "",
        location: "",
        salaryRange: "",
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
        if (!formData.interviewField || !formData.positionLevel || !formData.numberOfQuestions || !formData.topNCvs || !formData.workModel || !formData.status || !formData.location || !formData.salaryRange) {
            setErrorMessage("Please fill in all required fields");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/jobs/create`, {
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
                    workModel: formData.workModel,
                    status: formData.status,
                    location: formData.location,
                    salaryRange: formData.salaryRange,
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
                workModel: "",
                status: "",
                location: "",
                salaryRange: "",
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

    // Text formatting functions
    const applyFormatting = (format) => {
        // Focus the editor first
        if (editorRef.current) {
            editorRef.current.focus();
        }

        if (format === 'bullet') {
            const selection = window.getSelection();
            if (!selection.rangeCount) return;

            const range = selection.getRangeAt(0);

            if (range.collapsed) {
                // Option 1: Create Empty Bullet Point
                const ul = document.createElement('ul');
                ul.style.listStyleType = 'disc';
                ul.style.paddingLeft = '25px';
                ul.style.marginTop = '8px';
                ul.style.marginBottom = '8px';

                const li = document.createElement('li');
                li.innerHTML = '&#8203;'; // Zero-width space for cursor focus
                ul.appendChild(li);

                range.insertNode(ul);

                // Position cursor inside the bullet
                const newRange = document.createRange();
                newRange.setStart(li, 0);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
            } else {
                // Option 2: Convert Selection to Bullets (Pro)
                const fragment = range.extractContents();
                const tempDiv = document.createElement('div');
                tempDiv.appendChild(fragment);

                // Normalize: convert block boundaries to line breaks, keep inline tags
                let htmlContent = tempDiv.innerHTML
                    .replace(/<\/div>|<\/p>/gi, '<br>')
                    .replace(/<div>|<p>/gi, '');

                let lines = htmlContent.split(/<br\s*\/?>|\n/gi).filter(line => line.trim() !== '');

                const ul = document.createElement('ul');
                ul.style.listStyleType = 'disc';
                ul.style.paddingLeft = '25px';
                ul.style.marginTop = '8px';
                ul.style.marginBottom = '8px';

                lines.forEach(line => {
                    const li = document.createElement('li');
                    li.innerHTML = line.trim();
                    ul.appendChild(li);
                });

                range.insertNode(ul);
            }

            // Sync state
            if (editorRef.current) {
                setFormData(prev => ({ ...prev, jobDescription: editorRef.current.innerHTML }));
            }
        } else {
            // Use execCommand for other formatting
            const selection = window.getSelection();
            if (!selection.rangeCount) return;

            switch (format) {
                case 'bold':
                    document.execCommand('bold', false, null);
                    break;
                case 'italic':
                    document.execCommand('italic', false, null);
                    break;
                case 'underline':
                    document.execCommand('underline', false, null);
                    break;
                default:
                    break;
            }
        }

        // Keep focus on editor after formatting
        if (editorRef.current) {
            editorRef.current.focus();
        }
    };

    // Handle content change from contentEditable
    const handleContentChange = (e) => {
        const content = e.currentTarget.innerHTML;
        setFormData({ ...formData, jobDescription: content });
    };

    // Initialize editor content when modal opens
    useEffect(() => {
        if (showJDModal && editorRef.current && formData.jobDescription) {
            if (editorRef.current.innerHTML !== formData.jobDescription) {
                editorRef.current.innerHTML = formData.jobDescription;
            }
        }
    }, [showJDModal]);

    // Handle key press to ensure proper line breaks and list handling
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            const selection = window.getSelection();
            if (!selection.rangeCount) return;

            const range = selection.getRangeAt(0);
            const parentLi = range.startContainer.parentElement?.closest('li');

            // Case: User presses Enter on an empty bullet point to exit the list
            if (parentLi && (parentLi.textContent.trim() === '' || parentLi.textContent === '\u200B')) {
                e.preventDefault();

                const ul = parentLi.parentElement;

                // Remove the empty li
                parentLi.remove();

                // If the UL is now empty, remove it too
                if (ul && ul.children.length === 0) {
                    ul.remove();
                }

                // Insert a new line after the UL or at current position
                const br = document.createElement('br');
                range.insertNode(br);

                // Move cursor after the BR
                const newRange = document.createRange();
                newRange.setStartAfter(br);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);

                // Sync state
                if (editorRef.current) {
                    setFormData(prev => ({ ...prev, jobDescription: editorRef.current.innerHTML }));
                }
                return;
            }
        }

        // Handle Backspace on empty bullet
        if (e.key === 'Backspace') {
            const selection = window.getSelection();
            if (!selection.rangeCount) return;

            const range = selection.getRangeAt(0);
            const parentLi = range.startContainer.parentElement?.closest('li');

            if (parentLi && parentLi.textContent.trim() === '' && range.startOffset === 0) {
                e.preventDefault();
                const ul = parentLi.parentElement;
                parentLi.remove();
                if (ul && ul.children.length === 0) {
                    ul.remove();
                }
                // Sync state
                if (editorRef.current) {
                    setFormData(prev => ({ ...prev, jobDescription: editorRef.current.innerHTML }));
                }
            }
        }
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

                {/* Form Content - Non-scrollable, fits on one page */}
                <div className="flex-1 overflow-hidden">
                    <div className="bg-white rounded-2xl shadow-lg p-6 w-full h-full overflow-y-auto">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Row 1 - 3 Columns */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block font-medium text-gray-700 mb-2 text-sm">
                                        Interview Field <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="interviewField"
                                        value={formData.interviewField}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
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
                                    <label className="block font-medium text-gray-700 mb-2 text-sm">
                                        Position Level <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="positionLevel"
                                        value={formData.positionLevel}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
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
                                    <label className="block font-medium text-gray-700 mb-2 text-sm">
                                        Work Model <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="workModel"
                                        value={formData.workModel}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
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
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block font-medium text-gray-700 mb-2 text-sm">
                                        Status <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                        required
                                    >
                                        <option value="">Select status...</option>
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Contract">Contract</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-medium text-gray-700 mb-2 text-sm">
                                        Location <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        placeholder="e.g., New York, NY"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-medium text-gray-700 mb-2 text-sm">
                                        Salary Range <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="salaryRange"
                                        value={formData.salaryRange}
                                        onChange={handleInputChange}
                                        placeholder="e.g., $70k - $150k"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Row 3 - 2 Columns */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-medium text-gray-700 mb-2 text-sm">
                                        Number of Questions <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="numberOfQuestions"
                                        value={formData.numberOfQuestions}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                        required
                                    >
                                        <option value="">Select questions...</option>
                                        <option value="5">5 Questions</option>
                                        <option value="10">10 Questions</option>
                                        <option value="15">15 Questions</option>
                                        <option value="20">20 Questions</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-medium text-gray-700 mb-2 text-sm">
                                        Top N CVs <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="topNCvs"
                                        value={formData.topNCvs}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                        required
                                    >
                                        <option value="">Select top CVs...</option>
                                        <option value="5">Top 5</option>
                                        <option value="10">Top 10</option>
                                        <option value="15">Top 15</option>
                                        <option value="20">Top 20</option>
                                        <option value="25">Top 25</option>
                                    </select>
                                </div>
                            </div>

                            {/* Row 4 - Upload CVs and Job Description (2 Columns) */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-medium text-gray-700 mb-2 text-sm">
                                        <Upload className="w-4 h-4 inline mr-1" />
                                        Upload CVs
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-all cursor-pointer">
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
                                            className="text-blue-600 hover:text-blue-700 w-full"
                                        >
                                            <Upload className="w-8 h-8 mx-auto mb-2" />
                                            <p className="text-sm">Click to upload CVs</p>
                                            <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX</p>
                                            {formData.cvFiles.length > 0 && (
                                                <p className="text-sm text-green-600 mt-2 font-medium">
                                                    ✓ {formData.cvFiles.length} file(s) uploaded
                                                </p>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-medium text-gray-700 mb-2 text-sm flex justify-between items-center">
                                        <span>
                                            <FileText className="w-4 h-4 inline mr-1" />
                                            Job Description
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setShowJDModal(true)}
                                            className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-xs"
                                        >
                                            <Maximize2 className="w-3 h-3" />
                                            Expand Editor
                                        </button>
                                    </label>
                                    <div className="border-2 border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-all h-[168px] flex items-center justify-center">
                                        <div className="text-center w-full">
                                            {formData.jobDescription ? (
                                                <div
                                                    className="text-left text-sm text-gray-700 max-h-[120px] overflow-y-auto px-2 job-description-preview"
                                                    dangerouslySetInnerHTML={{
                                                        __html: formData.jobDescription.length > 300
                                                            ? formData.jobDescription.substring(0, 300) + '...'
                                                            : formData.jobDescription
                                                    }}
                                                />
                                            ) : (
                                                <div className="text-gray-400">
                                                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                                    <p className="text-sm">Click "Expand Editor" to write</p>
                                                    <p className="text-xs mt-1">detailed job description</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
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

            {/* Job Description Modal */}
            {showJDModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                            <h3 className="text-2xl font-bold text-gray-800">Job Description Editor</h3>
                            <button
                                onClick={() => setShowJDModal(false)}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Formatting Toolbar */}
                        <div className="flex gap-2 p-4 border-b border-gray-200 bg-gray-50">
                            <button
                                type="button"
                                onClick={() => applyFormatting('bold')}
                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                title="Bold (Select text first)"
                            >
                                <Bold className="w-5 h-5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFormatting('italic')}
                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                title="Italic (Select text first)"
                            >
                                <Italic className="w-5 h-5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFormatting('underline')}
                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                title="Underline (Select text first)"
                            >
                                <Underline className="w-5 h-5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFormatting('bullet')}
                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                title="Bullet List (Select text first)"
                            >
                                <List className="w-5 h-5" />
                            </button>
                            <div className="ml-4 text-xs text-gray-500 flex items-center">
                                Select text and click formatting buttons
                            </div>
                        </div>

                        {/* Text Area */}
                        <div className="flex-1 p-6 overflow-hidden flex flex-col relative">
                            <div
                                ref={editorRef}
                                id="jdEditor"
                                contentEditable
                                onInput={handleContentChange}
                                onKeyDown={handleKeyDown}
                                suppressContentEditableWarning
                                className="w-full flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all overflow-y-auto text-sm"
                                style={{ minHeight: '400px', whiteSpace: 'pre-wrap' }}
                            />
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-center p-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => setShowJDModal(false)}
                                className="px-10 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Internal Styles */}
            <style dangerouslySetInnerHTML={{ __html: richTextStyles }} />
        </div>
    );
};

export default JobPosting;
