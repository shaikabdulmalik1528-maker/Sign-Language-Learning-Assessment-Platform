import sqlite3
import os

# Target the backend SQLite database
db_path = os.path.join("backend", "app_data.db")

# Also check root if app_data.db exists there
if not os.path.exists(db_path) and os.path.exists("app_data.db"):
    db_path = "app_data.db"

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 1. Drop existing tables to clear old schemas
cursor.execute("DROP TABLE IF EXISTS attempt_logs;")
cursor.execute("DROP TABLE IF EXISTS practice_sessions;")

# 2. Create practice_sessions table
cursor.execute("""
CREATE TABLE practice_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
""")

# 3. Create attempt_logs table
cursor.execute("""
CREATE TABLE attempt_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    alphabet TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    confidence_score REAL NOT NULL,
    inference_time_ms REAL NOT NULL,
    misclassified_as TEXT,
    FOREIGN KEY (session_id) REFERENCES practice_sessions (id)
);
""")

# 4. Seed dummy sessions and attempt logs for student_id = 1
cursor.execute("INSERT INTO practice_sessions (student_id) VALUES (1);")
session_id_1 = cursor.lastrowid

cursor.execute("INSERT INTO practice_sessions (student_id) VALUES (1);")
session_id_2 = cursor.lastrowid

attempts = [
    # Session 1 attempts
    (session_id_1, 'A', True, 0.95, 210.0, None),
    (session_id_1, 'B', True, 0.91, 230.0, None),
    (session_id_1, 'C', False, 0.45, 410.0, 'G'),
    (session_id_1, 'C', False, 0.52, 380.0, 'G'),
    (session_id_1, 'D', True, 0.88, 260.0, None),
    # Session 2 attempts
    (session_id_2, 'A', True, 0.98, 190.0, None),
    (session_id_2, 'B', True, 0.94, 200.0, None),
    (session_id_2, 'C', True, 0.82, 310.0, None),
    (session_id_2, 'E', False, 0.35, 520.0, 'F')
]

cursor.executemany("""
INSERT INTO attempt_logs (session_id, alphabet, is_correct, confidence_score, inference_time_ms, misclassified_as)
VALUES (?, ?, ?, ?, ?, ?);
""", attempts)

conn.commit()
conn.close()
print("Database schema successfully reset and seeded with test session data!")
