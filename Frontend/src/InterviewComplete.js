import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Home, CalendarCheck, UserPlus } from 'lucide-react';

const InterviewComplete = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { candidateName, jobTitle, isDemo } = location.state || {};

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-[#0a2a5e] to-[#1e4a9e] h-32 flex items-center justify-center relative">
                    <div className="absolute -bottom-10">
                        <div className="bg-white p-2 rounded-full shadow-lg">
                            <div className="bg-green-100 p-4 rounded-full">
                                <CheckCircle className="w-12 h-12 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-16 pb-8 px-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Interview Complete!</h2>

                    {isDemo ? (
                        <>
                            <p className="text-gray-600 mb-6">
                                Thank you for exploring the <span className="font-semibold text-gray-800">Demo Agent</span>! 
                                Your interview for the <span className="font-semibold text-[#0a2a5e]">{jobTitle}</span> role was purely a demonstration.
                            </p>
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 text-left">
                                <h3 className="font-semibold text-[#0a2a5e] flex items-center gap-2 mb-2">
                                    <CalendarCheck className="w-5 h-5" /> Want the full experience?
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Sign up as a recruiter to create your own custom job postings and AI interview agents. Or sign up as a candidate to apply for real roles!
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/')}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#0a2a5e] text-white rounded-xl hover:bg-[#061a3d] transition-colors font-medium shadow-md hover:shadow-lg mb-3"
                            >
                                <Home className="w-5 h-5" />
                                Return to Homepage
                            </button>
                            <button
                                onClick={() => navigate('/candidate/signup')}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white text-[#0a2a5e] border-2 border-[#0a2a5e] rounded-xl hover:bg-[#f0f4ff] transition-colors font-medium shadow-sm hover:shadow-md"
                            >
                                <UserPlus className="w-5 h-5" />
                                Create Candidate Account
                            </button>
                        </>
                    ) : (
                        <>
                            {candidateName ? (
                                <p className="text-gray-600 mb-6">
                                    Thank you for your time, <span className="font-semibold text-gray-800">{candidateName}</span>.
                                    Your interview for the <span className="font-semibold text-[#0a2a5e]">{jobTitle}</span> role has been successfully submitted and is now being analyzed.
                                </p>
                            ) : (
                                <p className="text-gray-600 mb-6">
                                    Thank you for completing the interview. Your responses have been successfully submitted and are now being analyzed.
                                </p>
                            )}
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 text-left">
                                <h3 className="font-semibold text-[#0a2a5e] flex items-center gap-2 mb-2">
                                    <CalendarCheck className="w-5 h-5" /> What happens next?
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Our AI is currently generating a detailed evaluation report. The recruitment team will review your performance and get in touch with you regarding the next steps in the hiring process.
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/candidate/jobs')}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#0a2a5e] text-white rounded-xl hover:bg-[#061a3d] transition-colors font-medium shadow-md hover:shadow-lg"
                            >
                                <Home className="w-5 h-5" />
                                Return to Dashboard
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InterviewComplete;
