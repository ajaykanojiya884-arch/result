"""
Deprecated helper script for multi-database creation.

This project no longer supports creating separate physical databases
for each batch. Database management has been replaced by a single
database partitioned by `batch_id`. Keep this file as a reminder;
delete if you no longer need it.
"""

if __name__ == '__main__':
    print("This script is deprecated. Use batch-based workflows instead.")
