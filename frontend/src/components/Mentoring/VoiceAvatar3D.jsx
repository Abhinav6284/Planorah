import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils, Vector3 } from 'three';
import { MeshDistortMaterial, Sphere } from '@react-three/drei';

/**
 * VoiceAvatar3D
 * A dynamic 3D React-Three-Fiber mesh that reacts to an audio level signal.
 * 
 * @param {boolean} isActive - Whether the AI is currently in an active call session.
 * @param {boolean} isSpeaking - Whether the AI is currently producing speech.
 * @param {number} audioLevel - A normalized 0.0 to 1.0 volume signal from the mic/AI stream.
 */
const VoiceAvatar3D = ({ isActive, isSpeaking, audioLevel = 0 }) => {
  const meshRef = useRef();
  const materialRef = useRef();

  // Target values for smooth interpolation
  const targetScale = useMemo(() => new Vector3(1, 1, 1), []);
  const targetDistortion = useRef(0);
  const targetSpeed = useRef(1);

  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current) return;

    // 1. Calculate Target State based on Audio & Flags
    let config = {
      scale: 1,
      distort: 0.1,    // Baseline calm surface
      speed: 1,        // Baseline spin/morph speed
      roughness: 0.2,
      metalness: 0.8
    };

    if (isActive) {
      if (isSpeaking) {
        // Highly reactive when speaking
        // Scale bounds [1.1, 1.45]
        // Distort bounds [0.3, 0.8]
        config.scale = 1.1 + Math.pow(audioLevel, 1.5) * 0.35;
        config.distort = 0.3 + (audioLevel * 0.5);
        config.speed = 3 + (audioLevel * 5);
      } else {
        // "Listening" state (subtle breathing logic)
        const breathe = Math.sin(state.clock.elapsedTime * 2) * 0.05;
        config.scale = 1.05 + breathe;
        config.distort = 0.2;
        config.speed = 2;
      }
    } else {
      // Idle state
      config.scale = 1;
      config.distort = 0.1;
      config.speed = 0.5;
    }

    // 2. Smooth Interpolation (Damping)
    targetScale.setScalar(config.scale);
    meshRef.current.scale.lerp(targetScale, delta * 8);

    // Smoothly interpolate distortion and speed to prevent jarring jumps when audio spikes
    targetDistortion.current = MathUtils.lerp(targetDistortion.current, config.distort, delta * 10);
    targetSpeed.current = MathUtils.lerp(targetSpeed.current, config.speed, delta * 5);

    // Apply to material
    materialRef.current.distort = targetDistortion.current;
    materialRef.current.speed = targetSpeed.current;

    // Let the sphere slowly rotate naturally as well
    meshRef.current.rotation.y += delta * (isActive ? 0.5 : 0.1);
    meshRef.current.rotation.x += delta * (isActive ? 0.2 : 0.05);
  });

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]}>
      <MeshDistortMaterial
        ref={materialRef}
        color={isActive ? (isSpeaking ? "#06b6d4" : "#3b82f6") : "#1e293b"} // Cyan speaking, Blue listening, Slate idle
        envMapIntensity={isActive ? 2 : 0.5}
        clearcoat={1}
        clearcoatRoughness={0.1}
        metalness={0.9}
        roughness={0.15}
        distort={0.1} // Initial values, overridden in useFrame
        speed={1}
        radius={1}
      />
    </Sphere>
  );
};

export default VoiceAvatar3D;
