#!/usr/bin/env python3
"""
Uvicorn configuration for development server with optimized settings
to reduce excessive reloading and improve performance.
"""

import os
from pathlib import Path

# Get the backend directory
backend_dir = Path(__file__).parent

# Configuration for development server
bind = "0.0.0.0:8000"
workers = 1
worker_class = "uvicorn.workers.UvicornWorker"
worker_connections = 1000

# Reload configuration - optimized to reduce excessive reloading
reload = True
reload_dirs = [str(backend_dir / "app")]  # Only watch app directory
reload_includes = ["*.py", "*.html", "*.js", "*.css"]  # Only reload on relevant file changes
reload_excludes = [
    "*.pyc",
    "*.pyo",
    "__pycache__",
    ".git",
    "node_modules",
    "*.log",
    "*.tmp",
    "logs/",
    "postgres-db/",
    "postgres-debug-log/",
    "uploads/",
    "*.sqlite",
    "*.db",
    "alembic/versions/*.py",  # Don't reload on migration files
]

# Performance settings
max_requests = 1000
max_requests_jitter = 50

# Logging
log_level = "info"
access_log = True

# Application
application = "app.main:app"

# Additional settings for better development experience
host = "0.0.0.0"
port = 8000
debug = True
reload_delay = 0.25  # Small delay to batch file changes