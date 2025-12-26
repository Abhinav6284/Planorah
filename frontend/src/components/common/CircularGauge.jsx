import React from "react";

const CircularGauge = ({ score }) => {
    const radius = 50;
    const stroke = 8;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    const getColor = (s) => s >= 80 ? "#22c55e" : s >= 50 ? "#eab308" : "#ef4444";
    const color = getColor(score);

    return (
        <div className="relative flex flex-col items-center justify-center p-4">
            <svg
                height={radius * 2}
                width={radius * 2}
                className="transform -rotate-90"
            >
                <circle
                    stroke="#e5e7eb"
                    strokeWidth={stroke}
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <circle
                    stroke={color}
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset, transition: "stroke-dashoffset 1s ease-in-out" }}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <span className="text-3xl font-bold" style={{ color }}>{score}</span>
                <div className="text-xs text-gray-400">/100</div>
            </div>

            <div className="mt-2 text-sm font-medium text-gray-500">
                {score >= 80 ? "Excellent" : score >= 50 ? "Good" : "Needs Work"}
            </div>
        </div>
    );
};

export default CircularGauge;
