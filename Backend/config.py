import os

class Config: 
    SECRET_KEY = 'your-secret-key'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///instance/imt.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False


    # Email Configuration
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = 'sakshibiranje7126@gmail.com'  # Replace
    MAIL_PASSWORD = 'Sakshi1234'     # Replace
