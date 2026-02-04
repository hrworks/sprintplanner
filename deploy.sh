#!/bin/bash
set -e

echo "🚀 Deploying Sprint Planner..."

# Configuration
REPO_URL="git@github.com-sprintplanner:hrworks/sprintplanner.git"
DEPLOY_DIR="/opt/sprintplanner"
BRANCH="main"

# Clone or pull repository
if [ ! -d "$DEPLOY_DIR" ]; then
    echo "📦 Cloning repository..."
    git clone "$REPO_URL" "$DEPLOY_DIR"
    cd "$DEPLOY_DIR"
else
    echo "📥 Pulling latest changes..."
    cd "$DEPLOY_DIR"
    git fetch origin
    git reset --hard origin/$BRANCH
fi

# Copy environment file if not exists
if [ ! -f "$DEPLOY_DIR/sprintplanner-api/.env" ]; then
    echo "⚙️  Creating .env file..."
    cp "$DEPLOY_DIR/sprintplanner-api/.env.example" "$DEPLOY_DIR/sprintplanner-api/.env"
    echo "⚠️  Please edit $DEPLOY_DIR/sprintplanner-api/.env with production values!"
    exit 1
fi

# Build and start with Docker
echo "🐳 Building and starting containers..."
cd "$DEPLOY_DIR"
docker-compose down
docker-compose up -d --build

echo "✅ Deployment complete!"
echo "📊 Application running at http://localhost:8080"
echo ""
echo "Useful commands:"
echo "  docker-compose logs -f          # View logs"
echo "  docker-compose ps               # Check status"
echo "  docker-compose restart          # Restart services"
