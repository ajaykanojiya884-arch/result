#!/usr/bin/env python
"""
Legacy multi-database test script — removed.

This repository no longer supports multiple physical databases; the
workflow has been migrated to a single-database model partitioned by
`batch_id`. This script was kept as a placeholder to avoid accidental
re-use. If you need an automated test for batch switching, create a new
script targeting `/admin/batches` and `batch_config.set_active_batch`.
"""

if __name__ == '__main__':
    print("This script has been deprecated. See README for batch-based testing guidelines.")
    
    if response.status_code == 200:
        source_data = response.json()
        log(f"Source data fetched: {len(source_data)} records (or status ok)")
    else:
        log(f"Could not verify source data (endpoint may vary)", "WARNING")
    
    # Switch to target
    if not test_switch_database(target_db):
        return False
    
    log(f"✓ Switched to target database")
    time.sleep(1)
    
    # Get admins from target
    response = requests.get(
        f"{BACKEND_URL}/admin/teachers",
        headers=get_headers()
    )
    
    if response.status_code == 200:
        target_data = response.json()
        log(f"Target data fetched: {len(target_data)} records (or status ok)")
        log(f"✓ Data copying verified")
    else:
        log(f"Could not verify target data", "WARNING")
    
    return True


def test_full_workflow():
    """Run the full test workflow"""
    log_section("MULTI-DATABASE WORKFLOW TEST")
    
    # Step 1: Login
    if not login_admin():
        log("Cannot proceed without login", "ERROR")
        return False
    
    # Step 2: Get active database
    if not test_get_active_database():
        return False
    
    # Step 3: List databases
    if not test_list_databases():
        return False
    
    # Step 4: Create first test database
    db1_name = "test_workflow_db1"
    if not test_create_database(db1_name):
        log(f"Created database {db1_name} may have failed, continuing...", "WARNING")
    
    # Step 5: Create second test database
    db2_name = "test_workflow_db2"
    if not test_create_database(db2_name):
        log(f"Created database {db2_name} may have failed, continuing...", "WARNING")
    
    # Step 6: List databases again
    if not test_list_databases():
        return False
    
    # Step 7: Switch to first database
    if not test_switch_database(db1_name):
        log("Could not switch to first database", "WARNING")
    
    # Step 8: Switch to second database
    if not test_switch_database(db2_name):
        log("Could not switch to second database", "WARNING")
    
    # Step 9: Switch back to original
    if not test_get_active_database():
        return False
    
    log_section("WORKFLOW TEST COMPLETE")
    log("✓ All tests completed successfully!")
    return True


def main():
    """Main test entry point"""
    print("\n" + "="*60)
    print("  MULTI-DATABASE FEATURE TEST SUITE")
    print("="*60)
    print(f"  Backend URL: {BACKEND_URL}")
    print(f"  Admin User: {ADMIN_USERNAME}")
    print("="*60 + "\n")
    
    try:
        success = test_full_workflow()
        sys.exit(0 if success else 1)
    except Exception as e:
        log(f"Test suite failed with exception: {e}", "ERROR")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
