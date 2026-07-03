import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from dotenv import load_dotenv

# Load env variables
load_dotenv()

DB_USER = os.environ.get('DB_USER', 'postgres')
DB_PASSWORD = os.environ.get('DB_PASSWORD', '')
DB_HOST = os.environ.get('DB_HOST', 'localhost')
DB_NAME = os.environ.get('DB_NAME', 'yieldx')

print(f"Attempting to connect to PostgreSQL as user '{DB_USER}' at '{DB_HOST}'...")
try:
    # Connect to the default 'postgres' database to issue the CREATE DATABASE command
    conn = psycopg2.connect(
        dbname='postgres',
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()
    
    # Check if database exists
    cursor.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{DB_NAME}'")
    exists = cursor.fetchone()
    
    if not exists:
        print(f"Creating database '{DB_NAME}'...")
        cursor.execute(f'CREATE DATABASE {DB_NAME}')
        print("Database created successfully!")
    else:
        print(f"Database '{DB_NAME}' already exists.")
        
    cursor.close()
    conn.close()
    print("All done!")
except Exception as e:
    print(f"Error: {e}")
