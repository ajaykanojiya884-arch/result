# backend/email_utils.py

from flask_mail import Message
from app import mail
import logging

logger = logging.getLogger(__name__)

def send_email(to_email, subject, body):
    """
    Send an email using Flask-Mail with Gmail SMTP.

    Args:
        to_email (str): Recipient email address
        subject (str): Email subject
        body (str): Email body (HTML supported)

    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        msg = Message(
            subject=subject,
            recipients=[to_email],
            html=body
        )

        mail.send(msg)
        logger.info(f"Email sent successfully to {to_email}")
        return True

    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False

def send_teacher_credentials_email(teacher_name, teacher_email, username, password):
    """
    Send email notification to teacher with their login credentials.

    Args:
        teacher_name (str): Teacher's full name
        teacher_email (str): Teacher's email address
        username (str): Teacher's username
        password (str): Teacher's plain text password

    Returns:
        bool: True if email sent successfully, False otherwise
    """
    subject = "Junior College Portal - Login Credentials Updated"

    body = f"""
    <html>
    <body>
        <h2>Junior College Portal - Login Credentials</h2>

        <p>Dear {teacher_name},</p>

        <p>Your login credentials for the Junior College Result Analysis Portal have been updated.</p>

        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Login Details:</h3>
            <p><strong>Name:</strong> {teacher_name}</p>
            <p><strong>Username:</strong> {username}</p>
            <p><strong>Password:</strong> {password}</p>
        </div>

        <p style="color: #d32f2f; font-weight: bold;">
            ⚠️ IMPORTANT: Please keep your login credentials confidential and do not share them with anyone.
        </p>

        <p>You can access the portal at: <a href="http://localhost:3000">Junior College Portal</a></p>

        <p>If you have any questions, please contact the system administrator.</p>

        <br>
        <p>Best regards,<br>
        Junior College Administration</p>
    </body>
    </html>
    """

    return send_email(teacher_email, subject, body)