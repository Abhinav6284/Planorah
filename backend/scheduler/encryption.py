"""
Token encryption utilities for secure OAuth credential storage.
Encrypts tokens at rest using Django SECRET_KEY.
"""

import os
import json
from base64 import b64encode, b64decode
from cryptography.fernet import Fernet
from django.conf import settings


class TokenEncryption:
    """Encrypt/decrypt OAuth tokens using Django SECRET_KEY."""

    @staticmethod
    def _get_cipher():
        """Create a Fernet cipher from Django SECRET_KEY."""
        # Use first 32 bytes of SECRET_KEY, base64 encoded for Fernet
        secret = settings.SECRET_KEY.encode()[:32]
        # Pad to 32 bytes if needed
        if len(secret) < 32:
            secret = secret.ljust(32, b'\0')
        # Convert to valid Fernet key (base64 encoded 32 bytes)
        key = b64encode(secret[:32])
        return Fernet(key)

    @classmethod
    def encrypt(cls, plaintext: str) -> str:
        """
        Encrypt a token string.
        Returns: base64-encoded encrypted value
        """
        if not plaintext:
            return None
        cipher = cls._get_cipher()
        encrypted = cipher.encrypt(plaintext.encode())
        return b64encode(encrypted).decode()

    @classmethod
    def decrypt(cls, ciphertext: str) -> str:
        """
        Decrypt an encrypted token.
        Returns: plaintext token
        Raises: InvalidToken if decryption fails
        """
        if not ciphertext:
            return None
        try:
            cipher = cls._get_cipher()
            encrypted = b64decode(ciphertext.encode())
            decrypted = cipher.decrypt(encrypted)
            return decrypted.decode()
        except Exception as e:
            raise ValueError(f"Token decryption failed: {str(e)}")
