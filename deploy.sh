#!/bin/bash

echo "🚀 Starting deployment..."

# Navigate to project directory
cd ~/ebm_poc/

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Restart PM2
echo "♻️  Restarting PM2..."
pm2 restart ebm_poc

# Show status
echo "✅ Deployment complete!"
pm2 status ebm_poc
pm2 logs ebm_poc --lines 10
