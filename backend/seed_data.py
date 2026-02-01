"""
DEV ONLY SEED DATA
Creates students, allocations, and marks.
DO NOT RUN IN PRODUCTION.
"""

import random
from werkzeug.security import generate_password_hash
from app import create_app, db
from models import (
    Admin,
    Teacher,
    Student,
    Subject,
    TeacherSubjectAllocation,
    Mark
)
from batch_config import get_active_batch


DIVISIONS = ["A", "B"]
STUDENTS_PER_DIV = 10


def seed():
    app = create_app()

    with app.app_context():
        print("🌱 Seeding development data...")

        batch_id = get_active_batch()

        # --------------------------------------------------
        # 1️⃣ Admin
        # --------------------------------------------------
        if Admin.query.count() == 0:
            admin = Admin(
                username="admin",
                password_hash=generate_password_hash("admin123"),
                email="admin@test.com",
                active=True
            )
            db.session.add(admin)
            print("✓ Admin added")

        # --------------------------------------------------
        # 2️⃣ Teachers
        # --------------------------------------------------
        if Teacher.query.count() == 0:
            teachers = [
                ("ENG", "English Teacher"),
                ("ECO", "Economics Teacher"),
                ("BK", "Book Keeping Teacher"),
                ("OC", "OC Teacher"),
                ("HINDI", "Hindi Teacher"),
                ("IT", "IT Teacher"),
                ("MATHS", "Maths Teacher"),
                ("SP", "SP Teacher"),
                ("EVS", "EVS Teacher"),
                ("PE", "PE Teacher"),
            ]

            for code, name in teachers:
                db.session.add(
                    Teacher(
                        name=name,
                        userid=f"{code.lower()}_teacher",
                        password_hash=generate_password_hash("teacher123"),
                        role="TEACHER"
                    )
                )

            print("✓ Teachers added")

        db.session.commit()

        # --------------------------------------------------
        # 3️⃣ Students (10 per division, random optionals)
        # --------------------------------------------------
        if Student.query.count() == 0:
            roll = 1

            for div in DIVISIONS:
                for i in range(STUDENTS_PER_DIV):
                    opt1 = random.choice(["HINDI", "IT"])
                    opt2 = random.choice(["MATHS", "SP"])

                    student = Student(
                        roll_no=str(roll),
                        name=f"Student {roll}",
                        division=div,
                        optional_subject=opt1,
                        optional_subject_2=opt2,
                        batch_id=batch_id
                    )
                    db.session.add(student)
                    roll += 1

            print("✓ Students added")

        db.session.commit()

        # --------------------------------------------------
        # 4️⃣ Teacher ↔ Subject Allocation (ALL subjects, BOTH divisions)
        # --------------------------------------------------
        if TeacherSubjectAllocation.query.count() == 0:
            teachers = {t.userid: t for t in Teacher.query.all()}
            subjects = {s.subject_code: s for s in Subject.query.all()}

            for div in DIVISIONS:
                for code, subject in subjects.items():
                    teacher_key = f"{code.lower()}_teacher"
                    teacher = teachers.get(teacher_key)

                    if not teacher:
                        continue

                    alloc = TeacherSubjectAllocation(
                        teacher_id=teacher.teacher_id,
                        subject_id=subject.subject_id,
                        division=div
                    )
                    db.session.add(alloc)

            print("✓ Teacher-subject allocations added")

        db.session.commit()

        # --------------------------------------------------
        # 5️⃣ Marks (ONLY numeric subjects, random values)
        # --------------------------------------------------
        if Mark.query.count() == 0:
            subjects = {s.subject_code: s for s in Subject.query.all()}
            students = Student.query.all()

            for student in students:
                # CORE subjects
                core_subjects = ["ENG", "ECO", "BK", "OC"]

                # Optional subjects (only chosen ones)
                optional_subjects = [
                    student.optional_subject,
                    student.optional_subject_2
                ]

                for code in core_subjects + optional_subjects:
                    subject = subjects.get(code)
                    if not subject:
                        continue

                    # Skip grade-only subjects
                    if subject.subject_eval_type == "GRADE":
                        continue

                    mark = Mark(
                        roll_no=student.roll_no,
                        division=student.division,
                        batch_id=batch_id,          
                        subject_id=subject.subject_id,
                        unit1=random.randint(5, 25),
                        unit2=random.randint(5, 25),
                        term=random.randint(10, 50),
                        internal=random.randint(10, 20),
                        annual=random.randint(35, 80),
                    )
                    db.session.add(mark)

            print("✓ Marks added (numeric subjects only)")

        db.session.commit()

        print("✅ DEV DATA SEEDING COMPLETE")


if __name__ == "__main__":
    seed()
