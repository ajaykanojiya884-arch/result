# /backend/services/result_service.py

from models import Student, Mark, Result, Subject, TeacherSubjectAllocation
from app import db


# ---------------- SUBJECT GRACE HELPER ----------------
def apply_subject_grace(mark_map, required_codes):
    PASS_MARK = 35
    TOTAL_GRACE = 15
    MAX_SUBJECTS = 3
    MAX_PER_SUBJECT = 10

    remaining = TOTAL_GRACE
    used = 0

    adjusted = {}
    grace_by_code = {}

    for code in required_codes:
        if used >= MAX_SUBJECTS or remaining <= 0:
            # still populate zeros for remaining codes
            break

        m = mark_map.get(code)
        if not m or m.annual is None:
            continue

        orig = m.annual
        if orig < PASS_MARK:
            needed = PASS_MARK - orig
            g = min(needed, MAX_PER_SUBJECT, remaining)
            adjusted[code] = orig + g
            grace_by_code[code] = g
            remaining -= g
            used += 1
        else:
            adjusted[code] = orig
            grace_by_code[code] = 0.0

    # Ensure every required code has entries (defaults)
    for code in required_codes:
        if code not in adjusted:
            m = mark_map.get(code)
            adjusted[code] = m.annual if (m and m.annual is not None) else None
            grace_by_code[code] = 0.0

    return adjusted, grace_by_code



import math

def generate_results_for_division(division: str, batch_id: str):
    """
    Generate / update results for all students in a division.

    Logic:
    1. Filter students by division and batch.
    2. Determine required subjects (Core + Student Optionals).
    3. Fetch marks and use `sub_avg` (rounded up) as the value.
    4. Map optionals to `opt1` and `opt2` slots.
    5. Calculate percentage based on these rounded averages.
    """
    
    # 1. Fetch Students
    students = Student.query.filter_by(division=division, batch_id=batch_id).all()
    if not students:
        return

    # 2. Fetch Marks for this division
    marks = Mark.query.filter_by(
        division=division, 
        batch_id=batch_id
    ).all()

    # Organize marks by (roll_no, subject_code) for fast lookup
    # Need subject map to convert subject_id -> code
    subjects_map = {s.subject_id: s.subject_code for s in Subject.query.all()}
    
    # mark_map key: (roll_no, subject_code) -> Mark object
    mark_map = {}
    for m in marks:
        code = subjects_map.get(m.subject_id)
        if code:
            mark_map[(m.roll_no, code)] = m

    # 3. Process each student
    for student in students:
        # Determine strict required subjects
        # Core + Student's selected optionals
        required_codes = ["ENG", "ECO", "BK", "OC"]
        if student.optional_subject:
            required_codes.append(student.optional_subject)
        if student.optional_subject_2:
            required_codes.append(student.optional_subject_2)

        # Check if all required marks are present (using sub_avg check as proxy for valid mark entry)
        # Note: We rely on `sub_avg` being present.
        missing_required = False
        student_marks = {} 

        for code in required_codes:
            m = mark_map.get((student.roll_no, code))
            if not m or m.sub_avg is None:
                missing_required = True
                break
            student_marks[code] = m

        if missing_required:
            # If Result exists, clear valid flag or percentage to indicate incomplete
            existing = Result.query.filter_by(roll_no=student.roll_no, division=student.division, batch_id=batch_id).first()
            if existing:
                existing.percentage = None
                existing.total_grace = 0.0
                db.session.add(existing)
            continue

        # All marks present. Prepare Result row.
        result = Result.query.filter_by(
            roll_no=student.roll_no,
            division=student.division,
            batch_id=batch_id,
        ).first()

        if not result:
            result = Result()
            result.roll_no = student.roll_no
            result.name = student.name
            result.division = student.division
            result.batch_id = batch_id
        
        # Reset all slots to None/0 before populating
        result.opt1_code = None
        result.opt1_avg = None
        result.opt1_grace = 0.0
        result.opt2_code = None
        result.opt2_avg = None
        result.opt2_grace = 0.0

        total_score = 0.0
        subject_count = 0

        # Helper to get rounded mark
        def get_rounded_mark(code):
            m = student_marks.get(code)
            if m and m.sub_avg is not None:
                # CEILING logic: 64.1 -> 65, 64.0 -> 64
                return float(math.ceil(m.sub_avg))
            return 0.0

        # --- CORE SUBJECTS ---
        # ENG
        val_eng = get_rounded_mark("ENG")
        result.eng_avg = val_eng
        result.eng_grace = 0.0 # Grace logic placeholder
        total_score += val_eng
        subject_count += 1

        # ECO
        val_eco = get_rounded_mark("ECO")
        result.eco_avg = val_eco
        result.eco_grace = 0.0
        total_score += val_eco
        subject_count += 1

        # BK
        val_bk = get_rounded_mark("BK")
        result.bk_avg = val_bk
        result.bk_grace = 0.0
        total_score += val_bk
        subject_count += 1

        # OC
        val_oc = get_rounded_mark("OC")
        result.oc_avg = val_oc
        result.oc_grace = 0.0
        total_score += val_oc
        subject_count += 1

        # --- OPTIONAL SLOT 1 ---
        # Mapped from Student.optional_subject
        if student.optional_subject:
            code = student.optional_subject
            val = get_rounded_mark(code)
            result.opt1_code = code
            result.opt1_avg = val
            result.opt1_grace = 0.0
            total_score += val
            subject_count += 1

        # --- OPTIONAL SLOT 2 ---
        # Mapped from Student.optional_subject_2
        if student.optional_subject_2:
            code = student.optional_subject_2
            val = get_rounded_mark(code)
            result.opt2_code = code
            result.opt2_avg = val
            result.opt2_grace = 0.0
            total_score += val
            subject_count += 1

        # --- PERCENTAGE & GRACE LOGIC ---
        
        # 1. Base Percentage (No Grace)
        if subject_count > 0:
            result.percentage = round(total_score / subject_count, 2)
        else:
            result.percentage = 0.0
        
        result.overall_tot = total_score
        
        # 2. Identify Failed Subjects
        # Collect (code, score) for subjects < 35
        # Note: We track by code to assign grace later
        failed_subjects = []
        
        # Helper to check pass/fail
        def check_fail(code, score):
            if score < 35.0:
                failed_subjects.append(code)

        check_fail("ENG", result.eng_avg)
        check_fail("ECO", result.eco_avg)
        check_fail("BK", result.bk_avg)
        check_fail("OC", result.oc_avg)
        if result.opt1_code: check_fail(result.opt1_code, result.opt1_avg)
        if result.opt2_code: check_fail(result.opt2_code, result.opt2_avg)

        # 3. Apply Logic
        MAX_GRACE_TOTAL = 15
        MAX_GRACE_SUB = 10
        
        # Reset grace
        result.total_grace = 0.0
        
        # Default Grade Calculation (Based on Percentage)
        def get_grade_from_percentage(perc):
            if perc >= 75: return "Grade I with Distinction"
            if perc >= 60: return "Grade I"
            if perc >= 45: return "Grade II"
            if perc >= 35: return "Pass Class"
            return "Fail"

        current_grade = get_grade_from_percentage(result.percentage)

        # --- RULE 1: Subject Passing (Condonation) ---
        condonation_applied = False
        
        if failed_subjects:
            # Check eligibility
            if len(failed_subjects) <= 3:
                needed_grace = 0
                eligible = True
                grace_map = {} # code -> amount needed
                
                for code in failed_subjects:
                    # fetch current val
                    val, _ = result.get_subject_data(code)
                    if val is None: val = 0.0
                    
                    deficit = 35.0 - val
                    if deficit > MAX_GRACE_SUB:
                        eligible = False
                        break
                    
                    grace_map[code] = deficit
                    needed_grace += deficit
                
                if eligible and needed_grace <= MAX_GRACE_TOTAL:
                    # APPLY CONDONATION
                    condonation_applied = True
                    result.total_grace = needed_grace
                    result.overall_grade = "Promoted - Passed with Condonation"
                    
                    # Distribute grace to fields
                    for code, g_val in grace_map.items():
                        if code == "ENG": result.eng_grace = g_val
                        elif code == "ECO": result.eco_grace = g_val
                        elif code == "BK": result.bk_grace = g_val
                        elif code == "OC": result.oc_grace = g_val
                        elif code == result.opt1_code: result.opt1_grace = g_val
                        elif code == result.opt2_code: result.opt2_grace = g_val
            
            if not condonation_applied:
                # Failed and not covered by grace
                result.overall_grade = "Fail"
        else:
            # No failed subjects -> Passed
            # --- RULE 2: Grade II -> Grade I Promotion ---
            # Only if NO subject grace was needed (condition: failed_subjects empty here)
            promotion_applied = False
            
            if current_grade == "Grade II":
                # Check tot score range [357, 359]
                # target is 360 (60% of 6 subjects usually, assuming 600 total?)
                # Wait, "percentage based" means 60% of total marks. 
                # If subject_count=6 and max=100 each, total=600. 60% is 360.
                # If subject_count is different, scale accordingly?
                # User prompt said: "total_marks \u2208 [357, 359]" explicitly. 
                # I will adhere to 357-359 range assuming 6 subjects * 100.
                
                if 357 <= result.overall_tot <= 359:
                    deficit = 360.0 - result.overall_tot
                    # Logic says "Up to 3 grace marks". 360-357=3. 360-359=1.
                    # Fits 3 limit.
                    
                    result.total_grace = deficit
                    result.overall_grade = "Grade I"
                    promotion_applied = True
            
            if not promotion_applied:
                result.overall_grade = current_grade

        db.session.add(result)

    db.session.commit()

