import React, { useState, useEffect } from 'react';

const ClockWidget = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();

    // Calculate rotation angles
    const secondDeg = (seconds / 60) * 360;
    const minuteDeg = ((minutes + seconds / 60) / 60) * 360;
    const hourDeg = ((hours % 12 + minutes / 60) / 12) * 360;

    const dateStr = time.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });

    const hourNumbers = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    return (
        <div className="h-full flex flex-col items-center justify-center relative p-3 sm:p-4">
            {/* Square Watch Container */}
            <div
                className="relative w-40 h-40 sm:w-52 sm:h-52 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#1a1a1a] transition-colors duration-300"
                style={{
                    boxShadow: `
                        0 25px 50px -12px rgba(0, 0, 0, 0.25),
                        0 12px 24px -8px rgba(0, 0, 0, 0.2),
                        0 4px 8px rgba(0, 0, 0, 0.15),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1),
                        inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                    `,
                    transform: 'translateY(-4px)',
                }}
            >
                {/* Inner Frame */}
                <div className="w-full h-full rounded-3xl p-2">
                    {/* Watch Face - White in light mode, Black in dark mode */}
                    <div className="w-full h-full rounded-2xl bg-[#EEEEEF] dark:bg-black relative overflow-hidden transition-colors duration-300">

                        {/* Minute Markers */}
                        {[...Array(60)].map((_, i) => (
                            <div
                                key={`tick-${i}`}
                                className="absolute w-full h-full"
                                style={{
                                    transform: `rotate(${i * 6}deg)`,
                                    left: '50%',
                                    top: '50%',
                                    marginLeft: '-50%',
                                    marginTop: '-50%',
                                }}
                            >
                                <div
                                    className={`absolute left-1/2 -translate-x-1/2 transition-colors duration-300 ${i % 5 === 0
                                        ? 'w-[2px] h-3 bg-black/80 dark:bg-white/80'
                                        : 'w-[1px] h-1.5 bg-black/20 dark:bg-white/20'
                                        }`}
                                    style={{ top: '8px' }}
                                />
                            </div>
                        ))}

                        {/* Hour Numbers */}
                        {hourNumbers.map((num, i) => {
                            const angle = (i * 30 - 90) * (Math.PI / 180);
                            const radius = 56;
                            const x = 50 + (radius / 76) * 50 * Math.cos(angle);
                            const y = 50 + (radius / 76) * 50 * Math.sin(angle);

                            return (
                                <span
                                    key={num}
                                    className={`absolute transition-colors duration-300 ${num % 3 === 0
                                        ? 'text-black dark:text-white text-sm font-medium'
                                        : 'text-black/40 dark:text-white/40 text-xs'
                                        }`}
                                    style={{
                                        left: `${x}%`,
                                        top: `${y}%`,
                                        transform: 'translate(-50%, -50%)',
                                    }}
                                >
                                    {num}
                                </span>
                            );
                        })}

                        {/* Center */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-black/10 dark:bg-white/20 z-30 transition-colors duration-300" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-orange-500 z-40" />

                        {/* Hour Hand */}
                        <div
                            className="absolute top-1/2 left-1/2 origin-bottom z-10"
                            style={{
                                width: '3px',
                                height: '28px',
                                marginLeft: '-1.5px',
                                marginTop: '-28px',
                                transform: `rotate(${hourDeg}deg)`,
                            }}
                        >
                            <div className="w-full h-full bg-black/90 dark:bg-white/90 rounded-sm transition-colors duration-300" />
                        </div>

                        {/* Minute Hand */}
                        <div
                            className="absolute top-1/2 left-1/2 origin-bottom z-10"
                            style={{
                                width: '2px',
                                height: '42px',
                                marginLeft: '-1px',
                                marginTop: '-42px',
                                transform: `rotate(${minuteDeg}deg)`,
                            }}
                        >
                            <div className="w-full h-full bg-black dark:bg-white rounded-sm transition-colors duration-300" />
                        </div>

                        {/* Second Hand */}
                        <div
                            className="absolute top-1/2 left-1/2 origin-bottom z-20"
                            style={{
                                width: '1px',
                                height: '48px',
                                marginLeft: '-0.5px',
                                marginTop: '-48px',
                                transform: `rotate(${secondDeg}deg)`,
                                transition: seconds === 0 ? 'none' : 'transform 0.1s linear',
                            }}
                        >
                            <div className="w-full h-full bg-orange-500" />
                        </div>

                        {/* Second hand tail */}
                        <div
                            className="absolute top-1/2 left-1/2 origin-top z-20"
                            style={{
                                width: '1px',
                                height: '10px',
                                marginLeft: '-0.5px',
                                transform: `rotate(${secondDeg}deg)`,
                                transition: seconds === 0 ? 'none' : 'transform 0.1s linear',
                            }}
                        >
                            <div className="w-full h-full bg-orange-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Date Below */}
            <div className="mt-5 text-base text-gray-800 dark:text-white font-bold tracking-wide transition-colors duration-300">
                {dateStr}
            </div>
        </div>
    );
};

export default ClockWidget;
