import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'yieldx.db')

def migrate():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN address_line VARCHAR(255)")
        print("Successfully added address_line to users table.")
    except sqlite3.OperationalError as e:
        print(f"Error (column might already exist): {e}")
        
    conn.commit()
    conn.close()

if __name__ == "__main__":
    migrate()
