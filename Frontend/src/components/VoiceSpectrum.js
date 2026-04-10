import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const VoiceSpectrum = ({ mode, audioStream, isDarkMode }) => {
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  // Realism enhancements: time for simulation
  const timeRef = useRef(0);

  useEffect(() => {
    let localStream = null;
    let cleanUpOwnStream = false;

    const setupContext = async () => {
      if (mode === 'idle') return;

      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') {
            await audioCtx.resume();
        }
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64; // 32 frequency bins
        analyser.smoothingTimeConstant = 0.8; // Smoothing factor
        
        let source;
        if (mode === 'user') {
          let sourceStream = audioStream;
          if (!sourceStream) {
            localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            sourceStream = localStream;
            cleanUpOwnStream = true;
          }
          source = audioCtx.createMediaStreamSource(sourceStream);
          source.connect(analyser);
        } else if (mode === 'ai') {
          if (!window.aiAudioElement) return;
          source = audioCtx.createMediaElementSource(window.aiAudioElement);
          source.connect(analyser);
          analyser.connect(audioCtx.destination); // Must route AI audio to speakers
        }
        
        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
      } catch (err) {
        console.error("Error setting up audio context for spectrum", err);
      }
    };

    setupContext();
    
    return () => {
      // Clean up audio context when mode changes or unmounts
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(e => console.error(e));
        audioContextRef.current = null;
      }
      if (cleanUpOwnStream && localStream) {
        localStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [mode, audioStream]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Use device pixel ratio for sharper edges on retina displays
    const dpr = window.devicePixelRatio || 1;
    const cssWidth = canvas.clientWidth || 300;
    const cssHeight = canvas.clientHeight || 100;
    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;
    ctx.scale(dpr, dpr);
    
    const width = cssWidth;
    const height = cssHeight;
    
    let smoothedHeights = new Array(24).fill(10);
    
    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      timeRef.current += 0.05;
      
      ctx.clearRect(0, 0, width, height);
      
      const isAI = mode === 'ai';
      const isUser = mode === 'user';
      const numPills = 18;
      const spacing = width > 200 ? 8 : 4;
      const totalSpacing = (numPills - 1) * spacing;
      const pillWidth = Math.max(2, (width - totalSpacing) / numPills);
      
      const startX = (width - (numPills * pillWidth + totalSpacing)) / 2;
      
      let targetHeights = new Array(numPills).fill(8); // Base height
      
      if ((isUser || isAI) && analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        const step = Math.floor(dataArrayRef.current.length / numPills);
        for (let i = 0; i < numPills; i++) {
           // Average several points for smoother spectrum
           let sum = 0;
           for(let j=0; j<step; j++) {
               sum += dataArrayRef.current[(i * step) + j] || 0;
           }
           let val = sum / step;
           // Apply a bell curve envelope so the center reacts more
           let envelope = Math.sin(Math.PI * i / (numPills - 1));
           let normalized = (val / 255) * envelope;
           
           let finalHeight = 12 + normalized * (height - 30);
           // Boost AI mode slightly so it feels powerful
           if (isAI) finalHeight = 12 + normalized * (height - 10) * 1.3;
           
           targetHeights[i] = Math.min(finalHeight, height - 8);
        }
      } else {
        // Idle Simulation: very gentle breathing
        for (let i = 0; i < numPills; i++) {
          const envelope = Math.sin(Math.PI * i / (numPills - 1));
          const breathe = Math.sin(timeRef.current * 0.4) * 0.5 + 0.5;
          targetHeights[i] = 8 + breathe * envelope * 8; 
        }
      }
      
      // Draw Each Pill
      for (let i = 0; i < numPills; i++) {
        // Easing factor to remove jittering
        smoothedHeights[i] += (targetHeights[i] - smoothedHeights[i]) * 0.3;
        
        const pillHeight = smoothedHeights[i];
        const x = startX + i * (pillWidth + spacing);
        const y = (height - pillHeight) / 2;
        
        ctx.beginPath();
        const r = pillWidth / 2;
        ctx.roundRect(x, y, pillWidth, pillHeight, r);
        
        // Gradient Colors
        const gradient = ctx.createLinearGradient(0, y, 0, y + pillHeight);
        if (isUser) {
          gradient.addColorStop(0, isDarkMode ? '#4F8CFF' : '#3A7DFF');
          gradient.addColorStop(1, isDarkMode ? '#1E40AF' : '#0A2540');
          ctx.shadowColor = isDarkMode ? 'rgba(79, 140, 255, 0.6)' : 'rgba(58, 125, 255, 0.4)';
          ctx.shadowBlur = isDarkMode ? 12 : 8;
        } else if (isAI) {
          gradient.addColorStop(0, isDarkMode ? '#8DE4FF' : '#6FA8FF');
          gradient.addColorStop(1, isDarkMode ? '#3A7DFF' : '#3A7DFF');
          ctx.shadowColor = isDarkMode ? 'rgba(141, 228, 255, 0.8)' : 'rgba(111, 168, 255, 0.6)';
          ctx.shadowBlur = isDarkMode ? 20 : 12; // Glowing effect
        } else {
          gradient.addColorStop(0, isDarkMode ? '#334155' : '#E2E8F0');
          gradient.addColorStop(1, isDarkMode ? '#1E293B' : '#94A3B8');
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
        }
        
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.closePath();
      }
    };
    
    draw();
    
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [mode]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`relative w-full max-w-sm h-32 flex items-center justify-center p-4 rounded-3xl backdrop-blur-md transition-all duration-300 ${
        isDarkMode 
          ? 'bg-[#111827]/60 border border-gray-700/60 ' + (mode === 'ai' ? 'shadow-[0_8px_32px_rgba(141,228,255,0.15)]' : 'shadow-[0_4px_20px_rgba(0,0,0,0.3)]')
          : 'bg-white/40 border border-white/60 ' + (mode === 'ai' ? 'shadow-[0_8px_32px_rgba(111,168,255,0.2)]' : 'shadow-[0_8px_32px_rgba(0,0,0,0.04)]')
      }`}
    >
       <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} />
    </motion.div>
  );
};

export default VoiceSpectrum;
