import sqlite3

def init_db():
    conn = sqlite3.connect("imt.db")
    cur = conn.cursor()
    cur.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            phone TEXT,
            password TEXT
        )
    ''')
    conn.commit()
    conn.close()

def add_user(data):
    conn = sqlite3.connect("imt.db")
    cur = conn.cursor()
    
    cur.execute('''
        INSERT INTO users (name, email, phone, password)
        VALUES (?, ?, ?, ?)
    ''', (data['firstName'] + " " + data['lastName'], data['email'], data['phone'], data['password']))
    conn.commit()
    conn.close()
