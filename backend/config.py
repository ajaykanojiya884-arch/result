# backend/config.py
import os
from dotenv import load_dotenv

load_dotenv()

# --------------------------------------------------
# Flask Configuration
# --------------------------------------------------
FLASK_ENV = os.getenv("FLASK_ENV", "development")
DEBUG = os.getenv("FLASK_DEBUG", "False").lower() == "true"
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")

# --------------------------------------------------
# MySQL Database Configuration (SINGLE SOURCE OF TRUTH)
# --------------------------------------------------
MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", 3306))
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "root")
MYSQL_DB = os.getenv("MYSQL_DB", "result_analysis")

SQLALCHEMY_DATABASE_URI = (
    f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}"
    f"@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}"
)

SQLALCHEMY_TRACK_MODIFICATIONS = False

# --------------------------------------------------
# CORS Configuration
# --------------------------------------------------
CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS", "http://localhost:3000"
).split(",")

# --------------------------------------------------
# Grace Marks Configuration
# --------------------------------------------------
# Default increased to 20 (can be overridden via .env)
GRACE_MAX = int(os.getenv("GRACE_MAX", "20"))

# --------------------------------------------------
# Master Excel Configuration (Optional)
# --------------------------------------------------
# If empty, admin routes can ignore master Excel behavior
MASTER_EXCEL_PATH = os.getenv(
    "MASTER_EXCEL_PATH",
    os.path.join(os.path.dirname(__file__), "db_exports", "master_marks.xlsx")
)
MASTER_EXCEL_SHEET = os.getenv("MASTER_EXCEL_SHEET", "Marks")

# --------------------------------------------------
# Config Class (Used by Flask App)
# --------------------------------------------------
class Config:
    SECRET_KEY = SECRET_KEY
    SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    GRACE_MAX = GRACE_MAX

    # Email Configuration (Gmail SMTP)
    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.getenv("MAIL_PORT", 587))
    MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "True").lower() == "true"
    MAIL_USE_SSL = os.getenv("MAIL_USE_SSL", "False").lower() == "true"
    MAIL_USERNAME = os.getenv("MAIL_USERNAME", "abc@gmail.com")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "")
    MAIL_DEFAULT_SENDER = os.getenv(
        "MAIL_DEFAULT_SENDER", "Kanoujiyadeepak19@gmail.com"
    )
