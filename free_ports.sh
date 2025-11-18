#!/bin/bash

# BiteCheck - Free Ports Script
# This script frees all ports used by the BiteCheck project

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Freeing BiteCheck project ports...${NC}"

# Ports used by the project
PORTS=(8000 8081 3000 19000 19001 19002)

# Kill processes by port
for port in "${PORTS[@]}"; do
    PIDS=$(lsof -ti :$port 2>/dev/null)
    if [ -n "$PIDS" ]; then
        echo -e "${YELLOW}Freeing port $port...${NC}"
        echo "$PIDS" | xargs kill -9 2>/dev/null
        sleep 0.5
    fi
done

# Kill processes by name
echo -e "${YELLOW}Killing related processes...${NC}"
pkill -f "uvicorn app.main:app" 2>/dev/null
pkill -f "expo start" 2>/dev/null
pkill -f "npm.*expo" 2>/dev/null

# Clean up PID files
if [ -f "/tmp/bitecheck_backend.pid" ]; then
    rm -f "/tmp/bitecheck_backend.pid"
    echo -e "${GREEN}✓ Removed backend PID file${NC}"
fi

if [ -f "/tmp/bitecheck_frontend.pid" ]; then
    rm -f "/tmp/bitecheck_frontend.pid"
    echo -e "${GREEN}✓ Removed frontend PID file${NC}"
fi

# Verify ports are free
echo ""
echo -e "${YELLOW}Verifying ports are free...${NC}"
ALL_FREE=true
for port in "${PORTS[@]}"; do
    if lsof -ti :$port > /dev/null 2>&1; then
        echo -e "${RED}✗ Port $port is still in use${NC}"
        ALL_FREE=false
    else
        echo -e "${GREEN}✓ Port $port is free${NC}"
    fi
done

echo ""
if [ "$ALL_FREE" = true ]; then
    echo -e "${GREEN}✓ All ports are now free!${NC}"
else
    echo -e "${YELLOW}⚠ Some ports may still be in use${NC}"
    echo -e "${YELLOW}  You may need to manually kill processes or restart your terminal${NC}"
fi

