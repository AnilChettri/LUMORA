#!/bin/bash
set -e

echo "🐳 Building Docker image..."

# Build image
docker build -t brainimation:latest -t brainimation:$(date +%s) .

echo "✅ Docker image built successfully!"
echo "To run: docker-compose up -d"
