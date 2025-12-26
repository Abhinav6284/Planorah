import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function ResourceHub() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const resources = {
        coding: {
            title: "Coding & Practice",
            icon: "💻",
            color: "blue",
            items: [
                { name: "Google Colab", url: "https://colab.research.google.com/", desc: "Best for coding practice, Python, ML exercises" },
                { name: "Colab Blank Notebook", url: "https://colab.research.google.com/#create=true", desc: "Start a new notebook instantly" },
                { name: "Kaggle Notebooks", url: "https://www.kaggle.com/code", desc: "Free GPU coding environment" },
                { name: "Jupyter Notebook", url: "https://jupyter.org/", desc: "Official Jupyter platform" }
            ]
        },
        math: {
            title: "Math Tools",
            icon: "📐",
            color: "purple",
            items: [
                { name: "Desmos Graphing", url: "https://www.desmos.com/calculator", desc: "Graph equations, visualize curves" },
                { name: "Desmos Geometry", url: "https://www.desmos.com/geometry", desc: "Geometric constructions" },
                { name: "GeoGebra", url: "https://www.geogebra.org/", desc: "Math + Geometry + 3D + CAS" },
                { name: "Symbolab", url: "https://www.symbolab.com/", desc: "Math solver with steps" }
            ]
        },
        science: {
            title: "Science Visualizations",
            icon: "🔬",
            color: "green",
            items: [
                { name: "PhET Simulations", url: "https://phet.colorado.edu/", desc: "Physics, Chemistry, Biology simulations" },
                { name: "MolView", url: "https://molview.org/", desc: "Chemical structures in 3D" },
                { name: "ChemDraw Online", url: "https://web.chemdraw.com/", desc: "Chemical drawing tool" }
            ]
        },
        biology: {
            title: "Anatomy & Biology",
            icon: "🧬",
            color: "red",
            items: [
                { name: "BioDigital Human", url: "https://www.biodigital.com/", desc: "3D Anatomy Explorer" },
                { name: "Visible Body", url: "https://www.visiblebody.com/", desc: "Premium 3D anatomy models" },
                { name: "OpenStax Biology", url: "https://openstax.org/details/books/biology-2e", desc: "Free biology textbook" }
            ]
        },
        reference: {
            title: "Reference Libraries",
            icon: "📚",
            color: "yellow",
            items: [
                { name: "LibreTexts", url: "https://libretexts.org/", desc: "All subjects: math, physics, chemistry, biology" },
                { name: "OpenStax", url: "https://openstax.org/subjects", desc: "Free textbooks for all major subjects" },
                { name: "Khan Academy", url: "https://www.khanacademy.org/", desc: "Learn anything, for free" }
            ]
        },
        chemistry: {
            title: "Chemistry Resources",
            icon: "⚗️",
            color: "indigo",
            items: [
                { name: "PubChem", url: "https://pubchem.ncbi.nlm.nih.gov/", desc: "Chemical database" },
                { name: "ChemSpider", url: "https://www.chemspider.com/", desc: "Compound data & spectra" }
            ]
        }
    };

    const colorVariants = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        purple: "bg-purple-50 text-purple-600 border-purple-100",
        green: "bg-green-50 text-green-600 border-green-100",
        red: "bg-red-50 text-red-600 border-red-100",
        yellow: "bg-yellow-50 text-yellow-600 border-yellow-100",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100"
    };

    const filteredResources = () => {
        let filtered = {};

        Object.keys(resources).forEach(key => {
            if (selectedCategory === 'all' || selectedCategory === key) {
                const category = resources[key];
                const filteredItems = category.items.filter(item =>
                    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.desc.toLowerCase().includes(searchQuery.toLowerCase())
                );

                if (filteredItems.length > 0) {
                    filtered[key] = { ...category, items: filteredItems };
                }
            }
        });

        return filtered;
    };

    return (
        <div className="min-h-full bg-gray-50">
            <div className="p-6 md:p-10 font-sans">
                <header className="mb-10">
                    <h1 className="text-3xl font-serif font-medium text-gray-900 mb-2">Resource Hub</h1>
                    <p className="text-gray-500">Your curated collection of learning tools and references</p>
                </header>

                {/* Search & Filter */}
                <div className="mb-8 space-y-4">
                    <input
                        type="text"
                        placeholder="Search resources..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 bg-white focus:border-black outline-none transition-all text-lg"
                    />

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === 'all'
                                ? 'bg-black text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            All
                        </button>
                        {Object.keys(resources).map(key => (
                            <button
                                key={key}
                                onClick={() => setSelectedCategory(key)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${selectedCategory === key
                                    ? 'bg-black text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                <span>{resources[key].icon}</span>
                                {resources[key].title}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Resources Grid */}
                <div className="space-y-10">
                    {Object.keys(filteredResources()).map(categoryKey => {
                        const category = filteredResources()[categoryKey];
                        return (
                            <div key={categoryKey}>
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="text-2xl">{category.icon}</span>
                                    {category.title}
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {category.items.map((item, index) => (
                                        <motion.a
                                            key={index}
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            whileHover={{ y: -4 }}
                                            className={`p-5 rounded-2xl border-2 ${colorVariants[category.color]} hover:shadow-lg transition-all group`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-gray-900">{item.name}</h3>
                                                <svg className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </div>
                                            <p className="text-sm text-gray-600">{item.desc}</p>
                                        </motion.a>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {Object.keys(filteredResources()).length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-lg">No resources found matching "{searchQuery}"</p>
                    </div>
                )}
            </div>
        </div>
    );
}
