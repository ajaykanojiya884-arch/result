"""
db_utils.py

Utility helpers used by the backend. This file now only contains a
graceful restart helper previously shared by the multi-database flow.
"""
import os
import signal
import threading
import time

_restart_lock = threading.Lock()
_restart_scheduled = False


def schedule_restart(delay_seconds: int = 1):
    """Gracefully restart the current process after a short delay.

    This is used when a persistent configuration change requires the
    backend process to restart (for example, when admins change global
    settings). The function is intentionally conservative and idempotent.
    """
    global _restart_scheduled

    with _restart_lock:
        if _restart_scheduled:
            return
        _restart_scheduled = True

    def _restart():
        time.sleep(delay_seconds)
        try:
            os.kill(os.getpid(), signal.SIGTERM)
        except Exception:
            # In some environments os.kill may not behave as expected;
            # swallow any exception and let the process exit naturally.
            pass

    t = threading.Thread(target=_restart, daemon=True)
    t.start()
