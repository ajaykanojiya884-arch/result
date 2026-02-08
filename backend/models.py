from app import db
from sqlalchemy import CheckConstraint
from sqlalchemy.orm import validates
from datetime import datetime
from flask_login import UserMixin

def now():
    return datetime.utcnow()

# =====================================================
# ADMIN
# =====================================================
class Admin(db.Model, UserMixin):
    __tablename__ = "admins"

    admin_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(150), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255))
    active = db.Column(db.Boolean, default=True, nullable=False)

    created_at = db.Column(db.DateTime, default=now, nullable=False)
    updated_at = db.Column(db.DateTime, default=now, onupdate=now, nullable=False)

    def get_id(self):
        return str(self.admin_id)


# =====================================================
# SUBJECTS
# =====================================================
class Subject(db.Model):
    __tablename__ = "subjects"

    subject_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    subject_code = db.Column(db.String(50), unique=True, nullable=False, index=True)
    subject_name = db.Column(db.String(100), nullable=False)

    subject_type = db.Column(db.String(50), nullable=False)  # CORE / OPTIONAL

    # ✅ NEW: Distinguish grade-only subjects (PE / EVS)
    subject_eval_type = db.Column(
        db.Enum("MARKS", "GRADE", name="subject_eval_type_enum"),
        nullable=False,
        default="MARKS"
    )

    active = db.Column(db.Boolean, default=True, nullable=False)

    created_at = db.Column(db.DateTime, default=now, nullable=False)
    updated_at = db.Column(db.DateTime, default=now, onupdate=now, nullable=False)

    marks = db.relationship(
        "Mark",
        backref="subject",
        cascade="all, delete-orphan"
    )

    teacher_allocations = db.relationship(
        "TeacherSubjectAllocation",
        backref="subject_ref",
        cascade="all, delete-orphan"
    )

    __table_args__ = (
        CheckConstraint(
            "subject_type != 'OPTIONAL' OR subject_code IN ('HINDI','IT','MATHS','SP')",
            name="ck_optional_allowed_codes"
        ),
    )


# =====================================================
# TEACHERS
# =====================================================
class Teacher(db.Model, UserMixin):
    __tablename__ = "teachers"

    teacher_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(200), nullable=False)
    userid = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(200))
    active = db.Column(db.Boolean, default=True, nullable=False)

    role = db.Column(
        db.Enum("ADMIN", "TEACHER", name="teacher_role_enum"),
        nullable=False,
        default="TEACHER"
    )

    created_at = db.Column(db.DateTime, default=now, nullable=False)
    updated_at = db.Column(db.DateTime, default=now, onupdate=now, nullable=False)

    subject_allocations = db.relationship(
        "TeacherSubjectAllocation",
        backref="teacher_ref",
        cascade="all, delete-orphan"
    )

    marks_entered = db.relationship(
        "Mark",
        backref="entered_by_teacher",
        cascade="all, delete-orphan"
    )

    def get_id(self):
        return str(self.teacher_id)

    def __init__(
        self,
        name: str = "",
        userid: str = "",
        password_hash: str= "",
        email: str = " ",
        role: str = "TEACHER",
        active: bool = True,
        **kwargs,
    ):
        # Allow construction with keyword args (helps static checkers like Pylance)
        if name is not None:
            self.name = name
        if userid is not None:
            self.userid = userid
        if password_hash is not None:
            self.password_hash = password_hash
        if email is not None:
            self.email = email
        if role is not None:
            self.role = role
        if active is not None:
            self.active = active

        # Accept and ignore additional kwargs to be flexible with callers
        for k, v in kwargs.items():
            try:
                setattr(self, k, v)
            except Exception:
                # ignore unknown or read-only attributes
                pass


# =====================================================
# TEACHER-SUBJECT ALLOCATIONS
# =====================================================
class TeacherSubjectAllocation(db.Model):
    __tablename__ = "teacher_subject_allocations"

    allocation_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    teacher_id = db.Column(
        db.Integer,
        db.ForeignKey("teachers.teacher_id", ondelete="CASCADE"),
        nullable=False
    )
    subject_id = db.Column(
        db.Integer,
        db.ForeignKey("subjects.subject_id", ondelete="CASCADE"),
        nullable=False
    )
    division = db.Column(db.String(10), nullable=False)

    created_at = db.Column(db.DateTime, default=now, nullable=False)
    updated_at = db.Column(db.DateTime, default=now, onupdate=now, nullable=False)

    __table_args__ = (
        db.UniqueConstraint(
            "teacher_id", "subject_id", "division",
            name="uq_teacher_subject_div"
        ),
    )


# =====================================================
# STUDENTS
# =====================================================
class Student(db.Model):
    __tablename__ = "students"

    student_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    batch_id = db.Column(db.String(10), index=True, nullable=False)

    roll_no = db.Column(db.String(50), nullable=False, index=True)
    name = db.Column(db.String(200), nullable=False)
    division = db.Column(db.String(10), nullable=False)

    optional_subject = db.Column(db.String(20))      # HINDI / IT
    optional_subject_2 = db.Column(db.String(20))    # MATHS / SP

    created_at = db.Column(db.DateTime, default=now, nullable=False)
    updated_at = db.Column(db.DateTime, default=now, onupdate=now, nullable=False)

    __table_args__ = (
        db.UniqueConstraint(
            "batch_id", "roll_no", "division",
            name="uq_batch_roll_div"
        ),
    )


# =====================================================
# MARKS (NUMERIC SUBJECTS ONLY)
# =====================================================
class Mark(db.Model):
    __tablename__ = "marks"

    mark_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    batch_id = db.Column(db.String(10), index=True, nullable=False)

    roll_no = db.Column(db.String(50), nullable=False, index=True)
    division = db.Column(db.String(10), nullable=False)

    subject_id = db.Column(
        db.Integer,
        db.ForeignKey("subjects.subject_id", ondelete="CASCADE"),
        nullable=False
    )

    unit1 = db.Column(db.Float, default=0.0)
    unit2 = db.Column(db.Float, default=0.0)
    internal = db.Column(db.Float, default=0.0)
    term = db.Column(db.Float, default=0.0)
    annual = db.Column(db.Float, default=0.0)

    tot = db.Column(db.Float, default=0.0)
    sub_avg = db.Column(db.Float, default=0.0)
    # legacy `grace` removed from marks table; grace is stored in `Result`

    entered_by = db.Column(
        db.Integer,
        db.ForeignKey("teachers.teacher_id", ondelete="SET NULL"),
        nullable=True
    )

    created_at = db.Column(db.DateTime, default=now, nullable=False)
    updated_at = db.Column(db.DateTime, default=now, onupdate=now, nullable=False)

    __table_args__ = (
        db.UniqueConstraint(
            "batch_id", "roll_no", "division", "subject_id",
            name="uq_batch_roll_div_sub"
        ),
    )

    # ✅ VALIDATION: prevent PE / EVS numeric marks
    @validates("subject_id")
    def validate_subject(self, key, subject_id):
        subject = Subject.query.get(subject_id)

        if not subject:
            raise ValueError("Invalid subject")

        if subject.subject_eval_type == "GRADE":
            raise ValueError(
                f"{subject.subject_code} is a grade-only subject "
                "and cannot have numeric marks"
            )

        return subject_id


# =====================================================
# RESULTS (AUTOMATED / MATERIALIZED PROJECTION)
# =====================================================
class Result(db.Model):
    __tablename__ = "results"

    result_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    batch_id = db.Column(db.String(10), index=True, nullable=False)

    roll_no = db.Column(db.String(50), nullable=False, index=True)
    name = db.Column(db.String(200))
    division = db.Column(db.String(10), nullable=False)

    # Numeric subject averages
    eng_avg = db.Column(db.Float)
    eng_grace = db.Column(db.Float, default=0.0)

    # Generic Optional Slots
    opt1_code = db.Column(db.String(10))
    opt1_avg = db.Column(db.Float)
    opt1_grace = db.Column(db.Float, default=0.0)

    opt2_code = db.Column(db.String(10))
    opt2_avg = db.Column(db.Float)
    opt2_grace = db.Column(db.Float, default=0.0)

    bk_avg = db.Column(db.Float)
    bk_grace = db.Column(db.Float, default=0.0)

    oc_avg = db.Column(db.Float)
    oc_grace = db.Column(db.Float, default=0.0)

    eco_avg = db.Column(db.Float)
    eco_grace = db.Column(db.Float, default=0.0)

    # Grade-only subjects
    evs_grade = db.Column(db.String(2))
    pe_grade = db.Column(db.String(2))

    # Final computed values
    overall_tot = db.Column(db.Float, default=0.0)
    total_grace = db.Column(db.Float, default=0.0)
    percentage = db.Column(db.Float, default=0.0)
    overall_grade = db.Column(db.String(50))

    is_published = db.Column(db.Boolean, default=False, nullable=False)

    created_at = db.Column(db.DateTime, default=now, nullable=False)
    updated_at = db.Column(db.DateTime, default=now, onupdate=now, nullable=False)

    __table_args__ = (
        db.UniqueConstraint(
            "batch_id", "roll_no", "division",
            name="uq_batch_result"
        ),
    )

    def get_subject_data(self, code):
        """
        Helper to fetch avg and grace for a given subject code.
        Handles Core subjects + mapped slots logic.
        Returns (avg, grace) or (None, 0.0) if not found.
        """
        code = code.upper() if code else ""
        
        # 1. Check Core
        if code == "ENG":
            return self.eng_avg, self.eng_grace
        if code == "ECO":
            return self.eco_avg, self.eco_grace
        if code == "BK":
            return self.bk_avg, self.bk_grace
        if code == "OC":
            return self.oc_avg, self.oc_grace
        
        # 2. Check Optional Slots
        if code == self.opt1_code:
            return self.opt1_avg, self.opt1_grace
        
        if code == self.opt2_code:
            return self.opt2_avg, self.opt2_grace
            
        return None, 0.0

    def __repr__(self):
        return f"<Result roll={self.roll_no} div={self.division}>"
