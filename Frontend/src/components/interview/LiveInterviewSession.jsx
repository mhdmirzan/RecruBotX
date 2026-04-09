import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    MessageSquare,
    User,
    Clock,
    ChevronRight,
    ChevronLeft,
    X,
    PhoneOff
} from 'lucide-react';
import { ConversationState } from '../../services/ConversationStateMachine';
import { correctGrammar } from '../../utils/grammarUtils';
import AITypingIndicator from './AITypingIndicator';
import TypewriterText from './TypewriterText';
import Logo from '../Logo';
import VoiceSpectrum from '../VoiceSpectrum';

// Live Caption Component (Updated for Relative Flow)
const LiveCaption = ({ text, isVisible }) => {
    return (
        <div
            className={`transition-all duration-300 transform
                ${isVisible && text ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            `}
        >
            <div className="live-caption">
                {text}
            </div>
        </div>
    );
};

const LiveInterviewSession = ({
    messages,
    status,
    interimText,
    candidateName,
    jobRole,
    onInterrupt,
    liveCaption, /* Accept liveCaption from App parent */
    onEndInterview,
    isConnected
}) => {
    // State
    const [isTranscriptVisible, setIsTranscriptVisible] = useState(true);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCamOn, setIsCamOn] = useState(true);

    // Derived State
    const isAiSpeaking = status === ConversationState.AI_SPEAKING;
    const isUserSpeaking = status === ConversationState.PROCESSING || interimText.length > 0;
    const isListening = status === ConversationState.LISTENING;

    // AI Thinking State for Typing Indicator
    const lastMessage = messages[messages.length - 1];
    const isAIThinking = status === ConversationState.PROCESSING && lastMessage?.role !== 'interviewer';

    // Timer
    useEffect(() => {
        const timer = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Video Preview
    const videoRef = useRef(null);
    useEffect(() => {
        let activeStream = null;
        let isMounted = true;

        const startVideo = async () => {
            if (!isCamOn) {
                if (videoRef.current) videoRef.current.srcObject = null;
                return;
            }
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                if (!isMounted) {
                    // Stop it immediately if the component unmounted while waiting for user permission
                    stream.getTracks().forEach(track => track.stop());
                    return;
                }
                activeStream = stream;
                if (videoRef.current) videoRef.current.srcObject = stream;
            } catch (err) {
                console.error("Video access denied:", err);
            }
        };

        startVideo();

        return () => {
            isMounted = false;
            if (activeStream) {
                activeStream.getTracks().forEach(track => track.stop());
            }
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
        };
    }, [isCamOn]);

    // Auto-scroll Transcript
    const transcriptRef = useRef(null);
    useEffect(() => {
        const scrollNode = transcriptRef.current;
        if (!scrollNode) return;

        // Create observer to constantly scroll down if new text is animated
        const observer = new MutationObserver(() => {
            scrollNode.scrollTo({
                top: scrollNode.scrollHeight,
                behavior: 'smooth'
            });
        });

        // Observe both child additions and text/character changes
        observer.observe(scrollNode, {
            childList: true,
            subtree: true,
            characterData: true
        });

        // Trigger an initial scroll just in case
        scrollNode.scrollTo({ top: scrollNode.scrollHeight, behavior: 'smooth' });

        return () => observer.disconnect();
    }, []);

    const spectrumMode = isAiSpeaking ? 'ai' : 'idle';

    return (
        <div className="flex h-screen bg-[#FFFFFF] flex-col font-sans relative overflow-hidden">
            {/* Subtle Background Elements */}
            <div className="absolute top-[-15%] left-[-10%] w-[40rem] h-[40rem] bg-gradient-to-br from-blue-50 to-transparent rounded-full mix-blend-multiply filter blur-3xl opacity-60 pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] bg-gradient-to-tl from-indigo-50 to-transparent rounded-full mix-blend-multiply filter blur-3xl opacity-60 pointer-events-none"></div>

            {/* TOP HEADER OVERLAY */}
            <header className="w-full max-w-7xl mx-auto py-6 px-8 flex items-center justify-between z-20 relative">
                <Logo className="h-8 w-auto relative z-50" />
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-white/60 backdrop-blur-md rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isAiSpeaking ? 'bg-blue-500 animate-pulse' : isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></div>
                        <span className="text-sm font-medium text-[#111827]">
                            {isAiSpeaking ? 'AI is speaking' : isListening ? 'Listening...' : 'Thinking...'}
                        </span>
                        <div className="w-px h-4 bg-gray-200 mx-1"></div>
                        <span className="text-sm font-mono text-gray-500 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {formatTime(elapsedTime)}
                        </span>
                    </div>

                    <div className="px-4 py-2 bg-white/60 backdrop-blur-md rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 font-medium text-[#111827] flex items-center gap-2 text-sm">
                        <span>{jobRole}</span>
                        {isConnected !== undefined && (
                            <>
                                <div className="w-px h-4 bg-gray-200 mx-1"></div>
                                {isConnected ? (
                                    <span className="flex items-center gap-1.5 text-green-600 font-medium text-xs uppercase tracking-wider">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Connected
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 text-orange-500 font-medium text-xs uppercase tracking-wider">
                                        <span className="w-2 h-2 rounded-full bg-orange-500"></span> Connecting
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full max-w-7xl mx-auto px-8 flex flex-col lg:flex-row gap-8 lg:gap-16 z-10 pb-8 h-[calc(100vh-100px)]">
                
                {/* Left Side - Transcript & Context */}
                <div className={`flex flex-col gap-6 max-w-md h-full transition-all duration-300 ease-in-out ${isTranscriptVisible ? 'w-full opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
                    
                    {/* AI Avatar Card */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20, y: 10 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="p-6 bg-white/80 backdrop-blur-xl rounded-[24px] shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center gap-5 transition-all duration-300 hover:shadow-[0_12px_50px_rgb(0,0,0,0.06)] shrink-0"
                    >
                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0A2540] to-[#3A7DFF] flex items-center justify-center p-[2px] shadow-sm">
                                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center overflow-hidden">
                                    <Logo className="w-8 h-auto object-contain" />
                                </div>
                            </div>
                            {isAiSpeaking && (
                                <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3A7DFF] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-[#3A7DFF] border-2 border-white"></span>
                                </span>
                            )}
                        </div>
                        <div className="flex-1 flex justify-between items-start">
                            <div className="pr-2">
                                <h2 className="text-lg font-bold text-[#111827] tracking-tight">INTERVEUU AI</h2>
                                <p className="text-sm text-gray-500 font-medium mt-0.5 max-w-[180px] truncate" title={jobRole}>
                                    {jobRole} Interview
                                </p>
                            </div>
                            <button onClick={() => setIsTranscriptVisible(false)} className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-lg transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>

                    {/* Transcript Area */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                        className="flex-1 bg-white/80 backdrop-blur-xl rounded-[24px] p-6 shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col overflow-hidden min-h-0 relative"
                    >
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2 shrink-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                            Live Transcript
                        </h3>
                        
                        <div className="flex-1 overflow-y-auto space-y-6 pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col" ref={transcriptRef}>
                            
                            {messages.length === 0 && (
                                <div className="flex items-center justify-center h-full text-gray-400 text-sm font-medium italic opacity-70">
                                    The interview is starting...
                                </div>
                            )}

                            {messages.map((msg, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex flex-col gap-2 ${msg.role === 'candidate' ? 'items-end' : 'items-start'}`}
                                >
                                    {msg.role !== 'candidate' ? (
                                        <>
                                            <div className="flex items-center gap-2 ml-1">
                                                <div className="w-6 h-6 rounded-md bg-[#0A2540] text-white flex items-center justify-center text-[10px] font-bold tracking-wider">AI</div>
                                            </div>
                                            <div className="bg-[#F8FAFC] p-4 lg:p-5 rounded-[20px] rounded-tl-sm border border-gray-100 shadow-sm relative">
                                                <p className="text-[#111827] leading-relaxed text-sm whitespace-pre-wrap"><TypewriterText text={correctGrammar(msg.content)} typingSpeed={msg.speed || 40} /></p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-2 mr-1">
                                                <span className="text-xs font-medium text-gray-400">You</span>
                                                <div className="w-6 h-6 rounded-md bg-gray-200 text-[#111827] flex items-center justify-center text-[10px] font-bold uppercase">
                                                    {candidateName ? candidateName.charAt(0) : 'U'}
                                                </div>
                                            </div>
                                            <div className="bg-[#111827] p-4 lg:p-5 rounded-[20px] rounded-tr-sm shadow-[0_4px_14px_rgba(17,24,39,0.1)] text-white max-w-[90%]">
                                                <p className="text-sm leading-relaxed whitespace-pre-wrap opacity-95">{correctGrammar(msg.content)}</p>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            ))}
                            
                            {/* Live user speaking interim text */}
                            <AnimatePresence mode="popLayout">
                            {interimText && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="flex flex-col gap-2 items-end"
                                >
                                    <div className="flex items-center gap-2 text-[#3A7DFF] mt-2 mb-1 mr-1">
                                        <Mic className="w-3.5 h-3.5 animate-pulse opacity-80" />
                                        <span className="text-xs font-medium opacity-80 italic animate-pulse">Listening...</span>
                                    </div>
                                    <div className="bg-blue-50/80 border border-blue-100 p-4 rounded-[20px] rounded-tr-sm shadow-sm max-w-[90%]">
                                        <p className="text-[#111827] text-sm leading-relaxed opacity-80">{correctGrammar(interimText)}...</p>
                                    </div>
                                </motion.div>
                            )}
                            </AnimatePresence>

                            {/* AI Typing Indicator */}
                            {isAIThinking && (
                                <div className="flex flex-col gap-2 items-start mt-2">
                                    <div className="flex items-center gap-2 ml-1">
                                        <div className="w-6 h-6 rounded-md bg-gray-100 text-gray-400 flex items-center justify-center text-[10px] font-bold">AI</div>
                                    </div>
                                    <div className="bg-[#F8FAFC] py-3 px-5 rounded-[20px] rounded-tl-sm border border-gray-100 shadow-sm relative w-fit">
                                        <AITypingIndicator isAIThinking={isAIThinking} />
                                    </div>
                                </div>
                            )}

                        </div>
                    </motion.div>
                </div>

                {/* Right Side - Spectrum & Main Focus */}
                <div className="flex-1 flex flex-col justify-center items-center relative py-12">
                   
                   {!isTranscriptVisible && (
                        <button
                            onClick={() => setIsTranscriptVisible(true)}
                            className="absolute left-0 top-[15%] transform -translate-y-1/2 bg-white/90 p-2.5 rounded-full border border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:bg-gray-50 transition-all z-30 flex items-center gap-2 hover:scale-105"
                        >
                            <MessageSquare className="w-4 h-4 text-gray-500" />
                            <span className="text-xs font-medium text-gray-600 px-1 pr-2">Show Transcript</span>
                        </button>
                    )}

                    <div className="absolute top-4 right-0 w-44 aspect-video bg-black rounded-2xl overflow-hidden shadow-xl border border-gray-100 group z-30 ring-4 ring-white/50">
                        {isCamOn ? (
                            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#111827]">
                                <VideoOff className="w-5 h-5 text-gray-500" />
                            </div>
                        )}
                        <div className="absolute bottom-2 left-2 text-[10px] font-bold bg-black/60 px-2 py-0.5 rounded-md text-white backdrop-blur-sm">
                            You
                        </div>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-12 lg:top-[15%] text-center w-full px-4 z-40 pointer-events-none"
                    >
                        <h3 className="text-2xl font-semibold text-[#111827] tracking-tight mb-3 drop-shadow-sm bg-white/40 inline-block px-6 py-2 rounded-full backdrop-blur-md border border-white/50">
                            {isAiSpeaking ? "Interviewer speaking..." : isListening ? "Listening to you..." : "Analyzing..."}
                        </h3>
                        {/* Live Caption mapped correctly directly beneath title */}
                        <div className="min-h-[3rem] flex items-center justify-center w-full relative z-40">
                            <LiveCaption text={correctGrammar(liveCaption)} isVisible={isAiSpeaking} />
                        </div>
                    </motion.div>

                    <div className="w-full flex justify-center scale-110 sm:scale-125 md:scale-[1.6] my-auto pointer-events-none origin-center transform translate-y-16 lg:translate-y-10 z-10">
                        <VoiceSpectrum 
                            mode={spectrumMode} 
                            // audioStream not strictly needed since Component captures it internally if 'user'
                        />
                    </div>

                    {/* Controls */}
                    <motion.div 
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 400, damping: 25 }}
                        className="absolute bottom-[2%] flex items-center gap-3 bg-white/90 backdrop-blur-xl p-2.5 px-3 rounded-full border border-gray-200/50 shadow-[0_12px_40px_rgba(10,37,64,0.08)]"
                    >
                        <ControlBtn
                            icon={isMicOn ? Mic : MicOff}
                            active={isMicOn}
                            onClick={() => setIsMicOn(!isMicOn)}
                            label={isMicOn ? "Mute" : "Unmute"}
                            colorClass={!isMicOn ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
                        />
                        <ControlBtn
                            icon={isCamOn ? Video : VideoOff}
                            active={isCamOn}
                            onClick={() => setIsCamOn(!isCamOn)}
                            label={isCamOn ? "Stop Video" : "Start Video"}
                            colorClass={!isCamOn ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
                        />

                        <div className="w-px h-8 bg-gray-200/60 mx-1"></div>

                        <button
                            className="bg-[#111827] text-white px-5 py-2.5 rounded-full font-medium transition-all text-sm flex items-center gap-2 hover:bg-[#1f2937] hover:scale-[1.02] active:scale-95 shadow-[0_4px_14px_rgba(17,24,39,0.2)]"
                            onClick={() => {
                                if (onEndInterview) {
                                    onEndInterview();
                                } else {
                                    window.location.reload();
                                }
                            }}
                        >
                            <PhoneOff className="w-4 h-4 text-red-400" />
                            End Interview
                        </button>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

// Updated ControlBtn to match new style
const ControlBtn = ({ icon: Icon, active, onClick, label, colorClass }) => (
    <button
        onClick={onClick}
        title={label}
        className={`p-3 rounded-full transition-all flex items-center justify-center w-11 h-11 ${colorClass}`}
    >
        <Icon className="w-5 h-5" />
    </button>
);

export default LiveInterviewSession;
