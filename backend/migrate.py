import sqlite3
import os

db_path = "f:/WP/YieldX/backend/yieldx.db"
if not os.path.exists(db_path):
    print("DB not found at:", db_path)
else:
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    columns = [
        ("profile_pic", "TEXT"),
        ("farm_size", "FLOAT"),
        ("farming_experience", "INTEGER"),
        ("preferred_crops", "VARCHAR(255)")
    ]

    for col_name, col_type in columns:
        try:
            cur.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type};")
            print(f"Added {col_name}")
        except Exception as e:
            print(f"Failed to add {col_name}: {e}")

    conn.commit()
    conn.close()
