#!/usr/bin/env bash

# Function to stop background processes when script exits
cleanup() {
    echo -e "\nStopping all services..."
    kill $(jobs -p) 2>/dev/null
    exit
}
trap cleanup SIGINT SIGTERM EXIT

echo "======================================"
echo "Starting Bind Service"
echo "======================================"
(
    cd bind-service || exit
    if [ ! -d "venv" ]; then
        echo "Creating venv and installing dependencies for bind-service..."
        python3 -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
    else
        source venv/bin/activate
    fi
    exec uvicorn main:app --port 8001 --host 0.0.0.0
) &

echo "======================================"
echo "Starting API"
echo "======================================"
(
    cd api || exit
    if [ ! -d "venv" ]; then
        echo "Creating venv and installing dependencies for API..."
        python3 -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
    else
        source venv/bin/activate
    fi
    export BIND_SERVICE_URL="http://localhost:8001/bind"
    export DATABASE_URL="sqlite:///./database.db"
    exec uvicorn main:app --port 8000 --host 0.0.0.0 --reload
) &

echo "======================================"
echo "Starting Client"
echo "======================================"
(
    cd client || exit
    if [ ! -d "node_modules" ]; then
        echo "Installing client dependencies..."
        npm install
    fi
    exec npm run dev
) &

echo "======================================"
echo "All services are starting!"
echo "- API expecting bind-service at localhost:8001"
echo "- Client expecting API at localhost:8000"
echo ""
echo "Press Ctrl+C to stop all services."
echo "======================================"

wait
