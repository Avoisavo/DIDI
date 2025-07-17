#!/bin/bash

echo "🚀 Setting up Decentralized Attendance System"
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi
cd ..

# Install contract dependencies
echo "📦 Installing contract dependencies..."
cd contracts
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install contract dependencies"
    exit 1
fi
cd ..

echo ""
echo "✅ All dependencies installed successfully!"
echo ""
echo "🎯 Next Steps:"
echo "1. Start the backend server: cd backend && npm run dev"
echo "2. Start the frontend: cd frontend && npm start"
echo "3. Deploy contracts: cd contracts && npm run deploy"
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo ""
echo "📚 Documentation: README.md" 