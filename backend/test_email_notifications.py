# backend/test_email_notification.py

"""
Test script to demonstrate the Gmail notification feature for teacher creation.
This script creates a test teacher and sends an email notification.
"""

import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from models import Teacher
from werkzeug.security import generate_password_hash
from email_utils import send_teacher_credentials_email

def test_teacher_email_notification():
    """
    Test function to create a teacher and send email notification.
    """
    app = create_app()

    with app.app_context():
        # Test teacher data
        test_teacher_data = {
            "name": "Prem Kadam",
            "userid": "prem123",
            "password": "prem@123",
            "email": "premkadamgamil@gmail.com"
        }

        print("=== Junior College Result System - Email Notification Test ===")
        print(f"Creating teacher: {test_teacher_data['name']}")
        print(f"Username: {test_teacher_data['userid']}")
        print(f"Email: {test_teacher_data['email']}")
        print()

        # Check if teacher already exists
        existing_teacher = Teacher.query.filter_by(userid=test_teacher_data['userid']).first()
        if existing_teacher:
            print(f"Teacher with userid '{test_teacher_data['userid']}' already exists.")
            print("Updating existing teacher...")
            existing_teacher.name = test_teacher_data['name']
            existing_teacher.email = test_teacher_data['email']
            existing_teacher.password_hash = generate_password_hash(test_teacher_data['password'])
        else:
            # Create new teacher
            teacher = Teacher(
                name=test_teacher_data['name'],
                userid=test_teacher_data['userid'],
                email=test_teacher_data['email'],
                password_hash=generate_password_hash(test_teacher_data['password']),
                role="TEACHER",
                active=True
            )
            from app import db
            db.session.add(teacher)
            print("✓ Teacher created successfully in database")

        from app import db
        db.session.commit()

        # Send email notification
        print("Sending email notification...")
        email_sent = send_teacher_credentials_email(
            teacher_name=test_teacher_data['name'],
            teacher_email=test_teacher_data['email'],
            username=test_teacher_data['userid'],
            password=test_teacher_data['password']
        )

        if email_sent:
            print("✓ Email sent successfully!")
            print()
            print("Email Details:")
            print("- To:", test_teacher_data['email'])
            print("- Subject: Junior College Portal - Login Credentials Updated")
            print("- Contains: Name, Username, Password, and security notice")
        else:
            print("✗ Failed to send email. Check Gmail credentials and try again.")
            print()
            print("Troubleshooting:")
            print("1. Make sure MAIL_PASSWORD in .env is set to your Gmail App Password")
            print("2. Enable 2-Factor Authentication on Gmail account")
            print("3. Generate an App Password: https://support.google.com/accounts/answer/185833")
            print("4. Update .env file with the App Password (not regular password)")

        print()
        print("=== Test Complete ===")

if __name__ == "__main__":
    test_teacher_email_notification()