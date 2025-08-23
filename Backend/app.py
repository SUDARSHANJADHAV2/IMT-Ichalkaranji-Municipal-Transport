from flask import Flask, render_template, request, redirect, url_for, flash, session
import sqlite3
import os

app = Flask(__name__)
app.secret_key = 'your_secret_key_2025'  # Change this in production!

# Database setup
def init_db():
    if not os.path.exists('backend/database.db'):
        conn = sqlite3.connect('backend/database.db')
        c = conn.cursor()
        c.execute('''CREATE TABLE users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        email TEXT UNIQUE NOT NULL,
                        password TEXT NOT NULL
                    )''')
        conn.commit()
        conn.close()
init_db()

# Routes
@app.route('/')
def home():
    return 'Welcome to the Home Page! <a href="/login">Login</a> | <a href="/register">Register</a>'

@app.route('/register', methods=['POST'])
def register():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        conn = sqlite3.connect('backend/database.db')
        c = conn.cursor()

        try:
            c.execute("INSERT INTO users (email, password) VALUES (?, ?)", (email, password))
            conn.commit()
            flash('Registration successful! Please login.', 'success')
            return redirect(url_for('login'))
        except sqlite3.IntegrityError:
            flash('Email already registered!', 'danger')
        finally:
            conn.close()

    return render_template('register.html')

@app.route('/login', methods=[ 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        conn = sqlite3.connect('backend/database.db')
        c = conn.cursor()
        c.execute("SELECT * FROM users WHERE email=? AND password=?", (email, password))
        user = c.fetchone()
        conn.close()

        if user:
            session['user_id'] = user[0]
            flash('Login successful!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid credentials!', 'danger')

    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        flash('Please login first.', 'warning')
        return redirect(url_for('login'))
    return 'Welcome to your Dashboard! <a href="/logout">Logout</a>'

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    flash('Logged out successfully.', 'info')
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True)
@app.route('/login', methods=['POST'])

def login():
    # Your login logic here
    email = request.form.get('email')
    password = request.form.get('password')
    # Verify credentials, etc.
    return jsonify({'message': 'Login successful'})  # Respond with a JSON message
