#!/bin/bash
# Quick Start Script for AI Todo SaaS

echo "🚀 AI Todo SaaS - Quick Start Guide"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: Backend Setup${NC}"
echo "Make sure FastAPI is running:"
echo "  cd app"
echo "  python -m uvicorn main:app --reload"
echo ""
echo "Expected output: Uvicorn running on http://127.0.0.1:8000"
echo ""

echo -e "${BLUE}Step 2: Frontend Setup${NC}"
echo "Install dependencies:"
echo "  cd frontend"
echo "  npm install"
echo ""

echo -e "${BLUE}Step 3: Start Frontend${NC}"
echo "  npm run dev"
echo ""
echo "Expected output: Local: http://localhost:5173"
echo ""

echo -e "${BLUE}Step 4: Open Browser${NC}"
echo "Navigate to: http://localhost:5173"
echo ""

echo -e "${GREEN}✅ Everything set up!${NC}"
echo ""
echo "Try these prompts in the AI chat:"
echo "  • Create a task to review reports by tomorrow"
echo "  • Show me all high-priority tasks"
echo "  • Mark task 1 as completed"
echo "  • Create 3 tasks for this week"
echo ""
echo "Features:"
echo "  ✓ Real-time todo updates (polls every 2 seconds)"
echo "  ✓ Color-coded priorities (Red=High, Orange=Medium, Blue=Low)"
echo "  ✓ AI-powered task management"
echo "  ✓ Dark mode SaaS aesthetic"
echo "  ✓ Error handling and offline detection"
echo ""
