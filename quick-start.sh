#!/bin/bash

# Quick Start Script for Leelaverse Dynamic Feed
# This script helps you start both frontend and backend servers

echo "🚀 Starting Leelaverse Development Environment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js version: $(node --version)"
echo -e "${GREEN}✓${NC} npm version: $(npm --version)"
echo ""

# Backend Setup
echo -e "${BLUE}📦 Setting up Backend...${NC}"
cd backend

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

echo -e "${GREEN}✓${NC} Backend ready"
echo ""

# Frontend Setup
echo -e "${BLUE}📦 Setting up Frontend...${NC}"
cd ../Leelaah-frontend

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

echo -e "${GREEN}✓${NC} Frontend ready"
echo ""

# Check for .env file
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠${NC} No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo -e "${GREEN}✓${NC} .env file created"
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  🎯 READY TO START"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "To start the application, open TWO terminals:"
echo ""
echo -e "${BLUE}Terminal 1 - Backend:${NC}"
echo "  cd backend"
echo "  npm start"
echo ""
echo -e "${BLUE}Terminal 2 - Frontend:${NC}"
echo "  cd Leelaah-frontend"
echo "  npm run dev"
echo ""
echo "Then open: http://localhost:5173"
echo ""
echo "═══════════════════════════════════════════════════════"
