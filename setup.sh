#!/bin/bash

# ComplaintAI Quick Setup Script
# Run this after cloning the repo

echo "🚀 ComplaintAI Setup"
echo "===================="
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ required. You have $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check for npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm detected"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"

# Check for .env.local
if [ ! -f .env.local ]; then
    echo ""
    echo "⚠️  No .env.local file found"
    echo "   Creating from .env.example..."
    cp .env.example .env.local
    echo ""
    echo "📝 Please edit .env.local with your API keys:"
    echo "   - Supabase URL and keys"
    echo "   - Stripe keys"
    echo "   - Anthropic API key"
    echo ""
    echo "   Then run: npm run dev"
else
    echo "✅ .env.local exists"
fi

echo ""
echo "===================="
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your API keys"
echo "2. Run the database schema in Supabase SQL Editor"
echo "3. Run: npm run dev"
echo "4. Open: http://localhost:3000"
echo ""
echo "For full deployment instructions, see: docs/DEPLOYMENT.md"
