import React, { useEffect, useRef } from 'react';

const AudioVisualizer = ({ isSpeaking, audioLevel = 0 }) => {
    const canvasRef = useRef(null);
    const requestRef = useRef();

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width = canvas.width = canvas.offsetWidth;
        let height = canvas.height = canvas.offsetHeight;

        // Configuration for the waves
        const waves = [
            { color: 'rgba(20, 184, 166, 0.55)', speed: 0.012, amplitude: 52, frequency: 0.009, phase: 0 },   // Teal
            { color: 'rgba(56, 189, 248, 0.45)', speed: 0.02, amplitude: 38, frequency: 0.013, phase: 120 },  // Sky
            { color: 'rgba(251, 146, 60, 0.35)', speed: 0.016, amplitude: 30, frequency: 0.006, phase: 240 },  // Amber
            { color: 'rgba(244, 63, 94, 0.28)', speed: 0.022, amplitude: 22, frequency: 0.018, phase: 360 }   // Rose
        ];

        let time = 0;

        const animate = () => {
            // Resize handling (basic)
            if (canvas.width !== canvas.offsetWidth || canvas.height !== canvas.offsetHeight) {
                width = canvas.width = canvas.offsetWidth;
                height = canvas.height = canvas.offsetHeight;
            }

            ctx.clearRect(0, 0, width, height);

            // Audio reactivity
            // Smoothed target level
            const baseLevel = Math.max(0.08, Math.min(1, audioLevel * 1.4));
            const targetLevel = isSpeaking ? Math.max(0.2, audioLevel * 2) : baseLevel;

            waves.forEach((wave, index) => {
                ctx.beginPath();
                ctx.strokeStyle = wave.color;
                ctx.lineWidth = 2;

                // Adjust frequency and amplitude based on audio level
                const activeAmplitude = wave.amplitude * targetLevel * (isSpeaking ? 1.5 : 0.9);
                const activeFrequency = wave.frequency * (isSpeaking ? 1.0 : 0.7);

                for (let x = 0; x < width; x++) {
                    // Sine wave equation: y = A * sin(B * x + C) + D
                    // A = amplitude, B = frequency, C = phase + time, D = vertical shift

                    // Add some variation based on x to make it look less uniform
                    const envelope = Math.sin((x / width) * Math.PI); // Tapers ends to 0

                    const y = height / 2 +
                        Math.sin(x * activeFrequency + time * wave.speed + wave.phase) *
                        activeAmplitude * envelope;

                    if (x === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();
            });

            time += isSpeaking ? 5 + audioLevel * 10 : 2.5 + audioLevel * 6;
            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(requestRef.current);
        };
    }, [isSpeaking, audioLevel]);

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ width: '100%', height: '100%' }}
        />
    );
};

export default AudioVisualizer;
