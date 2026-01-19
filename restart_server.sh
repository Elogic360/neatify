#!/bin/bash
# Kill existing uvicorn process
pkill -f uvicorn

# Wait a moment
sleep 2

# Start the server
cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000