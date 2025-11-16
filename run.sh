#!/bin/bash

# BiteCheck - One-Click Run Script
# This script sets up and runs both backend and frontend services

# Don't exit on error - we want to handle cleanup gracefully
set +e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project directories
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# PID files for cleanup
BACKEND_PID_FILE="/tmp/bitecheck_backend.pid"
FRONTEND_PID_FILE="/tmp/bitecheck_frontend.pid"

# Function to stop existing services
stop_existing_services() {
    echo -e "${YELLOW}Checking for existing services...${NC}"
    
    # Stop backend if running on port 8000
    if lsof -ti :8000 > /dev/null 2>&1; then
        echo -e "${YELLOW}Stopping existing backend service on port 8000...${NC}"
        lsof -ti :8000 | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
    
    # Stop frontend/Expo if running on port 8081
    if lsof -ti :8081 > /dev/null 2>&1; then
        echo -e "${YELLOW}Stopping existing frontend service on port 8081...${NC}"
        lsof -ti :8081 | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
    
    # Clean up PID files
    if [ -f "$BACKEND_PID_FILE" ]; then
        BACKEND_PID=$(cat "$BACKEND_PID_FILE" 2>/dev/null)
        if [ -n "$BACKEND_PID" ] && ps -p "$BACKEND_PID" > /dev/null 2>&1; then
            kill "$BACKEND_PID" 2>/dev/null || true
        fi
        rm -f "$BACKEND_PID_FILE"
    fi
    
    if [ -f "$FRONTEND_PID_FILE" ]; then
        FRONTEND_PID=$(cat "$FRONTEND_PID_FILE" 2>/dev/null)
        if [ -n "$FRONTEND_PID" ] && ps -p "$FRONTEND_PID" > /dev/null 2>&1; then
            kill "$FRONTEND_PID" 2>/dev/null || true
        fi
        rm -f "$FRONTEND_PID_FILE"
    fi
    
    # Kill any remaining uvicorn or expo processes
    pkill -f "uvicorn app.main:app" 2>/dev/null || true
    pkill -f "expo start" 2>/dev/null || true
    
    echo -e "${GREEN}✓ Existing services stopped${NC}"
}

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}Shutting down services...${NC}"
    
    if [ -f "$BACKEND_PID_FILE" ]; then
        BACKEND_PID=$(cat "$BACKEND_PID_FILE" 2>/dev/null)
        if [ -n "$BACKEND_PID" ] && ps -p "$BACKEND_PID" > /dev/null 2>&1; then
            kill "$BACKEND_PID" 2>/dev/null || true
            echo -e "${GREEN}✓ Backend stopped${NC}"
        fi
        rm -f "$BACKEND_PID_FILE"
    fi
    
    if [ -f "$FRONTEND_PID_FILE" ]; then
        FRONTEND_PID=$(cat "$FRONTEND_PID_FILE" 2>/dev/null)
        if [ -n "$FRONTEND_PID" ] && ps -p "$FRONTEND_PID" > /dev/null 2>&1; then
            kill "$FRONTEND_PID" 2>/dev/null || true
            echo -e "${GREEN}✓ Frontend stopped${NC}"
        fi
        rm -f "$FRONTEND_PID_FILE"
    fi
    
    echo -e "${GREEN}Cleanup complete!${NC}"
    exit 0
}

# Set up trap for cleanup on script exit
trap cleanup SIGINT SIGTERM EXIT

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}✗ Python 3 is not installed. Please install Python 3.11+${NC}"
    exit 1
fi
PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
echo -e "${GREEN}✓ Python $PYTHON_VERSION found${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed. Please install Node.js 18+${NC}"
    exit 1
fi
NODE_VERSION=$(node --version)
echo -e "${GREEN}✓ Node.js $NODE_VERSION found${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm found${NC}"

echo ""

# Stop any existing services
stop_existing_services

echo ""

# Check environment files
echo -e "${BLUE}Checking environment configuration...${NC}"

# Check frontend .env
if [ ! -f "$FRONTEND_DIR/.env" ]; then
    echo -e "${YELLOW}⚠ Frontend .env file not found${NC}"
    if [ -f "$FRONTEND_DIR/env.example" ]; then
        echo -e "${YELLOW}  Creating .env from env.example...${NC}"
        cp "$FRONTEND_DIR/env.example" "$FRONTEND_DIR/.env"
        echo -e "${RED}  ⚠ Please update frontend/.env with your Supabase credentials!${NC}"
    fi
else
    # Check if frontend .env has placeholder values
    if grep -q "placeholder\|your_supabase" "$FRONTEND_DIR/.env" 2>/dev/null; then
        echo -e "${YELLOW}⚠ Frontend .env contains placeholder values${NC}"
        echo -e "${YELLOW}  Please update with your actual Supabase credentials${NC}"
    else
        echo -e "${GREEN}✓ Frontend .env configured${NC}"
    fi
fi

# Check backend .env
if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo -e "${YELLOW}⚠ Backend .env file not found${NC}"
    echo -e "${RED}  ⚠ Backend requires .env file with Supabase credentials!${NC}"
    echo -e "${YELLOW}  The backend may fail to start without proper configuration.${NC}"
else
    # Check if backend .env has placeholder values
    if grep -q "placeholder\|your_service_role_key_here" "$BACKEND_DIR/.env" 2>/dev/null; then
        echo -e "${YELLOW}⚠ Backend .env contains placeholder values${NC}"
        echo -e "${YELLOW}  Please update with your actual Supabase credentials${NC}"
    else
        echo -e "${GREEN}✓ Backend .env configured${NC}"
    fi
fi

echo ""

# Backend Setup
echo -e "${BLUE}Setting up backend...${NC}"
cd "$BACKEND_DIR"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
echo -e "${YELLOW}Activating virtual environment...${NC}"
source venv/bin/activate

# Install/update dependencies
if [ ! -f "venv/.deps_installed" ] || [ "requirements.txt" -nt "venv/.deps_installed" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    pip install --upgrade pip > /dev/null 2>&1
    pip install -r requirements.txt > /dev/null 2>&1
    touch venv/.deps_installed
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Backend dependencies up to date${NC}"
fi

# Start backend server
echo -e "${YELLOW}Starting backend server (FastAPI)...${NC}"

# Check if port 8000 is available
if lsof -ti :8000 > /dev/null 2>&1; then
    echo -e "${RED}✗ Port 8000 is already in use${NC}"
    echo -e "${YELLOW}  Attempting to free the port...${NC}"
    lsof -ti :8000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Start uvicorn in the background
cd "$BACKEND_DIR"
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > /tmp/bitecheck_backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > "$BACKEND_PID_FILE"

# Wait a moment and verify backend started
sleep 3
if ps -p "$BACKEND_PID" > /dev/null 2>&1; then
    # Test if backend is responding
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend server started (PID: $BACKEND_PID)${NC}"
        echo -e "${BLUE}  Backend API: http://localhost:8000${NC}"
        echo -e "${BLUE}  API Docs: http://localhost:8000/docs${NC}"
    else
        echo -e "${YELLOW}⚠ Backend started but not responding yet${NC}"
        echo -e "${YELLOW}  Check logs: tail -f /tmp/bitecheck_backend.log${NC}"
    fi
else
    echo -e "${RED}✗ Backend failed to start${NC}"
    echo -e "${RED}  Check logs: tail -f /tmp/bitecheck_backend.log${NC}"
    exit 1
fi

echo ""

# Frontend Setup
echo -e "${BLUE}Setting up frontend...${NC}"
cd "$FRONTEND_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies (this may take a while)...${NC}"
    npm install
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Frontend dependencies found${NC}"
fi

# Increase file limit to prevent EMFILE errors (macOS issue)
echo -e "${YELLOW}Setting file limit for file watchers...${NC}"
CURRENT_LIMIT=$(ulimit -n)
if [ "$CURRENT_LIMIT" -lt 4096 ]; then
    ulimit -n 4096 2>/dev/null || echo -e "${YELLOW}  Warning: Could not increase file limit (may need sudo)${NC}"
    echo -e "${GREEN}✓ File limit increased${NC}"
else
    echo -e "${GREEN}✓ File limit already sufficient ($CURRENT_LIMIT)${NC}"
fi

# Clear previous log
> /tmp/bitecheck_frontend.log

# Check if port 8081 is available (Metro bundler)
if lsof -ti :8081 > /dev/null 2>&1; then
    echo -e "${YELLOW}Port 8081 is in use, attempting to free it...${NC}"
    lsof -ti :8081 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# Start frontend server
echo -e "${YELLOW}Starting frontend server (Expo)...${NC}"
cd "$FRONTEND_DIR"
npm start > /tmp/bitecheck_frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > "$FRONTEND_PID_FILE"

# Wait a moment and verify frontend started
sleep 3
if ps -p "$FRONTEND_PID" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend server started (PID: $FRONTEND_PID)${NC}"
else
    echo -e "${YELLOW}⚠ Frontend may have issues starting${NC}"
    echo -e "${YELLOW}  Check logs: tail -f /tmp/bitecheck_frontend.log${NC}"
fi

# Wait for Expo to initialize and extract URLs
echo -e "${YELLOW}Waiting for Expo to initialize...${NC}"
sleep 5

# Function to extract frontend URLs from log
extract_frontend_urls() {
    local log_file="/tmp/bitecheck_frontend.log"
    local metro_url="http://localhost:8081"
    local expo_devtools_url=""
    
    # Try to find Expo DevTools URL in log
    if [ -f "$log_file" ]; then
        # Look for common Expo DevTools patterns
        expo_devtools_url=$(grep -oE "http://localhost:1900[0-9]" "$log_file" | head -1)
        if [ -z "$expo_devtools_url" ]; then
            expo_devtools_url=$(grep -oE "http://.*:1900[0-9]" "$log_file" | head -1)
        fi
    fi
    
    # Check if Metro is actually running
    if lsof -i :8081 > /dev/null 2>&1; then
        echo -e "${GREEN}  Metro Bundler:${NC}    $metro_url"
    else
        echo -e "${YELLOW}  Metro Bundler:${NC}    Starting... (check logs if issues)"
    fi
    
    if [ -n "$expo_devtools_url" ]; then
        echo -e "${GREEN}  Expo DevTools:${NC}     $expo_devtools_url"
    else
        echo -e "${YELLOW}  Expo DevTools:${NC}     Check log file for URL"
    fi
}

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  🚀 BiteCheck is running!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Backend:${NC}"
echo -e "${GREEN}  API:${NC}          http://localhost:8000"
echo -e "${GREEN}  API Docs:${NC}     http://localhost:8000/docs"
echo -e "${GREEN}  Health:${NC}       http://localhost:8000/health"
echo ""
echo -e "${BLUE}Frontend:${NC}"
extract_frontend_urls
echo ""
echo -e "${YELLOW}Useful Commands:${NC}"
echo -e "  View Backend Logs:  tail -f /tmp/bitecheck_backend.log"
echo -e "  View Frontend Logs: tail -f /tmp/bitecheck_frontend.log"
echo -e "  Stop Services:      Press Ctrl+C"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. Scan the QR code in the frontend log with Expo Go app"
echo -e "  2. Or press 'i' for iOS simulator / 'a' for Android emulator"
echo -e "  3. Or open the Expo DevTools URL in your browser"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Wait for processes and keep script running
while true; do
    # Check if backend is still running
    if [ -f "$BACKEND_PID_FILE" ]; then
        BACKEND_PID=$(cat "$BACKEND_PID_FILE" 2>/dev/null)
        if [ -z "$BACKEND_PID" ] || ! ps -p "$BACKEND_PID" > /dev/null 2>&1; then
            echo -e "${RED}Backend process died. Check logs for errors.${NC}"
            cleanup
        fi
    fi
    
    # Check if frontend is still running
    if [ -f "$FRONTEND_PID_FILE" ]; then
        FRONTEND_PID=$(cat "$FRONTEND_PID_FILE" 2>/dev/null)
        if [ -z "$FRONTEND_PID" ] || ! ps -p "$FRONTEND_PID" > /dev/null 2>&1; then
            echo -e "${RED}Frontend process died. Check logs for errors.${NC}"
            cleanup
        fi
    fi
    
    sleep 5
done

