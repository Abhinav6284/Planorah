import React, { useState } from 'react';
import Editor from '@monaco-editor/react';

export default function CodeStudio() {
    const [language, setLanguage] = useState('javascript');
    const [code, setCode] = useState('// Write your code here\nconsole.log("Hello, Planorah!");');
    const [output, setOutput] = useState([]);
    const [isRunning, setIsRunning] = useState(false);

    const languageMap = {
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

    const defaultCode = {
        javascript: '// Write your JavaScript code here\nconsole.log("Hello from JavaScript!");',
        python: '# Write your Python code here\nprint("Hello from Python!")',
        java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n    }\n}',
        cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello from C++!" << endl;\n    return 0;\n}',
        c: '#include <stdio.h>\n\nint main() {\n    printf("Hello from C!\\n");\n    return 0;\n}',
        csharp: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello from C#!");\n    }\n}',
        go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello from Go!")\n}',
        rust: 'fn main() {\n    println!("Hello from Rust!");\n}',
        ruby: '# Write your Ruby code here\nputs "Hello from Ruby!"'
    };

    const handleLanguageChange = (newLang) => {
        setLanguage(newLang);
        setCode(defaultCode[newLang] || '');
        setOutput([]);
    };

    const handleRun = async () => {
        setIsRunning(true);
        setOutput(['> Running code...']);

        try {
            const langConfig = languageMap[language];

            const response = await fetch('https://emkc.org/api/v2/piston/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    language: langConfig.piston,
                    version: langConfig.version,
                    files: [{
                        content: code
                    }]
                })
            });

            const result = await response.json();

            if (result.run) {
                const outputLines = [];

                if (result.run.stdout) {
                    outputLines.push(...result.run.stdout.split('\n').filter(line => line.trim()));
                }

                if (result.run.stderr) {
                    outputLines.push('> Errors:');
                    outputLines.push(...result.run.stderr.split('\n').filter(line => line.trim()).map(line => `ERROR: ${line}`));
                }

                if (outputLines.length === 0) {
                    outputLines.push('> Code executed successfully (no output)');
                }

                setOutput(outputLines);
            } else {
                setOutput(['> Error: Failed to execute code']);
            }
        } catch (error) {
            setOutput([`> Error: ${error.message}`, '> Make sure you have an internet connection.']);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] bg-[#1e1e1e] text-white font-mono overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-3 bg-[#252526] border-b border-[#333]">
                <div className="flex items-center gap-4">
                    <h1 className="font-bold text-lg tracking-tight">Code Studio</h1>
                    <select
                        value={language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="bg-[#3c3c3c] text-sm px-3 py-1.5 rounded border border-[#555] focus:outline-none focus:border-blue-500"
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                        <option value="c">C</option>
                        <option value="csharp">C#</option>
                        <option value="go">Go</option>
                        <option value="rust">Rust</option>
                        <option value="ruby">Ruby</option>
                    </select>
                    <div className="text-xs text-gray-400">Powered by Piston API</div>
                </div>
                <button
                    onClick={handleRun}
                    disabled={isRunning}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded font-medium text-sm transition-colors ${isRunning ? 'bg-gray-600 cursor-wait' : 'bg-green-600 hover:bg-green-700'
                        }`}
                >
                    {isRunning ? (
                        <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Running...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                            Run Code
                        </>
                    )}
                </button>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex">
                {/* Editor */}
                <div className="flex-1 relative">
                    <Editor
                        height="100%"
                        defaultLanguage="javascript"
                        language={language === 'cpp' ? 'cpp' : language}
                        value={code}
                        onChange={(value) => setCode(value)}
                        theme="vs-dark"
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            padding: { top: 20 },
                            scrollBeyondLastLine: false,
                        }}
                    />
                </div>

                {/* Output Panel */}
                <div className="w-1/3 bg-[#1e1e1e] border-l border-[#333] flex flex-col">
                    <div className="px-4 py-2 bg-[#252526] text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-[#333]">
                        Console Output
                    </div>
                    <div className="flex-1 p-4 overflow-auto font-mono text-sm text-gray-300 space-y-1">
                        {output.length === 0 ? (
                            <div className="opacity-50 italic">Run your code to see output...</div>
                        ) : (
                            output.map((line, i) => (
                                <div key={i} className={line.startsWith('ERROR') ? 'text-red-400' : line.startsWith('>') ? 'text-green-400' : ''}>{line}</div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
