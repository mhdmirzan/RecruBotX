import { useState, useEffect, useRef } from 'react';
import LiveInterviewSession from './components/LiveInterviewSession';
import InterviewReport from './components/InterviewReport';
import AudioRecorder from './components/AudioRecorder';
import DebugPanel from './components/DebugPanel';
import { conversationStateMachine, ConversationState } from './services/ConversationStateMachine';
import CandidateDashboard from './components/CandidateDashboard';

function App() {
  // State
  const [currentState, setCurrentState] = useState(ConversationState.IDLE);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [messages, setMessages] = useState([]);
  const [interimText, setInterimText] = useState('');
  const [liveCaption, setLiveCaption] = useState(''); // Live caption state
  const wordBufferRef = useRef([]); // Buffer for incoming words
  const captionIntervalRef = useRef(null);

  // Synchronized Caption Streaming Effect
  useEffect(() => {
    if (currentState === ConversationState.AI_SPEAKING) {
      // Start streaming words
      captionIntervalRef.current = setInterval(() => {
        if (wordBufferRef.current.length > 0) {
          // Take next word
          const nextWord = wordBufferRef.current.shift();
          setLiveCaption(prev => {
            // Logic: Accumulate words until line is full (5 words), then clear and start fresh.
            // This prevents multi-line wrap and keeps it synchronized.
            const words = prev ? prev.split(' ') : [];
            if (words.length >= 5) {
              return nextWord; // Start new line
            }
            return prev ? prev + " " + nextWord : nextWord;
          });
        }
      }, 270); // ADJUST SPEED HERE (Lower = Faster, Higher = Slower). 275ms = ~3.6 words/sec
    } else {
      // Cleanup when not speaking
      if (captionIntervalRef.current) clearInterval(captionIntervalRef.current);
      // Clear buffer and caption after short delay
      if (wordBufferRef.current.length > 0 || liveCaption) {
        const timer = setTimeout(() => {
          setLiveCaption('');
          wordBufferRef.current = [];
        }, 500);
        return () => clearTimeout(timer);
      }
    }
    return () => clearInterval(captionIntervalRef.current);
  }, [currentState]);

  const [reportData, setReportData] = useState(null); // Stores report when interview ends

  // Hardcoded config for now, or passed from Dashboard
  const [config, setConfig] = useState({
    candidate_name: 'Ayyash',
    job_role: 'Python Developer'
  });

  // Debug state
  const [debugInfo, setDebugInfo] = useState({
    wsStatus: 'Disconnected',
    status: 'IDLE',
    events: [],
    lastMessage: 'None'
  });

  // Refs
  const ws = useRef(null);
  const audioRef = useRef(null);
  const isConnecting = useRef(false);

  // Helper to log debug events
  const logDebug = (event) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => ({
      ...prev,
      events: [`[${timestamp}] ${event}`, ...prev.events].slice(0, 20)
    }));
  };

  // --- WebSocket Logic ---
  useEffect(() => {
    const unsubscribe = conversationStateMachine.subscribe((event) => {
      setCurrentState(event.to);
      setDebugInfo(prev => ({ ...prev, status: event.to }));

      // Clear caption when AI stops speaking
      if (event.from === ConversationState.AI_SPEAKING && event.to !== ConversationState.AI_SPEAKING) {
        setTimeout(() => setLiveCaption(''), 200);
      }
    });

    const connect = () => {
      if (ws.current || isConnecting.current) return;
      isConnecting.current = true;
      logDebug('🔌 Connecting...');

      const socket = new WebSocket('ws://127.0.0.1:8000/ws/interview');

      socket.onopen = () => {
        logDebug('✅ Connected');
        ws.current = socket;
        isConnecting.current = false;
        setIsConnected(true);
        setDebugInfo(prev => ({ ...prev, wsStatus: 'Connected' }));
      };

      socket.onclose = () => {
        logDebug('❌ Disconnected');
        ws.current = null;
        isConnecting.current = false;
        setIsConnected(false);
        setDebugInfo(prev => ({ ...prev, wsStatus: 'Disconnected' }));
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
  }, []);

  // --- Message Handling ---
  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'session_created':
        logDebug('✅ Session Started');
        setSessionActive(true);
        conversationStateMachine.transition(ConversationState.LISTENING, { source: 'session_created' });
        break;

      case 'text_chunk':
        // Append streamed text to transcript
        setMessages(prev => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.role === 'interviewer') {
            const newPrev = [...prev];
            newPrev[prev.length - 1] = { ...lastMsg, content: lastMsg.content + data.payload };
            return newPrev;
          }
          return [...prev, { role: 'interviewer', content: data.payload }];
        });

        // Push words to buffer for synchronized captioning
        // We split by spaces and add to our ref queue
        if (data.payload) {
          const words = data.payload.split(' ').filter(w => w.length > 0);
          wordBufferRef.current.push(...words);
        }
        break;

      case 'audio_output':
        logDebug(`🔊 Audio Received`);
        playAudio(data.payload);
        break;

      case 'transcription':
        logDebug(`📝 Transcription: ${data.payload}`);
        setInterimText(''); // Clear interim text
        setMessages(prev => {
          // If the last message was 'interviewer', append new candidate message
          // If last was 'candidate', replace/append? Ideally append if it's a new chunk.
          // But since STT is one-shot per utterance, just append new message.
          return [...prev, { role: 'candidate', content: data.payload }];
        });
        break;

      case 'report':
        logDebug('📊 Report Received');
        setReportData(data.payload);
        setSessionActive(false); // Switch to report view
        break;

      case 'response_complete':
        // Check if we should end interview? handled by report message
        break;
    }
  };

  // --- Audio Logic ---
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
        // Delay listening to prevent self-hearing (echo cancellation buffer)
        setTimeout(() => {
          conversationStateMachine.transition(ConversationState.LISTENING, { source: 'audio_finished' });
        }, 800);
      };

      audio.play().catch(e => {
        logDebug(`⚠️ Play Error: ${e.message}`);
        conversationStateMachine.transition(ConversationState.LISTENING, { source: 'autoplay_fail' });
      });
    } catch (e) {
      console.error(e);
    }
  };

  // --- User Actions ---
  const startInterview = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'start_interview', payload: config }));
    } else {
      // Mock start for UI testing if backend offline (Optional)
      console.warn("Backend not connected, cannot start interview.");
    }
  };

  const handleInterrupt = () => {
    logDebug('🛑 Interrupt!');
    setLiveCaption(''); // Clear caption on interrupt
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

    // Simulate live transcript (Removed for real transcription)
    // setMessages(prev => [...prev, { role: 'candidate', content: "(Audio sent...)" }]);
  };

  // --- Render ---

  // 1. Setup Screen (New Dashboard)
  if (!sessionActive && !reportData) {
    return (
      <CandidateDashboard
        candidateName={config.candidate_name}
        onStartInterview={startInterview}
      />
    );
  }

  // 2. Report Screen
  if (reportData) {
    return <InterviewReport reportData={reportData} onRestart={() => window.location.reload()} />;
  }

  // 3. Live Interview Screen
  return (
    <>
      <LiveInterviewSession
        messages={messages}
        status={currentState}
        interimText={interimText}
        candidateName={config.candidate_name}
        jobRole={config.job_role}
        onInterrupt={handleInterrupt}
        liveCaption={liveCaption} /* Pass liveCaption */
      />

      <AudioRecorder
        onAudioData={handleAudioData}
        onInterrupt={handleInterrupt}
        isRecording={currentState === ConversationState.LISTENING}
        isDetectingInterrupt={currentState === ConversationState.AI_SPEAKING}
      />
    </>
  );
}

export default App;
