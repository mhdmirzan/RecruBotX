import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  Mic, MicOff, Send, CheckCircle, XCircle, Volume2, Loader, 
  LogOut, LayoutDashboard, Cog, Sparkles, Play, RotateCcw,
  Clock, Target, Award, TrendingUp, Upload, FileText
} from "lucide-react";
import { getCurrentUser, logoutUser } from "./utils/userDatabase";
import API_BASE_URL from "./apiConfig";
import Logo from "./components/Logo";
import { motion } from "framer-motion";
import VoiceSpectrum from "./components/VoiceSpectrum";

const VoiceInterview = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  
  // Setup state
  const [interviewField, setInterviewField] = useState("");
  const [positionLevel, setPositionLevel] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [availableFields, setAvailableFields] = useState([]);
  const [availableLevels, setAvailableLevels] = useState([]);
  
  // Candidate Information
  const [candidateName, setCandidateName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [education, setEducation] = useState("");
  const [projects, setProjects] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [cvFile, setCvFile] = useState(null);
  
  // Interview state
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentQuestionNum, setCurrentQuestionNum] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [userAnswer, setUserAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [currentScore, setCurrentScore] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  
  // Final report
  const [reportData, setReportData] = useState(null);
  
  // Audio visualization
  const [audioLevel, setAudioLevel] = useState(0);
  const animationRef = useRef(null);
  
  // Audio recording
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const lastSoundTimeRef = useRef(Date.now());

  // Get current user and fetch fields on mount
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate("/signin/candidate");
    } else {
      setUser(currentUser);
    }
    fetchAvailableFields();
  }, [navigate]);

  const handleLogout = () => {
    logoutUser();
    navigate("/signin/candidate");
  };

  const fetchAvailableFields = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/voice-interview/available-fields`);
      const data = await response.json();
      if (data.success) {
        setAvailableFields(data.fields);
        setAvailableLevels(data.levels);
      }
    } catch (error) {
      console.error("Error fetching fields:", error);
      setAvailableFields([
        "Software Engineering", "Data Science", "Web Development", 
        "Machine Learning", "DevOps", "Cybersecurity"
      ]);
      setAvailableLevels(["Junior", "Intermediate", "Senior"]);
    }
  };

  const handleCvFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        alert('Only PDF files are allowed');
        e.target.value = '';
        return;
      }
      setCvFile(file);
    }
  };

  const startInterview = async () => {
    // Validate all required fields
    if (!interviewField || !positionLevel || !candidateName || !phoneNumber || 
        !emailAddress || !education || !projects || !skills || !experience || !cvFile) {
      alert("Please fill in all required fields including CV upload");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) {
      alert("Please enter a valid email address");
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('cv_file', cvFile);
      formData.append('interview_field', interviewField);
      formData.append('position_level', positionLevel);
      formData.append('num_questions', numQuestions);
      formData.append('candidate_name', candidateName);
      formData.append('phone_number', phoneNumber);
      formData.append('email_address', emailAddress);
      formData.append('education', education);
      formData.append('projects', projects);
      formData.append('skills', skills);
      formData.append('experience', experience);

      const response = await fetch(`${API_BASE_URL}/voice-interview/start-session-with-cv`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setSessionId(data.session_id);
        setCurrentQuestion(data.question);
        setCurrentQuestionNum(data.current_question);
        setTotalQuestions(data.total_questions);
        setIsSetupComplete(true);
        
        // Speak the question
        speakQuestion(data.question);
      } else {
        alert(data.detail || "Failed to start interview");
      }
    } catch (error) {
      console.error("Error starting interview:", error);
      alert("Failed to start interview. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const speakQuestion = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      // Automatically start recording after question is spoken
      setTimeout(() => {
        startRecording(true);
      }, 500);
    };
    window.speechSynthesis.speak(utterance);
  };

  const startRecording = async (isAutomatic = false) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      audioChunksRef.current = [];

      // Setup audio context for real-time level monitoring
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Clean up
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach(track => track.stop());
        }
        
        // Clear timers
        if (silenceTimerRef.current) {
          clearInterval(silenceTimerRef.current);
        }
        if (recordingTimerRef.current) {
          clearTimeout(recordingTimerRef.current);
        }
        
        await submitAudioAnswer(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      lastSoundTimeRef.current = Date.now();

      // Start silence detection (check every 100ms)
      silenceTimerRef.current = setInterval(() => {
        monitorAudioLevel();
      }, 100);

      // Set maximum recording time (1 minute)
      recordingTimerRef.current = setTimeout(() => {
        if (isRecording) {
          console.log("⏱️ Maximum recording time reached (1 minute)");
          stopRecording();
        }
      }, 60000); // 60 seconds

    } catch (error) {
      console.error("Error accessing microphone:", error);
      if (!isAutomatic) {
        alert("Could not access microphone. Please check permissions or type your answer.");
      }
    }
  };

  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average volume
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    setAudioLevel(average);

    // Silence detection threshold (adjust based on environment)
    const silenceThreshold = 10;
    const currentTime = Date.now();

    if (average > silenceThreshold) {
      // Sound detected, reset silence timer
      lastSoundTimeRef.current = currentTime;
    } else {
      // Check if 4 seconds of silence
      const silenceDuration = (currentTime - lastSoundTimeRef.current) / 1000;
      
      if (silenceDuration >= 4 && isRecording) {
        console.log("🤫 4 seconds of silence detected, stopping recording...");
        stopRecording();
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);
      
      // Clear intervals
      if (silenceTimerRef.current) {
        clearInterval(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      if (recordingTimerRef.current) {
        clearTimeout(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const submitAudioAnswer = async (audioBlob) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("session_id", sessionId);
      formData.append("audio_file", audioBlob, "recording.webm");

      const response = await fetch(`${API_BASE_URL}/voice-interview/submit-answer`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setFeedback(data.feedback);
        setCurrentScore(data.score);
        
        // Check if interview is complete
        if (data.is_complete) {
          setIsComplete(true);
          await generateReport();
        } else {
          // Wait 3 seconds then get next question
          setTimeout(async () => {
            await getNextQuestion();
          }, 3000);
        }
      }
    } catch (error) {
      console.error("Error submitting audio:", error);
      alert("Failed to submit audio. Please try again or type your answer.");
    } finally {
      setIsProcessing(false);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) {
      alert("Please provide an answer");
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("session_id", sessionId);
      formData.append("text_answer", userAnswer);

      const response = await fetch(`${API_BASE_URL}/voice-interview/submit-answer`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setFeedback(data.feedback);
        setCurrentScore(data.score);
        
        // Check if interview is complete
        if (data.is_complete) {
          setIsComplete(true);
          await generateReport();
        } else {
          // Wait 3 seconds then get next question
          setTimeout(async () => {
            await getNextQuestion();
          }, 3000);
        }
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      alert("Failed to submit answer. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getNextQuestion = async () => {
    setFeedback("");
    setCurrentScore(null);
    setUserAnswer("");
    setIsProcessing(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/voice-interview/next-question?session_id=${sessionId}`,
        { method: "POST" }
      );

      const data = await response.json();
      if (data.success) {
        if (data.complete) {
          setIsComplete(true);
          await generateReport();
        } else {
          setCurrentQuestion(data.question);
          setCurrentQuestionNum(data.current_question);
          speakQuestion(data.question);
        }
      }
    } catch (error) {
      console.error("Error getting next question:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateReport = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/voice-interview/generate-report/${sessionId}`,
        { method: "POST" }
      );

      const data = await response.json();
      if (data.success) {
        setReportData(data.summary);
      }
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  const restartInterview = () => {
    setSessionId(null);
    setIsSetupComplete(false);
    setCurrentQuestion("");
    setCurrentQuestionNum(0);
    setUserAnswer("");
    setFeedback("");
    setCurrentScore(null);
    setIsComplete(false);
    setReportData(null);
  };

  // Voice animation effect for AI speaking
  useEffect(() => {
    if (isSpeaking) {
      animationRef.current = setInterval(() => {
        setAudioLevel(Math.random() * 100);
      }, 100);
    } else {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
      if (!isRecording) {
        setAudioLevel(0);
      }
    }

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isSpeaking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (silenceTimerRef.current) {
        clearInterval(silenceTimerRef.current);
      }
      if (recordingTimerRef.current) {
        clearTimeout(recordingTimerRef.current);
      }
    };
  }, []);

  // Loading state
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Sidebar Component
  const Sidebar = () => (
    <aside className="w-72 h-screen bg-white shadow-xl flex flex-col p-6 border-r border-gray-200 flex-shrink-0">
      <div className="mb-8 flex items-center justify-center gap-2 flex-shrink-0">
        <Logo className="h-9 w-auto" />
      </div>

      <nav className="flex flex-col space-y-4 text-gray-700 flex-shrink-0">
        <NavLink
          to="/candidate/dashboard"
          className={({ isActive }) =>
            `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"}`
          }
        >
          <LayoutDashboard className="w-5 h-5" /> Dashboard
        </NavLink>
        
        <NavLink
          to="/candidate/settings"
          className={({ isActive }) =>
            `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"}`
          }
        >
          <Cog className="w-5 h-5" /> Settings
        </NavLink>
      </nav>

      <div className="mt-auto flex-shrink-0">
        <div className="mb-4 text-center pb-4 border-b border-gray-200">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl shadow-lg overflow-hidden">
            {user.profileImage ? (
              <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</>
            )}
          </div>
          <h3 className="font-bold text-gray-800 text-lg">{user.firstName} {user.lastName}</h3>
          <p className="text-sm text-gray-500 mt-1">{user.email}</p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 rounded-xl text-white hover:from-red-600 hover:to-red-700 transition-all shadow-md"
        >
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>
    </aside>
  );

  // Setup Screen
  if (!isSetupComplete) {
    return (
      <div className="h-screen w-screen flex bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden fixed inset-0">
        <Sidebar />
        
        <main className="flex-1 h-screen flex flex-col overflow-hidden py-6 px-10">
          {/* Welcome Banner */}
                  {/* Top Header */}
        <div className="flex justify-between items-center mb-3 flex-shrink-0">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">AI Voice Interview</h2>
            <p className="mt-1 text-gray-500 text-md py-4">Practice technical interviews with intelligent feedback.</p>
          </div>
        </div>

          {/* Setup Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
            {/* Configuration Card */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8 flex flex-col overflow-hidden">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 flex-shrink-0">
                <Target className="w-6 h-6 text-blue-600" />
                Configure Your Interview
              </h3>

              <div className="space-y-4 overflow-y-auto pr-2" style={{maxHeight: 'calc(100vh - 300px)'}}>
                {/* Personal Information */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition bg-gray-50 hover:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1-234-567-8900"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition bg-gray-50 hover:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition bg-gray-50 hover:bg-white"
                  />
                </div>

                {/* Interview Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Interview Field <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={interviewField}
                    onChange={(e) => setInterviewField(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition bg-gray-50 hover:bg-white"
                  >
                    <option value="">Select a field...</option>
                    {availableFields.map((field) => (
                      <option key={field} value={field}>{field}</option>
                    ))}
                  </select>
                </div>

                {/* Position Level */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Position Level <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {availableLevels.map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setPositionLevel(level)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          positionLevel === level
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="font-semibold text-sm">{level}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {level === "Junior" && "0-2 years"}
                          {level === "Intermediate" && "2-5 years"}
                          {level === "Senior" && "5+ years"}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Education <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="Bachelor of Computer Science, MIT, 2020&#10;Master of AI, Stanford, 2022"
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition bg-gray-50 hover:bg-white resize-none"
                  />
                </div>

                {/* Projects */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Projects <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={projects}
                    onChange={(e) => setProjects(e.target.value)}
                    placeholder="AI Chatbot using NLP and Python&#10;E-commerce Platform with React and Node.js"
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition bg-gray-50 hover:bg-white resize-none"
                  />
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Skills <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="Python, JavaScript, React, MongoDB, FastAPI, Machine Learning"
                    rows={2}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition bg-gray-50 hover:bg-white resize-none"
                  />
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Experience <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="3 years as Software Engineer at Tech Corp, worked on cloud infrastructure and microservices"
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition bg-gray-50 hover:bg-white resize-none"
                  />
                </div>

                {/* CV Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload Your CV <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-blue-300 rounded-xl p-4 flex flex-col items-center justify-center hover:bg-blue-50 transition">
                    <Upload className="w-6 h-6 text-blue-600 mb-2" />
                    <input
                      id="cvFileUpload"
                      type="file"
                      accept=".pdf"
                      onChange={handleCvFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="cvFileUpload"
                      className="cursor-pointer text-blue-600 font-medium hover:underline text-center text-sm"
                    >
                      {cvFile ? (
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span>{cvFile.name}</span>
                        </div>
                      ) : (
                        "Click to upload your CV (.pdf)"
                      )}
                    </label>
                    <p className="text-xs text-gray-500 mt-1">PDF format only, max 10MB</p>
                  </div>
                </div>
              </div>

              <button
                onClick={startInterview}
                disabled={isProcessing || !interviewField || !positionLevel || !candidateName || !phoneNumber || !emailAddress || !education || !projects || !skills || !experience || !cvFile}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-6 flex-shrink-0"
              >
                {isProcessing ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Starting Interview...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Start Interview
                  </>
                )}
              </button>
            </div>

            {/* Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 flex-shrink-0 overflow-y-auto"  style={{maxHeight: 'calc(100vh - 180px)'}}>
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                How It Works
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3 py-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">1</div>
                  <div>
                    <p className="font-medium text-gray-800">Upload Your CV</p>
                    <p className="text-sm text-gray-500">Submit your resume in PDF format</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 py-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">2</div>
                  <div>
                    <p className="font-medium text-gray-800">Start Your Interview</p>
                    <p className="text-sm text-gray-500">Click the Start Interview button to begin</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 py-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">3</div>
                  <div>
                    <p className="font-medium text-gray-800">AI Asks Questions</p>
                    <p className="text-sm text-gray-500">Respond naturally with video feed</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 py-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">4</div>
                  <div>
                    <p className="font-medium text-gray-800">Get Feedback</p>
                    <p className="text-sm text-gray-500">Receive instant AI-powered insights</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
                  <Clock className="w-4 h-4" />
                  Recording Info
                </div>
                <p className="text-sm text-blue-600">
                  Auto-stops after 4 seconds of silence or 1 minute maximum per answer.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Complete Screen
  if (isComplete && reportData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Interview Complete!</h1>
              <p className="text-gray-600">Great job completing the interview</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Overall Score</h3>
                <div className="text-5xl font-bold text-blue-600">{reportData.avg_score}/100</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Performance Level</h3>
                <div className="text-2xl font-bold text-purple-600">{reportData.performance_level}</div>
              </div>
            </div>

            <div className="space-y-6 mb-8">
              {/* Strengths */}
              <div className="bg-green-50 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  Strengths
                </h3>
                <ul className="space-y-2">
                  {reportData.strengths.map((strength, idx) => (
                    <li key={idx} className="text-gray-700 flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Areas for Improvement */}
              <div className="bg-orange-50 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <XCircle className="w-6 h-6 text-orange-600" />
                  Areas for Improvement
                </h3>
                <ul className="space-y-2">
                  {reportData.improvements.map((improvement, idx) => (
                    <li key={idx} className="text-gray-700 flex items-start gap-2">
                      <span className="text-orange-600 mt-1">•</span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={restartInterview}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg"
              >
                Start New Interview
              </button>
              <button
                onClick={() => navigate("/candidate/dashboard")}
                className="flex-1 bg-gray-200 text-gray-800 py-4 rounded-xl font-semibold hover:bg-gray-300 transition"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Interview Screen
  const spectrumMode = isSpeaking ? 'ai' : isRecording ? 'user' : 'idle';

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col font-sans relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute top-[-15%] left-[-10%] w-[40rem] h-[40rem] bg-gradient-to-br from-blue-50 to-transparent rounded-full mix-blend-multiply filter blur-3xl opacity-60"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] bg-gradient-to-tl from-indigo-50 to-transparent rounded-full mix-blend-multiply filter blur-3xl opacity-60"></div>

      {/* Top Header */}
      <header className="w-full max-w-7xl mx-auto py-6 px-8 flex items-center justify-between z-10 relative">
        <Logo className="h-8 w-auto grayscale opacity-80" />
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white/60 backdrop-blur-md rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-blue-500 animate-pulse' : isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></div>
            <span className="text-sm font-medium text-[#111827]">
              {isSpeaking ? 'AI is speaking' : isRecording ? 'Recording...' : 'Session Active'}
            </span>
          </div>
          <div className="px-4 py-2 bg-white/60 backdrop-blur-md rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 font-medium text-[#111827] flex items-center gap-2 text-sm">
            <span>{currentQuestionNum} <span className="text-gray-400">/ {totalQuestions}</span></span>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-8 flex flex-col lg:flex-row gap-8 lg:gap-16 z-10 pb-8 h-[calc(100vh-100px)]">
        
        {/* Left Side - Transcript & Context */}
        <div className="flex-1 flex flex-col gap-6 max-w-md h-full">
          {/* AI Avatar Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="p-6 bg-white/80 backdrop-blur-xl rounded-[24px] shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center gap-5 transition-all duration-300 hover:shadow-[0_12px_50px_rgb(0,0,0,0.06)]"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0A2540] to-[#3A7DFF] flex items-center justify-center p-[2px] shadow-sm">
                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center overflow-hidden">
                   <Logo className="w-8 h-auto object-contain" />
                </div>
              </div>
              {isSpeaking && (
                 <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3A7DFF] opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-4 w-4 bg-[#3A7DFF] border-2 border-white"></span>
                 </span>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#111827] tracking-tight">INTERVEUU AI</h2>
              <p className="text-sm text-gray-500 font-medium mt-0.5">
                {interviewField} • {positionLevel}
              </p>
            </div>
          </motion.div>

          {/* Transcript Area */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="flex-1 bg-white/80 backdrop-blur-xl rounded-[24px] p-6 shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col overflow-hidden transition-all duration-300 hover:shadow-[0_12px_50px_rgb(0,0,0,0.06)]"
          >
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
              Live Transcript
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-6 pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col">
              {/* Question Bubble */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-2"
              >
                <div className="flex items-center gap-2 ml-1">
                  <div className="w-6 h-6 rounded-md bg-[#0A2540] text-white flex items-center justify-center text-[10px] font-bold tracking-wider">AI</div>
                </div>
                <div className="bg-[#F8FAFC] p-5 rounded-[20px] rounded-tl-sm border border-gray-100 shadow-sm relative">
                  <p className="text-[#111827] leading-relaxed text-sm whitespace-pre-wrap">
                    {currentQuestion}
                    {isSpeaking && (
                      <motion.span 
                        animate={{ opacity: [0, 1, 0] }} 
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        className="inline-block w-1.5 h-3.5 bg-[#3A7DFF] ml-1.5 rounded-sm align-middle"
                      />
                    )}
                  </p>
                </div>
              </motion.div>

              {/* Typed Answer / Voice Transcription representation */}
              {(userAnswer || isRecording) && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-2 items-end mt-2"
                >
                  <div className="flex items-center gap-2 mr-1">
                    <span className="text-xs font-medium text-gray-400">You</span>
                    <div className="w-6 h-6 rounded-md bg-gray-200 text-[#111827] flex items-center justify-center text-xs font-bold uppercase">
                       {candidateName ? candidateName.charAt(0) : 'U'}
                    </div>
                  </div>
                  <div className={`p-5 rounded-[20px] rounded-tr-sm max-w-[90%] shadow-sm ${
                    isRecording && !userAnswer
                      ? 'bg-blue-50 border border-blue-100'
                      : 'bg-[#111827] text-white'
                  }`}>
                    {isRecording && !userAnswer ? (
                      <div className="flex items-center gap-2 text-[#3A7DFF]">
                         <Mic className="w-4 h-4 animate-pulse opacity-80" />
                         <span className="text-sm font-medium opacity-80 italic animate-pulse">Listening...</span>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap opacity-95">{userAnswer}</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Feedback Block */}
              {feedback && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className={`p-5 rounded-[20px] flex gap-3 mt-4 border ${
                    currentScore >= 70 
                      ? 'bg-[#F0FDF4] border-[#BBF7D0] shadow-[0_4px_20px_rgba(34,197,94,0.05)]' 
                      : 'bg-[#FFFBEB] border-[#FDE68A] shadow-[0_4px_20px_rgba(245,158,11,0.05)]'
                  }`}
                >
                  {currentScore >= 70 ? (
                    <div className="bg-white rounded-full p-1 mt-0.5 shadow-sm h-min"><CheckCircle className="w-5 h-5 text-[#16A34A]" /></div>
                  ) : (
                    <div className="bg-white rounded-full p-1 mt-0.5 shadow-sm h-min"><XCircle className="w-5 h-5 text-[#D97706]" /></div>
                  )}
                  <div>
                     <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Feedback</span>
                     <p className="text-sm text-[#111827] leading-relaxed opacity-90">{feedback}</p>
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* Typing input fallback */}
            {!isRecording && !isProcessing && !feedback && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} delay={0.5}
                className="mt-5 pt-5 border-t border-gray-100 flex gap-2 items-end"
              >
                <div className="flex-1 bg-gray-50 border border-gray-200 focus-within:border-[#3A7DFF] focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50/50 rounded-2xl transition-all duration-200">
                  <textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your response..."
                    className="w-full bg-transparent px-4 py-3.5 text-sm text-[#111827] border-none focus:outline-none focus:ring-0 resize-none h-14 placeholder-gray-400 font-medium"
                    disabled={isProcessing}
                  />
                </div>
                {userAnswer.trim().length > 0 && (
                  <button
                    onClick={submitAnswer}
                    disabled={isProcessing}
                    className="mb-1 h-12 w-12 rounded-full bg-[#111827] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_4px_14px_rgba(0,0,0,0.1)] flex-shrink-0"
                  >
                    {isProcessing ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Right Side - Spectrum & Main Focus */}
        <div className="flex-1 flex flex-col justify-center items-center relative py-12">
           
           <motion.div 
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             className="absolute top-[15%] text-center"
           >
             <h3 className="text-2xl font-semibold text-[#111827] tracking-tight mb-2">
                {isSpeaking ? "Interviewer speaking..." : isRecording ? "Listening..." : "Ready."}
             </h3>
             {isRecording && (
                <p className="text-[#3A7DFF] text-sm font-medium animate-pulse flex items-center justify-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#3A7DFF]"></div>
                   Speak clearly into your microphone
                </p>
             )}
           </motion.div>

           <div className="w-full flex justify-center scale-110 sm:scale-125 md:scale-150 my-auto pointer-events-none origin-center">
             <VoiceSpectrum 
               mode={spectrumMode} 
               audioStream={audioStreamRef.current} 
             />
           </div>

           {/* Controls */}
           <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 400, damping: 25 }}
              className="absolute bottom-[5%] flex items-center gap-4 bg-white/90 backdrop-blur-xl p-2.5 rounded-full border border-white/50 shadow-[0_12px_40px_rgba(10,37,64,0.08)]"
           >
              {isRecording ? (
                <button
                  onClick={stopRecording}
                  disabled={isProcessing}
                  className="group flex items-center gap-3 px-6 py-3.5 bg-[#111827] text-white rounded-full font-semibold hover:scale-[1.02] active:scale-95 transition-all shadow-[0_8px_25px_rgba(17,24,39,0.25)] hover:shadow-[0_12px_30px_rgba(17,24,39,0.3)] disabled:opacity-50"
                >
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-6 h-6 bg-red-500/20 rounded-full animate-ping"></div>
                    <div className="w-3 h-3 rounded-sm bg-red-500 group-hover:bg-red-400 transition-colors"></div>
                  </div>
                  Pause Recording
                </button>
              ) : (
                <>
                  <button
                    onClick={() => startRecording(false)}
                    disabled={isProcessing || isSpeaking}
                    className={`flex items-center gap-3 px-6 py-3.5 rounded-full font-semibold transition-all duration-300 ${
                      isProcessing || isSpeaking 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-70' 
                        : 'bg-[#111827] text-white hover:scale-[1.02] active:scale-95 shadow-[0_8px_25px_rgba(17,24,39,0.25)] hover:shadow-[0_12px_30px_rgba(17,24,39,0.3)]'
                    }`}
                  >
                    <Mic className={`w-5 h-5 ${isProcessing || isSpeaking ? '' : 'text-[#6FA8FF]'}`} />
                    Answer with Voice
                  </button>
                  
                  {userAnswer.trim() && !isProcessing && (
                     <button
                       onClick={submitAnswer}
                       className="flex items-center gap-2 px-5 py-3.5 rounded-full font-semibold bg-[#3A7DFF] text-white hover:bg-blue-600 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_8px_20px_rgba(58,125,255,0.3)]"
                     >
                       Submit Result
                       <Send className="w-4 h-4 ml-1" />
                     </button>
                  )}
                </>
              )}
           </motion.div>
        </div>
      </main>
    </div>
  );
};

export default VoiceInterview;
