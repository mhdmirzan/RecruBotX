import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, User, Briefcase, Play, ArrowRight } from "lucide-react";
import DemoInterviewModal from "./DemoInterviewModal";

const StarTryInterviewButton = ({ onClick }) => {
  const pathRef = useRef(null);

  useEffect(() => {
    if (pathRef.current) {
      const div = pathRef.current;
      div.style.setProperty(
        "--path",
        `path('M 0 0 H ${div.offsetWidth} V ${div.offsetHeight} H 0 V 0')`
      );
    }
  }, []);

  return (
    <button
      onClick={onClick}
      ref={pathRef}
      className="group relative isolate overflow-hidden inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-medium shadow-md hover:shadow-xl hover:shadow-cyan-500/20 hover:brightness-110 transition-all duration-300"
    >
      {/* Outer dark rim to provide high contrast boundary for the moving light */}
      <div className="absolute inset-0 bg-rose-500 z-0" />

      {/* Bright white moving light traveling along the dark boundary */}
      <div
        className="absolute inset-0 aspect-square animate-star-btn bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,1),transparent_60%)] z-25"
        style={{
          offsetPath: "var(--path)",
          offsetDistance: "0%",
          width: "90px",
        }}
      />

      {/* Inner main button body returning to the striking orange gradient */}
      <div className="absolute inset-[2px] rounded-full bg-gradient-to-r from-orange-400 to-rose-500 z-20" />

      <span className="relative z-30 flex items-center gap-2 text-white">
        <Play className="h-5 w-5 fill-current" />
        <span className="font-semibold tracking-wide">Try Interview</span>
      </span>
    </button>
  );
};

const highlightPills = [
  "Unbiased Evaluation",
  "Automated Screening",
  "Smart Insights",
];

const heroStats = [
  { label: "Candidates Processed", value: "10k+" },
  { label: "Time to Hire", value: "-60%" },
  { label: "Bias Reduction", value: "99%" },
];

const containerVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const statsVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.08 },
  },
};

const Hero = () => {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetMouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId;
    let time = 0;

    const themeColors = {
      backgroundTop: "rgba(245, 248, 255, 1)", // light blue tint
      backgroundBottom: "rgba(255, 255, 255, 1)", // white
      wavePalette: [
        { offset: 0, amplitude: 70, frequency: 0.003, color: "rgba(10, 42, 94, 0.6)", opacity: 0.35 },      // #0a2a5e
        { offset: Math.PI / 2, amplitude: 90, frequency: 0.0026, color: "rgba(20, 61, 122, 0.5)", opacity: 0.25 }, // lighter theme
        { offset: Math.PI, amplitude: 60, frequency: 0.0034, color: "rgba(30, 74, 158, 0.4)", opacity: 0.2 },
        { offset: Math.PI * 1.5, amplitude: 80, frequency: 0.0022, color: "rgba(10, 42, 94, 0.25)", opacity: 0.15 },
        { offset: Math.PI * 2, amplitude: 55, frequency: 0.004, color: "rgba(30, 74, 158, 0.2)", opacity: 0.1 },
      ],
    };

    const mouseInfluence = 70;
    const influenceRadius = 320;
    const smoothing = 0.1;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const recenterMouse = () => {
      const centerPoint = { x: canvas.width / 2, y: canvas.height / 2 };
      mouseRef.current = centerPoint;
      targetMouseRef.current = centerPoint;
    };

    const handleResize = () => {
      resizeCanvas();
      recenterMouse();
    };

    const handleMouseMove = (event) => {
      targetMouseRef.current = { x: event.clientX, y: event.clientY };
    };

    const handleMouseLeave = () => {
      recenterMouse();
    };

    resizeCanvas();
    recenterMouse();

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    const drawWave = (wave) => {
      ctx.save();
      ctx.beginPath();

      for (let x = 0; x <= canvas.width; x += 4) {
        const dx = x - mouseRef.current.x;
        const dy = canvas.height / 2 - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const influence = Math.max(0, 1 - distance / influenceRadius);
        const mouseEffect =
          influence *
          mouseInfluence *
          Math.sin(time * 0.001 + x * 0.01 + wave.offset);

        const y =
          canvas.height / 2 +
          Math.sin(x * wave.frequency + time * 0.002 + wave.offset) *
          wave.amplitude +
          Math.sin(x * wave.frequency * 0.4 + time * 0.003) *
          (wave.amplitude * 0.45) +
          mouseEffect;

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = wave.color;
      ctx.globalAlpha = wave.opacity;
      ctx.shadowBlur = 35;
      ctx.shadowColor = wave.color;
      ctx.stroke();

      ctx.restore();
    };

    const animate = () => {
      time += 1;

      mouseRef.current.x +=
        (targetMouseRef.current.x - mouseRef.current.x) * smoothing;
      mouseRef.current.y +=
        (targetMouseRef.current.y - mouseRef.current.y) * smoothing;

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, themeColors.backgroundTop);
      gradient.addColorStop(1, themeColors.backgroundBottom);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      themeColors.wavePalette.forEach(drawWave);

      animationId = window.requestAnimationFrame(animate);
    };

    animationId = window.requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <section
      className="relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden bg-white"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      />

      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-blue-100/40 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-indigo-100/30 blur-[120px]" />
        <div className="absolute top-1/2 left-1/4 h-[400px] w-[400px] rounded-full bg-[#0a2a5e]/5 blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-24 text-center md:px-8 lg:px-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full"
        >
          <motion.div
            variants={itemVariants}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#0a2a5e]/10 bg-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#0a2a5e]"
          >
            <Sparkles className="h-4 w-4 text-[#0a2a5e]" aria-hidden="true" />
            AI-Powered Recruitment Platform
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="mb-6 text-4xl font-semibold tracking-tight text-gray-900 md:text-6xl lg:text-7xl"
          >
            Redefining Hiring Through{" "}
            <span className="bg-gradient-to-r from-[#0a2a5e] via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Intelligent Conversations
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mx-auto mb-10 max-w-3xl text-base text-gray-600 md:text-xl md:leading-relaxed"
          >
            RecruBotX empowers you with AI-driven video interviews to hire faster,
            smarter, and fairer. From screening to selection, it streamlines the
            journey for HR and candidates alike.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mb-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              to="/candidate/signin"
              className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-medium bg-[#0a2a5e] text-white shadow-lg hover:bg-[#061a3d] hover:shadow-xl transition-all duration-300"
            >
              <User className="h-5 w-5" />
              Candidate
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
            <Link
              to="/recruiter/signin"
              className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-medium bg-white text-[#0a2a5e] border border-[#0a2a5e]/20 shadow-sm hover:shadow-md hover:bg-blue-50 transition-all duration-300"
            >
              <Briefcase className="h-5 w-5" />
              Recruiter
            </Link>
            <StarTryInterviewButton onClick={() => setShowDemoModal(true)} />
          </motion.div>

          <motion.ul
            variants={itemVariants}
            className="mb-12 flex flex-wrap items-center justify-center gap-4 text-xs uppercase tracking-[0.15em] text-gray-600"
          >
            {highlightPills.map((pill) => (
              <li
                key={pill}
                className="rounded-full border border-[#0a2a5e]/10 bg-white/50 px-5 py-2.5 backdrop-blur-sm"
              >
                {pill}
              </li>
            ))}
          </motion.ul>

          <motion.div
            variants={statsVariants}
            className="grid gap-4 rounded-3xl border border-[#0a2a5e]/10 bg-white/50 p-8 backdrop-blur-md sm:grid-cols-3 max-w-4xl mx-auto shadow-xl shadow-[#0a2a5e]/5"
          >
            {heroStats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="space-y-2"
              >
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0a2a5e]/70">
                  {stat.label}
                </div>
                <div className="text-4xl lg:text-5xl font-bold text-[#0a2a5e]">
                  {stat.value}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <DemoInterviewModal
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
      />
    </section>
  );
};

export default Hero;
