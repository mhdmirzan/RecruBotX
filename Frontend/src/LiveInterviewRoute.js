import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import LiveInterviewSession from "./components/LiveInterview/LiveInterviewSession";
import AudioRecorder from "./components/LiveInterview/AudioRecorder";
import { conversationStateMachine, ConversationState } from "./services/ConversationStateMachine";

const LiveInterviewRoute = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Extracted from InterviewPage navigation state
    const { sessionId, candidateName, jobTitle } = location.state || {};

    const [currentState, setCurrentState] = useState(ConversationState.IDLE);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState([]);
    const [liveCaption, setLiveCaption] = useState("");

    const wordBufferRef = useRef([]);
    const captionIntervalRef = useRef(null);
    const ws = useRef(null);
    const audioRef = useRef(null);
    const isConnecting = useRef(false);

    // If candidate landed here without going through the start form
    useEffect(() => {
        if (!sessionId) {
            navigate("/candidate/jobs"); // Fallback
        }
    }, [sessionId, navigate]);

    // Synchronized Caption Streaming Effect
    useEffect(() => {
        if (currentState === ConversationState.AI_SPEAKING) {
            captionIntervalRef.current = setInterval(() => {
                if (wordBufferRef.current.length > 0) {
                    const nextWord = wordBufferRef.current.shift();
                    setLiveCaption(prev => {
                        const words = prev ? prev.split(' ') : [];
                        if (words.length >= 5) {
                            return nextWord;
                        }
                        return prev ? prev + " " + nextWord : nextWord;
                    });
                }
            }, 270);
        } else {
            if (captionIntervalRef.current) clearInterval(captionIntervalRef.current);
            if (wordBufferRef.current.length > 0 || liveCaption) {
                const timer = setTimeout(() => {
                    setLiveCaption('');
                    wordBufferRef.current = [];
                }, 500);
                return () => clearTimeout(timer);
            }
        }
        return () => clearInterval(captionIntervalRef.current);
    }, [currentState, liveCaption]);

    const isWrappingUp = useRef(false);

    // --- WebSocket Logic ---
    useEffect(() => {
        if (!sessionId) return;

        const unsubscribe = conversationStateMachine.subscribe((event) => {
            setCurrentState(event.to);
            if (event.from === ConversationState.AI_SPEAKING && event.to !== ConversationState.AI_SPEAKING) {
                setTimeout(() => setLiveCaption(''), 200);
            }
        });

        const connect = () => {
            if (ws.current || isConnecting.current) return;
            isConnecting.current = true;

            // Connect using the specific sessionId endpoint we will build in FastAPI
            // Assuming FastAPI runs on 8000
            const wsUrl = `ws://localhost:8000/ws/interview/${sessionId}`;
            const socket = new WebSocket(wsUrl);

            socket.onopen = () => {
                ws.current = socket;
                isConnecting.current = false;
                setIsConnected(true);

                // Immediately kick off the interview once socket opens
                socket.send(JSON.stringify({
                    type: 'start_interview',
                    payload: { candidate_name: candidateName, job_role: jobTitle }
                }));
            };

            socket.onclose = () => {
                ws.current = null;
                isConnecting.current = false;
                setIsConnected(false);
                conversationStateMachine.reset();
            };

            socket.onerror = (err) => console.error("WS Error:", err);

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    handleWebSocketMessage(data);
                } catch (e) {
                    console.error(e);
                }
            };
        };

        connect();

        return () => {
            unsubscribe();
            if (ws.current) ws.current.close();
            if (audioRef.current) audioRef.current.pause();
        };
    }, [sessionId, candidateName, jobTitle]);

    const handleWebSocketMessage = (data) => {
        switch (data.type) {
            case 'session_created':
                conversationStateMachine.transition(ConversationState.LISTENING, { source: 'session_created' });
                break;
            case 'text_chunk':
                setMessages(prev => {
                    const lastMsg = prev[prev.length - 1];
                    if (lastMsg && lastMsg.role === 'interviewer') {
                        const newPrev = [...prev];
                        newPrev[prev.length - 1] = { ...lastMsg, content: lastMsg.content + data.payload };
                        return newPrev;
                    }
                    return [...prev, { role: 'interviewer', content: data.payload }];
                });
                if (data.payload) {
                    const words = data.payload.split(' ').filter(w => w.length > 0);
                    wordBufferRef.current.push(...words);
                }
                break;
            case 'audio_output':
                playAudio(data.payload);
                break;
            case 'transcription':
                setMessages(prev => [...prev, { role: 'candidate', content: data.payload }]);
                break;
            case 'report':
                // Instead of abruptly closing, flag that we are wrapping up.
                // The actual navigation will happen after the last audio chunk finishes playing.
                isWrappingUp.current = true;
                break;
            default:
                break;
        }
    };

    const playAudio = (base64String) => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.onended = null;
        }
        try {
            const byteCharacters = atob(base64String);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'audio/mpeg' });
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            audioRef.current = audio;

            audio.onplay = () => {
                conversationStateMachine.transition(ConversationState.AI_SPEAKING, { source: 'audio_started' });
            };
            audio.onended = () => {
                URL.revokeObjectURL(url);
                audioRef.current = null;

                if (isWrappingUp.current) {
                    // Sequence finished. Wait a final 2 seconds for dramatic effect, then close.
                    setTimeout(() => {
                        ws.current?.close();
                        navigate("/candidate/interview-complete", { state: { sessionId, candidateName, jobTitle } });
                    }, 2000);
                } else {
                    setTimeout(() => {
                        conversationStateMachine.transition(ConversationState.LISTENING, { source: 'audio_finished' });
                    }, 800);
                }
            };
            audio.play().catch(e => {
                conversationStateMachine.transition(ConversationState.LISTENING, { source: 'autoplay_fail' });
            });
        } catch (e) {
            console.error(e);
        }
    };

    const handleInterrupt = () => {
        setLiveCaption('');
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'interrupt', payload: {} }));
        }
        conversationStateMachine.transition(ConversationState.CANDIDATE_INTERRUPTING);
        setTimeout(() => conversationStateMachine.transition(ConversationState.LISTENING), 150);
    };

    const handleAudioData = (audioBlob) => {
        if (conversationStateMachine.getState() !== ConversationState.LISTENING) return;
        conversationStateMachine.transition(ConversationState.PROCESSING);
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
            const base64Audio = reader.result.split(',')[1];
            if (ws.current?.readyState === WebSocket.OPEN) {
                ws.current.send(JSON.stringify({ type: 'audio_data', payload: base64Audio }));
            }
        };
    };

    const handleEndInterview = () => {
        if (window.confirm("Are you sure you want to end the interview?")) {
            if (ws.current?.readyState === WebSocket.OPEN) {
                ws.current.close();
            }
            navigate("/candidate/interview-complete", { state: { sessionId, candidateName, jobTitle, aborted: true } });
        }
    };

    if (!sessionId) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Minimal Header */}
            <div className="bg-white p-4 shadow-sm flex items-center gap-4">
                <button
                    onClick={() => {
                        if (window.confirm("Are you sure you want to leave? Your interview will be ended.")) {
                            if (ws.current?.readyState === WebSocket.OPEN) ws.current.close();
                            navigate(-1);
                        }
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-bold text-[#0a2a5e]">RecruBotX AI Interview</h1>
                <div className="ml-auto text-sm">
                    {isConnected ? (
                        <span className="flex items-center gap-2 text-green-600 font-semibold">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Connected
                        </span>
                    ) : (
                        <span className="flex items-center gap-2 text-orange-500 font-semibold">
                            <span className="w-2 h-2 rounded-full bg-orange-500"></span> Testing Connection...
                        </span>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative">
                <LiveInterviewSession
                    messages={messages}
                    status={currentState}
                    interimText={""}
                    candidateName={candidateName || "Candidate"}
                    jobRole={jobTitle || "Role"}
                    onInterrupt={handleInterrupt}
                    liveCaption={liveCaption}
                    onEndInterview={handleEndInterview}
                />

                <AudioRecorder
                    onAudioData={handleAudioData}
                    onInterrupt={handleInterrupt}
                    isRecording={currentState === ConversationState.LISTENING}
                    isDetectingInterrupt={currentState === ConversationState.AI_SPEAKING}
                />
            </div>
        </div>
    );
};

export default LiveInterviewRoute;
