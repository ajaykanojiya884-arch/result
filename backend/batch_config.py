# backend/batch_config.py
import json
import os
import threading

ACTIVE_BATCH_FILE = os.path.join(
    os.path.dirname(__file__),
    "active_batch.json"
)

_batch_lock = threading.Lock()
DEFAULT_BATCH = "2024"


def get_active_batch() -> str:
    """
    Returns the currently active academic batch/year.
    """
    with _batch_lock:
        if not os.path.exists(ACTIVE_BATCH_FILE):
            set_active_batch(DEFAULT_BATCH)
            return DEFAULT_BATCH

        try:
            with open(ACTIVE_BATCH_FILE, "r") as f:
                data = json.load(f)
                return data.get("active_batch", DEFAULT_BATCH)
        except Exception:
            set_active_batch(DEFAULT_BATCH)
            return DEFAULT_BATCH


def set_active_batch(batch_id: str):
    """
    Persist the active batch/year.
    """
    if not batch_id or not str(batch_id).strip():
        raise ValueError("batch_id cannot be empty")

    with _batch_lock:
        with open(ACTIVE_BATCH_FILE, "w") as f:
            json.dump({"active_batch": str(batch_id)}, f, indent=2)
