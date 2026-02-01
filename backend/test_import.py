# quick import test for result_service
try:
    from services import result_service
    print('imported services.result_service')
except Exception as e:
    print('import error', e)
    raise
