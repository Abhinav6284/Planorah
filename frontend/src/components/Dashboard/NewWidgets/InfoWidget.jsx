import React, { useState } from 'react';

const InfoWidget = () => {
    const [openSection, setOpenSection] = useState('Devices');

    const sections = [
        { id: 'Resources', label: 'Saved Resources' },
        { id: 'Devices', label: 'Study Devices', content: true },
        { id: 'Stats', label: 'Study Statistics' },
        { id: 'Certificates', label: 'Certificates & Awards' },
    ];

    const toggle = (id) => setOpenSection(openSection === id ? null : id);

    return (
        <div className="bg-[#FFFFF0] dark:bg-gray-800 rounded-[30px] p-6 h-full flex flex-col justify-center space-y-4">
            {sections.map((section) => (
                <div key={section.id} className="border-b border-dashed border-gray-200 dark:border-gray-700 last:border-0 pb-2 last:pb-0">
                    <button
                        onClick={() => toggle(section.id)}
                        className="w-full flex items-center justify-between text-left py-2 group"
                    >
                        <span className="text-gray-600 dark:text-gray-300 font-medium text-sm group-hover:text-black dark:group-hover:text-white transition-colors">
                            {section.label}
                        </span>
                        <span className={`text-gray-400 transform transition-transform ${openSection === section.id ? 'rotate-180' : ''}`}>
                            ⌄
                        </span>
                    </button>

                    {/* Content for Devices specific match */}
                    {section.content && openSection === section.id && (
                        <div className="mt-2 pl-2 flex items-center gap-3 animate-fadeIn">
                            <div className="w-10 h-8 bg-gray-900 rounded-md flex items-center justify-center">
                                {/* Macbook Icon Placeholder */}
                                <div className="w-6 h-4 bg-gray-200 rounded-sm"></div>
                            </div>
                            <div>
                                <div className="text-sm font-bold text-gray-900 dark:text-white">MacBook Air</div>
                                <div className="text-xs text-gray-500">Version M1</div>
                            </div>
                            <div className="flex-1 text-right text-gray-400">⋮</div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default InfoWidget;
