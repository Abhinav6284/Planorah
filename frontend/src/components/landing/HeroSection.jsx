import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Zap, TrendingUp, CheckCircle2 } from "lucide-react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  Environment,
  ContactShadows,
  PresentationControls,
  MeshTransmissionMaterial,
} from "@react-three/drei";

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
      {/* Outer Torus — Terracotta */}
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

      {/* Inner Icosahedron — Charcoal */}
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

export default function HeroSection() {
  return (
    <section className="relative py-10 px-6 bg-[#F5F1E8] dark:bg-charcoalDark overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute top-0 right-0 w-[45vw] h-[45vw] bg-terracotta/8 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[35vw] h-[35vw] bg-charcoal/5 dark:bg-white/3 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Hero Card */}
        <div className="mb-20 rounded-3xl border border-white/10 bg-charcoal dark:bg-charcoalMuted p-10 shadow-darkSoft lg:p-14">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* ── Left Column ── */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-6"
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
                className="text-5xl sm:text-6xl lg:text-7xl font-playfair font-bold text-white leading-[1.05] tracking-tight"
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
                className="text-lg text-gray-300 max-w-lg leading-relaxed font-outfit"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                AI-powered goal planning, structured daily tasks, real results.
                Transform ambitions into achievements with intelligent productivity.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4 mt-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto px-9 py-4 text-[15px] font-semibold bg-white text-charcoal rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 group font-outfit"
                  >
                    Start for Free
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
                <a href="#pricing">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto px-9 py-4 text-[15px] font-semibold text-white border border-white/20 rounded-full hover:bg-white/10 transition-all flex items-center justify-center gap-2 font-outfit"
                  >
                    View Pricing →
                  </motion.button>
                </a>
              </motion.div>

              {/* Stats Row */}
              <motion.div
                className="flex gap-8 pt-2 text-sm font-outfit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.8 }}
              >
                <div>
                  <div className="text-2xl font-bold text-white">5.0 ★</div>
                  <div className="text-gray-400">Avg Rating</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">10,000+</div>
                  <div className="text-gray-400">Active Users</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">42%</div>
                  <div className="text-gray-400">Productivity Boost</div>
                </div>
              </motion.div>
            </motion.div>

            {/* ── Right Column — 3D Canvas ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative h-[440px] lg:h-[580px] w-full"
            >
              {/* 3D Canvas */}
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

              {/* Floating Card 1 — Goals */}
              <motion.div
                animate={{ y: [-8, 8, -8] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="absolute left-0 top-10 z-20 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl"
              >
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-terracotta to-[#E8956A] rounded-full flex items-center justify-center shadow-inner flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white/90 font-outfit">Goals Achieved</div>
                    <div className="text-[11px] text-terracotta mt-0.5 font-outfit">12 this week 🔥</div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Card 2 — Roadmap */}
              <motion.div
                animate={{ y: [8, -8, 8] }}
                transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
                className="absolute right-0 bottom-16 z-20 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl"
              >
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-sage to-[#a3b99a] rounded-full flex items-center justify-center shadow-inner flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white/90 font-outfit">AI Roadmap Ready</div>
                    <div className="text-[11px] text-sage mt-0.5 font-outfit">On track for June ✨</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Trusted by */}
        <div className="text-center space-y-6">
          <div className="text-sm text-gray-500 dark:text-gray-400 font-outfit">Trusted by ambitious people at</div>
          <div className="flex flex-wrap items-center justify-center gap-10 lg:gap-16">
            {["Google", "Microsoft", "Apple", "Amazon", "Meta"].map((company) => (
              <div key={company} className="text-gray-500 dark:text-gray-400 font-bold text-base font-outfit">
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
