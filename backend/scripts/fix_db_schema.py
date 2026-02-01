import pymysql
import os
import sys

# Add parent directory to path to import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DB

def fix_schema():
    print(f"Connecting to database '{MYSQL_DB}' on {MYSQL_HOST}...")
    try:
        connection = pymysql.connect(
            host=MYSQL_HOST,
            port=MYSQL_PORT,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            database=MYSQL_DB,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return

    try:
        with connection.cursor() as cursor:
            # Check if column exists in subjects
            print("Checking 'subjects' table for 'subject_eval_type' column...")
            cursor.execute("DESCRIBE subjects;")
            columns = [row['Field'] for row in cursor.fetchall()]
            
            if 'subject_eval_type' not in columns:
                print("Column 'subject_eval_type' missing. Adding it...")
                sql = "ALTER TABLE subjects ADD COLUMN subject_eval_type ENUM('MARKS', 'GRADE') NOT NULL DEFAULT 'MARKS';"
                cursor.execute(sql)
                connection.commit()
                print("[OK] Column 'subject_eval_type' added successfully.")
            else:
                print("[OK] Column 'subject_eval_type' already exists.")

            # Check for other potential missing columns (SAFEGUARDS)
            # Result table: overall_tot
            print("Checking 'results' table for 'overall_tot' column...")
            cursor.execute("DESCRIBE results;")
            result_columns = [row['Field'] for row in cursor.fetchall()]
            
            if 'overall_tot' not in result_columns:
                 print("Column 'overall_tot' missing in results. Adding it...")
                 sql = "ALTER TABLE results ADD COLUMN overall_tot FLOAT DEFAULT 0.0;"
                 cursor.execute(sql)
                 connection.commit()
                 print("[OK] Column 'overall_tot' added successfully.")
            
    except Exception as e:
        print(f"Error executing schema update: {e}")
    finally:
        connection.close()

if __name__ == "__main__":
    fix_schema()
