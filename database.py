import sqlite3

class DatabaseManager:
    """
    Handles encrypted storage of user data using SQLite.
    """
    def __init__(self, db_path="face_data.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                encrypted_embedding BLOB NOT NULL
            )
        ''')
        conn.commit()
        conn.close()

    def add_user(self, name: str, encrypted_embedding: bytes):
        """Adds or updates a user and their encrypted facial embedding."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        try:
            cursor.execute('INSERT INTO users (name, encrypted_embedding) VALUES (?, ?)', (name, encrypted_embedding))
            conn.commit()
            print(f"[DB] User '{name}' added successfully.")
        except sqlite3.IntegrityError:
            print(f"[DB] User '{name}' already exists. Updating their face data.")
            cursor.execute('UPDATE users SET encrypted_embedding = ? WHERE name = ?', (encrypted_embedding, name))
            conn.commit()
        finally:
            conn.close()

    def get_all_users(self):
        """Retrieves all users and their encrypted embeddings."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('SELECT name, encrypted_embedding FROM users')
        results = cursor.fetchall()
        conn.close()
        return results
