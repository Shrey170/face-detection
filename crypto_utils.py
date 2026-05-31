import os
import numpy as np
from cryptography.fernet import Fernet

class CryptoManager:
    """
    Manages encryption and decryption of facial embeddings to ensure data security.
    Uses Fernet symmetric encryption from the cryptography library.
    """
    def __init__(self, key_file="secret.key"):
        self.key_file = key_file
        self.key = self._load_or_generate_key()
        self.fernet = Fernet(self.key)

    def _load_or_generate_key(self):
        if os.path.exists(self.key_file):
            with open(self.key_file, "rb") as f:
                return f.read()
        else:
            key = Fernet.generate_key()
            with open(self.key_file, "wb") as f:
                f.write(key)
            return key

    def encrypt_embedding(self, embedding: np.ndarray) -> bytes:
        """Encrypts a numpy array embedding."""
        embedding_bytes = embedding.tobytes()
        encrypted_data = self.fernet.encrypt(embedding_bytes)
        return encrypted_data

    def decrypt_embedding(self, encrypted_data: bytes, dtype=np.float64) -> np.ndarray:
        """Decrypts bytes back into a numpy array embedding."""
        decrypted_bytes = self.fernet.decrypt(encrypted_data)
        embedding = np.frombuffer(decrypted_bytes, dtype=dtype).copy()
        return embedding
