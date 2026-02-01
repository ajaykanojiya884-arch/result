
import os, sys
import math

# ensure backend package root is on sys.path when run from scripts/
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app import create_app, db
from models import Mark

def main():
    app = create_app()
    with app.app_context():
        print("Starting fix for Marks sub_avg (rounding up to natural numbers)...")
        
        marks = Mark.query.all()
        print(f"Found {len(marks)} mark entries.")
        
        updated_count = 0
        for m in marks:
            # Recalculate based on current tot
            # Logic: sub_avg = ceil(tot / 2)
            if m.tot is None:
                continue
            
            new_sub_avg = float(math.ceil(m.tot / 2))
            
            if m.sub_avg != new_sub_avg:
                old_val = m.sub_avg
                m.sub_avg = new_sub_avg
                updated_count += 1
                # print(f"Updating Mark {m.mark_id}: {old_val} -> {new_sub_avg} (tot={m.tot})")
        
        if updated_count > 0:
            print(f"Committing updates for {updated_count} marks...")
            try:
                db.session.commit()
                print("Success.")
            except Exception as e:
                db.session.rollback()
                print(f"Error executing commit: {e}")
        else:
            print("No marks needed updating.")

if __name__ == '__main__':
    main()
