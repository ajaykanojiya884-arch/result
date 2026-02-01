import sys
sys.path.insert(0, r'C:\Users\Pranay\Desktop\Result_Analysis\backend')
try:
    import services.result_service as rs
    print('imported services.result_service')
except Exception as e:
    print('import error', e)
    raise
