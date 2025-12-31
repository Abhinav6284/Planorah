import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaFolder, FaFolderOpen, FaFile, FaJs, FaPython, FaJava, FaHtml5, FaCss3Alt, 
    FaPlay, FaStop, FaPlus, FaTimes, FaChevronDown, FaChevronRight, 
    FaTerminal, FaCog, FaSearch, FaCode, FaBars, FaDownload,
    FaCopy, FaTrash, FaExpand, FaCompress, FaSun, FaMoon
} from 'react-icons/fa';
import { VscExtensions, VscSourceControl, VscAccount, VscSettingsGear } from 'react-icons/vsc';

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
    const [sidebarTab, setSidebarTab] = useState('files'); // files, search, git, extensions
    const [searchQuery, setSearchQuery] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [fontSize, setFontSize] = useState(14);
    const [minimap, setMinimap] = useState(true);
    const [wordWrap, setWordWrap] = useState('off');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [contextMenu, setContextMenu] = useState(null);
    const [newItemModal, setNewItemModal] = useState(null); // { type: 'file' | 'folder', parentPath: string }
    const [newItemName, setNewItemName] = useState('');
    
    const terminalRef = useRef(null);
    const editorRef = useRef(null);

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
                    <div className="p-4 text-center text-gray-400 text-sm">
                        <VscSourceControl className="text-4xl mx-auto mb-4 opacity-50" />
                        <p>Source Control</p>
                        <p className="text-xs mt-2">Git integration coming soon!</p>
                    </div>
                );
            case 'extensions':
                return (
                    <div className="p-4 text-center text-gray-400 text-sm">
                        <VscExtensions className="text-4xl mx-auto mb-4 opacity-50" />
                        <p>Extensions</p>
                        <p className="text-xs mt-2">Extension marketplace coming soon!</p>
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
                {/* Activity Bar */}
                <div className="w-12 bg-[#333333] flex flex-col items-center py-2 gap-2">
                    <button
                        onClick={() => { setShowSidebar(true); setSidebarTab('files'); }}
                        className={`p-2.5 rounded ${sidebarTab === 'files' && showSidebar ? 'bg-[#444] text-white' : 'text-gray-500 hover:text-white'}`}
                        title="Explorer"
                    >
                        <FaFile className="text-lg" />
                    </button>
                    <button
                        onClick={() => { setShowSidebar(true); setSidebarTab('search'); }}
                        className={`p-2.5 rounded ${sidebarTab === 'search' && showSidebar ? 'bg-[#444] text-white' : 'text-gray-500 hover:text-white'}`}
                        title="Search"
                    >
                        <FaSearch className="text-lg" />
                    </button>
                    <button
                        onClick={() => { setShowSidebar(true); setSidebarTab('git'); }}
                        className={`p-2.5 rounded ${sidebarTab === 'git' && showSidebar ? 'bg-[#444] text-white' : 'text-gray-500 hover:text-white'}`}
                        title="Source Control"
                    >
                        <VscSourceControl className="text-lg" />
                    </button>
                    <button
                        onClick={() => { setShowSidebar(true); setSidebarTab('extensions'); }}
                        className={`p-2.5 rounded ${sidebarTab === 'extensions' && showSidebar ? 'bg-[#444] text-white' : 'text-gray-500 hover:text-white'}`}
                        title="Extensions"
                    >
                        <VscExtensions className="text-lg" />
                    </button>
                    <div className="flex-1" />
                    <button className="p-2.5 text-gray-500 hover:text-white" title="Account">
                        <VscAccount className="text-lg" />
                    </button>
                    <button
                        onClick={() => setShowSettings(true)}
                        className="p-2.5 text-gray-500 hover:text-white"
                        title="Settings"
                    >
                        <VscSettingsGear className="text-lg" />
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
                    <div className="flex-1 relative">
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

                    {/* Terminal Panel */}
                    {showTerminal && (
                        <div className="h-48 bg-[#1e1e1e] border-t border-[#333] flex flex-col">
                            <div className="flex items-center justify-between px-4 py-1 bg-[#252526] text-xs">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1 text-white">
                                        <FaTerminal />
                                        Terminal
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setTerminalOutput([{ type: 'system', text: 'Terminal cleared.' }, { type: 'prompt', text: '$ ' }])}
                                        className="hover:text-white text-gray-400"
                                        title="Clear"
                                    >
                                        <FaTrash className="text-xs" />
                                    </button>
                                    <button
                                        onClick={() => setShowTerminal(false)}
                                        className="hover:text-white text-gray-400"
                                        title="Close Terminal"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            </div>
                            <div ref={terminalRef} className="flex-1 p-2 font-mono text-sm overflow-auto">
                                {terminalOutput.map((line, i) => (
                                    <div
                                        key={i}
                                        className={`${line.type === 'error' ? 'text-red-400' : line.type === 'system' ? 'text-blue-400' : line.type === 'input' ? 'text-yellow-400' : line.type === 'prompt' ? 'text-green-400' : 'text-gray-300'}`}
                                    >
                                        {line.text}
                                    </div>
                                ))}
                                <div className="flex items-center">
                                    <span className="text-green-400">$ </span>
                                    <input
                                        type="text"
                                        value={terminalInput}
                                        onChange={(e) => setTerminalInput(e.target.value)}
                                        onKeyDown={handleTerminalKeyDown}
                                        className="flex-1 bg-transparent outline-none text-gray-300 ml-1"
                                        autoFocus
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between px-4 py-0.5 bg-[#007acc] text-white text-xs">
                <div className="flex items-center gap-4">
                    <span>Planorah CodeSpace</span>
                    {activeTab && (
                        <>
                            <span>|</span>
                            <span>{getLanguageFromFile(activeTab).toUpperCase()}</span>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowTerminal(!showTerminal)}
                        className="hover:bg-[#1177bb] px-2 py-0.5 rounded flex items-center gap-1"
                    >
                        <FaTerminal />
                        Terminal
                    </button>
                    <span>UTF-8</span>
                    <span>Spaces: 4</span>
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
        </div>
    );
}
