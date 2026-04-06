#!/bin/bash
set -e

echo "🧹 Cleaning up Docker resources..."

# Stop containers
echo "Stopping containers..."
docker-compose down

# Remove unused images and volumes
echo "Removing unused images..."
docker image prune -f

echo "Removing unused volumes..."
docker volume prune -f

echo "✅ Cleanup completed!"
