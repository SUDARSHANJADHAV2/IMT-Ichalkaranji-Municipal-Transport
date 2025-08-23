import random, smtplib
from email.message import EmailMessage

otp_db = {}  # In-memory OTP store

def send_otp(email):
    otp = str(random.randint(100000, 999999))
    otp_db[email] = otp

    msg = EmailMessage()
    msg.set_content(f"Your OTP is {otp}")
    
    msg['Subject'] = 'IMT Registration OTP'
    msg['From'] = "your.email@gmail.com"
    msg['To'] = email

    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
        server.login("your.email@gmail.com", "yourpassword")
        server.send_message(msg)
    return otp

def verify_otp(email, user_otp):
    return otp_db.get(email) == user_otp
