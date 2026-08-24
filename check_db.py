import sqlite3

conn = sqlite3.connect('app_data.db')
c = conn.cursor()

print("\n--- LATEST SESSION ---")
print(c.execute('SELECT * FROM practice_sessions ORDER BY rowid DESC LIMIT 1').fetchall())

print("\n--- LATEST ATTEMPT ---")
print(c.execute('SELECT * FROM attempts ORDER BY rowid DESC LIMIT 1').fetchall())

print("\n--- LEARNER STATE ---")
print(c.execute('SELECT * FROM learner_states WHERE user_id="user_123"').fetchall())
