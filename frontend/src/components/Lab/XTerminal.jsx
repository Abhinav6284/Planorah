import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import 'xterm/css/xterm.css';
import { FaPlus, FaTimes, FaTerminal, FaChevronDown, FaCircle, FaWifi } from 'react-icons/fa';

const XTerminal = ({
    fileSystem,
    currentDir = '/project',
    onRunCode,
    onCreateFile,
    onCreateFolder,
    onDeleteItem,
    onOpenFile,
    getFileContent,
    theme = 'dark'
}) => {
    const terminalRef = useRef(null);
    const xtermRef = useRef(null);
    const fitAddonRef = useRef(null);
    const wsRef = useRef(null);
    const [tabs, setTabs] = useState([{ id: 1, name: 'bash', cwd: '/project' }]);
    const [activeTab, setActiveTab] = useState(1);
    const [connectionStatus, setConnectionStatus] = useState('disconnected'); // connecting, connected, disconnected, fallback
    const [useSimulated, setUseSimulated] = useState(false);

    // Simulated terminal state
    const [currentDirectory, setCurrentDirectory] = useState(currentDir);
    const [commandHistory, setCommandHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Terminal theme
    const terminalTheme = {
        dark: {
            background: '#1e1e1e',
            foreground: '#cccccc',
            cursor: '#ffffff',
            cursorAccent: '#1e1e1e',
            black: '#000000',
            red: '#cd3131',
            green: '#0dbc79',
            yellow: '#e5e510',
            blue: '#2472c8',
            magenta: '#bc3fbc',
            cyan: '#11a8cd',
            white: '#e5e5e5',
            brightBlack: '#666666',
            brightRed: '#f14c4c',
            brightGreen: '#23d18b',
            brightYellow: '#f5f543',
            brightBlue: '#3b8eea',
            brightMagenta: '#d670d6',
            brightCyan: '#29b8db',
            brightWhite: '#ffffff',
        },
        light: {
            background: '#ffffff',
            foreground: '#333333',
            cursor: '#333333',
            cursorAccent: '#ffffff',
            black: '#000000',
            red: '#cd3131',
            green: '#00bc7c',
            yellow: '#949800',
            blue: '#0451a5',
            magenta: '#bc05bc',
            cyan: '#0598bc',
            white: '#555555',
            brightBlack: '#666666',
            brightRed: '#cd3131',
            brightGreen: '#14ce14',
            brightYellow: '#b5ba00',
            brightBlue: '#0451a5',
            brightMagenta: '#bc05bc',
            brightCyan: '#0598bc',
            brightWhite: '#a5a5a5',
        }
    };

    // Get WebSocket URL
    const getWsUrl = () => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.hostname;
        const port = process.env.NODE_ENV === 'development' ? '8000' : window.location.port;
        return `${protocol}//${host}:${port}/ws/terminal/`;
    };

    // Connect to WebSocket
    const connectWebSocket = () => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            return;
        }

        setConnectionStatus('connecting');

        try {
            const wsUrl = getWsUrl();
            wsRef.current = new WebSocket(wsUrl);

            wsRef.current.onopen = () => {
                setConnectionStatus('connected');
                setUseSimulated(false);
            };

            wsRef.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'output' && xtermRef.current) {
                        xtermRef.current.write(data.data);
                    } else if (data.type === 'error' && xtermRef.current) {
                        xtermRef.current.write(`\x1b[31m${data.data}\x1b[0m`);
                    }
                } catch (e) {
                    console.error('WebSocket message error:', e);
                }
            };

            wsRef.current.onclose = () => {
                setConnectionStatus('disconnected');
                // Fallback to simulated mode
                if (!useSimulated) {
                    setUseSimulated(true);
                    setConnectionStatus('fallback');
                    if (xtermRef.current) {
                        xtermRef.current.writeln('\r\n\x1b[33m⚠ WebSocket disconnected. Using simulated terminal.\x1b[0m\r\n');
                        writePrompt(xtermRef.current);
                    }
                }
            };

            wsRef.current.onerror = () => {
                setConnectionStatus('fallback');
                setUseSimulated(true);
            };

        } catch (error) {
            console.error('WebSocket connection error:', error);
            setConnectionStatus('fallback');
            setUseSimulated(true);
        }
    };

    // Initialize xterm
    useEffect(() => {
        if (!terminalRef.current || xtermRef.current) return;

        const term = new XTerm({
            cursorBlink: true,
            cursorStyle: 'bar',
            fontSize: 14,
            fontFamily: '"Cascadia Code", "Fira Code", "JetBrains Mono", Menlo, Monaco, "Courier New", monospace',
            lineHeight: 1.4,
            theme: terminalTheme[theme],
            allowTransparency: true,
            scrollback: 5000,
        });

        const fitAddon = new FitAddon();
        const webLinksAddon = new WebLinksAddon();

        term.loadAddon(fitAddon);
        term.loadAddon(webLinksAddon);

        term.open(terminalRef.current);
        fitAddon.fit();

        xtermRef.current = term;
        fitAddonRef.current = fitAddon;

        // Start immediately in simulated mode (no WebSocket needed)
        setUseSimulated(true);
        setConnectionStatus('local');

        // Show welcome message immediately
        term.writeln('\x1b[1;36m╔══════════════════════════════════════════════════════════╗\x1b[0m');
        term.writeln('\x1b[1;36m║\x1b[0m  \x1b[1;35m🚀 Planorah CodeSpace Terminal\x1b[0m                          \x1b[1;36m║\x1b[0m');
        term.writeln('\x1b[1;36m║\x1b[0m  Type \x1b[1;33mhelp\x1b[0m for available commands                         \x1b[1;36m║\x1b[0m');
        term.writeln('\x1b[1;36m╚══════════════════════════════════════════════════════════╝\x1b[0m');
        term.writeln('');
        writePrompt(term);

        // Handle resize
        const handleResize = () => {
            if (fitAddonRef.current) {
                fitAddonRef.current.fit();
                // Send resize to WebSocket
                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    wsRef.current.send(JSON.stringify({
                        type: 'resize',
                        cols: term.cols,
                        rows: term.rows
                    }));
                }
            }
        };
        window.addEventListener('resize', handleResize);

        // Handle input
        let inputBuffer = '';
        term.onKey(({ key, domEvent }) => {
            const code = domEvent.keyCode;

            // If connected to real terminal, send all input
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && !useSimulated) {
                wsRef.current.send(JSON.stringify({
                    type: 'input',
                    data: key
                }));
                return;
            }

            // Simulated terminal mode
            if (code === 13) { // Enter
                term.writeln('');
                if (inputBuffer.trim()) {
                    setCommandHistory(prev => [...prev, inputBuffer]);
                    handleSimulatedCommand(term, inputBuffer.trim());
                } else {
                    writePrompt(term);
                }
                inputBuffer = '';
                setHistoryIndex(-1);
            } else if (code === 8) { // Backspace
                if (inputBuffer.length > 0) {
                    inputBuffer = inputBuffer.slice(0, -1);
                    term.write('\b \b');
                }
            } else if (code === 38) { // Up arrow - history
                domEvent.preventDefault();
                if (commandHistory.length > 0) {
                    const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
                    setHistoryIndex(newIndex);
                    const cmd = commandHistory[commandHistory.length - 1 - newIndex] || '';
                    term.write('\r\x1b[K');
                    writePrompt(term, false);
                    term.write(cmd);
                    inputBuffer = cmd;
                }
            } else if (code === 40) { // Down arrow
                domEvent.preventDefault();
                if (historyIndex > 0) {
                    const newIndex = historyIndex - 1;
                    setHistoryIndex(newIndex);
                    const cmd = commandHistory[commandHistory.length - 1 - newIndex] || '';
                    term.write('\r\x1b[K');
                    writePrompt(term, false);
                    term.write(cmd);
                    inputBuffer = cmd;
                } else if (historyIndex === 0) {
                    setHistoryIndex(-1);
                    term.write('\r\x1b[K');
                    writePrompt(term, false);
                    inputBuffer = '';
                }
            } else if (code === 9) { // Tab - autocomplete
                domEvent.preventDefault();
                const commands = ['help', 'clear', 'ls', 'cd', 'pwd', 'cat', 'mkdir', 'touch', 'rm', 'echo', 'date', 'run', 'npm', 'git', 'code', 'exit'];
                const matches = commands.filter(c => c.startsWith(inputBuffer));
                if (matches.length === 1) {
                    const completion = matches[0].slice(inputBuffer.length);
                    term.write(completion);
                    inputBuffer += completion;
                } else if (matches.length > 1) {
                    term.writeln('');
                    term.writeln(matches.join('  '));
                    writePrompt(term, false);
                    term.write(inputBuffer);
                }
            } else if (code === 67 && domEvent.ctrlKey) { // Ctrl+C
                term.writeln('^C');
                inputBuffer = '';
                writePrompt(term);
            } else if (code === 76 && domEvent.ctrlKey) { // Ctrl+L
                term.clear();
                writePrompt(term);
                inputBuffer = '';
            } else if (key.length === 1 && !domEvent.ctrlKey && !domEvent.altKey) {
                inputBuffer += key;
                term.write(key);
            }
        });

        return () => {
            window.removeEventListener('resize', handleResize);
            if (wsRef.current) {
                wsRef.current.close();
            }
            term.dispose();
            xtermRef.current = null;
        };
    }, []);

    // Update theme
    useEffect(() => {
        if (xtermRef.current) {
            xtermRef.current.options.theme = terminalTheme[theme];
        }
    }, [theme]);

    const writePrompt = (term, newLine = true) => {
        const user = 'user';
        const host = 'planorah';
        const dir = currentDirectory.replace('/project', '~');
        const prompt = `\x1b[1;32m${user}@${host}\x1b[0m:\x1b[1;34m${dir}\x1b[0m$ `;
        term.write(prompt);
    };

    // Navigate to path in virtual filesystem
    const navigateTo = (path) => {
        if (path.startsWith('/')) return path;
        if (path === '..') {
            const parts = currentDirectory.split('/').filter(Boolean);
            parts.pop();
            return '/' + parts.join('/') || '/project';
        }
        if (path === '.' || path === '') return currentDirectory;
        if (path === '~') return '/project';
        return `${currentDirectory}/${path}`.replace(/\/+/g, '/');
    };

    // Get directory contents
    const getDirectoryContents = (path) => {
        const parts = path.split('/').filter(Boolean);
        let current = fileSystem;
        for (const part of parts) {
            if (current[part]) {
                current = current[part].children || current[part];
            } else {
                return null;
            }
        }
        return current.children || current;
    };

    const handleSimulatedCommand = (term, input) => {
        const args = input.split(/\s+/);
        const cmd = args[0].toLowerCase();
        const cmdArgs = args.slice(1);

        switch (cmd) {
            case 'help':
                term.writeln('\x1b[1;33m📚 Available Commands:\x1b[0m');
                term.writeln('');
                term.writeln('  \x1b[1;36mNavigation:\x1b[0m ls, cd, pwd');
                term.writeln('  \x1b[1;36mFile Ops:\x1b[0m cat, touch, mkdir, rm, code');
                term.writeln('  \x1b[1;36mExecution:\x1b[0m run, node, python');
                term.writeln('  \x1b[1;36mPackages:\x1b[0m npm install/start/test');
                term.writeln('  \x1b[1;36mGit:\x1b[0m git status/add/commit/log');
                term.writeln('  \x1b[1;36mUtils:\x1b[0m echo, date, clear, history, exit');
                term.writeln('');
                term.writeln('\x1b[2mNote: This is a simulated terminal.\x1b[0m');
                break;
            case 'clear':
                term.clear();
                break;
            case 'ls':
                const contents = getDirectoryContents(cmdArgs[0] ? navigateTo(cmdArgs[0]) : currentDirectory);
                if (!contents) {
                    term.writeln(`\x1b[31mls: cannot access '${cmdArgs[0]}': No such directory\x1b[0m`);
                } else {
                    Object.entries(contents).forEach(([name, item]) => {
                        if (item.type === 'folder') {
                            term.writeln(`\x1b[1;34m📁 ${name}/\x1b[0m`);
                        } else {
                            term.writeln(`📄 ${name}`);
                        }
                    });
                }
                break;
            case 'cd':
                if (!cmdArgs[0]) {
                    setCurrentDirectory('/project');
                } else {
                    const newPath = navigateTo(cmdArgs[0]);
                    setCurrentDirectory(newPath);
                }
                break;
            case 'pwd':
                term.writeln(currentDirectory);
                break;
            case 'cat':
                if (!cmdArgs[0]) {
                    term.writeln('\x1b[31mcat: missing file operand\x1b[0m');
                } else {
                    const content = getFileContent?.(navigateTo(cmdArgs[0]).replace(/^\//, ''));
                    if (content) {
                        content.split('\n').forEach(line => term.writeln(line));
                    } else {
                        term.writeln(`\x1b[31mcat: ${cmdArgs[0]}: No such file\x1b[0m`);
                    }
                }
                break;
            case 'touch':
                if (cmdArgs[0]) {
                    onCreateFile?.(`${currentDirectory.replace(/^\//, '')}/${cmdArgs[0]}`, cmdArgs[0]);
                    term.writeln(`\x1b[32m✓\x1b[0m Created: ${cmdArgs[0]}`);
                }
                break;
            case 'mkdir':
                if (cmdArgs[0]) {
                    onCreateFolder?.(`${currentDirectory.replace(/^\//, '')}/${cmdArgs[0]}`, cmdArgs[0]);
                    term.writeln(`\x1b[32m✓\x1b[0m Created directory: ${cmdArgs[0]}`);
                }
                break;
            case 'code':
                if (cmdArgs[0]) {
                    onOpenFile?.(navigateTo(cmdArgs[0]).replace(/^\//, ''), cmdArgs[0]);
                    term.writeln(`\x1b[32m✓\x1b[0m Opening ${cmdArgs[0]}...`);
                }
                break;
            case 'echo':
                term.writeln(cmdArgs.join(' '));
                break;
            case 'date':
                term.writeln(new Date().toString());
                break;
            case 'run':
                term.writeln('\x1b[36mℹ\x1b[0m Running current file...');
                onRunCode?.();
                break;
            case 'npm':
                if (cmdArgs[0] === 'install' || cmdArgs[0] === 'i') {
                    term.writeln('\x1b[2m⠋ Installing dependencies...\x1b[0m');
                    setTimeout(() => {
                        term.writeln('\x1b[32m✓\x1b[0m Installed 0 packages');
                        writePrompt(term);
                    }, 800);
                    return;
                } else if (cmdArgs[0] === 'start') {
                    term.writeln('\x1b[2m> node src/index.js\x1b[0m');
                    onRunCode?.();
                } else if (cmdArgs[0] === 'test') {
                    term.writeln('\x1b[33mNo test specified\x1b[0m');
                }
                break;
            case 'git':
                if (cmdArgs[0] === 'status') {
                    term.writeln('On branch \x1b[32mmain\x1b[0m');
                    term.writeln('Changes not staged for commit:');
                    term.writeln('  \x1b[31mmodified:   src/index.js\x1b[0m');
                } else if (cmdArgs[0] === 'add') {
                    term.writeln(`\x1b[32m✓\x1b[0m Staged: ${cmdArgs[1] || '.'}`);
                } else if (cmdArgs[0] === 'commit') {
                    term.writeln('[main abc1234] commit message');
                } else if (cmdArgs[0] === 'log') {
                    term.writeln('\x1b[33mcommit abc1234\x1b[0m');
                    term.writeln('Author: You <you@planorah.me>');
                    term.writeln('    Initial commit');
                }
                break;
            case 'history':
                commandHistory.forEach((c, i) => term.writeln(`  ${i + 1}  ${c}`));
                break;
            case 'exit':
                term.writeln('Goodbye! 👋');
                break;
            case '':
                break;
            default:
                term.writeln(`\x1b[31m${cmd}: command not found\x1b[0m`);
                term.writeln('Type \x1b[33mhelp\x1b[0m for available commands');
        }

        writePrompt(term);
    };

    const addTab = () => {
        const newId = Math.max(...tabs.map(t => t.id)) + 1;
        setTabs([...tabs, { id: newId, name: `bash ${newId}`, cwd: '/project' }]);
        setActiveTab(newId);
    };

    const closeTab = (id) => {
        if (tabs.length === 1) return;
        const newTabs = tabs.filter(t => t.id !== id);
        setTabs(newTabs);
        if (activeTab === id) setActiveTab(newTabs[0].id);
    };

    const getStatusColor = () => {
        switch (connectionStatus) {
            case 'connected': return 'text-green-500';
            case 'connecting': return 'text-yellow-500 animate-pulse';
            case 'local': return 'text-green-400';
            case 'fallback': return 'text-orange-400';
            default: return 'text-gray-500';
        }
    };

    const getStatusText = () => {
        switch (connectionStatus) {
            case 'connected': return 'Connected';
            case 'connecting': return 'Connecting...';
            case 'local': return 'Local';
            case 'fallback': return 'Simulated';
            default: return 'Disconnected';
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e]">
            {/* Terminal Header */}
            <div className="flex items-center bg-[#252526] border-b border-[#3c3c3c] px-2">
                <div className="flex items-center gap-1 flex-1 overflow-x-auto">
                    {tabs.map(tab => (
                        <div
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-3 py-1.5 text-xs cursor-pointer group ${activeTab === tab.id
                                ? 'bg-[#1e1e1e] text-white border-t border-t-[#007acc]'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <FaTerminal className="text-[10px]" />
                            <span>{tab.name}</span>
                            {tabs.length > 1 && (
                                <FaTimes
                                    className="text-[10px] opacity-0 group-hover:opacity-100 hover:text-red-400"
                                    onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                                />
                            )}
                        </div>
                    ))}
                </div>

                <button onClick={addTab} className="p-1.5 text-gray-400 hover:text-white hover:bg-[#3c3c3c] rounded" title="New Terminal">
                    <FaPlus className="text-xs" />
                </button>

                {/* Connection Status */}
                <div className={`flex items-center gap-1.5 ml-3 px-2 py-1 text-xs ${getStatusColor()}`} title={connectionStatus === 'fallback' ? 'Backend not available - using simulated commands' : ''}>
                    <FaCircle className="text-[6px]" />
                    <span>{getStatusText()}</span>
                </div>

                <div className="flex items-center gap-1 ml-2 text-gray-400">
                    <span className="text-xs">bash</span>
                    <FaChevronDown className="text-[10px]" />
                </div>
            </div>

            {/* Terminal Container */}
            <div ref={terminalRef} className="flex-1 p-2" />
        </div>
    );
};

export default XTerminal;
