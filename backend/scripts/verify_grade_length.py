
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from models import Result
from sqlalchemy import text

def verify_fix():
    app = create_app()
    with app.app_context():
        print("Verifying overall_grade length...")
        
        long_grade = "Promoted – Passed with Condonation" # 34 chars
        print(f"Testing string length: {len(long_grade)}")
        
        try:
            # We don't want to mess up real data, so let's just create a dummy result momentarily or just check schema.
            # actually better to just try an INSERT/UPDATE on a dummy ID if possible, or rollback.
            
            # Let's inspect column type via SQL first to be safe
            with db.engine.connect() as conn:
                result = conn.execute(text("DESCRIBE results overall_grade"))
                # Output: Field, Type, Null, Key, Default, Extra
                for row in result:
                    print(f"Column Definition: {row}")
                    # Type should be varchar(50)
            
            print("Verification Check Complete. Please ensure 'varchar(50)' is visible above.")

        except Exception as e:
            print(f"Verification failed: {e}")

if __name__ == "__main__":
    verify_fix()
