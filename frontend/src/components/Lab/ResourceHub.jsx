import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

function ResourceLogo({ itemName, itemUrl }) {
    const [sourceIndex, setSourceIndex] = useState(0);

    const logoSources = useMemo(() => {
        try {
            const domain = new URL(itemUrl).hostname.replace(/^www\./, '');
            return [
                `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`,
                `https://icons.duckduckgo.com/ip3/${domain}.ico`,
                `https://${domain}/favicon.ico`
            ];
        } catch {
            return [];
        }
    }, [itemUrl]);

    const currentSource = logoSources[sourceIndex];

    return (
        <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
            {currentSource ? (
                <img
                    src={currentSource}
                    alt={`${itemName} logo`}
                    className="w-6 h-6 object-contain"
                    loading="lazy"
                    onError={() => setSourceIndex((prev) => prev + 1)}
                />
            ) : (
                <span className="text-sm font-semibold text-gray-700">{itemName.charAt(0).toUpperCase()}</span>
            )}
        </div>
    );
}

export default function ResourceHub() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const resources = {
        coding: {
            title: "Coding & Practice",
            icon: "💻",
            color: "blue",
            items: [
                { name: "Google Colab", url: "https://colab.research.google.com/", desc: "Best for coding practice, Python, ML exercises (Free)" },
                { name: "Colab Blank Notebook", url: "https://colab.research.google.com/#create=true", desc: "Start a new notebook instantly (Free)" },
                { name: "Kaggle Notebooks", url: "https://www.kaggle.com/code", desc: "Free GPU coding environment" },
                { name: "Jupyter Notebook", url: "https://jupyter.org/", desc: "Official Jupyter platform" },
                { name: "Scratch", url: "https://scratch.mit.edu/", desc: "Block-based coding platform for STEM creation (Free)" },
                { name: "Code.org", url: "https://code.org/", desc: "Interactive coding courses and computer science activities (Free)" }
            ]
        },
        virtual_labs: {
            title: "Virtual Lab Platforms",
            icon: "🧪",
            color: "teal",
            items: [
                { name: "LabXchange Virtual Labs", url: "https://www.labxchange.org/", desc: "Harvard mini-labs for biology and chemistry with guided protocols (Free, account required)" },
                { name: "ExploreLearning Gizmos", url: "https://www.explorelearning.com/", desc: "550+ science and math simulations for grades 3-12 (Paid, free samples/trial)" },
                { name: "NOVA Labs", url: "https://www.pbslearningmedia.org/collection/nova-labs/", desc: "PBS science simulations and games tied to documentary content (Free)" },
                { name: "Concord Consortium", url: "https://learn.concord.org/", desc: "NGSS-aligned STEM interactives with data-driven inquiry (Free)" },
                { name: "Inq-ITS", url: "https://www.inqits.com/", desc: "Inquiry-based virtual science labs with self-grading and classroom integration (Free tier + Paid)" },
                { name: "3M Young Scientist Lab", url: "https://www.youngscientistlab.com/", desc: "Middle-school virtual experiments including wind energy design labs (Free)" }
            ]
        },
        math: {
            title: "Math Tools",
            icon: "📐",
            color: "purple",
            items: [
                { name: "Desmos Graphing", url: "https://www.desmos.com/calculator", desc: "Graph equations, visualize curves" },
                { name: "Desmos Geometry", url: "https://www.desmos.com/geometry", desc: "Geometric constructions" },
                { name: "GeoGebra", url: "https://www.geogebra.org/", desc: "Math + Geometry + 3D + CAS (Free)" },
                { name: "Symbolab", url: "https://www.symbolab.com/", desc: "Math solver with steps" },
                { name: "Wolfram|Alpha", url: "https://www.wolframalpha.com/", desc: "Computational engine for math and science queries (Free + Paid Pro)" },
                { name: "Wolfram Demonstrations", url: "https://demonstrations.wolfram.com/", desc: "Interactive STEM models across math, physics, and chemistry (Free)" }
            ]
        },
        science: {
            title: "Science Visualizations",
            icon: "🔬",
            color: "green",
            items: [
                { name: "PhET Simulations", url: "https://phet.colorado.edu/", desc: "Physics, Chemistry, Biology simulations" },
                { name: "MolView", url: "https://molview.org/", desc: "Chemical structures in 3D" },
                { name: "ChemDraw Online", url: "https://web.chemdraw.com/", desc: "Chemical drawing tool" },
                { name: "NASA Eyes", url: "https://eyes.nasa.gov/", desc: "Explore Earth, the solar system, and missions in interactive 3D (Free)" }
            ]
        },
        biology: {
            title: "Anatomy & Biology",
            icon: "🧬",
            color: "red",
            items: [
                { name: "BioDigital Human", url: "https://www.biodigital.com/", desc: "3D Anatomy Explorer (Free basic + Paid premium)" },
                { name: "Visible Body", url: "https://www.visiblebody.com/", desc: "Premium 3D anatomy models (Paid)" },
                { name: "OpenStax Biology", url: "https://openstax.org/details/books/biology-2e", desc: "Free biology textbook" },
                { name: "Zygote Body", url: "https://zygotebody.com/", desc: "Free web-based 3D human anatomy atlas" },
                { name: "CellCraft", url: "https://www.cellcraft.io/", desc: "Game-based cell biology simulation where students build and manage a cell (Free)" },
                { name: "HHMI BioInteractive", url: "https://www.biointeractive.org/", desc: "Virtual labs, animations, and interactives for biology and life science (Free)" }
            ]
        },
        chemistry: {
            title: "Chemistry Resources",
            icon: "⚗️",
            color: "indigo",
            items: [
                { name: "PubChem", url: "https://pubchem.ncbi.nlm.nih.gov/", desc: "Chemical database" },
                { name: "ChemSpider", url: "https://www.chemspider.com/", desc: "Compound data & spectra" },
                { name: "ChemCollective Virtual Lab", url: "https://chemcollective.org/vlab", desc: "Browser-based chemistry lab for reactions, pH, temperature, and titrations (Free)" },
                { name: "ChemCollective Simulations", url: "https://chemcollective.org/activities/simulations", desc: "Chemistry concept applets: periodic trends, titration curves, equilibrium, and more (Free)" },
                { name: "ChemViz3D", url: "https://www.chemviz3d.com/", desc: "Interactive 3D chemistry visualization and reaction animation tool (Free personal use)" },
                { name: "PhET Chemistry Sims", url: "https://phet.colorado.edu/en/simulations/filter?subjects=chemistry", desc: "Chemistry-focused PhET simulations (Free)" }
            ]
        },
        physics_engineering: {
            title: "Physics, Circuits & Engineering",
            icon: "⚙️",
            color: "orange",
            items: [
                { name: "Tinkercad Circuits", url: "https://www.tinkercad.com/circuits", desc: "Browser electronics and Arduino simulation with drag-drop components (Free, account required)" },
                { name: "EveryCircuit", url: "https://everycircuit.com/", desc: "Real-time animated analog and digital circuit simulator (Free limited + Paid)" },
                { name: "Falstad Circuit Simulator", url: "https://falstad.com/circuit/", desc: "Classic free browser circuit simulator with live current visualization" },
                { name: "DCACLab", url: "https://dcaclab.com/", desc: "Virtual breadboard lab with multimeter and oscilloscope tools (Free for students)" },
                { name: "PhET Circuit Construction Kit", url: "https://phet.colorado.edu/en/simulation/circuit-construction-kit-dc", desc: "Build and test DC/AC circuits interactively (Free)" },
                { name: "Algodoo", url: "https://www.algodoo.com/", desc: "2D physics sandbox for mechanics and experiment-style simulations (Free)" }
            ]
        },
        reference_management: {
            title: "Reference Management",
            icon: "🗂️",
            color: "teal",
            items: [
                { name: "Zotero", url: "https://www.zotero.org/", desc: "Free, open-source reference manager with 9,000+ citation styles and group libraries" },
                { name: "Mendeley", url: "https://www.mendeley.com/", desc: "Reference manager with PDF annotation, citation tools, and cloud sync (Free + Paid)" },
                { name: "EndNote", url: "https://endnote.com/", desc: "Advanced commercial reference manager with desktop, web, and AI-assisted features (Paid)" },
                { name: "Paperpile", url: "https://paperpile.com/", desc: "Chrome-based reference manager integrated with Google Docs and Drive (Trial + Paid)" },
                { name: "Qiqqa", url: "https://www.qiqqa.com/", desc: "PDF-focused research manager with tagging, metadata extraction, and bibliography generation (Free)" },
                { name: "Docear", url: "https://www.docear.org/", desc: "Open-source literature suite combining reference management and mind mapping (Free)" }
            ]
        },
        literature_discovery: {
            title: "Literature Discovery",
            icon: "🔎",
            color: "green",
            items: [
                { name: "Google Scholar", url: "https://scholar.google.com/", desc: "Free academic search engine for papers, theses, books, and conference literature" },
                { name: "Semantic Scholar", url: "https://www.semanticscholar.org/", desc: "AI-powered scholarly search and topic discovery across scientific literature (Free)" },
                { name: "ResearchRabbit", url: "https://www.researchrabbit.ai/", desc: "Visual research maps for papers, authors, and citation networks (Free tier)" },
                { name: "Connected Papers", url: "https://www.connectedpapers.com/", desc: "Graph-based tool to explore related papers and citation clusters (Free tier)" },
                { name: "Unpaywall", url: "https://unpaywall.org/", desc: "Browser extension that finds legal open-access versions of paywalled papers (Free)" },
                { name: "Scite", url: "https://scite.ai/", desc: "Smart citation index showing supporting, contrasting, and mentioning citation contexts (Free + Paid)" }
            ]
        },
        notes_organization: {
            title: "Notes & Organization",
            icon: "📝",
            color: "purple",
            items: [
                { name: "Evernote", url: "https://evernote.com/", desc: "Notebook-style notes, web clipping, and task organization with search and sync (Free + Paid)" },
                { name: "Microsoft OneNote", url: "https://www.onenote.com/", desc: "Free digital notebooks with sections, handwriting, and multimedia notes" },
                { name: "Notion", url: "https://www.notion.so/", desc: "All-in-one workspace for notes, databases, tasks, and collaboration (Free personal plan)" },
                { name: "Obsidian", url: "https://obsidian.md/", desc: "Markdown knowledge-base app with backlink graphs for connected research notes (Free + Paid sync/publish)" }
            ]
        },
        writing_productivity: {
            title: "Writing & Productivity",
            icon: "✍️",
            color: "indigo",
            items: [
                { name: "Grammarly", url: "https://www.grammarly.com/", desc: "AI writing assistant for grammar, clarity, tone, and citation support (Free + Paid)" },
                { name: "Overleaf", url: "https://www.overleaf.com/", desc: "Cloud LaTeX editor for collaborative STEM writing and publication workflows (Free + Paid)" },
                { name: "Google Docs", url: "https://docs.google.com/", desc: "Real-time collaborative writing with comments, suggestions, and add-ons (Free)" },
                { name: "ChatGPT", url: "https://chatgpt.com/", desc: "AI assistant for brainstorming, outlining, and explaining difficult concepts" },
                { name: "arXiv", url: "https://arxiv.org/", desc: "Open-access preprint repository for physics, math, CS, and related fields (Free)" },
                { name: "IEEE Xplore", url: "https://ieeexplore.ieee.org/", desc: "Engineering and technology research database (Institutional/Paid access)" }
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
        }
    };

    const colorVariants = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        purple: "bg-purple-50 text-purple-600 border-purple-100",
        green: "bg-green-50 text-green-600 border-green-100",
        red: "bg-red-50 text-red-600 border-red-100",
        yellow: "bg-yellow-50 text-yellow-600 border-yellow-100",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
        teal: "bg-teal-50 text-teal-600 border-teal-100",
        orange: "bg-orange-50 text-orange-600 border-orange-100"
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
                                    {category.items.map((item) => (
                                        <motion.a
                                            key={item.url}
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            whileHover={{ y: -4 }}
                                            className={`p-5 rounded-2xl border-2 ${colorVariants[category.color]} hover:shadow-lg transition-all group`}
                                        >
                                            <div className="flex justify-between items-start gap-3 mb-2">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <ResourceLogo itemName={item.name} itemUrl={item.url} />
                                                    <h3 className="font-bold text-gray-900 leading-tight">{item.name}</h3>
                                                </div>
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
