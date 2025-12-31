import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import 'xterm/css/xterm.css';
import { FaPlus, FaTimes, FaTerminal, FaChevronDown } from 'react-icons/fa';

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
    const [tabs, setTabs] = useState([{ id: 1, name: 'bash', cwd: '/project' }]);
    const [activeTab, setActiveTab] = useState(1);
    const [currentDirectory, setCurrentDirectory] = useState(currentDir);
    const [commandHistory, setCommandHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [currentInput, setCurrentInput] = useState('');

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
            scrollback: 1000,
        });

        const fitAddon = new FitAddon();
        const webLinksAddon = new WebLinksAddon();

        term.loadAddon(fitAddon);
        term.loadAddon(webLinksAddon);

        term.open(terminalRef.current);
        fitAddon.fit();

        xtermRef.current = term;
        fitAddonRef.current = fitAddon;

        // Welcome message
        term.writeln('\x1b[1;36m╔══════════════════════════════════════════════════════════╗\x1b[0m');
        term.writeln('\x1b[1;36m║\x1b[0m  \x1b[1;35m🚀 Welcome to Planorah CodeSpace Terminal\x1b[0m                \x1b[1;36m║\x1b[0m');
        term.writeln('\x1b[1;36m║\x1b[0m  Type \x1b[1;33mhelp\x1b[0m for available commands                         \x1b[1;36m║\x1b[0m');
        term.writeln('\x1b[1;36m╚══════════════════════════════════════════════════════════╝\x1b[0m');
        term.writeln('');
        writePrompt(term);

        // Handle resize
        const handleResize = () => {
            if (fitAddonRef.current) {
                fitAddonRef.current.fit();
            }
        };
        window.addEventListener('resize', handleResize);

        // Handle input
        let inputBuffer = '';
        term.onKey(({ key, domEvent }) => {
            const char = key;
            const code = domEvent.keyCode;

            if (code === 13) { // Enter
                term.writeln('');
                if (inputBuffer.trim()) {
                    setCommandHistory(prev => [...prev, inputBuffer]);
                    handleCommand(term, inputBuffer.trim());
                } else {
                    writePrompt(term);
                }
                inputBuffer = '';
                setCurrentInput('');
                setHistoryIndex(-1);
            } else if (code === 8) { // Backspace
                if (inputBuffer.length > 0) {
                    inputBuffer = inputBuffer.slice(0, -1);
                    setCurrentInput(inputBuffer);
                    term.write('\b \b');
                }
            } else if (code === 38) { // Up arrow - history
                domEvent.preventDefault();
                if (commandHistory.length > 0) {
                    const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
                    setHistoryIndex(newIndex);
                    const cmd = commandHistory[commandHistory.length - 1 - newIndex] || '';
                    // Clear current line and write history command
                    term.write('\r\x1b[K');
                    writePrompt(term, false);
                    term.write(cmd);
                    inputBuffer = cmd;
                    setCurrentInput(cmd);
                }
            } else if (code === 40) { // Down arrow - history
                domEvent.preventDefault();
                if (historyIndex > 0) {
                    const newIndex = historyIndex - 1;
                    setHistoryIndex(newIndex);
                    const cmd = commandHistory[commandHistory.length - 1 - newIndex] || '';
                    term.write('\r\x1b[K');
                    writePrompt(term, false);
                    term.write(cmd);
                    inputBuffer = cmd;
                    setCurrentInput(cmd);
                } else if (historyIndex === 0) {
                    setHistoryIndex(-1);
                    term.write('\r\x1b[K');
                    writePrompt(term, false);
                    inputBuffer = '';
                    setCurrentInput('');
                }
            } else if (code === 9) { // Tab - autocomplete
                domEvent.preventDefault();
                // Simple autocomplete for commands
                const commands = ['help', 'clear', 'ls', 'cd', 'pwd', 'cat', 'mkdir', 'touch', 'rm', 'cp', 'mv', 'echo', 'date', 'run', 'node', 'python', 'npm', 'git', 'code', 'exit'];
                const matches = commands.filter(c => c.startsWith(inputBuffer));
                if (matches.length === 1) {
                    const completion = matches[0].slice(inputBuffer.length);
                    term.write(completion);
                    inputBuffer += completion;
                    setCurrentInput(inputBuffer);
                } else if (matches.length > 1) {
                    term.writeln('');
                    term.writeln(matches.join('  '));
                    writePrompt(term, false);
                    term.write(inputBuffer);
                }
            } else if (code === 67 && domEvent.ctrlKey) { // Ctrl+C
                term.writeln('^C');
                inputBuffer = '';
                setCurrentInput('');
                writePrompt(term);
            } else if (code === 76 && domEvent.ctrlKey) { // Ctrl+L - clear
                term.clear();
                writePrompt(term);
                inputBuffer = '';
                setCurrentInput('');
            } else if (char.length === 1 && !domEvent.ctrlKey && !domEvent.altKey) {
                inputBuffer += char;
                setCurrentInput(inputBuffer);
                term.write(char);
            }
        });

        return () => {
            window.removeEventListener('resize', handleResize);
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
        if (newLine) {
            term.write(prompt);
        } else {
            term.write(prompt);
        }
    };

    const writeError = (term, msg) => {
        term.writeln(`\x1b[1;31mError:\x1b[0m ${msg}`);
    };

    const writeSuccess = (term, msg) => {
        term.writeln(`\x1b[1;32m✓\x1b[0m ${msg}`);
    };

    const writeInfo = (term, msg) => {
        term.writeln(`\x1b[1;36mℹ\x1b[0m ${msg}`);
    };

    // Navigate to path in virtual filesystem
    const navigateTo = (path) => {
        if (path.startsWith('/')) {
            return path;
        } else if (path === '..') {
            const parts = currentDirectory.split('/').filter(Boolean);
            parts.pop();
            return '/' + parts.join('/') || '/project';
        } else if (path === '.') {
            return currentDirectory;
        } else if (path === '~') {
            return '/project';
        } else {
            return `${currentDirectory}/${path}`.replace(/\/+/g, '/');
        }
    };

    // Check if path exists
    const pathExists = (path) => {
        const parts = path.split('/').filter(Boolean);
        let current = fileSystem;
        for (const part of parts) {
            if (current[part]) {
                current = current[part].children || current[part];
            } else {
                return false;
            }
        }
        return true;
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

    const handleCommand = useCallback((term, input) => {
        const args = input.split(/\s+/);
        const cmd = args[0].toLowerCase();
        const cmdArgs = args.slice(1);

        switch (cmd) {
            case 'help':
                term.writeln('\x1b[1;33m📚 Available Commands:\x1b[0m');
                term.writeln('');
                term.writeln('  \x1b[1;36mNavigation:\x1b[0m');
                term.writeln('    ls [path]         List directory contents');
                term.writeln('    cd <path>         Change directory');
                term.writeln('    pwd               Print working directory');
                term.writeln('');
                term.writeln('  \x1b[1;36mFile Operations:\x1b[0m');
                term.writeln('    cat <file>        Display file contents');
                term.writeln('    touch <file>      Create new file');
                term.writeln('    mkdir <dir>       Create new directory');
                term.writeln('    rm <file>         Remove file or directory');
                term.writeln('    cp <src> <dest>   Copy file');
                term.writeln('    mv <src> <dest>   Move/rename file');
                term.writeln('    code <file>       Open file in editor');
                term.writeln('');
                term.writeln('  \x1b[1;36mExecution:\x1b[0m');
                term.writeln('    run               Run current file');
                term.writeln('    node <file>       Run JavaScript file');
                term.writeln('    python <file>     Run Python file');
                term.writeln('');
                term.writeln('  \x1b[1;36mPackage Management:\x1b[0m');
                term.writeln('    npm install       Install dependencies');
                term.writeln('    npm start         Start application');
                term.writeln('    npm test          Run tests');
                term.writeln('');
                term.writeln('  \x1b[1;36mGit:\x1b[0m');
                term.writeln('    git status        Show repository status');
                term.writeln('    git add <file>    Stage file');
                term.writeln('    git commit -m     Commit changes');
                term.writeln('    git log           Show commit history');
                term.writeln('');
                term.writeln('  \x1b[1;36mUtilities:\x1b[0m');
                term.writeln('    echo <text>       Print text');
                term.writeln('    date              Show current date');
                term.writeln('    clear             Clear terminal');
                term.writeln('    history           Show command history');
                term.writeln('    exit              Close terminal');
                break;

            case 'clear':
                term.clear();
                break;

            case 'ls':
                const lsPath = cmdArgs[0] ? navigateTo(cmdArgs[0]) : currentDirectory;
                const contents = getDirectoryContents(lsPath);
                if (!contents) {
                    writeError(term, `ls: cannot access '${cmdArgs[0]}': No such file or directory`);
                } else {
                    const items = Object.entries(contents);
                    if (items.length === 0) {
                        term.writeln('(empty directory)');
                    } else {
                        items.forEach(([name, item]) => {
                            if (item.type === 'folder') {
                                term.writeln(`\x1b[1;34m📁 ${name}/\x1b[0m`);
                            } else {
                                const ext = name.split('.').pop();
                                const icon = ext === 'js' ? '📜' : ext === 'py' ? '🐍' : ext === 'html' ? '🌐' : ext === 'css' ? '🎨' : ext === 'json' ? '📋' : '📄';
                                term.writeln(`${icon} ${name}`);
                            }
                        });
                    }
                }
                break;

            case 'cd':
                if (!cmdArgs[0]) {
                    setCurrentDirectory('/project');
                } else {
                    const newPath = navigateTo(cmdArgs[0]);
                    if (pathExists(newPath)) {
                        setCurrentDirectory(newPath);
                    } else {
                        writeError(term, `cd: ${cmdArgs[0]}: No such directory`);
                    }
                }
                break;

            case 'pwd':
                term.writeln(currentDirectory);
                break;

            case 'cat':
                if (!cmdArgs[0]) {
                    writeError(term, 'cat: missing file operand');
                } else {
                    const filePath = navigateTo(cmdArgs[0]);
                    const content = getFileContent?.(filePath.replace(/^\//, ''));
                    if (content !== undefined && content !== '') {
                        content.split('\n').forEach(line => term.writeln(line));
                    } else {
                        writeError(term, `cat: ${cmdArgs[0]}: No such file`);
                    }
                }
                break;

            case 'touch':
                if (!cmdArgs[0]) {
                    writeError(term, 'touch: missing file operand');
                } else {
                    const parent = currentDirectory.replace(/^\//, '');
                    onCreateFile?.(`${parent}/${cmdArgs[0]}`.replace(/^\//, ''), cmdArgs[0]);
                    writeSuccess(term, `Created file: ${cmdArgs[0]}`);
                }
                break;

            case 'mkdir':
                if (!cmdArgs[0]) {
                    writeError(term, 'mkdir: missing operand');
                } else {
                    const parent = currentDirectory.replace(/^\//, '');
                    onCreateFolder?.(`${parent}/${cmdArgs[0]}`.replace(/^\//, ''), cmdArgs[0]);
                    writeSuccess(term, `Created directory: ${cmdArgs[0]}`);
                }
                break;

            case 'rm':
                if (!cmdArgs[0]) {
                    writeError(term, 'rm: missing operand');
                } else {
                    const rmPath = navigateTo(cmdArgs[0]).replace(/^\//, '');
                    onDeleteItem?.(rmPath);
                    writeSuccess(term, `Removed: ${cmdArgs[0]}`);
                }
                break;

            case 'code':
                if (!cmdArgs[0]) {
                    writeError(term, 'code: missing file operand');
                } else {
                    const codePath = navigateTo(cmdArgs[0]).replace(/^\//, '');
                    onOpenFile?.(codePath, cmdArgs[0]);
                    writeSuccess(term, `Opening ${cmdArgs[0]} in editor...`);
                }
                break;

            case 'echo':
                term.writeln(cmdArgs.join(' '));
                break;

            case 'date':
                term.writeln(new Date().toString());
                break;

            case 'run':
                writeInfo(term, 'Running current file...');
                onRunCode?.();
                break;

            case 'node':
            case 'python':
                if (!cmdArgs[0]) {
                    writeError(term, `${cmd}: missing file operand`);
                } else {
                    writeInfo(term, `Running ${cmdArgs[0]}...`);
                    onRunCode?.();
                }
                break;

            case 'npm':
                const npmCmd = cmdArgs[0];
                if (npmCmd === 'install' || npmCmd === 'i') {
                    term.writeln('\x1b[2m⠋ Installing dependencies...\x1b[0m');
                    setTimeout(() => {
                        term.writeln('\x1b[1;32m✓\x1b[0m Installed 0 packages');
                        term.writeln('\x1b[2mup to date, audited 0 packages\x1b[0m');
                        writePrompt(term);
                    }, 1000);
                    return;
                } else if (npmCmd === 'start') {
                    term.writeln('\x1b[2m> my-project@1.0.0 start\x1b[0m');
                    term.writeln('\x1b[2m> node src/index.js\x1b[0m');
                    onRunCode?.();
                } else if (npmCmd === 'test') {
                    term.writeln('\x1b[2m> my-project@1.0.0 test\x1b[0m');
                    term.writeln('\x1b[33mNo test specified\x1b[0m');
                } else if (npmCmd === 'init') {
                    writeSuccess(term, 'Initialized package.json');
                } else {
                    writeError(term, `npm: unknown command '${npmCmd}'`);
                }
                break;

            case 'git':
                const gitCmd = cmdArgs[0];
                if (gitCmd === 'status') {
                    term.writeln('On branch \x1b[1;32mmain\x1b[0m');
                    term.writeln('');
                    term.writeln('Changes not staged for commit:');
                    term.writeln('  \x1b[31mmodified:   src/index.js\x1b[0m');
                    term.writeln('');
                    term.writeln('Untracked files:');
                    term.writeln('  \x1b[31msrc/utils.js\x1b[0m');
                } else if (gitCmd === 'add') {
                    writeSuccess(term, `Staged: ${cmdArgs[1] || '.'}`);
                } else if (gitCmd === 'commit') {
                    const msgIndex = cmdArgs.indexOf('-m');
                    if (msgIndex !== -1 && cmdArgs[msgIndex + 1]) {
                        term.writeln(`[main abc1234] ${cmdArgs.slice(msgIndex + 1).join(' ')}`);
                        term.writeln(' 1 file changed, 10 insertions(+)');
                    } else {
                        writeError(term, 'Please provide commit message: git commit -m "message"');
                    }
                } else if (gitCmd === 'log') {
                    term.writeln('\x1b[33mcommit abc1234567890\x1b[0m');
                    term.writeln('Author: You <you@planorah.me>');
                    term.writeln('Date:   ' + new Date().toDateString());
                    term.writeln('');
                    term.writeln('    Initial commit');
                } else if (gitCmd === 'branch') {
                    term.writeln('* \x1b[1;32mmain\x1b[0m');
                } else if (gitCmd === 'checkout') {
                    writeSuccess(term, `Switched to branch '${cmdArgs[1] || 'main'}'`);
                } else {
                    writeError(term, `git: '${gitCmd}' is not a git command`);
                }
                break;

            case 'history':
                commandHistory.forEach((cmd, i) => {
                    term.writeln(`  ${i + 1}  ${cmd}`);
                });
                break;

            case 'whoami':
                term.writeln('user');
                break;

            case 'hostname':
                term.writeln('planorah-codespace');
                break;

            case 'exit':
                term.writeln('Goodbye! 👋');
                break;

            case '':
                break;

            default:
                writeError(term, `${cmd}: command not found`);
                term.writeln(`Type \x1b[1;33mhelp\x1b[0m for available commands`);
        }

        writePrompt(term);
    }, [currentDirectory, fileSystem, commandHistory, onRunCode, onCreateFile, onCreateFolder, onDeleteItem, onOpenFile, getFileContent]);

    const addTab = () => {
        const newId = Math.max(...tabs.map(t => t.id)) + 1;
        setTabs([...tabs, { id: newId, name: `bash ${newId}`, cwd: '/project' }]);
        setActiveTab(newId);
    };

    const closeTab = (id) => {
        if (tabs.length === 1) return;
        const newTabs = tabs.filter(t => t.id !== id);
        setTabs(newTabs);
        if (activeTab === id) {
            setActiveTab(newTabs[0].id);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e]">
            {/* Terminal Tabs */}
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
                <button
                    onClick={addTab}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-[#3c3c3c] rounded"
                    title="New Terminal"
                >
                    <FaPlus className="text-xs" />
                </button>
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
