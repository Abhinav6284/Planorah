import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function ScienceStation() {
    const [beakerColor, setBeakerColor] = useState('bg-blue-200');
    const [reaction, setReaction] = useState(null);

    const elements = [
        { id: 'acid', name: 'Hydrochloric Acid', color: 'bg-yellow-200', type: 'acid' },
        { id: 'base', name: 'Sodium Hydroxide', color: 'bg-purple-200', type: 'base' },
        { id: 'water', name: 'Distilled Water', color: 'bg-blue-100', type: 'neutral' },
        { id: 'indicator', name: 'Universal Indicator', color: 'bg-green-400', type: 'indicator' }
    ];

    const handleMix = (element) => {
        setReaction(`Adding ${element.name}...`);

        setTimeout(() => {
            if (element.type === 'acid') {
                setBeakerColor('bg-red-400');
                setReaction('Reaction: Solution turned Acidic (Red)!');
            } else if (element.type === 'base') {
                setBeakerColor('bg-purple-600');
                setReaction('Reaction: Solution turned Basic (Purple)!');
            } else if (element.type === 'indicator') {
                setBeakerColor('bg-green-400');
                setReaction('Reaction: Indicator added (Green).');
            } else {
                setBeakerColor('bg-blue-200');
                setReaction('Diluted with Water.');
            }
        }, 800);
    };

    return (
        <div className="min-h-full bg-gray-50">
            <div className="p-6 md:p-10 font-sans">
                <header className="mb-10">
                    <h1 className="text-3xl font-serif font-medium text-gray-900">Chemistry Lab: pH Simulator</h1>
                    <p className="text-gray-500">Mix elements to observe chemical changes.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Shelf */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4">Chemical Shelf</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {elements.map((el) => (
                                <motion.button
                                    key={el.id}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleMix(el)}
                                    className={`p-4 rounded-xl border border-gray-200 flex flex-col items-center gap-2 hover:shadow-md transition-all`}
                                >
                                    <div className={`w-12 h-12 rounded-full ${el.color} border-2 border-white shadow-sm`} />
                                    <span className="text-xs font-medium text-center">{el.name}</span>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Workspace */}
                    <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="absolute top-4 right-4 text-sm text-gray-400 font-mono">
                            Simulation Mode: Active
                        </div>

                        {/* Beaker */}
                        <div className="relative mt-10">
                            <div className="w-48 h-64 border-4 border-gray-300 border-t-0 rounded-b-3xl relative overflow-hidden bg-white/50 backdrop-blur-sm z-10">
                                {/* Liquid */}
                                <motion.div
                                    animate={{ height: '70%' }}
                                    className={`absolute bottom-0 left-0 right-0 ${beakerColor} transition-colors duration-1000 opacity-80`}
                                >
                                    {/* Bubbles */}
                                    <motion.div
                                        animate={{ y: [0, -20, 0], opacity: [0, 1, 0] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="absolute bottom-4 left-10 w-4 h-4 bg-white rounded-full opacity-50"
                                    />
                                    <motion.div
                                        animate={{ y: [0, -30, 0], opacity: [0, 1, 0] }}
                                        transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
                                        className="absolute bottom-8 right-12 w-3 h-3 bg-white rounded-full opacity-50"
                                    />
                                </motion.div>
                            </div>
                            {/* Beaker Gloss */}
                            <div className="absolute top-4 right-4 w-4 h-40 bg-white/20 rounded-full blur-sm z-20 pointer-events-none" />
                        </div>

                        {/* Reaction Log */}
                        <div className="mt-8 h-12 flex items-center justify-center">
                            {reaction && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={reaction}
                                    className="px-4 py-2 bg-black text-white rounded-full text-sm font-medium shadow-lg"
                                >
                                    {reaction}
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
