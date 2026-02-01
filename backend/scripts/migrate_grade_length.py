
import sys
import os

# Add parent directory to path to import app context
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from sqlalchemy import text

def run_migration():
    app = create_app()
    with app.app_context():
        print("Starting migration: increasing overall_grade length...")
        
        # We need to know the database type to use the correct SQL.
        # Assuming MySQL based on the error log showing pymysql.
        # However, `backend/db_registry.sqlite` is seen in file list, which implies SQLite?
        # BUT the error log explicitly says: `(pymysql.err.DataError) (1406, "Data too long...`
        # This confirms it is MySQL.
        
        try:
            # Check current batches from registry if needed, but here we just want to hit the active DB.
            # The app context should be bound to the active database from config/registry.
            
            # Since the system supports multiple databases/batches, we might need to run this on ALL result tables 
            # or specifically the one active. The error happened on the active one.
            # The `Result` model maps to table `results`.
            
            # Let's try to alter the table.
            with db.engine.connect() as conn:
                conn.execute(text("ALTER TABLE results MODIFY overall_grade VARCHAR(50)"))
                conn.commit()
                print("Successfully altered table 'results'.")
                
        except Exception as e:
            print(f"Error during migration: {e}")
            # If it's SQLite, the syntax is different, but the error confirmed MySQL.
            # If it fails, we might need to debug.

if __name__ == "__main__":
    run_migration()
