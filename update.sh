#!/bin/bash
set -e

echo "🚀 Updating Sprint Planner..."

# Pull latest changes
git pull origin main

# Rebuild and restart containers
docker-compose down
docker-compose up -d --build

echo "✅ Update complete!"
echo "📊 Application running at http://localhost:8080"
echo ""
echo "Useful commands:"
echo "  docker-compose logs -f          # View logs"
echo "  docker-compose ps               # Check status"
echo "  docker-compose restart          # Restart services"
