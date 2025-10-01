#!/usr/bin/env python
"""
Script to ensure the database exists before running migrations.
Used in CI/CD environments.
"""
import os
import sys
import psycopg2
from urllib.parse import urlparse

# Get database URL from environment or use default
db_url = os.environ.get('DATABASE_URL', 'postgres://postgres:postgres@localhost:5432/project_management')

# Parse the URL
url = urlparse(db_url)
dbname = url.path[1:]  # Remove leading slash
user = url.username
password = url.password
host = url.hostname
port = url.port

try:
    # Connect to default postgres database
    conn = psycopg2.connect(
        dbname='postgres',
        user=user,
        password=password,
        host=host,
        port=port
    )
    conn.autocommit = True
    cursor = conn.cursor()
    
    # Check if our database exists
    cursor.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{dbname}'")
    exists = cursor.fetchone()
    
    if not exists:
        print(f"Creating database {dbname}...")
        cursor.execute(f'CREATE DATABASE {dbname}')
        print(f"Database {dbname} created successfully!")
    else:
        print(f"Database {dbname} already exists.")
    
    cursor.close()
    conn.close()
    
    print("Database check completed successfully.")
    sys.exit(0)
except Exception as e:
    print(f"Error ensuring database exists: {e}")
    sys.exit(1)
