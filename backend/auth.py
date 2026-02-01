# backend/auth.py

from flask import Blueprint, request, jsonify
from functools import wraps
import jwt
import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from config import Config
from app import db
from models import Teacher, TeacherSubjectAllocation, Subject, Admin

# Utility functions used by tests and other modules
def hash_password(password: str) -> str:
    return generate_password_hash(password)


def verify_password(password: str, hashed: str) -> bool:
    try:
        return check_password_hash(hashed, password)
    except Exception:
        return False


def generate_token(user_id: int, user_type: str, expires_hours: int = 24) -> str:
    payload = {
        "user_id": user_id,
        "user_type": user_type,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=expires_hours),
        "iat": datetime.datetime.utcnow(),
    }
    return jwt.encode(payload, Config.SECRET_KEY, algorithm="HS256")


def verify_token(token: str):
    try:
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except Exception:
        return None

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

# ======================================================
# TOKEN DECORATOR
# ======================================================
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if "Authorization" in request.headers:
            try:
                token = request.headers["Authorization"].split(" ")[1]
            except IndexError:
                return {"error": "Invalid Authorization header"}, 401

        if not token:
            return {"error": "Token missing"}, 401

        try:
            data = jwt.decode(
                token,
                Config.SECRET_KEY,
                algorithms=["HS256"]
            )
            if not isinstance(data, dict):
                data = {}
            # Support tokens issued for both teachers and admins.
            # Prefer Admin lookup when token indicates ADMIN role to avoid id collisions.
            role = (data.get("role") or data.get("user_type") or "").upper()
            user = None
            if role == "ADMIN":
                user = Admin.query.get(data.get("user_id"))
            else:
                user = Teacher.query.get(data.get("user_id"))

            # If role was ADMIN but admin record not found, fallback to Teacher only if present
            if role == "ADMIN" and user is None:
                user = Teacher.query.get(data.get("user_id"))

            # Debug logging to assist with tracing token/user resolution during development
            try:
                print(f"[auth.token_required] token data={data}, role={role}, resolved_user={user}")
            except Exception:
                pass

            # If teacher lookup failed and role indicates ADMIN, try Admin table
            if user is None and role == "ADMIN":
                user = Admin.query.get(data.get("user_id"))

            if not user or not getattr(user, "active", True):
                return {"error": "Invalid or inactive user"}, 401

        except jwt.ExpiredSignatureError:
            return {"error": "Token expired"}, 401
        except Exception:
            return {"error": "Invalid token"}, 401

        # extra-safety: ensure `user` is defined and not None for static checkers
        if user is None:
            return {"error": "Invalid or inactive user"}, 401

        return f(
            user_id=getattr(user, "teacher_id", None) or getattr(user, "admin_id", None),
            user_type=getattr(user, "role", role),
            *args,
            **kwargs
        )

    return decorated


# ======================================================
# LOGIN
# ======================================================
@auth_bp.route("/login", methods=["POST", "OPTIONS"])
def login():
    # Handle CORS preflight request
    if request.method == "OPTIONS":
        return "", 204
    
    data = request.json or {}
    userid = data.get("userid")
    password = data.get("password")

    if not userid or not password:
        return {"error": "userid and password required"}, 400

    # Prefer admin login first (admins may share ids/userids with teachers)
    role = None
    user_id = None

    admin = Admin.query.filter_by(username=userid, active=True).first()
    if admin and check_password_hash(admin.password_hash, password):
        role = "ADMIN"
        user_id = admin.admin_id
    else:
        # Try teacher login (teachers use `userid`)
        user = Teacher.query.filter_by(userid=userid, active=True).first()
        if user and check_password_hash(user.password_hash, password):
            role = (user.role or "TEACHER").upper()
            user_id = user.teacher_id

    if not role or not user_id:
        return {"error": "Invalid username or password"}, 401

    # Issue a token using generate_token (default expiry now 24 hours)
    token = generate_token(user_id, role)

    return {"token": token, "role": role}, 200



# ======================================================
# CURRENT USER INFO
# ======================================================
@auth_bp.route("/me", methods=["GET"])
@token_required
def me(user_id=None, user_type=None):
    # Return info based on role carried by the token/decorator
    role = (user_type or "TEACHER").upper()

    if role == "ADMIN":
        admin = Admin.query.get(user_id)
        if not admin:
            return {"error": "Admin not found"}, 404
        return jsonify({
            "admin_id": admin.admin_id,
            "username": admin.username,
            "email": admin.email,
            "role": "ADMIN"
        }), 200

    # Default: teacher
    teacher = Teacher.query.get(user_id)
    if not teacher:
        return {"error": "User not found"}, 404

    allocations = TeacherSubjectAllocation.query.filter_by(
        teacher_id=teacher.teacher_id
    ).all()

    allocation_data = []
    for alloc in allocations:
        subject = Subject.query.get(alloc.subject_id)
        if subject:
            allocation_data.append({
                "subject_id": subject.subject_id,
                "subject_code": subject.subject_code,
                "subject_name": subject.subject_name,
                "division": alloc.division,
                "subject_eval_type": getattr(subject, "subject_eval_type", "MARKS")
            })

    return jsonify({
        "teacher_id": teacher.teacher_id,
        "name": teacher.name,
        "userid": teacher.userid,
        "role": teacher.role,
        "allocations": allocation_data
    }), 200


# ======================================================
# CHANGE PASSWORD (TEACHER)
# ======================================================
@auth_bp.route("/teacher/change-password", methods=["POST", "OPTIONS"])
@token_required
def teacher_change_password(user_id=None, user_type=None):
    # Handle CORS preflight
    if request.method == "OPTIONS":
        return "", 204

    role = (user_type or "TEACHER").upper()
    # Only teachers may use this endpoint to change their own password
    if role != "TEACHER":
        return {"error": "Only teachers may change password via this endpoint"}, 403

    data = request.json or {}
    old_pwd = data.get("old_password")
    new_pwd = data.get("new_password")

    if not old_pwd or not new_pwd:
        return {"error": "old_password and new_password required"}, 400

    teacher = Teacher.query.get(user_id)
    if not teacher:
        return {"error": "Teacher not found"}, 404

    if not verify_password(old_pwd, teacher.password_hash):
        return {"error": "Old password is incorrect"}, 401

    # Hash and save new password
    teacher.password_hash = hash_password(new_pwd)
    try:
        db.session.add(teacher)
        db.session.commit()
    except Exception:
        db.session.rollback()
        return {"error": "Failed to update password"}, 500

    return {"message": "Password updated"}, 200



# ======================================================
# REFRESH TOKEN
# ======================================================
@auth_bp.route("/refresh", methods=["POST"])
@token_required
def refresh(user_id=None, user_type=None):
    """Issue a new token for a valid (non-expired) token holder.
    This requires the existing token to be valid; the frontend should
    call this before expiry to extend the session.
    """
    try:
        # Ensure we have a valid user id
        if user_id is None:
            return {"error": "Invalid user"}, 401
        try:
            uid = int(user_id)
        except Exception:
            return {"error": "Invalid user id"}, 400
        role = (user_type or "TEACHER").upper()
        new_token = generate_token(uid, role)
        return {"token": new_token}, 200
    except Exception:
        return {"error": "Failed to refresh token"}, 500
