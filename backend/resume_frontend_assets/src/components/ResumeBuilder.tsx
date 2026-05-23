import React, { useState } from 'react';
import { FaangMinimal } from './templates/FaangMinimal';
import { HarvardATS } from './templates/HarvardATS';
import { ModernExecutive } from './templates/ModernExecutive';
import { mockResumeData } from '../data/mockData';

const TEMPLATES = [
  { id: 'faang', name: 'FAANG Minimal', component: FaangMinimal },
  { id: 'harvard', name: 'Harvard Inspired', component: HarvardATS },
  { id: 'executive', name: 'Modern Executive', component: ModernExecutive },
];

const FONTS = [
  { id: 'font-sans', name: 'Inter / System Sans' },
  { id: 'font-serif', name: 'Merriweather / Serif' },
  { id: 'font-mono', name: 'IBM Plex Mono' },
];

const COLORS = [
  { id: 'text-blue-700', name: 'Executive Blue', bg: 'bg-blue-700' },
  { id: 'text-gray-900', name: 'Classic Black', bg: 'bg-gray-900' },
  { id: 'text-emerald-700', name: 'Emerald Green', bg: 'bg-emerald-700' },
  { id: 'text-indigo-700', name: 'Indigo', bg: 'bg-indigo-700' },
];

export const ResumeBuilder: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [selectedFont, setSelectedFont] = useState(FONTS[0].id);
  const [selectedColor, setSelectedColor] = useState(COLORS[0].id);
  const [zoom, setZoom] = useState(0.8);

  const CurrentTemplate = selectedTemplate.component;

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Sidebar Controls */}
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm z-10">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold tracking-tight text-gray-900">Planorah Studio</h2>
          <p className="text-sm text-gray-500 mt-1">Premium ATS Resume Builder</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Template Selection */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Templates</h3>
            <div className="space-y-3">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 flex items-center justify-between ${
                    selectedTemplate.id === template.id
                      ? 'border-black bg-black text-white shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="font-medium text-sm">{template.name}</span>
                  {selectedTemplate.id === template.id && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinelinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Typography */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Typography</h3>
            <div className="grid grid-cols-1 gap-2">
              {FONTS.map((font) => (
                <button
                  key={font.id}
                  onClick={() => setSelectedFont(font.id)}
                  className={`px-3 py-2 text-sm rounded-lg border text-left ${
                    selectedFont === font.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {font.name}
                </button>
              ))}
            </div>
          </section>

          {/* Colors */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Accent Color</h3>
            <div className="flex flex-wrap gap-3">
              {COLORS.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(color.id)}
                  className={`w-8 h-8 rounded-full border-2 focus:outline-none transition-transform hover:scale-110 ${color.bg} ${
                    selectedColor === color.id ? 'ring-2 ring-offset-2 ring-gray-400 border-white' : 'border-transparent'
                  }`}
                  title={color.name}
                />
              ))}
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <button className="w-full bg-black text-white font-medium py-2.5 rounded-lg hover:bg-gray-800 transition-colors shadow-sm flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinelinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export to PDF
          </button>
        </div>
      </aside>

      {/* Main Preview Area */}
      <main className="flex-1 flex flex-col relative">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            ATS Parsing Validated
          </div>
          
          <div className="flex items-center gap-4 bg-gray-100 px-3 py-1.5 rounded-lg">
            <button onClick={() => setZoom(z => Math.max(0.4, z - 0.1))} className="p-1 hover:bg-gray-200 rounded text-gray-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinelinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
            </button>
            <span className="text-xs font-medium text-gray-600 w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} className="p-1 hover:bg-gray-200 rounded text-gray-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinelinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
        </header>

        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-[#ECECEE] p-8 flex items-start justify-center">
          <div 
            className="transition-transform duration-300 origin-top shadow-2xl rounded-sm"
            style={{ transform: `scale(${zoom})` }}
          >
            {/* The Resume Paper */}
            <CurrentTemplate 
              data={mockResumeData} 
              fontFamily={selectedFont} 
              primaryColor={selectedColor} 
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResumeBuilder;
