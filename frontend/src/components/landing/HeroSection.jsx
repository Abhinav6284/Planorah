import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Zap, TrendingUp, CheckCircle2, Sparkles } from "lucide-react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  Environment,
  ContactShadows,
  PresentationControls,
  MeshTransmissionMaterial,
} from "@react-three/drei";

function useIsSmallScreen() {
  const [isSmall, setIsSmall] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 1024 : false
  );
  useEffect(() => {
    const update = () => setIsSmall(window.innerWidth < 1024);
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);
  return isSmall;
}

function PlanoraSphere() {
  const groupRef = useRef();
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.18;
      groupRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.28) * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[2.2, 0.38, 64, 128]} />
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={0.8}
          chromaticAberration={0.04}
          anisotropy={0.1}
          distortion={0.08}
          distortionScale={0.4}
          temporalDistortion={0.08}
          iridescence={0.8}
          iridescenceIOR={1.2}
          iridescenceThicknessRange={[0, 1200]}
          color="#D96C4A"
        />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <icosahedronGeometry args={[1, 0]} />
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={2}
          roughness={0.05}
          chromaticAberration={0.15}
          color="#1A1A1A"
        />
      </mesh>
    </group>
  );
}

function MobileOrbFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none">
      <div className="absolute w-80 h-80 rounded-full bg-terracotta/10 blur-3xl" />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        className="absolute w-64 h-64 rounded-full"
        style={{ border: "2.5px dashed rgba(217,108,74,0.30)" }}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute w-44 h-44 rounded-full"
        style={{ border: "1.5px solid rgba(217,108,74,0.50)" }}
      />

      {/* Inner ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        className="absolute w-28 h-28 rounded-full"
        style={{ border: "1px solid rgba(217,108,74,0.40)" }}
      />

      {/* Core glowing sphere */}
      <motion.div
        animate={{ scale: [1, 1.07, 1], opacity: [0.88, 1, 0.88] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="w-20 h-20 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 35% 35%, #E8956A, #D96C4A, #B85030)",
          boxShadow:
            "0 0 55px rgba(217,108,74,0.55), 0 0 110px rgba(217,108,74,0.18)",
        }}
      />

      {/* Charcoal diamond accent (icosahedron stand-in) */}
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute w-8 h-8 bg-[#1A1A1A]/80"
        style={{ clipPath: "polygon(50% 0%,100% 50%,50% 100%,0% 50%)" }}
      />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function HeroSection() {
  const isMobile = useIsSmallScreen();

  return (
    <section className="relative py-10 px-4 sm:px-6 bg-[#F5F1E8] dark:bg-charcoalDark overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute top-0 right-0 w-[45vw] h-[45vw] bg-terracotta/8 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[35vw] h-[35vw] bg-charcoal/5 dark:bg-white/3 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Hero Card */}
        <div className="mb-12 sm:mb-20 rounded-2xl sm:rounded-3xl border border-white/10 bg-charcoal dark:bg-charcoalMuted p-6 sm:p-10 shadow-darkSoft lg:p-14">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">

            {/* ── Left Column ── */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-5 sm:gap-6"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold tracking-widest uppercase text-terracotta bg-terracotta/10 rounded-full border border-terracotta/20">
                  <Zap className="w-3.5 h-3.5" />
                  AI-Powered Productivity
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                className="text-4xl sm:text-5xl lg:text-7xl font-playfair font-bold text-white leading-[1.05] tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                Master Your<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-terracotta to-[#E8956A]">
                  Daily Progress.
                </span>
              </motion.h1>

              {/* Sub-heading */}
              <motion.p
                className="text-base sm:text-lg text-gray-300 max-w-lg leading-relaxed font-outfit"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                AI-powered goal planning, structured daily tasks, real results.
                Transform ambitions into achievements with intelligent productivity.
              </motion.p>

              {/* CTA Buttons - BOLD & PROMINENT */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4 sm:gap-5 mt-6 sm:mt-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                {/* PRIMARY CTA - MASSIVE, GLOWING */}
                <Link to="/register" className="w-full sm:w-auto flex-1">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 60px rgba(217, 108, 74, 0.8)" }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full px-10 py-5 text-lg font-bold bg-gradient-to-r from-terracotta to-[#E8956A] text-white rounded-full shadow-2xl hover:shadow-terracotta/50 transition-all duration-300 flex items-center justify-center gap-3 group font-outfit relative overflow-hidden"
                  >
                    <Sparkles className="w-5 h-5 group-hover:animate-spin" />
                    Start Free Now
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </motion.button>
                </Link>

                {/* SECONDARY CTA - PRICING */}
                <a href="#pricing" className="w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full px-10 py-5 text-lg font-bold text-white border-2 border-white/40 rounded-full hover:border-white/70 transition-all duration-300 flex items-center justify-center gap-2 font-outfit backdrop-blur-sm"
                  >
                    View Plans & Pricing
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </a>
              </motion.div>

              {/* Trust badges below buttons */}
              <motion.div
                className="flex flex-wrap gap-3 sm:gap-4 mt-6 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-terracotta" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-terracotta" />
                  <span>Free forever plan</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-terracotta" />
                  <span>Cancel anytime</span>
                </div>
              </motion.div>

              {/* Stats Row - BOLD NUMBERS */}
              <motion.div
                className="grid grid-cols-3 gap-4 sm:gap-8 pt-10 sm:pt-12 border-t border-white/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="text-center"
                >
                  <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-terracotta to-[#E8956A] bg-clip-text text-transparent">5.0★</div>
                  <div className="text-gray-400 text-xs sm:text-sm mt-2 font-outfit">Avg Rating</div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="text-center"
                >
                  <div className="text-4xl sm:text-5xl font-bold text-white">10K+</div>
                  <div className="text-gray-400 text-xs sm:text-sm mt-2 font-outfit">Active Users</div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="text-center"
                >
                  <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-terracotta to-[#E8956A] bg-clip-text text-transparent">42%</div>
                  <div className="text-gray-400 text-xs sm:text-sm mt-2 font-outfit">Productivity +</div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* ── Right Column — 3-D Canvas (desktop) / CSS orb (mobile) ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative h-[320px] sm:h-[400px] lg:h-[580px] w-full"
            >
              {isMobile ? (
                /* ── Mobile/tablet: lightweight CSS orb, no WebGL ── */
                <MobileOrbFallback />
              ) : (
                /* ── Desktop: full 3-D scene ── */
                <div className="absolute inset-0 cursor-grab active:cursor-grabbing z-10">
                  <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
                    <Environment preset="city" />
                    <PresentationControls
                      global
                      rotation={[0, 0.3, 0]}
                      polar={[-0.4, 0.2]}
                      azimuth={[-1, 0.75]}
                      config={{ mass: 2, tension: 400 }}
                      snap={{ mass: 4, tension: 400 }}
                    >
                      <Float rotationIntensity={0.6} floatIntensity={1} speed={1.4}>
                        <PlanoraSphere />
                      </Float>
                    </PresentationControls>
                    <ContactShadows
                      position={[0, -3.5, 0]}
                      opacity={0.3}
                      scale={20}
                      blur={2}
                      far={4}
                    />
                  </Canvas>
                </div>
              )}

              {/* Floating Card 1 — Goals */}
              <motion.div
                animate={{ y: [-6, 6, -6] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="absolute left-0 top-6 sm:top-10 z-20 bg-white/10 backdrop-blur-xl border border-white/20 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-2xl"
              >
                <div className="flex gap-2 sm:gap-3 items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-terracotta to-[#E8956A] rounded-full flex items-center justify-center shadow-inner flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-[11px] sm:text-xs font-semibold text-white/90 font-outfit">Goals Achieved</div>
                    <div className="text-[10px] sm:text-[11px] text-terracotta mt-0.5 font-outfit">12 this week 🔥</div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Card 2 — Roadmap */}
              <motion.div
                animate={{ y: [6, -6, 6] }}
                transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
                className="absolute right-0 bottom-10 sm:bottom-16 z-20 bg-white/10 backdrop-blur-xl border border-white/20 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-2xl"
              >
                <div className="flex gap-2 sm:gap-3 items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-sage to-[#a3b99a] rounded-full flex items-center justify-center shadow-inner flex-shrink-0">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-[11px] sm:text-xs font-semibold text-white/90 font-outfit">AI Roadmap Ready</div>
                    <div className="text-[10px] sm:text-[11px] text-sage mt-0.5 font-outfit">On track for June ✨</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>

        {/* Trusted by */}
        <div className="text-center space-y-4 sm:space-y-6">
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-outfit">
            Trusted by ambitious people at
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 lg:gap-16">
            {["Google", "Microsoft", "Apple", "Amazon", "Meta"].map((company) => (
              <div
                key={company}
                className="text-gray-500 dark:text-gray-400 font-bold text-sm sm:text-base font-outfit"
              >
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
