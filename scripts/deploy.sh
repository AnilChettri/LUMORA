#!/bin/bash
set -e

echo "🚀 Starting Brainimation deployment..."

# Check Node.js version
NODE_VERSION=$(node -v)
echo "✓ Node.js version: $NODE_VERSION"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the project
echo "🔨 Building project..."
npm run build

# Run type check
echo "✓ Type checking..."
npm run check

# Run database migrations
echo "🗄️ Running database migrations..."
npm run db:push

echo "✅ Deployment completed successfully!"
echo "Start the application with: npm start"
