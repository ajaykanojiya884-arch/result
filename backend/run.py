# run.py

import os
from app import create_app

# Allow opt-in/out of serving built frontend via environment variable
SERVE_FRONTEND = os.environ.get('SERVE_FRONTEND', '1') not in ('0', 'false', 'False')

# Helpful startup message to remind building frontend
if SERVE_FRONTEND:
    build_path = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'build'))
    if not os.path.isdir(build_path):
        print("[WARN] Frontend build not detected. Run 'npm run build' in the frontend directory to enable SPA serving.")

app = create_app(serve_frontend=SERVE_FRONTEND)

if __name__ == "__main__":
    try:
        from config import FLASK_ENV
    except ImportError:
        FLASK_ENV = "production"

    debug_mode = (FLASK_ENV == 'development')
    
    # The Werkzeug reloader should be used in development for a better developer experience.
    app.run(host='0.0.0.0', debug=debug_mode, use_reloader=debug_mode)
