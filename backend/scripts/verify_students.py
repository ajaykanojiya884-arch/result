"""
Verify that the test students exist in the database.

Run: python backend/scripts/verify_students.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from app import create_app
from models import Student


def main():
    app = create_app()
    with app.app_context():
        targets = ["A-51", "A-52", "B-51", "B-52", "A-53"]
        found = Student.query.filter(Student.roll_no.in_(targets)).all()
        if not found:
            print("No matching students found.")
            return
        for s in found:
            print(f"{s.roll_no} | {s.division} | {s.name} | {s.optional_subject} | {s.optional_subject_2}")


if __name__ == '__main__':
    main()
