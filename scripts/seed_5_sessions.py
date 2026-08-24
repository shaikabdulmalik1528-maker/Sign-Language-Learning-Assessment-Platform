# seed_data.py
import sqlite3
from datetime import datetime

# Connect to app_data.db inside backend/
conn = sqlite3.connect("backend/app_data.db")
cursor = conn.cursor()

# 1. Create tables if they don't exist
cursor.execute("""
CREATE TABLE IF NOT EXISTS practice_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS attempt_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    alphabet TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    confidence_score REAL NOT NULL,
    inference_time_ms REAL NOT NULL,
    misclassified_as TEXT,
    FOREIGN KEY (session_id) REFERENCES practice_sessions (id)
)
""")

# 2. Insert dummy session for student_id = 1
cursor.execute("INSERT INTO practice_sessions (student_id) VALUES (1)")
session_id = cursor.lastrowid

# 3. Insert attempt logs for this session
attempts = [
    (session_id, 'A', 1, 0.95, 250.0, None),
    (session_id, 'B', 1, 0.90, 280.0, None),
    (session_id, 'C', 0, 0.40, 450.0, 'G'),
    (session_id, 'C', 0, 0.50, 410.0, 'G'),
    (session_id, 'D', 1, 0.88, 300.0, None),
    (session_id, 'E', 1, 0.92, 260.0, None),
]

cursor.executemany("""
INSERT INTO attempt_logs (session_id, alphabet, is_correct, confidence_score, inference_time_ms, misclassified_as)
VALUES (?, ?, ?, ?, ?, ?)
""", attempts)

conn.commit()
conn.close()
print(f"Successfully seeded session {session_id} with attempt logs for student_id = 1!")
