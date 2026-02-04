#!/bin/bash
set -e

# Fix Docker BuildKit colors for dark terminals
export BUILDKIT_COLORS="run=green:warning=yellow:error=red:cancel=cyan"

echo "🚀 Updating Sprint Planner..."

# Pull latest changes
git pull origin main

# Detect docker compose command
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    echo "❌ Error: docker compose not found"
    exit 1
fi

# Rebuild and restart containers
$DOCKER_COMPOSE down
$DOCKER_COMPOSE up -d --build

echo "✅ Update complete!"
echo "📊 Application running at http://localhost:8080"
echo ""
echo "Useful commands:"
echo "  $DOCKER_COMPOSE logs -f          # View logs"
echo "  $DOCKER_COMPOSE ps               # Check status"
echo "  $DOCKER_COMPOSE restart          # Restart services"
