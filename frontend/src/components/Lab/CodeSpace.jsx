import React, { useState, useRef, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaFolder, FaFolderOpen, FaFile, FaJs, FaPython, FaJava, FaHtml5, FaCss3Alt,
    FaPlay, FaStop, FaPlus, FaTimes, FaChevronDown, FaChevronRight,
    FaTerminal, FaCog, FaSearch, FaCode, FaBars, FaDownload,
    FaCopy, FaTrash, FaExpand, FaCompress, FaSun, FaMoon, FaCheck, FaGithub,
    FaReact, FaDocker, FaDatabase, FaMarkdown, FaSyncAlt,
    FaCodeBranch, FaUndo, FaStar, FaCloudDownloadAlt, FaKeyboard, FaColumns,
    FaGraduationCap, FaTrophy, FaLightbulb, FaRocket, FaUpload, FaEye, FaPalette,
    FaBookOpen, FaChartLine, FaMedal, FaCheckCircle, FaExclamationCircle, FaExclamationTriangle
} from 'react-icons/fa';
import { VscExtensions, VscSourceControl, VscAccount, VscSettingsGear, VscDebugAlt, VscRemote, VscGitCommit, VscSplitHorizontal } from 'react-icons/vsc';
import { SiTypescript, SiPrettier, SiEslint, SiTailwindcss, SiGit } from 'react-icons/si';
import XTerminal from './XTerminal';

// File icons based on extension
const getFileIcon = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'js':
        case 'jsx':
            return <FaJs className="text-yellow-400" />;
        case 'py':
            return <FaPython className="text-blue-400" />;
        case 'java':
            return <FaJava className="text-red-400" />;
        case 'html':
            return <FaHtml5 className="text-orange-500" />;
        case 'css':
            return <FaCss3Alt className="text-blue-500" />;
        case 'json':
            return <FaCode className="text-yellow-300" />;
        case 'md':
            return <FaFile className="text-gray-400" />;
        default:
            return <FaFile className="text-gray-400" />;
    }
};

// Language detection from filename
const getLanguageFromFile = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const langMap = {
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'py': 'python',
        'java': 'java',
        'cpp': 'cpp',
        'c': 'c',
        'cs': 'csharp',
        'go': 'go',
        'rs': 'rust',
        'rb': 'ruby',
        'html': 'html',
        'css': 'css',
        'json': 'json',
        'md': 'markdown'
    };
    return langMap[ext] || 'plaintext';
};

// Default project structure
const defaultFileSystem = {
    'project': {
        type: 'folder',
        children: {
            'src': {
                type: 'folder',
                children: {
                    'index.js': {
                        type: 'file',
                        content: `// Welcome to Planorah CodeSpace! 🚀
// Your VS Code-like IDE in the browser

console.log("Hello, World!");

// Try creating new files and folders
// Run your code with the Play button

function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet("Developer"));
`
                    },
                    'utils.js': {
                        type: 'file',
                        content: `// Utility functions

export const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
};

export const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
`
                    },
                    'styles.css': {
                        type: 'file',
                        content: `/* Main Styles */

body {
    font-family: 'Segoe UI', sans-serif;
    margin: 0;
    padding: 0;
    background: #1e1e1e;
    color: #d4d4d4;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}
`
                    }
                }
            },
            'README.md': {
                type: 'file',
                content: `# My Project

Welcome to your CodeSpace project!

## Getting Started

1. Create or edit files in the explorer
2. Use the terminal for commands
3. Run code with the play button

## Features

- ✨ Monaco Editor (VS Code editor)
- 📁 File Explorer
- 💻 Terminal Panel
- 🎨 Multiple Themes
- 🚀 Code Execution

Happy coding! 🎉
`
            },
            'package.json': {
                type: 'file',
                content: `{
  "name": "my-project",
  "version": "1.0.0",
  "description": "A CodeSpace project",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "test": "echo \\"No tests specified\\""
  },
  "author": "You",
  "license": "MIT"
}
`
            }
        }
    }
};

// Piston API language configurations
const pistonLanguages = {
    javascript: { piston: 'javascript', version: '18.15.0' },
    python: { piston: 'python', version: '3.10.0' },
    java: { piston: 'java', version: '15.0.2' },
    cpp: { piston: 'cpp', version: '10.2.0' },
    c: { piston: 'c', version: '10.2.0' },
    csharp: { piston: 'csharp', version: '6.12.0' },
    go: { piston: 'go', version: '1.16.2' },
    rust: { piston: 'rust', version: '1.68.2' },
    ruby: { piston: 'ruby', version: '3.0.1' }
};

// Available extensions
const availableExtensions = [
    {
        id: 'prettier',
        name: 'Prettier',
        description: 'Code formatter using prettier',
        author: 'Prettier',
        icon: <SiPrettier className="text-[#56b3b4]" />,
        downloads: '42.5M',
        rating: 4.8,
        installed: false,
        category: 'Formatters'
    },
    {
        id: 'eslint',
        name: 'ESLint',
        description: 'Integrates ESLint JavaScript into VS Code',
        author: 'Microsoft',
        icon: <SiEslint className="text-[#4b32c3]" />,
        downloads: '32.1M',
        rating: 4.7,
        installed: false,
        category: 'Linters'
    },
    {
        id: 'tailwindcss',
        name: 'Tailwind CSS IntelliSense',
        description: 'Intelligent Tailwind CSS tooling',
        author: 'Tailwind Labs',
        icon: <SiTailwindcss className="text-[#38bdf8]" />,
        downloads: '8.2M',
        rating: 4.9,
        installed: false,
        category: 'CSS'
    },
    {
        id: 'react-snippets',
        name: 'ES7+ React/Redux/React-Native snippets',
        description: 'Extensions for React, React-Native and Redux',
        author: 'dsznajder',
        icon: <FaReact className="text-[#61dafb]" />,
        downloads: '12.8M',
        rating: 4.6,
        installed: false,
        category: 'Snippets'
    },
    {
        id: 'gitlens',
        name: 'GitLens — Git supercharged',
        description: 'Supercharge Git within VS Code',
        author: 'GitKraken',
        icon: <SiGit className="text-[#f05032]" />,
        downloads: '28.4M',
        rating: 4.8,
        installed: false,
        category: 'Git'
    },
    {
        id: 'docker',
        name: 'Docker',
        description: 'Makes it easy to create, manage, and debug containerized applications',
        author: 'Microsoft',
        icon: <FaDocker className="text-[#2496ed]" />,
        downloads: '18.6M',
        rating: 4.7,
        installed: false,
        category: 'DevOps'
    },
    {
        id: 'python-ext',
        name: 'Python',
        description: 'IntelliSense, Linting, Debugging, Jupyter Notebooks',
        author: 'Microsoft',
        icon: <FaPython className="text-[#3776ab]" />,
        downloads: '98.2M',
        rating: 4.8,
        installed: false,
        category: 'Languages'
    },
    {
        id: 'typescript',
        name: 'TypeScript Importer',
        description: 'Automatic searches for TypeScript definitions',
        author: 'pmneo',
        icon: <SiTypescript className="text-[#3178c6]" />,
        downloads: '2.1M',
        rating: 4.5,
        installed: false,
        category: 'Languages'
    },
    {
        id: 'markdown-preview',
        name: 'Markdown Preview Enhanced',
        description: 'Markdown Preview with many features',
        author: 'Yiyi Wang',
        icon: <FaMarkdown className="text-gray-400" />,
        downloads: '4.5M',
        rating: 4.6,
        installed: false,
        category: 'Other'
    },
    {
        id: 'database-client',
        name: 'Database Client',
        description: 'Database manager for MySQL, PostgreSQL, SQLite',
        author: 'Weijan Chen',
        icon: <FaDatabase className="text-[#ffa500]" />,
        downloads: '3.2M',
        rating: 4.4,
        installed: false,
        category: 'Database'
    },
    {
        id: 'github-copilot',
        name: 'GitHub Copilot',
        description: 'Your AI pair programmer',
        author: 'GitHub',
        icon: <FaGithub className="text-white" />,
        downloads: '15.8M',
        rating: 4.9,
        installed: false,
        category: 'AI'
    },
    {
        id: 'code-runner',
        name: 'Code Runner',
        description: 'Run code snippet or code file for multiple languages',
        author: 'Jun Han',
        icon: <FaPlay className="text-green-500" />,
        downloads: '22.1M',
        rating: 4.7,
        installed: false,
        category: 'Other'
    }
];

export default function CodeSpace() {
    // State
    const [fileSystem, setFileSystem] = useState(defaultFileSystem);
    const [openTabs, setOpenTabs] = useState([{ path: 'project/src/index.js', name: 'index.js' }]);
    const [activeTab, setActiveTab] = useState('project/src/index.js');
    const [expandedFolders, setExpandedFolders] = useState({ 'project': true, 'project/src': true });
    const [showTerminal, setShowTerminal] = useState(true);
    const [terminalOutput, setTerminalOutput] = useState([
        { type: 'system', text: 'Welcome to Planorah CodeSpace Terminal!' },
        { type: 'system', text: 'Type "help" for available commands.' },
        { type: 'prompt', text: '$ ' }
    ]);
    const [terminalInput, setTerminalInput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [theme, setTheme] = useState('vs-dark');
    const [showSidebar, setShowSidebar] = useState(true);
    const [sidebarTab, setSidebarTab] = useState('files'); // files, search, git, extensions, debug
    const [searchQuery, setSearchQuery] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [fontSize, setFontSize] = useState(14);
    const [minimap, setMinimap] = useState(true);
    const [wordWrap, setWordWrap] = useState('off');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [contextMenu, setContextMenu] = useState(null);
    const [newItemModal, setNewItemModal] = useState(null); // { type: 'file' | 'folder', parentPath: string }
    const [newItemName, setNewItemName] = useState('');

    // Extensions state
    const [extensions, setExtensions] = useState(availableExtensions);
    const [extensionSearchQuery, setExtensionSearchQuery] = useState('');
    const [extensionCategory, setExtensionCategory] = useState('all');

    // Git state
    const [gitChanges, setGitChanges] = useState([
        { file: 'src/index.js', status: 'modified' },
        { file: 'src/utils.js', status: 'modified' },
    ]);
    const [gitBranch, setGitBranch] = useState('main');
    const [commitMessage, setCommitMessage] = useState('');
    const [stagedFiles, setStagedFiles] = useState([]);

    // Advanced IDE state
    const [splitView, setSplitView] = useState(false);
    const [secondaryActiveTab, setSecondaryActiveTab] = useState(null);
    const [showCommandPalette, setShowCommandPalette] = useState(false);
    const [commandQuery, setCommandQuery] = useState('');
    const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
    const [terminalTabs, setTerminalTabs] = useState([{ id: 1, name: 'Terminal 1' }]);
    const [activeTerminalTab, setActiveTerminalTab] = useState(1);

    // Learning Integration state
    const [showLearningPanel, setShowLearningPanel] = useState(false);
    const [currentChallenge, setCurrentChallenge] = useState(null);
    const [challengeProgress, setChallengeProgress] = useState({
        completed: 3,
        total: 10,
        streak: 5
    });

    // Portfolio state
    const [showPortfolioTemplates, setShowPortfolioTemplates] = useState(false);
    const [showLivePreview, setShowLivePreview] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const terminalRef = useRef(null);
    const editorRef = useRef(null);
    const fileInputRef = useRef(null);

    // Coding Challenges
    const codingChallenges = [
        {
            id: 1,
            title: 'Hello World',
            difficulty: 'Easy',
            points: 10,
            description: 'Write a function that returns "Hello, World!"',
            hint: 'Use console.log() or return statement',
            testCases: ['Output should be "Hello, World!"'],
            completed: true
        },
        {
            id: 2,
            title: 'Sum Two Numbers',
            difficulty: 'Easy',
            points: 15,
            description: 'Create a function that takes two numbers and returns their sum',
            hint: 'Use the + operator',
            testCases: ['sum(2, 3) should return 5', 'sum(-1, 1) should return 0'],
            completed: true
        },
        {
            id: 3,
            title: 'Reverse String',
            difficulty: 'Easy',
            points: 20,
            description: 'Write a function that reverses a string',
            hint: 'Try using split(), reverse(), and join() methods',
            testCases: ['reverse("hello") should return "olleh"'],
            completed: true
        },
        {
            id: 4,
            title: 'Palindrome Check',
            difficulty: 'Medium',
            points: 30,
            description: 'Check if a given string is a palindrome',
            hint: 'Compare the string with its reverse',
            testCases: ['isPalindrome("racecar") should return true'],
            completed: false
        },
        {
            id: 5,
            title: 'FizzBuzz',
            difficulty: 'Medium',
            points: 35,
            description: 'Implement the classic FizzBuzz problem',
            hint: 'Use modulo operator to check divisibility',
            testCases: ['Print Fizz for multiples of 3, Buzz for 5'],
            completed: false
        },
        {
            id: 6,
            title: 'Find Maximum',
            difficulty: 'Easy',
            points: 15,
            description: 'Find the maximum number in an array',
            hint: 'Use Math.max() with spread operator or loop',
            testCases: ['findMax([1, 5, 3]) should return 5'],
            completed: false
        },
        {
            id: 7,
            title: 'Array Sorting',
            difficulty: 'Medium',
            points: 40,
            description: 'Implement bubble sort algorithm',
            hint: 'Compare adjacent elements and swap if needed',
            testCases: ['sort([3, 1, 2]) should return [1, 2, 3]'],
            completed: false
        },
        {
            id: 8,
            title: 'Binary Search',
            difficulty: 'Hard',
            points: 50,
            description: 'Implement binary search algorithm',
            hint: 'Divide and conquer by comparing middle element',
            testCases: ['binarySearch([1,2,3,4,5], 3) should return 2'],
            completed: false
        }
    ];

    // Portfolio Templates
    const portfolioTemplates = [
        {
            id: 'modern',
            name: 'Modern Developer',
            description: 'Clean, modern portfolio with smooth animations',
            preview: '🎨',
            color: 'from-purple-500 to-pink-500',
            html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Portfolio</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header class="hero">
        <nav>
            <div class="logo">Portfolio</div>
            <ul>
                <li><a href="#about">About</a></li>
                <li><a href="#projects">Projects</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
        <div class="hero-content">
            <h1>Hi, I'm <span class="highlight">Your Name</span></h1>
            <p>Full Stack Developer | UI/UX Designer</p>
            <button class="cta-button">View My Work</button>
        </div>
    </header>
    
    <section id="about" class="section">
        <h2>About Me</h2>
        <p>I'm a passionate developer who loves creating beautiful and functional web applications.</p>
    </section>
    
    <section id="projects" class="section">
        <h2>My Projects</h2>
        <div class="project-grid">
            <div class="project-card">
                <h3>Project 1</h3>
                <p>Description of your awesome project</p>
            </div>
            <div class="project-card">
                <h3>Project 2</h3>
                <p>Another amazing project</p>
            </div>
        </div>
    </section>
    
    <section id="contact" class="section">
        <h2>Get In Touch</h2>
        <p>Feel free to reach out!</p>
    </section>
    
    <script src="script.js"></script>
</body>
</html>`,
            css: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    color: #eee;
    min-height: 100vh;
}

.hero {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 2rem;
}

nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
    background: linear-gradient(45deg, #f953c6, #b91d73);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

nav ul {
    display: flex;
    list-style: none;
    gap: 2rem;
}

nav a {
    color: #eee;
    text-decoration: none;
    transition: color 0.3s;
}

nav a:hover {
    color: #f953c6;
}

.hero-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
}

h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.highlight {
    background: linear-gradient(45deg, #f953c6, #b91d73);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.cta-button {
    margin-top: 2rem;
    padding: 1rem 2rem;
    background: linear-gradient(45deg, #f953c6, #b91d73);
    border: none;
    border-radius: 50px;
    color: white;
    font-size: 1rem;
    cursor: pointer;
    transition: transform 0.3s, box-shadow 0.3s;
}

.cta-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(249, 83, 198, 0.3);
}

.section {
    padding: 5rem 2rem;
    text-align: center;
}

.section h2 {
    font-size: 2rem;
    margin-bottom: 2rem;
    background: linear-gradient(45deg, #f953c6, #b91d73);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.project-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.project-card {
    background: rgba(255,255,255,0.1);
    padding: 2rem;
    border-radius: 15px;
    transition: transform 0.3s;
}

.project-card:hover {
    transform: translateY(-5px);
}`,
            js: `// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Add scroll animation
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop - sectionHeight / 2) {
            section.classList.add('active');
        }
    });
});

console.log('Portfolio loaded successfully!');`
        },
        {
            id: 'minimal',
            name: 'Minimalist',
            description: 'Simple and elegant single-page portfolio',
            preview: '✨',
            color: 'from-gray-600 to-gray-800',
            html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Minimal Portfolio</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <main>
        <h1>Your Name</h1>
        <p class="subtitle">Developer & Designer</p>
        <div class="links">
            <a href="#" class="link">GitHub</a>
            <a href="#" class="link">LinkedIn</a>
            <a href="#" class="link">Email</a>
        </div>
    </main>
</body>
</html>`,
            css: `body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #111;
    color: #fff;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0;
}

main {
    text-align: center;
}

h1 {
    font-size: 3rem;
    font-weight: 300;
    letter-spacing: 0.2em;
    margin: 0;
}

.subtitle {
    color: #888;
    margin: 1rem 0 2rem;
}

.links {
    display: flex;
    gap: 2rem;
    justify-content: center;
}

.link {
    color: #fff;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border: 1px solid #333;
    transition: all 0.3s;
}

.link:hover {
    background: #fff;
    color: #111;
}`,
            js: `console.log('Minimal portfolio loaded!');`
        },
        {
            id: 'creative',
            name: 'Creative Portfolio',
            description: 'Bold, colorful portfolio for creatives',
            preview: '🎭',
            color: 'from-yellow-500 to-red-500',
            html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Creative Portfolio</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <div class="intro">
            <h1>HELLO!</h1>
            <h2>I'm a Creative Developer</h2>
            <p>I build beautiful digital experiences</p>
        </div>
        <div class="gallery">
            <div class="item" style="--color: #ff6b6b">01</div>
            <div class="item" style="--color: #4ecdc4">02</div>
            <div class="item" style="--color: #ffe66d">03</div>
            <div class="item" style="--color: #95e1d3">04</div>
        </div>
    </div>
</body>
</html>`,
            css: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial Black', sans-serif;
    background: #0a0a0a;
    color: white;
    overflow-x: hidden;
}

.container {
    min-height: 100vh;
    padding: 4rem;
}

.intro {
    margin-bottom: 4rem;
}

h1 {
    font-size: 8rem;
    line-height: 1;
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #ffe66d);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

h2 {
    font-size: 2rem;
    color: #fff;
    margin: 1rem 0;
}

p {
    color: #888;
    font-weight: normal;
}

.gallery {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
}

.item {
    aspect-ratio: 1;
    background: var(--color);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    cursor: pointer;
    transition: transform 0.3s;
}

.item:hover {
    transform: scale(1.05) rotate(2deg);
}`,
            js: `document.querySelectorAll('.item').forEach((item, i) => {
    item.addEventListener('mouseenter', () => {
        item.style.transform = 'scale(1.1) rotate(' + (Math.random() * 10 - 5) + 'deg)';
    });
    item.addEventListener('mouseleave', () => {
        item.style.transform = '';
    });
});`
        },
        {
            id: 'developer',
            name: 'Developer Card',
            description: 'Terminal-style developer profile',
            preview: '💻',
            color: 'from-green-500 to-emerald-700',
            html: `<!DOCTYPE html>
<html>
<head>
    <title>Developer Profile</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="terminal">
        <div class="terminal-header">
            <span class="dot red"></span>
            <span class="dot yellow"></span>
            <span class="dot green"></span>
            <span class="title">developer@portfolio</span>
        </div>
        <div class="terminal-body">
            <p><span class="prompt">$</span> whoami</p>
            <p class="output">Your Name - Full Stack Developer</p>
            <p><span class="prompt">$</span> cat skills.txt</p>
            <p class="output">JavaScript, React, Node.js, Python</p>
            <p><span class="prompt">$</span> ls projects/</p>
            <p class="output">project1/  project2/  project3/</p>
            <p><span class="prompt">$</span> contact --email</p>
            <p class="output">your@email.com</p>
            <p><span class="prompt">$</span> <span class="cursor">_</span></p>
        </div>
    </div>
</body>
</html>`,
            css: `body {
    margin: 0;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #1a1a2e;
    font-family: 'Courier New', monospace;
}

.terminal {
    width: 600px;
    background: #0d1117;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}

.terminal-header {
    background: #161b22;
    padding: 10px 15px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
}

.red { background: #ff5f56; }
.yellow { background: #ffbd2e; }
.green { background: #27c93f; }

.title {
    color: #8b949e;
    margin-left: auto;
    font-size: 0.9rem;
}

.terminal-body {
    padding: 20px;
    color: #c9d1d9;
    line-height: 1.8;
}

.prompt {
    color: #27c93f;
}

.output {
    color: #58a6ff;
    margin-left: 20px;
}

.cursor {
    animation: blink 1s infinite;
}

@keyframes blink {
    50% { opacity: 0; }
}`,
            js: `// Typing animation
const cursor = document.querySelector('.cursor');
setInterval(() => {
    cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0';
}, 500);`
        }
    ];

    // Command Palette Commands
    const commands = [
        { id: 'file.new', label: 'File: New File', icon: <FaFile />, action: () => setNewItemModal({ type: 'file', parentPath: 'project' }) },
        { id: 'file.save', label: 'File: Save', icon: <FaCheck />, action: () => addTerminalOutput('system', 'File saved!') },
        { id: 'view.split', label: 'View: Split Editor', icon: <VscSplitHorizontal />, action: () => setSplitView(!splitView) },
        { id: 'view.terminal', label: 'View: Toggle Terminal', icon: <FaTerminal />, action: () => setShowTerminal(!showTerminal) },
        { id: 'view.sidebar', label: 'View: Toggle Sidebar', icon: <FaBars />, action: () => setShowSidebar(!showSidebar) },
        { id: 'view.fullscreen', label: 'View: Toggle Fullscreen', icon: <FaExpand />, action: () => setIsFullscreen(!isFullscreen) },
        { id: 'code.run', label: 'Run: Execute Code', icon: <FaPlay />, action: () => runCode() },
        { id: 'editor.format', label: 'Format Document', icon: <SiPrettier />, action: () => addTerminalOutput('system', 'Document formatted!') },
        { id: 'theme.toggle', label: 'Preferences: Toggle Theme', icon: theme === 'vs-dark' ? <FaSun /> : <FaMoon />, action: () => setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark') },
        { id: 'settings.open', label: 'Preferences: Open Settings', icon: <FaCog />, action: () => setShowSettings(true) },
        { id: 'keyboard.shortcuts', label: 'Keyboard Shortcuts', icon: <FaKeyboard />, action: () => setShowKeyboardShortcuts(true) },
        { id: 'learning.challenges', label: 'Learning: Open Challenges', icon: <FaTrophy />, action: () => { setShowLearningPanel(true); setSidebarTab('learning'); setShowSidebar(true); } },
        { id: 'portfolio.templates', label: 'Portfolio: Browse Templates', icon: <FaPalette />, action: () => setShowPortfolioTemplates(true) },
        { id: 'portfolio.preview', label: 'Portfolio: Live Preview', icon: <FaEye />, action: () => setShowLivePreview(true) },
    ];

    // Keyboard Shortcuts
    const keyboardShortcuts = [
        { key: 'Ctrl + Shift + P', action: 'Open Command Palette' },
        { key: 'Ctrl + S', action: 'Save File' },
        { key: 'Ctrl + N', action: 'New File' },
        { key: 'Ctrl + W', action: 'Close Tab' },
        { key: 'Ctrl + `', action: 'Toggle Terminal' },
        { key: 'Ctrl + B', action: 'Toggle Sidebar' },
        { key: 'Ctrl + \\', action: 'Split Editor' },
        { key: 'F5', action: 'Run Code' },
        { key: 'F11', action: 'Toggle Fullscreen' },
        { key: 'Ctrl + /', action: 'Toggle Comment' },
        { key: 'Ctrl + F', action: 'Find' },
        { key: 'Ctrl + H', action: 'Find and Replace' },
        { key: 'Alt + Up/Down', action: 'Move Line' },
        { key: 'Ctrl + D', action: 'Select Next Match' },
    ];

    // Keyboard event handler
    const handleKeyDown = useCallback((e) => {
        // Command Palette: Ctrl+Shift+P
        if (e.ctrlKey && e.shiftKey && e.key === 'P') {
            e.preventDefault();
            setShowCommandPalette(true);
        }
        // Toggle Terminal: Ctrl+`
        if (e.ctrlKey && e.key === '`') {
            e.preventDefault();
            setShowTerminal(prev => !prev);
        }
        // Toggle Sidebar: Ctrl+B
        if (e.ctrlKey && e.key === 'b') {
            e.preventDefault();
            setShowSidebar(prev => !prev);
        }
        // Split View: Ctrl+\
        if (e.ctrlKey && e.key === '\\') {
            e.preventDefault();
            setSplitView(prev => !prev);
        }
        // Run Code: F5
        if (e.key === 'F5') {
            e.preventDefault();
            runCode();
        }
        // Escape to close modals
        if (e.key === 'Escape') {
            setShowCommandPalette(false);
            setShowKeyboardShortcuts(false);
            setShowPortfolioTemplates(false);
            setShowLivePreview(false);
        }
    }, [theme, splitView]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Handle file upload
    const handleFileUpload = (e) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target.result;
                const newFs = JSON.parse(JSON.stringify(fileSystem));
                let current = newFs['project'].children;

                current[file.name] = {
                    type: 'file',
                    content: content
                };

                setFileSystem(newFs);
                openFile(`project/${file.name}`, file.name);
                addTerminalOutput('system', `Uploaded: ${file.name}`);
            };
            reader.readAsText(file);
        });
    };

    // Load portfolio template
    const loadTemplate = (template) => {
        const newFs = JSON.parse(JSON.stringify(fileSystem));
        let current = newFs['project'].children;

        current['index.html'] = { type: 'file', content: template.html };
        current['styles.css'] = { type: 'file', content: template.css };
        current['script.js'] = { type: 'file', content: template.js };

        setFileSystem(newFs);
        setSelectedTemplate(template);
        setShowPortfolioTemplates(false);
        openFile('project/index.html', 'index.html');
        addTerminalOutput('system', `Loaded template: ${template.name}`);
    };

    // Generate live preview HTML
    const generatePreviewHTML = () => {
        const htmlContent = getFileContent('project/index.html') || '<h1>No HTML file found</h1>';
        const cssContent = getFileContent('project/styles.css') || '';
        const jsContent = getFileContent('project/script.js') || '';

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>${cssContent}</style>
            </head>
            <body>
                ${htmlContent.replace(/<link[^>]*href=["']styles\.css["'][^>]*>/gi, '')
                .replace(/<script[^>]*src=["']script\.js["'][^>]*><\/script>/gi, '')}
                <script>${jsContent}</script>
            </body>
            </html>
        `;
    };

    // Get file content by path
    const getFileContent = (path) => {
        const parts = path.split('/');
        let current = fileSystem;
        for (const part of parts) {
            if (current[part]) {
                current = current[part].children || current[part];
            } else {
                return '';
            }
        }
        return current.content || '';
    };

    // Set file content by path
    const setFileContent = (path, content) => {
        const parts = path.split('/');
        const newFs = JSON.parse(JSON.stringify(fileSystem));
        let current = newFs;
        for (let i = 0; i < parts.length - 1; i++) {
            current = current[parts[i]].children || current[parts[i]];
        }
        if (current[parts[parts.length - 1]]) {
            current[parts[parts.length - 1]].content = content;
        }
        setFileSystem(newFs);
    };

    // Toggle folder expansion
    const toggleFolder = (path) => {
        setExpandedFolders(prev => ({
            ...prev,
            [path]: !prev[path]
        }));
    };

    // Open file in tab
    const openFile = (path, name) => {
        if (!openTabs.find(t => t.path === path)) {
            setOpenTabs([...openTabs, { path, name }]);
        }
        setActiveTab(path);
    };

    // Close tab
    const closeTab = (path, e) => {
        e?.stopPropagation();
        const newTabs = openTabs.filter(t => t.path !== path);
        setOpenTabs(newTabs);
        if (activeTab === path && newTabs.length > 0) {
            setActiveTab(newTabs[newTabs.length - 1].path);
        }
    };

    // Create new file/folder
    const createItem = () => {
        if (!newItemName.trim() || !newItemModal) return;

        const parts = newItemModal.parentPath.split('/');
        const newFs = JSON.parse(JSON.stringify(fileSystem));
        let current = newFs;

        for (const part of parts) {
            if (current[part]) {
                current = current[part].children || current[part];
            }
        }

        if (newItemModal.type === 'file') {
            current[newItemName] = {
                type: 'file',
                content: ''
            };
            // Open the new file
            openFile(`${newItemModal.parentPath}/${newItemName}`, newItemName);
        } else {
            current[newItemName] = {
                type: 'folder',
                children: {}
            };
            // Expand the new folder
            setExpandedFolders(prev => ({
                ...prev,
                [`${newItemModal.parentPath}/${newItemName}`]: true
            }));
        }

        setFileSystem(newFs);
        setNewItemModal(null);
        setNewItemName('');
    };

    // Delete file/folder
    const deleteItem = (path) => {
        const parts = path.split('/');
        const itemName = parts.pop();
        const newFs = JSON.parse(JSON.stringify(fileSystem));
        let current = newFs;

        for (const part of parts) {
            current = current[part].children || current[part];
        }

        delete current[itemName];
        setFileSystem(newFs);

        // Close tab if file was open
        closeTab(path);
    };

    // Run code
    const runCode = async () => {
        if (!activeTab) return;

        const language = getLanguageFromFile(activeTab);
        const langConfig = pistonLanguages[language];

        if (!langConfig) {
            addTerminalOutput('error', `Language "${language}" is not supported for execution.`);
            return;
        }

        setIsRunning(true);
        addTerminalOutput('system', `Running ${activeTab}...`);

        try {
            const code = getFileContent(activeTab);
            const response = await fetch('https://emkc.org/api/v2/piston/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    language: langConfig.piston,
                    version: langConfig.version,
                    files: [{ content: code }]
                })
            });

            const result = await response.json();

            if (result.run) {
                if (result.run.stdout) {
                    result.run.stdout.split('\n').forEach(line => {
                        if (line.trim()) addTerminalOutput('output', line);
                    });
                }
                if (result.run.stderr) {
                    result.run.stderr.split('\n').forEach(line => {
                        if (line.trim()) addTerminalOutput('error', line);
                    });
                }
                addTerminalOutput('system', `Process exited with code ${result.run.code}`);
            }
        } catch (error) {
            addTerminalOutput('error', `Execution failed: ${error.message}`);
        } finally {
            setIsRunning(false);
            addTerminalOutput('prompt', '$ ');
        }
    };

    // Add terminal output
    const addTerminalOutput = (type, text) => {
        setTerminalOutput(prev => [...prev, { type, text }]);
    };

    // Handle terminal command
    const handleTerminalCommand = (cmd) => {
        addTerminalOutput('input', `$ ${cmd}`);

        const args = cmd.trim().split(' ');
        const command = args[0].toLowerCase();

        switch (command) {
            case 'help':
                addTerminalOutput('output', 'Available commands:');
                addTerminalOutput('output', '  help     - Show this help message');
                addTerminalOutput('output', '  clear    - Clear terminal');
                addTerminalOutput('output', '  ls       - List files in current directory');
                addTerminalOutput('output', '  run      - Run current file');
                addTerminalOutput('output', '  echo     - Print text');
                addTerminalOutput('output', '  date     - Show current date');
                break;
            case 'clear':
                setTerminalOutput([{ type: 'system', text: 'Terminal cleared.' }]);
                break;
            case 'ls':
                addTerminalOutput('output', 'project/');
                addTerminalOutput('output', '├── src/');
                addTerminalOutput('output', '│   ├── index.js');
                addTerminalOutput('output', '│   ├── utils.js');
                addTerminalOutput('output', '│   └── styles.css');
                addTerminalOutput('output', '├── README.md');
                addTerminalOutput('output', '└── package.json');
                break;
            case 'run':
                runCode();
                return;
            case 'echo':
                addTerminalOutput('output', args.slice(1).join(' '));
                break;
            case 'date':
                addTerminalOutput('output', new Date().toString());
                break;
            case '':
                break;
            default:
                addTerminalOutput('error', `Command not found: ${command}`);
        }

        addTerminalOutput('prompt', '$ ');
    };

    // Handle terminal input
    const handleTerminalKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleTerminalCommand(terminalInput);
            setTerminalInput('');
        }
    };

    // Scroll terminal to bottom
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [terminalOutput]);

    // Download current file
    const downloadFile = () => {
        if (!activeTab) return;
        const content = getFileContent(activeTab);
        const filename = activeTab.split('/').pop();
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Copy to clipboard
    const copyToClipboard = () => {
        if (!activeTab) return;
        const content = getFileContent(activeTab);
        navigator.clipboard.writeText(content);
        addTerminalOutput('system', 'Code copied to clipboard!');
    };

    // Render file tree recursively
    const renderTree = (items, parentPath = '') => {
        return Object.entries(items).map(([name, item]) => {
            const path = parentPath ? `${parentPath}/${name}` : name;
            const isExpanded = expandedFolders[path];

            if (item.type === 'folder') {
                return (
                    <div key={path}>
                        <div
                            className="flex items-center gap-2 px-2 py-1 hover:bg-[#2a2d2e] cursor-pointer text-sm group"
                            onClick={() => toggleFolder(path)}
                            onContextMenu={(e) => {
                                e.preventDefault();
                                setContextMenu({ x: e.clientX, y: e.clientY, path, type: 'folder' });
                            }}
                        >
                            {isExpanded ? <FaChevronDown className="text-xs" /> : <FaChevronRight className="text-xs" />}
                            {isExpanded ? <FaFolderOpen className="text-yellow-500" /> : <FaFolder className="text-yellow-500" />}
                            <span>{name}</span>
                            <button
                                className="ml-auto opacity-0 group-hover:opacity-100 hover:text-blue-400"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setNewItemModal({ type: 'file', parentPath: path });
                                }}
                            >
                                <FaPlus className="text-xs" />
                            </button>
                        </div>
                        <AnimatePresence>
                            {isExpanded && item.children && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="ml-4"
                                >
                                    {renderTree(item.children, path)}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            } else {
                return (
                    <div
                        key={path}
                        className={`flex items-center gap-2 px-2 py-1 hover:bg-[#2a2d2e] cursor-pointer text-sm ml-4 group ${activeTab === path ? 'bg-[#37373d]' : ''}`}
                        onClick={() => openFile(path, name)}
                        onContextMenu={(e) => {
                            e.preventDefault();
                            setContextMenu({ x: e.clientX, y: e.clientY, path, type: 'file' });
                        }}
                    >
                        {getFileIcon(name)}
                        <span>{name}</span>
                    </div>
                );
            }
        });
    };

    // Sidebar content based on active tab
    const renderSidebarContent = () => {
        switch (sidebarTab) {
            case 'files':
                return (
                    <div className="text-gray-300">
                        <div className="flex items-center justify-between px-4 py-2 text-xs uppercase tracking-wider text-gray-500">
                            Explorer
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setNewItemModal({ type: 'file', parentPath: 'project' })}
                                    className="hover:text-white p-1"
                                    title="New File"
                                >
                                    <FaFile className="text-xs" />
                                </button>
                                <button
                                    onClick={() => setNewItemModal({ type: 'folder', parentPath: 'project' })}
                                    className="hover:text-white p-1"
                                    title="New Folder"
                                >
                                    <FaFolder className="text-xs" />
                                </button>
                            </div>
                        </div>
                        {renderTree(fileSystem)}
                    </div>
                );
            case 'search':
                return (
                    <div className="p-4">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search files..."
                                className="w-full bg-[#3c3c3c] border border-[#555] rounded px-9 py-2 text-sm focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        {searchQuery && (
                            <div className="mt-4 text-sm text-gray-400">
                                Search results for "{searchQuery}"...
                            </div>
                        )}
                    </div>
                );
            case 'git':
                return (
                    <div className="text-gray-300 h-full overflow-auto">
                        <div className="flex items-center justify-between px-4 py-2 text-xs uppercase tracking-wider text-gray-500">
                            Source Control
                            <div className="flex gap-1">
                                <button className="hover:text-white p-1" title="Refresh">
                                    <FaSyncAlt className="text-xs" />
                                </button>
                                <button className="hover:text-white p-1" title="Commit All">
                                    <FaCheck className="text-xs" />
                                </button>
                            </div>
                        </div>

                        {/* Branch selector */}
                        <div className="px-4 py-2 border-b border-[#333]">
                            <div className="flex items-center gap-2 text-sm">
                                <FaCodeBranch className="text-gray-500" />
                                <select
                                    value={gitBranch}
                                    onChange={(e) => setGitBranch(e.target.value)}
                                    className="bg-[#3c3c3c] border border-[#555] rounded px-2 py-1 text-xs flex-1"
                                >
                                    <option value="main">main</option>
                                    <option value="develop">develop</option>
                                    <option value="feature/new-feature">feature/new-feature</option>
                                </select>
                            </div>
                        </div>

                        {/* Commit message */}
                        <div className="px-4 py-2">
                            <input
                                type="text"
                                value={commitMessage}
                                onChange={(e) => setCommitMessage(e.target.value)}
                                placeholder="Message (press Enter to commit)"
                                className="w-full bg-[#3c3c3c] border border-[#555] rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && commitMessage.trim()) {
                                        addTerminalOutput('system', `Committed: "${commitMessage}"`);
                                        setCommitMessage('');
                                        setStagedFiles([]);
                                        setGitChanges([]);
                                    }
                                }}
                            />
                        </div>

                        {/* Staged Changes */}
                        {stagedFiles.length > 0 && (
                            <div className="px-2 py-1">
                                <div className="flex items-center justify-between px-2 py-1 text-xs text-gray-500">
                                    <span>STAGED CHANGES ({stagedFiles.length})</span>
                                    <button
                                        onClick={() => {
                                            setGitChanges([...gitChanges, ...stagedFiles.map(f => ({ file: f, status: 'modified' }))]);
                                            setStagedFiles([]);
                                        }}
                                        className="hover:text-white"
                                        title="Unstage All"
                                    >
                                        <FaUndo className="text-xs" />
                                    </button>
                                </div>
                                {stagedFiles.map((file, idx) => (
                                    <div key={idx} className="flex items-center gap-2 px-2 py-1 hover:bg-[#2a2d2e] text-sm group">
                                        <VscGitCommit className="text-green-500 text-xs" />
                                        <span className="flex-1 truncate">{file}</span>
                                        <button
                                            onClick={() => {
                                                setStagedFiles(stagedFiles.filter(f => f !== file));
                                                setGitChanges([...gitChanges, { file, status: 'modified' }]);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 hover:text-white"
                                        >
                                            <FaUndo className="text-xs" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Changes */}
                        <div className="px-2 py-1">
                            <div className="flex items-center justify-between px-2 py-1 text-xs text-gray-500">
                                <span>CHANGES ({gitChanges.length})</span>
                                <button
                                    onClick={() => {
                                        setStagedFiles([...stagedFiles, ...gitChanges.map(c => c.file)]);
                                        setGitChanges([]);
                                    }}
                                    className="hover:text-white"
                                    title="Stage All"
                                >
                                    <FaPlus className="text-xs" />
                                </button>
                            </div>
                            {gitChanges.map((change, idx) => (
                                <div key={idx} className="flex items-center gap-2 px-2 py-1 hover:bg-[#2a2d2e] text-sm group">
                                    <span className={`text-xs ${change.status === 'modified' ? 'text-yellow-500' : change.status === 'added' ? 'text-green-500' : 'text-red-500'}`}>
                                        {change.status === 'modified' ? 'M' : change.status === 'added' ? 'A' : 'D'}
                                    </span>
                                    <span className="flex-1 truncate">{change.file}</span>
                                    <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                                        <button
                                            onClick={() => {
                                                setStagedFiles([...stagedFiles, change.file]);
                                                setGitChanges(gitChanges.filter(c => c.file !== change.file));
                                            }}
                                            className="hover:text-green-400"
                                            title="Stage"
                                        >
                                            <FaPlus className="text-xs" />
                                        </button>
                                        <button className="hover:text-red-400" title="Discard">
                                            <FaUndo className="text-xs" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {gitChanges.length === 0 && stagedFiles.length === 0 && (
                                <div className="text-center text-gray-500 text-xs py-4">
                                    No changes detected
                                </div>
                            )}
                        </div>

                        {/* Recent Commits */}
                        <div className="px-2 py-1 border-t border-[#333] mt-2">
                            <div className="px-2 py-1 text-xs text-gray-500">RECENT COMMITS</div>
                            <div className="text-xs text-gray-400">
                                <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#2a2d2e]">
                                    <VscGitCommit className="text-blue-400" />
                                    <div className="flex-1">
                                        <div className="truncate">Initial commit</div>
                                        <div className="text-gray-600">2 hours ago</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#2a2d2e]">
                                    <VscGitCommit className="text-blue-400" />
                                    <div className="flex-1">
                                        <div className="truncate">Add project structure</div>
                                        <div className="text-gray-600">1 day ago</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'extensions':
                const filteredExtensions = extensions.filter(ext => {
                    const matchesSearch = ext.name.toLowerCase().includes(extensionSearchQuery.toLowerCase()) ||
                        ext.description.toLowerCase().includes(extensionSearchQuery.toLowerCase());
                    const matchesCategory = extensionCategory === 'all' || ext.category === extensionCategory;
                    return matchesSearch && matchesCategory;
                });

                const categories = ['all', ...new Set(extensions.map(e => e.category))];
                const installedCount = extensions.filter(e => e.installed).length;

                return (
                    <div className="text-gray-300 h-full overflow-auto">
                        <div className="px-4 py-2 text-xs uppercase tracking-wider text-gray-500">
                            Extensions
                        </div>

                        {/* Search */}
                        <div className="px-4 py-2">
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
                                <input
                                    type="text"
                                    value={extensionSearchQuery}
                                    onChange={(e) => setExtensionSearchQuery(e.target.value)}
                                    placeholder="Search extensions..."
                                    className="w-full bg-[#3c3c3c] border border-[#555] rounded px-8 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div className="px-4 py-1">
                            <select
                                value={extensionCategory}
                                onChange={(e) => setExtensionCategory(e.target.value)}
                                className="w-full bg-[#3c3c3c] border border-[#555] rounded px-2 py-1 text-xs"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat === 'all' ? 'All Categories' : cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Installed Section */}
                        {installedCount > 0 && (
                            <div className="px-2 py-1 border-b border-[#333]">
                                <div className="px-2 py-1 text-xs text-gray-500 flex items-center gap-2">
                                    <FaCheck className="text-green-500" />
                                    INSTALLED ({installedCount})
                                </div>
                                {extensions.filter(e => e.installed).map(ext => (
                                    <div key={ext.id} className="flex items-start gap-3 px-2 py-2 hover:bg-[#2a2d2e] rounded group">
                                        <div className="text-2xl mt-0.5">{ext.icon}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm truncate">{ext.name}</div>
                                            <div className="text-xs text-gray-500 truncate">{ext.author}</div>
                                            <div className="text-xs text-gray-400 mt-1 line-clamp-2">{ext.description}</div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setExtensions(extensions.map(e =>
                                                    e.id === ext.id ? { ...e, installed: false } : e
                                                ));
                                                addTerminalOutput('system', `Uninstalled: ${ext.name}`);
                                            }}
                                            className="px-2 py-1 text-xs bg-red-600/20 text-red-400 rounded hover:bg-red-600/40 opacity-0 group-hover:opacity-100"
                                        >
                                            Uninstall
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Available Extensions */}
                        <div className="px-2 py-1">
                            <div className="px-2 py-1 text-xs text-gray-500">
                                {extensionSearchQuery ? 'SEARCH RESULTS' : 'POPULAR EXTENSIONS'}
                            </div>
                            {filteredExtensions.filter(e => !e.installed).map(ext => (
                                <div key={ext.id} className="flex items-start gap-3 px-2 py-2 hover:bg-[#2a2d2e] rounded group">
                                    <div className="text-2xl mt-0.5">{ext.icon}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-sm truncate">{ext.name}</span>
                                            <span className="text-xs text-gray-500 bg-[#333] px-1.5 py-0.5 rounded">{ext.category}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 truncate">{ext.author}</div>
                                        <div className="text-xs text-gray-400 mt-1 line-clamp-2">{ext.description}</div>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <FaCloudDownloadAlt /> {ext.downloads}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FaStar className="text-yellow-500" /> {ext.rating}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setExtensions(extensions.map(e =>
                                                e.id === ext.id ? { ...e, installed: true } : e
                                            ));
                                            addTerminalOutput('system', `Installed: ${ext.name}`);
                                        }}
                                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        Install
                                    </button>
                                </div>
                            ))}
                            {filteredExtensions.filter(e => !e.installed).length === 0 && (
                                <div className="text-center text-gray-500 text-xs py-4">
                                    No extensions found
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'debug':
                return (
                    <div className="text-gray-300 h-full overflow-auto">
                        <div className="px-4 py-2 text-xs uppercase tracking-wider text-gray-500">
                            Run and Debug
                        </div>
                        <div className="p-4">
                            <button
                                onClick={runCode}
                                disabled={isRunning}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium disabled:bg-gray-600"
                            >
                                <FaPlay /> {isRunning ? 'Running...' : 'Run and Debug'}
                            </button>
                            <div className="mt-4 text-xs text-gray-500">
                                <div className="font-medium mb-2">Debug Console</div>
                                <div className="bg-[#1e1e1e] border border-[#333] rounded p-2 h-32 overflow-auto">
                                    {terminalOutput.slice(-5).map((line, i) => (
                                        <div key={i} className={`${line.type === 'error' ? 'text-red-400' : line.type === 'system' ? 'text-blue-400' : 'text-gray-400'}`}>
                                            {line.text}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-4 text-xs text-gray-500">
                                <div className="font-medium mb-2">Breakpoints</div>
                                <div className="text-gray-600 italic">No breakpoints set</div>
                            </div>
                        </div>
                    </div>
                );
            case 'learning':
                return (
                    <div className="text-gray-300 h-full overflow-auto">
                        <div className="flex items-center justify-between px-4 py-2 text-xs uppercase tracking-wider text-gray-500">
                            <span className="flex items-center gap-2">
                                <FaGraduationCap className="text-yellow-500" />
                                Learning Hub
                            </span>
                        </div>

                        {/* Progress Stats */}
                        <div className="px-4 py-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 mx-2 rounded-lg mb-3">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Your Progress</span>
                                <span className="text-xs text-gray-400">{challengeProgress.completed}/{challengeProgress.total}</span>
                            </div>
                            <div className="w-full bg-[#333] rounded-full h-2 mb-2">
                                <div
                                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                                    style={{ width: `${(challengeProgress.completed / challengeProgress.total) * 100}%` }}
                                />
                            </div>
                            <div className="flex items-center gap-4 text-xs">
                                <span className="flex items-center gap-1">
                                    <FaTrophy className="text-yellow-500" /> {challengeProgress.completed} completed
                                </span>
                                <span className="flex items-center gap-1">
                                    <FaChartLine className="text-green-500" /> {challengeProgress.streak} day streak
                                </span>
                            </div>
                        </div>

                        {/* Coding Challenges */}
                        <div className="px-2">
                            <div className="px-2 py-1 text-xs text-gray-500 flex items-center gap-2">
                                <FaTrophy className="text-yellow-500" />
                                CODING CHALLENGES
                            </div>
                            {codingChallenges.map(challenge => (
                                <div
                                    key={challenge.id}
                                    onClick={() => setCurrentChallenge(challenge)}
                                    className={`px-3 py-2 hover:bg-[#2a2d2e] rounded cursor-pointer mb-1 ${currentChallenge?.id === challenge.id ? 'bg-[#37373d]' : ''}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm flex items-center gap-2">
                                            {challenge.completed ? (
                                                <FaCheckCircle className="text-green-500" />
                                            ) : (
                                                <FaExclamationCircle className="text-gray-500" />
                                            )}
                                            {challenge.title}
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 rounded ${challenge.difficulty === 'Easy' ? 'bg-green-600/30 text-green-400' :
                                            challenge.difficulty === 'Medium' ? 'bg-yellow-600/30 text-yellow-400' :
                                                'bg-red-600/30 text-red-400'
                                            }`}>
                                            {challenge.difficulty}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <FaMedal /> {challenge.points} pts
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Current Challenge Details */}
                        {currentChallenge && (
                            <div className="px-4 py-3 border-t border-[#333] mt-2">
                                <h4 className="font-medium text-sm mb-2">{currentChallenge.title}</h4>
                                <p className="text-xs text-gray-400 mb-3">{currentChallenge.description}</p>

                                <div className="bg-[#1e1e1e] border border-[#333] rounded p-2 mb-3">
                                    <div className="text-xs text-gray-500 mb-1">💡 Hint</div>
                                    <div className="text-xs text-yellow-400">{currentChallenge.hint}</div>
                                </div>

                                <div className="text-xs text-gray-500 mb-2">Test Cases:</div>
                                {currentChallenge.testCases.map((test, i) => (
                                    <div key={i} className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                                        <FaCheck className="text-gray-600" /> {test}
                                    </div>
                                ))}

                                <button
                                    onClick={() => {
                                        addTerminalOutput('system', `Starting challenge: ${currentChallenge.title}`);
                                        // Create challenge file
                                        const newFs = JSON.parse(JSON.stringify(fileSystem));
                                        newFs['project'].children[`challenge_${currentChallenge.id}.js`] = {
                                            type: 'file',
                                            content: `// Challenge: ${currentChallenge.title}\n// ${currentChallenge.description}\n// Hint: ${currentChallenge.hint}\n\n// Write your solution below:\n\n`
                                        };
                                        setFileSystem(newFs);
                                        openFile(`project/challenge_${currentChallenge.id}.js`, `challenge_${currentChallenge.id}.js`);
                                    }}
                                    className="w-full mt-3 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-xs font-medium flex items-center justify-center gap-2"
                                >
                                    <FaRocket /> Start Challenge
                                </button>
                            </div>
                        )}
                    </div>
                );
            case 'portfolio':
                return (
                    <div className="text-gray-300 h-full overflow-auto">
                        <div className="flex items-center justify-between px-4 py-2 text-xs uppercase tracking-wider text-gray-500">
                            <span className="flex items-center gap-2">
                                <FaPalette className="text-pink-500" />
                                Portfolio Builder
                            </span>
                        </div>

                        {/* Upload Section */}
                        <div className="px-4 py-3">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".html,.css,.js"
                                multiple
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#3c3c3c] hover:bg-[#4c4c4c] border border-dashed border-[#555] rounded text-sm"
                            >
                                <FaUpload /> Upload HTML/CSS/JS Files
                            </button>
                        </div>

                        {/* Templates */}
                        <div className="px-2 py-1">
                            <div className="px-2 py-1 text-xs text-gray-500 flex items-center justify-between">
                                <span>TEMPLATES</span>
                                <button
                                    onClick={() => setShowPortfolioTemplates(true)}
                                    className="hover:text-white"
                                >
                                    View All
                                </button>
                            </div>
                            {portfolioTemplates.slice(0, 3).map(template => (
                                <div
                                    key={template.id}
                                    onClick={() => loadTemplate(template)}
                                    className={`px-3 py-2 hover:bg-[#2a2d2e] rounded cursor-pointer mb-1 ${selectedTemplate?.id === template.id ? 'bg-[#37373d] border-l-2 border-purple-500' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded bg-gradient-to-br ${template.color} flex items-center justify-center text-xl`}>
                                            {template.preview}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">{template.name}</div>
                                            <div className="text-xs text-gray-500">{template.description}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="px-4 py-3 border-t border-[#333] mt-2">
                            <button
                                onClick={() => setShowLivePreview(true)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium mb-2"
                            >
                                <FaEye /> Live Preview
                            </button>
                            <button
                                onClick={() => {
                                    // Download all portfolio files as zip
                                    const html = getFileContent('project/index.html');
                                    const css = getFileContent('project/styles.css');
                                    const js = getFileContent('project/script.js');

                                    // Create downloadable HTML with embedded styles/scripts
                                    const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <style>${css}</style>
</head>
<body>
${html.replace(/<link[^>]*>/gi, '').replace(/<script[^>]*src[^>]*><\/script>/gi, '')}
<script>${js}</script>
</body>
</html>`;

                                    const blob = new Blob([fullHtml], { type: 'text/html' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = 'portfolio.html';
                                    a.click();
                                    URL.revokeObjectURL(url);
                                    addTerminalOutput('system', 'Portfolio exported successfully!');
                                }}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium"
                            >
                                <FaDownload /> Export Portfolio
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={`flex flex-col h-[calc(100vh-80px)] bg-[#1e1e1e] text-white font-mono overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 h-screen' : ''}`}>
            {/* Top Menu Bar */}
            <div className="flex items-center justify-between px-4 py-1.5 bg-[#323233] text-sm border-b border-[#252526]">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowSidebar(!showSidebar)}
                        className="p-1 hover:bg-[#444] rounded"
                    >
                        <FaBars />
                    </button>
                    <span className="font-semibold flex items-center gap-2">
                        <FaCode className="text-blue-400" />
                        Planorah CodeSpace
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={runCode}
                        disabled={isRunning}
                        className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-medium ${isRunning ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                        {isRunning ? <FaStop /> : <FaPlay />}
                        {isRunning ? 'Running...' : 'Run'}
                    </button>
                    <button onClick={copyToClipboard} className="p-1.5 hover:bg-[#444] rounded" title="Copy Code">
                        <FaCopy />
                    </button>
                    <button onClick={downloadFile} className="p-1.5 hover:bg-[#444] rounded" title="Download">
                        <FaDownload />
                    </button>
                    <button
                        onClick={() => setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark')}
                        className="p-1.5 hover:bg-[#444] rounded"
                        title="Toggle Theme"
                    >
                        {theme === 'vs-dark' ? <FaSun /> : <FaMoon />}
                    </button>
                    <button
                        onClick={() => setSplitView(!splitView)}
                        className={`p-1.5 hover:bg-[#444] rounded ${splitView ? 'bg-[#555]' : ''}`}
                        title="Split Editor (Ctrl+\)"
                    >
                        <VscSplitHorizontal />
                    </button>
                    <button
                        onClick={() => setShowCommandPalette(true)}
                        className="p-1.5 hover:bg-[#444] rounded"
                        title="Command Palette (Ctrl+Shift+P)"
                    >
                        <FaKeyboard />
                    </button>
                    <button
                        onClick={() => setShowLivePreview(true)}
                        className="p-1.5 hover:bg-[#444] rounded"
                        title="Live Preview"
                    >
                        <FaEye />
                    </button>
                    <button
                        onClick={() => setShowSettings(true)}
                        className="p-1.5 hover:bg-[#444] rounded"
                        title="Settings"
                    >
                        <FaCog />
                    </button>
                    <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-1.5 hover:bg-[#444] rounded"
                        title="Toggle Fullscreen"
                    >
                        {isFullscreen ? <FaCompress /> : <FaExpand />}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Activity Bar - VS Code Style */}
                <div className="w-12 bg-[#333333] flex flex-col items-center py-1 border-r border-[#252526]">
                    {/* Top Icons */}
                    <button
                        onClick={() => { setShowSidebar(true); setSidebarTab('files'); }}
                        className={`relative w-full flex items-center justify-center py-3 transition-all ${sidebarTab === 'files' && showSidebar ? 'text-white' : 'text-gray-500 hover:text-white'}`}
                        title="Explorer (Ctrl+Shift+E)"
                    >
                        {sidebarTab === 'files' && showSidebar && <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-white rounded-r" />}
                        <FaFile className="text-xl" />
                    </button>
                    <button
                        onClick={() => { setShowSidebar(true); setSidebarTab('search'); }}
                        className={`relative w-full flex items-center justify-center py-3 transition-all ${sidebarTab === 'search' && showSidebar ? 'text-white' : 'text-gray-500 hover:text-white'}`}
                        title="Search (Ctrl+Shift+F)"
                    >
                        {sidebarTab === 'search' && showSidebar && <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-white rounded-r" />}
                        <FaSearch className="text-xl" />
                    </button>
                    <button
                        onClick={() => { setShowSidebar(true); setSidebarTab('git'); }}
                        className={`relative w-full flex items-center justify-center py-3 transition-all ${sidebarTab === 'git' && showSidebar ? 'text-white' : 'text-gray-500 hover:text-white'}`}
                        title="Source Control (Ctrl+Shift+G)"
                    >
                        {sidebarTab === 'git' && showSidebar && <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-white rounded-r" />}
                        <VscSourceControl className="text-xl" />
                        {gitChanges.length > 0 && (
                            <span className="absolute top-2 right-2 w-4 h-4 bg-[#007acc] rounded-full text-[10px] flex items-center justify-center">
                                {gitChanges.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => { setShowSidebar(true); setSidebarTab('debug'); }}
                        className={`relative w-full flex items-center justify-center py-3 transition-all ${sidebarTab === 'debug' && showSidebar ? 'text-white' : 'text-gray-500 hover:text-white'}`}
                        title="Run and Debug (Ctrl+Shift+D)"
                    >
                        {sidebarTab === 'debug' && showSidebar && <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-white rounded-r" />}
                        <VscDebugAlt className="text-xl" />
                    </button>
                    <button
                        onClick={() => { setShowSidebar(true); setSidebarTab('extensions'); }}
                        className={`relative w-full flex items-center justify-center py-3 transition-all ${sidebarTab === 'extensions' && showSidebar ? 'text-white' : 'text-gray-500 hover:text-white'}`}
                        title="Extensions (Ctrl+Shift+X)"
                    >
                        {sidebarTab === 'extensions' && showSidebar && <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-white rounded-r" />}
                        <VscExtensions className="text-xl" />
                    </button>

                    {/* Separator */}
                    <div className="w-8 h-px bg-[#4c4c4c] my-2" />

                    {/* Custom Panels */}
                    <button
                        onClick={() => { setShowSidebar(true); setSidebarTab('learning'); }}
                        className={`relative w-full flex items-center justify-center py-3 transition-all ${sidebarTab === 'learning' && showSidebar ? 'text-white' : 'text-gray-500 hover:text-white'}`}
                        title="Learning Hub"
                    >
                        {sidebarTab === 'learning' && showSidebar && <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-purple-500 rounded-r" />}
                        <FaGraduationCap className="text-xl" />
                    </button>
                    <button
                        onClick={() => { setShowSidebar(true); setSidebarTab('portfolio'); }}
                        className={`relative w-full flex items-center justify-center py-3 transition-all ${sidebarTab === 'portfolio' && showSidebar ? 'text-white' : 'text-gray-500 hover:text-white'}`}
                        title="Portfolio Builder"
                    >
                        {sidebarTab === 'portfolio' && showSidebar && <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-pink-500 rounded-r" />}
                        <FaPalette className="text-xl" />
                    </button>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Bottom Icons */}
                    <button className="w-full flex items-center justify-center py-3 text-gray-500 hover:text-white transition-all" title="Remote Explorer">
                        <VscRemote className="text-xl" />
                    </button>
                    <button className="w-full flex items-center justify-center py-3 text-gray-500 hover:text-white transition-all" title="Account">
                        <VscAccount className="text-xl" />
                    </button>
                    <button
                        onClick={() => setShowSettings(true)}
                        className="w-full flex items-center justify-center py-3 text-gray-500 hover:text-white transition-all"
                        title="Manage (Settings)"
                    >
                        <VscSettingsGear className="text-xl" />
                    </button>
                </div>

                {/* Sidebar */}
                <AnimatePresence>
                    {showSidebar && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 250, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="bg-[#252526] border-r border-[#1e1e1e] overflow-hidden"
                        >
                            <div className="w-[250px]">
                                {renderSidebarContent()}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Editor Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Tabs */}
                    <div className="flex bg-[#252526] border-b border-[#1e1e1e] overflow-x-auto">
                        {openTabs.map(tab => (
                            <div
                                key={tab.path}
                                onClick={() => setActiveTab(tab.path)}
                                className={`flex items-center gap-2 px-4 py-2 cursor-pointer text-sm border-r border-[#1e1e1e] min-w-max ${activeTab === tab.path ? 'bg-[#1e1e1e] text-white' : 'bg-[#2d2d2d] text-gray-400 hover:bg-[#2a2a2a]'}`}
                            >
                                {getFileIcon(tab.name)}
                                <span>{tab.name}</span>
                                <button
                                    onClick={(e) => closeTab(tab.path, e)}
                                    className="ml-2 hover:bg-[#444] p-0.5 rounded"
                                >
                                    <FaTimes className="text-xs" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Editor */}
                    <div className={`flex-1 relative ${splitView ? 'flex' : ''}`}>
                        {/* Primary Editor */}
                        <div className={splitView ? 'flex-1 border-r border-[#333]' : 'h-full'}>
                            {activeTab ? (
                                <Editor
                                    height="100%"
                                    language={getLanguageFromFile(activeTab)}
                                    value={getFileContent(activeTab)}
                                    onChange={(value) => setFileContent(activeTab, value || '')}
                                    theme={theme}
                                    options={{
                                        minimap: { enabled: minimap },
                                        fontSize: fontSize,
                                        wordWrap: wordWrap,
                                        padding: { top: 10 },
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                        lineNumbers: 'on',
                                        renderWhitespace: 'selection',
                                        bracketPairColorization: { enabled: true },
                                        cursorBlinking: 'smooth',
                                        smoothScrolling: true,
                                    }}
                                    onMount={(editor) => {
                                        editorRef.current = editor;
                                    }}
                                />
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-500">
                                    <div className="text-center">
                                        <FaCode className="text-6xl mx-auto mb-4 opacity-30" />
                                        <p className="text-lg">Open a file to start editing</p>
                                        <p className="text-sm mt-2">Select a file from the explorer</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Secondary Editor (Split View) */}
                        {splitView && (
                            <div className="flex-1 flex flex-col">
                                {/* Secondary Tabs */}
                                <div className="flex bg-[#252526] border-b border-[#1e1e1e] overflow-x-auto">
                                    {openTabs.filter(t => t.path !== activeTab).map(tab => (
                                        <div
                                            key={`secondary-${tab.path}`}
                                            onClick={() => setSecondaryActiveTab(tab.path)}
                                            className={`flex items-center gap-2 px-4 py-2 cursor-pointer text-sm border-r border-[#1e1e1e] min-w-max ${secondaryActiveTab === tab.path ? 'bg-[#1e1e1e] text-white' : 'bg-[#2d2d2d] text-gray-400 hover:bg-[#2a2a2a]'}`}
                                        >
                                            {getFileIcon(tab.name)}
                                            <span>{tab.name}</span>
                                        </div>
                                    ))}
                                </div>
                                {/* Secondary Editor Content */}
                                <div className="flex-1">
                                    {secondaryActiveTab ? (
                                        <Editor
                                            height="100%"
                                            language={getLanguageFromFile(secondaryActiveTab)}
                                            value={getFileContent(secondaryActiveTab)}
                                            onChange={(value) => setFileContent(secondaryActiveTab, value || '')}
                                            theme={theme}
                                            options={{
                                                minimap: { enabled: false },
                                                fontSize: fontSize,
                                                wordWrap: wordWrap,
                                                padding: { top: 10 },
                                                scrollBeyondLastLine: false,
                                                automaticLayout: true,
                                                lineNumbers: 'on',
                                            }}
                                        />
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                                            Select a file to compare
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Terminal Panel - Using XTerminal */}
                    {showTerminal && (
                        <div className="h-64 bg-[#1e1e1e] border-t border-[#333] flex flex-col resize-y overflow-hidden" style={{ minHeight: '100px', maxHeight: '500px' }}>
                            <XTerminal
                                fileSystem={fileSystem}
                                currentDir="/project"
                                theme={theme === 'vs-dark' ? 'dark' : 'light'}
                                onRunCode={runCode}
                                onCreateFile={(path, name) => {
                                    const newFs = JSON.parse(JSON.stringify(fileSystem));
                                    const parts = path.split('/');
                                    let current = newFs;
                                    for (let i = 0; i < parts.length - 1; i++) {
                                        current = current[parts[i]]?.children || current[parts[i]];
                                    }
                                    if (current) {
                                        current[name] = { type: 'file', content: '' };
                                        setFileSystem(newFs);
                                        openFile(path, name);
                                    }
                                }}
                                onCreateFolder={(path, name) => {
                                    const newFs = JSON.parse(JSON.stringify(fileSystem));
                                    const parts = path.split('/');
                                    let current = newFs;
                                    for (let i = 0; i < parts.length - 1; i++) {
                                        current = current[parts[i]]?.children || current[parts[i]];
                                    }
                                    if (current) {
                                        current[name] = { type: 'folder', children: {} };
                                        setFileSystem(newFs);
                                    }
                                }}
                                onDeleteItem={deleteItem}
                                onOpenFile={openFile}
                                getFileContent={getFileContent}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Status Bar - VS Code Style */}
            <div className="flex items-center justify-between px-2 py-0.5 bg-[#007acc] text-white text-[11px] select-none">
                {/* Left Side */}
                <div className="flex items-center">
                    {/* Remote Indicator */}
                    <button className="flex items-center gap-1.5 px-2 py-0.5 hover:bg-white/10 rounded-sm">
                        <VscRemote className="text-sm" />
                        <span>Codespace</span>
                    </button>

                    {/* Git Branch */}
                    <button className="flex items-center gap-1.5 px-2 py-0.5 hover:bg-white/10 rounded-sm">
                        <FaCodeBranch className="text-[10px]" />
                        <span>{gitBranch}</span>
                        <FaSyncAlt className="text-[9px]" />
                    </button>

                    {/* Problems */}
                    <button className="flex items-center gap-1.5 px-2 py-0.5 hover:bg-white/10 rounded-sm">
                        <FaExclamationCircle className="text-[10px]" />
                        <span>0</span>
                        <FaExclamationTriangle className="text-[10px] text-yellow-300" />
                        <span>0</span>
                    </button>
                </div>

                {/* Right Side */}
                <div className="flex items-center">
                    {/* Line & Column */}
                    <button className="px-2 py-0.5 hover:bg-white/10 rounded-sm">
                        Ln 1, Col 1
                    </button>

                    {/* Spaces */}
                    <button className="px-2 py-0.5 hover:bg-white/10 rounded-sm">
                        Spaces: 4
                    </button>

                    {/* Encoding */}
                    <button className="px-2 py-0.5 hover:bg-white/10 rounded-sm">
                        UTF-8
                    </button>

                    {/* Line Ending */}
                    <button className="px-2 py-0.5 hover:bg-white/10 rounded-sm">
                        LF
                    </button>

                    {/* Language Mode */}
                    {activeTab && (
                        <button className="px-2 py-0.5 hover:bg-white/10 rounded-sm">
                            {getLanguageFromFile(activeTab).charAt(0).toUpperCase() + getLanguageFromFile(activeTab).slice(1)}
                        </button>
                    )}

                    {/* Terminal Toggle */}
                    <button
                        onClick={() => setShowTerminal(!showTerminal)}
                        className={`flex items-center gap-1.5 px-2 py-0.5 hover:bg-white/10 rounded-sm ${showTerminal ? 'bg-white/10' : ''}`}
                    >
                        <FaTerminal className="text-[10px]" />
                        Terminal
                    </button>

                    {/* Notifications */}
                    <button className="px-2 py-0.5 hover:bg-white/10 rounded-sm">
                        <FaCheckCircle className="text-[10px]" />
                    </button>
                </div>
            </div>

            {/* Context Menu */}
            <AnimatePresence>
                {contextMenu && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setContextMenu(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed z-50 bg-[#252526] border border-[#454545] rounded shadow-lg py-1 min-w-[150px]"
                            style={{ top: contextMenu.y, left: contextMenu.x }}
                        >
                            {contextMenu.type === 'folder' && (
                                <>
                                    <button
                                        onClick={() => {
                                            setNewItemModal({ type: 'file', parentPath: contextMenu.path });
                                            setContextMenu(null);
                                        }}
                                        className="w-full px-4 py-1.5 text-left text-sm hover:bg-[#094771] flex items-center gap-2"
                                    >
                                        <FaFile className="text-xs" /> New File
                                    </button>
                                    <button
                                        onClick={() => {
                                            setNewItemModal({ type: 'folder', parentPath: contextMenu.path });
                                            setContextMenu(null);
                                        }}
                                        className="w-full px-4 py-1.5 text-left text-sm hover:bg-[#094771] flex items-center gap-2"
                                    >
                                        <FaFolder className="text-xs" /> New Folder
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => {
                                    deleteItem(contextMenu.path);
                                    setContextMenu(null);
                                }}
                                className="w-full px-4 py-1.5 text-left text-sm hover:bg-[#094771] flex items-center gap-2 text-red-400"
                            >
                                <FaTrash className="text-xs" /> Delete
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* New Item Modal */}
            <AnimatePresence>
                {newItemModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                        onClick={() => setNewItemModal(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#252526] border border-[#454545] rounded-lg p-6 w-80"
                        >
                            <h3 className="text-lg font-semibold mb-4">
                                New {newItemModal.type === 'file' ? 'File' : 'Folder'}
                            </h3>
                            <input
                                type="text"
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                placeholder={newItemModal.type === 'file' ? 'filename.js' : 'folder-name'}
                                className="w-full bg-[#3c3c3c] border border-[#555] rounded px-3 py-2 mb-4 focus:outline-none focus:border-blue-500"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && createItem()}
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setNewItemModal(null)}
                                    className="px-4 py-1.5 bg-[#3c3c3c] rounded hover:bg-[#4c4c4c]"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={createItem}
                                    className="px-4 py-1.5 bg-blue-600 rounded hover:bg-blue-700"
                                >
                                    Create
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Settings Modal */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                        onClick={() => setShowSettings(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#252526] border border-[#454545] rounded-lg p-6 w-96"
                        >
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <FaCog /> Settings
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Font Size</label>
                                    <input
                                        type="range"
                                        min="10"
                                        max="24"
                                        value={fontSize}
                                        onChange={(e) => setFontSize(Number(e.target.value))}
                                        className="w-full"
                                    />
                                    <span className="text-sm">{fontSize}px</span>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Theme</label>
                                    <select
                                        value={theme}
                                        onChange={(e) => setTheme(e.target.value)}
                                        className="w-full bg-[#3c3c3c] border border-[#555] rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="vs-dark">Dark (Default)</option>
                                        <option value="light">Light</option>
                                        <option value="hc-black">High Contrast</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Word Wrap</label>
                                    <select
                                        value={wordWrap}
                                        onChange={(e) => setWordWrap(e.target.value)}
                                        className="w-full bg-[#3c3c3c] border border-[#555] rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="off">Off</option>
                                        <option value="on">On</option>
                                        <option value="wordWrapColumn">Word Wrap Column</option>
                                    </select>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-400">Show Minimap</span>
                                    <button
                                        onClick={() => setMinimap(!minimap)}
                                        className={`w-12 h-6 rounded-full transition-colors ${minimap ? 'bg-blue-600' : 'bg-gray-600'}`}
                                    >
                                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${minimap ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowSettings(false)}
                                className="w-full mt-6 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                            >
                                Done
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Command Palette Modal */}
            <AnimatePresence>
                {showCommandPalette && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-start justify-center pt-24 z-50"
                        onClick={() => setShowCommandPalette(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: -20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: -20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#252526] border border-[#454545] rounded-lg w-[500px] max-h-[400px] overflow-hidden shadow-2xl"
                        >
                            <div className="p-3 border-b border-[#333]">
                                <div className="relative">
                                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input
                                        type="text"
                                        value={commandQuery}
                                        onChange={(e) => setCommandQuery(e.target.value)}
                                        placeholder="Type a command or search..."
                                        className="w-full bg-[#3c3c3c] border border-[#555] rounded px-9 py-2 text-sm focus:outline-none focus:border-blue-500"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div className="max-h-[300px] overflow-auto">
                                {commands
                                    .filter(cmd => cmd.label.toLowerCase().includes(commandQuery.toLowerCase()))
                                    .map(cmd => (
                                        <button
                                            key={cmd.id}
                                            onClick={() => {
                                                cmd.action();
                                                setShowCommandPalette(false);
                                                setCommandQuery('');
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-[#094771] flex items-center gap-3"
                                        >
                                            <span className="text-gray-400">{cmd.icon}</span>
                                            <span>{cmd.label}</span>
                                        </button>
                                    ))
                                }
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Keyboard Shortcuts Modal */}
            <AnimatePresence>
                {showKeyboardShortcuts && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                        onClick={() => setShowKeyboardShortcuts(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#252526] border border-[#454545] rounded-lg p-6 w-[500px] max-h-[600px] overflow-auto"
                        >
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <FaKeyboard /> Keyboard Shortcuts
                            </h3>
                            <div className="space-y-2">
                                {keyboardShortcuts.map((shortcut, i) => (
                                    <div key={i} className="flex items-center justify-between py-2 border-b border-[#333]">
                                        <span className="text-sm text-gray-300">{shortcut.action}</span>
                                        <kbd className="px-2 py-1 bg-[#3c3c3c] rounded text-xs font-mono">{shortcut.key}</kbd>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => setShowKeyboardShortcuts(false)}
                                className="w-full mt-6 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Portfolio Templates Modal */}
            <AnimatePresence>
                {showPortfolioTemplates && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                        onClick={() => setShowPortfolioTemplates(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#252526] border border-[#454545] rounded-lg p-6 w-[700px] max-h-[600px] overflow-auto"
                        >
                            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                                <FaPalette className="text-pink-500" /> Portfolio Templates
                            </h3>
                            <p className="text-gray-400 text-sm mb-6">Choose a template to start building your portfolio</p>

                            <div className="grid grid-cols-2 gap-4">
                                {portfolioTemplates.map(template => (
                                    <div
                                        key={template.id}
                                        onClick={() => loadTemplate(template)}
                                        className="group cursor-pointer bg-[#1e1e1e] rounded-lg overflow-hidden border border-[#333] hover:border-purple-500 transition-all"
                                    >
                                        <div className={`h-32 bg-gradient-to-br ${template.color} flex items-center justify-center text-5xl`}>
                                            {template.preview}
                                        </div>
                                        <div className="p-4">
                                            <h4 className="font-medium text-lg">{template.name}</h4>
                                            <p className="text-sm text-gray-400 mt-1">{template.description}</p>
                                            <button className="mt-3 text-sm text-purple-400 group-hover:text-purple-300 flex items-center gap-1">
                                                Use Template <FaRocket className="text-xs" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setShowPortfolioTemplates(false)}
                                className="w-full mt-6 px-4 py-2 bg-[#3c3c3c] rounded hover:bg-[#4c4c4c]"
                            >
                                Cancel
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Live Preview Modal */}
            <AnimatePresence>
                {showLivePreview && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 flex flex-col z-50"
                    >
                        <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#333]">
                            <div className="flex items-center gap-3">
                                <FaEye className="text-blue-400" />
                                <span className="font-medium">Live Preview</span>
                                <span className="text-xs text-gray-500">Auto-refreshes on code changes</span>
                            </div>
                            <button
                                onClick={() => setShowLivePreview(false)}
                                className="p-2 hover:bg-[#3c3c3c] rounded"
                            >
                                <FaTimes />
                            </button>
                        </div>
                        <div className="flex-1 p-4">
                            <div className="h-full bg-white rounded-lg overflow-hidden">
                                <iframe
                                    srcDoc={generatePreviewHTML()}
                                    className="w-full h-full border-0"
                                    title="Portfolio Preview"
                                    sandbox="allow-scripts"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
