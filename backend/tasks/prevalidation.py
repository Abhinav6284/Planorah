"""
Pre-validation for manual submissions.
Reduces human reviewer load by catching obvious issues automatically.
"""
import requests
import hashlib
from typing import Dict, Any, List, Tuple, Optional
from urllib.parse import urlparse


class PreValidator:
    """
    Pre-validation checks before manual review.
    Catches obvious issues to reduce human workload.
    """

    def __init__(self, proof_type: str, proof_payload: Dict[str, Any]):
        self.proof_type = proof_type
        self.proof_payload = proof_payload
        self.errors = []
        self.warnings = []

    def validate(self) -> Tuple[bool, Dict[str, Any]]:
        """
        Run pre-validation checks.

        Returns:
            (should_proceed, details) where:
            - should_proceed: True if should go to manual review, False to reject immediately
            - details: Dict with errors, warnings, and metadata
        """
        if self.proof_type == 'FILE_UPLOAD':
            return self._validate_file_upload()
        elif self.proof_type == 'URL':
            return self._validate_url()
        else:
            # No pre-validation for other types
            return True, {'status': 'no_prevalidation'}

    def _validate_file_upload(self) -> Tuple[bool, Dict[str, Any]]:
        """Pre-validate file uploads."""
        file_path = self.proof_payload.get('file_path', '')
        file_size = self.proof_payload.get('file_size', 0)
        file_type = self.proof_payload.get('file_type', '')

        # Check file size (max 50MB)
        max_size = 50 * 1024 * 1024  # 50MB
        if file_size > max_size:
            self.errors.append(
                f"File too large: {file_size / (1024*1024):.1f}MB (max: 50MB)")
            return False, {
                'status': 'rejected',
                'reason': 'File size exceeds limit',
                'errors': self.errors
            }

        # Check file type (basic whitelist)
        allowed_types = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/gif',
            'video/mp4',
            'application/zip',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]

        if file_type and file_type not in allowed_types:
            self.warnings.append(f"Unusual file type: {file_type}")

        # Check if file path is provided
        if not file_path:
            self.errors.append("No file path provided")
            return False, {
                'status': 'rejected',
                'reason': 'Missing file path',
                'errors': self.errors
            }

        return True, {
            'status': 'passed_prevalidation',
            'warnings': self.warnings,
            'metadata': {
                'file_size_mb': round(file_size / (1024*1024), 2),
                'file_type': file_type
            }
        }

    def _validate_url(self) -> Tuple[bool, Dict[str, Any]]:
        """Pre-validate URL submissions."""
        url = self.proof_payload.get('url', '')

        # Check URL format
        if not url:
            self.errors.append("No URL provided")
            return False, {
                'status': 'rejected',
                'reason': 'Missing URL',
                'errors': self.errors
            }

        # Parse URL
        try:
            parsed = urlparse(url)
            if not parsed.scheme or not parsed.netloc:
                self.errors.append(f"Invalid URL format: {url}")
                return False, {
                    'status': 'rejected',
                    'reason': 'Invalid URL format',
                    'errors': self.errors
                }
        except Exception as e:
            self.errors.append(f"Cannot parse URL: {str(e)}")
            return False, {
                'status': 'rejected',
                'reason': 'URL parsing error',
                'errors': self.errors
            }

        # Check URL availability (HEAD request)
        try:
            response = requests.head(url, timeout=10, allow_redirects=True)

            if response.status_code == 404:
                self.errors.append("URL returns 404 Not Found")
                return False, {
                    'status': 'rejected',
                    'reason': 'URL not accessible (404)',
                    'errors': self.errors
                }

            if response.status_code >= 500:
                self.warnings.append(
                    f"URL returns server error: {response.status_code}")

            return True, {
                'status': 'passed_prevalidation',
                'warnings': self.warnings,
                'metadata': {
                    'url': url,
                    'status_code': response.status_code,
                    'content_type': response.headers.get('Content-Type', 'unknown')
                }
            }

        except requests.Timeout:
            self.warnings.append("URL request timed out - may be slow")
            return True, {
                'status': 'passed_prevalidation',
                'warnings': self.warnings,
                'metadata': {'url': url, 'timeout': True}
            }

        except requests.RequestException as e:
            self.errors.append(f"Cannot reach URL: {str(e)}")
            return False, {
                'status': 'rejected',
                'reason': 'URL not reachable',
                'errors': self.errors
            }


def compute_content_hash(content: bytes) -> str:
    """
    Compute SHA256 hash of content for similarity detection.

    Args:
        content: File content as bytes

    Returns:
        Hex digest of SHA256 hash
    """
    return hashlib.sha256(content).hexdigest()


def check_hash_similarity(new_hash: str, existing_hashes: list) -> Tuple[bool, Optional[str]]:
    """
    Check if content hash matches existing submissions (plagiarism detection).

    Args:
        new_hash: Hash of new submission
        existing_hashes: List of hashes from previous submissions

    Returns:
        (is_duplicate, matching_hash) where:
        - is_duplicate: True if hash matches an existing submission
        - matching_hash: The matching hash if found, else None
    """
    if new_hash in existing_hashes:
        return True, new_hash

    return False, None
