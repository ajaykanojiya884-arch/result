import os
from flask import Flask, g, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import Config
from batch_config import get_active_batch
from flask_mail import Mail

# Build-aware static serving for single-file deployment
BASE_DIR = os.path.dirname(__file__)
FRONTEND_BUILD_DIR = os.path.normpath(os.path.join(BASE_DIR, '..', 'frontend', 'build'))


db = SQLAlchemy()
mail = Mail()


def create_app(serve_frontend: bool = True):
    """Create Flask app.

    If `serve_frontend` is True and a frontend build exists at
    `../frontend/build`, the Flask app will serve static files from that
    directory and return `index.html` for non-API routes (single-page app
    fallback). Otherwise, it behaves as a pure API server.
    """
    # Configure Flask static folder to frontend build when available
    static_folder = FRONTEND_BUILD_DIR if (serve_frontend and os.path.isdir(FRONTEND_BUILD_DIR)) else None
    static_url_path = '' if static_folder else None

    app = Flask(__name__, static_folder=static_folder, static_url_path=static_url_path)
    app.config.from_object(Config)

    CORS(app)
    db.init_app(app)
    mail.init_app(app)

    # -------------------------------------------------
    # Attach active batch to every request
    # -------------------------------------------------
    @app.before_request
    def load_active_batch():
        g.active_batch = get_active_batch()

    # ---------------- Blueprints ----------------
    from routes.teacher_routes import teacher_bp
    from routes.admin_routes import admin_bp
    from routes.analytics_routes import analytics_bp
    from routes.subject_routes import subject_bp
    from auth import auth_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(teacher_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(subject_bp)

    # If frontend is being served, prefer the built index.html for non-API routes
    if static_folder:
        # Serve the SPA root
        @app.route('/', defaults={'path': ''})
        @app.route('/<path:path>')
        def serve_spa(path: str):
            # If the requested resource exists in the static folder, let Flask handle it.
            requested = os.path.join(static_folder, path)
            if path != '' and os.path.exists(requested):
                return send_from_directory(static_folder, path)

            # Otherwise return the SPA entrypoint
            return send_from_directory(static_folder, 'index.html')
    else:
        @app.route("/")
        def index():
            return {"status": "Backend running", "active_batch": g.active_batch}, 200

    return app

