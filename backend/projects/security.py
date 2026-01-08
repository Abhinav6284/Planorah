"""
Security utilities for project file validation.
Prevents malware, dangerous scripts, and oversized files.
"""
import re
from django.core.exceptions import ValidationError


# Maximum file size (500KB per file)
MAX_FILE_SIZE = 500 * 1024  # 500KB

# Maximum total project size (5MB)
MAX_PROJECT_SIZE = 5 * 1024 * 1024  # 5MB

# Maximum files per project
MAX_FILES_PER_PROJECT = 100

# Allowed file extensions (whitelist approach)
ALLOWED_EXTENSIONS = {
    # Web
    'html', 'css', 'js', 'jsx', 'ts', 'tsx', 'json', 'xml', 'svg',
    # Programming
    'py', 'java', 'c', 'cpp', 'h', 'hpp', 'go', 'rs', 'rb', 'php',
    # Data
    'txt', 'md', 'csv', 'yaml', 'yml', 'toml', 'ini', 'env',
    # Config
    'gitignore', 'dockerignore', 'editorconfig', 'prettierrc', 'eslintrc',
}

# Blocked file extensions (executable/dangerous)
BLOCKED_EXTENSIONS = {
    'exe', 'dll', 'bat', 'cmd', 'sh', 'ps1', 'vbs', 'vbe',
    'msi', 'scr', 'pif', 'com', 'jar', 'class',
    'bin', 'so', 'dylib', 'deb', 'rpm',
}

# Dangerous patterns in code content
DANGEROUS_PATTERNS = [
    # Shell commands
    r'rm\s+-rf\s+/',
    r'sudo\s+rm',
    r'mkfs\.',
    r'dd\s+if=',
    r':\(\)\{:\|:\&\};:',  # Fork bomb
    
    # Dangerous Python
    r'os\.system\s*\(',
    r'subprocess\.call\s*\(\s*[\'"].*?rm',
    r'exec\s*\(\s*compile',
    r'__import__\s*\(\s*[\'"]os[\'"]',
    
    # Dangerous JavaScript
    r'eval\s*\(\s*atob',
    r'document\.write\s*\(\s*unescape',
    r'new\s+Function\s*\(\s*[\'"]return',
    
    # Network/exfiltration
    r'fetch\s*\(\s*[\'"]https?://[^/]*\.(ru|cn|xyz)',
    r'XMLHttpRequest.*\.open.*POST',
    
    # Crypto mining indicators
    r'coinhive',
    r'cryptonight',
    r'stratum\+tcp',
]

# Compiled patterns for efficiency
COMPILED_DANGEROUS_PATTERNS = [re.compile(p, re.IGNORECASE) for p in DANGEROUS_PATTERNS]


def validate_file_extension(path: str) -> None:
    """Check if file extension is allowed."""
    ext = path.split('.')[-1].lower() if '.' in path else ''
    
    if ext in BLOCKED_EXTENSIONS:
        raise ValidationError(f"File type '.{ext}' is not allowed for security reasons.")
    
    # For files with extensions, check against whitelist
    if ext and ext not in ALLOWED_EXTENSIONS:
        # Allow files without extensions or unknown but not dangerous
        pass  # We'll rely on content scanning for these


def validate_file_path(path: str) -> None:
    """Prevent directory traversal attacks."""
    if '..' in path:
        raise ValidationError("Invalid file path: directory traversal not allowed.")
    
    if path.startswith('/') or path.startswith('\\'):
        raise ValidationError("Invalid file path: absolute paths not allowed.")
    
    # Check for null bytes
    if '\x00' in path:
        raise ValidationError("Invalid file path: null bytes not allowed.")


def validate_file_content(content: str, path: str) -> None:
    """Scan content for dangerous patterns."""
    # Check file size
    if len(content.encode('utf-8')) > MAX_FILE_SIZE:
        raise ValidationError(f"File '{path}' exceeds maximum size of 500KB.")
    
    # Scan for dangerous patterns
    for pattern in COMPILED_DANGEROUS_PATTERNS:
        if pattern.search(content):
            raise ValidationError(
                f"File '{path}' contains potentially dangerous code patterns. "
                "Please review and remove any malicious content."
            )


def validate_project_files(files: list) -> None:
    """Validate all files in a project submission."""
    if len(files) > MAX_FILES_PER_PROJECT:
        raise ValidationError(f"Too many files. Maximum {MAX_FILES_PER_PROJECT} files allowed.")
    
    total_size = 0
    
    for file_data in files:
        path = file_data.get('path', '')
        content = file_data.get('content', '')
        
        # Validate path
        validate_file_path(path)
        validate_file_extension(path)
        
        # Validate content
        validate_file_content(content, path)
        
        total_size += len(content.encode('utf-8'))
    
    if total_size > MAX_PROJECT_SIZE:
        raise ValidationError(f"Total project size exceeds maximum of 5MB.")


def sanitize_repo_name(name: str) -> str:
    """Sanitize repository name for GitHub."""
    # Remove dangerous characters
    sanitized = re.sub(r'[^a-zA-Z0-9_.-]', '-', name)
    # Remove multiple dashes
    sanitized = re.sub(r'-+', '-', sanitized)
    # Remove leading/trailing dashes
    sanitized = sanitized.strip('-')
    # Limit length
    return sanitized[:100] if sanitized else 'my-project'
