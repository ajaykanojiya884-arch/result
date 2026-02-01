"""
Add five test students to the database with required optional subjects.

Run: python backend/scripts/add_test_students.py
"""
import os
import sys

# ensure backend package root is on sys.path when run from scripts/
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from app import create_app, db
from models import Subject, Student

MAIN_SUBJECTS = [
    ("ENG", "English", "CORE"),
    ("ECO", "Economics", "CORE"),
    ("BK", "Book Keeping", "CORE"),
    ("OC", "Organization of Commerce", "CORE"),
]

SAMPLE_STUDENTS = [
    {"name": "Prem", "division": "A", "optional_subject": "HINDI", "optional_subject_2": "MATHS", "roll_no": "A-51"},
    {"name": "Ajay", "division": "A", "optional_subject": "IT", "optional_subject_2": "SP", "roll_no": "A-52"},
    {"name": "Suman", "division": "B", "optional_subject": "HINDI", "optional_subject_2": "SP", "roll_no": "B-51"},
    {"name": "Rohan", "division": "B", "optional_subject": "IT", "optional_subject_2": "MATHS", "roll_no": "B-52"},
    {"name": "Kiran", "division": "A", "optional_subject": "HINDI", "optional_subject_2": "SP", "roll_no": "A-53"},
]


def safe_commit():
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()


def ensure_main_subjects():
    for code, name, typ in MAIN_SUBJECTS:
        existing = Subject.query.filter_by(subject_code=code).first()
        if not existing:
            s = Subject()
            s.subject_code = code
            s.subject_name = name
            s.subject_type = typ
            db.session.add(s)
    safe_commit()


def add_students():
    added = []
    for s in SAMPLE_STUDENTS:
        exists = Student.query.filter_by(roll_no=s['roll_no'], division=s['division']).first()
        if exists:
            continue
        st = Student()
        st.roll_no = s['roll_no']
        st.division = s['division']
        st.name = s['name']
        st.optional_subject = s['optional_subject']
        st.optional_subject_2 = s['optional_subject_2']
        db.session.add(st)
        added.append(s['roll_no'])
    safe_commit()
    return added


def main():
    app = create_app()
    with app.app_context():
        print("Ensuring main subjects exist...")
        ensure_main_subjects()
        print("Adding sample students...")
        added = add_students()
        if added:
            print("Added students:", ", ".join(added))
        else:
            print("No new students were added (they may already exist).")


if __name__ == '__main__':
    main()
