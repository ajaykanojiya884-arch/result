
import pytest
import math
from unittest.mock import patch
from app import create_app, db
import config
from models import Student, Mark, Result, Subject, Teacher, TeacherSubjectAllocation
from batch_config import set_active_batch
from services.result_service import generate_results_for_division

@pytest.fixture
def app():
    # Patch Config.SQLALCHEMY_DATABASE_URI to ensure we use SQLite in memory
    with patch.object(config.Config, 'SQLALCHEMY_DATABASE_URI', "sqlite:///:memory:"):
        app = create_app()
        app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
        app.config["TESTING"] = True
        
        with app.app_context():
            db.create_all()
            yield app
            db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

def test_result_refactor_slot_logic(app):
    """
    Test that result generation correctly maps optional subjects to slots
    and rounds sub_avg up.
    """
    with app.app_context():
        # Setup Batch
        batch_id = "2025-2026"
        set_active_batch(batch_id)

        # Setup Subjects
        subjects = [
            Subject(subject_code="ENG", subject_name="English", subject_type="CORE"),
            Subject(subject_code="ECO", subject_name="Economics", subject_type="CORE"),
            Subject(subject_code="BK", subject_name="Book Keeping", subject_type="CORE"),
            Subject(subject_code="OC", subject_name="Org of Commerce", subject_type="CORE"),
            Subject(subject_code="IT", subject_name="Information Tech", subject_type="OPTIONAL"),
            Subject(subject_code="MATHS", subject_name="Mathematics", subject_type="OPTIONAL")
        ]
        db.session.add_all(subjects)
        db.session.commit()
        
        # Get IDs
        s_map = {s.subject_code: s.subject_id for s in subjects}

        # Setup Student with IT and MATHS
        student = Student(
            roll_no="101",
            name="Test Student",
            division="A",
            optional_subject="IT",
            optional_subject_2="MATHS",
            batch_id=batch_id
        )
        db.session.add(student)
        db.session.commit()

        # Add Marks with decimals
        # sub_avg is the key value now.
        marks_data = [
            ("ENG", 64.1),   # Should round to 65
            ("ECO", 70.0),   # Should round to 70
            ("BK", 55.9),    # Should round to 56
            ("OC", 60.5),    # Should round to 61
            ("IT", 80.2),    # Should round to 81 (opt1)
            ("MATHS", 90.8)  # Should round to 91 (opt2)
        ]

        for code, val in marks_data:
            m = Mark(
                roll_no="101",
                division="A",
                subject_id=s_map[code],
                batch_id=batch_id,
                sub_avg=val,
                # Other fields kept minimal logic uses sub_avg
                unit1=0, unit2=0, term=0, annual=0, tot=0, internal=0
            )
            db.session.add(m)
        db.session.commit()

        # Generate Results
        generate_results_for_division("A", batch_id)

        # Verify
        result = Result.query.filter_by(roll_no="101").first()
        assert result is not None

        # Check Slots
        assert result.opt1_code == "IT"
        assert result.opt1_avg == 81.0, f"Expected 81.0, got {result.opt1_avg}"
        
        assert result.opt2_code == "MATHS"
        assert result.opt2_avg == 91.0, f"Expected 91.0, got {result.opt2_avg}"

        # Check Core Subjects Rounding
        assert result.eng_avg == 65.0, f"Expected 65.0, got {result.eng_avg}"
        assert result.eco_avg == 70.0
        assert result.bk_avg == 56.0
        assert result.oc_avg == 61.0

        # Check Percentage
        # Total = 65+70+56+61+81+91 = 424
        # Count = 6
        # Expected = 424 / 6 = 70.666... -> 70.67
        expected_total = 65+70+56+61+81+91
        expected_perc = round(expected_total / 6, 2)
        assert result.percentage == expected_perc, f"Expected {expected_perc}, got {result.percentage}"
        assert result.overall_tot == expected_total, f"Expected total {expected_total}, got {result.overall_tot}"

        # Check get_subject_data helper
        # Core
        avg, grace = result.get_subject_data("ENG")
        assert avg == 65.0
        assert grace == 0.0

        # Optional 1 (IT)
        avg, grace = result.get_subject_data("IT")
        assert avg == 81.0
        assert grace == 0.0

        # Optional 2 (MATHS)
        avg, grace = result.get_subject_data("MATHS")
        assert avg == 91.0
        assert grace == 0.0

        # Invalid/Unmapped
        avg, grace = result.get_subject_data("HINDI")
        assert avg is None
        assert grace == 0.0

        print("Test Passed: Slots mapped and Rounding correct.")
        
        # --- TEST GRACE LOGIC ---
        
        # Case 1: Condonation
        # Reset student data
        db.session.delete(result)
        db.session.commit()
        
        # Set marks for failure in ENG (28) -> needs 7 grace
        # total pass score = 35 - 28 = 7
        m = Mark.query.filter_by(roll_no="101", subject_id=s_map["ENG"]).first()
        m.sub_avg = 28.0
        db.session.add(m)
        db.session.commit()
        
        generate_results_for_division("A", batch_id)
        result = Result.query.filter_by(roll_no="101").first()
        
        assert result.eng_avg == 28.0
        assert result.eng_grace == 7.0
        assert result.total_grace == 7.0
        assert result.overall_grade == "Promoted – Passed with Condonation"
        
        # Case 2: Grade Promotion
        # Reset
        db.session.delete(result)
        db.session.commit()
        
        # Set marks to reach Total = 358 (Grade II range)
        # All pass. 358 is short of 360 (60%) by 2.
        # ENG=60, ECO=60, BK=60, OC=60, IT=60, MATHS=58 -> Total 358
        marks_setup = [
            ("ENG", 60), ("ECO", 60), ("BK", 60), ("OC", 60), ("IT", 60), ("MATHS", 58)
        ]
        for code, val in marks_setup:
            m = Mark.query.filter_by(roll_no="101", subject_id=s_map[code]).first()
            m.sub_avg = val
            db.session.add(m)
        db.session.commit()
        
        generate_results_for_division("A", batch_id)
        result = Result.query.filter_by(roll_no="101").first()
        
        assert result.overall_tot == 358.0
        # Percentage is 358/6 = 59.67 -> Grade II normally
        # But Rule 2 applies -> Promoted to Grade I
        assert result.overall_grade == "Grade I"
        assert result.total_grace == 2.0
        
        print("Test Passed: Grace Logic (Condonation & Promotion) correct.")
