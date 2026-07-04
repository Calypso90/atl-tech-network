#!/bin/bash
# Local Development Setup Script
# Run: chmod +x scripts/local-setup.sh && ./scripts/local-setup.sh

set -e

echo "🔥 Calcifer's Local Setup Script"
echo "================================="
echo ""

# Check if wrangler is available
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if user is logged into Cloudflare
echo ""
echo "🔐 Checking Cloudflare login..."
if ! npx wrangler whoami &> /dev/null; then
    echo "You need to log into Cloudflare (free account works):"
    npx wrangler login
fi

# Check if database already exists in wrangler.toml
if grep -q "YOUR_DATABASE_ID_HERE" wrangler.toml; then
    echo ""
    echo "🗄️  Creating D1 database..."

    # Create database and capture output
    OUTPUT=$(npx wrangler d1 create atl-tech-network-db 2>&1) || true

    # Extract database_id
    DB_ID=$(echo "$OUTPUT" | grep -o 'database_id = "[^"]*"' | cut -d'"' -f2)

    if [ -n "$DB_ID" ]; then
        echo "   Database ID: $DB_ID"
        # Update wrangler.toml
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/YOUR_DATABASE_ID_HERE/$DB_ID/" wrangler.toml
        else
            sed -i "s/YOUR_DATABASE_ID_HERE/$DB_ID/" wrangler.toml
        fi
        echo "   ✅ Updated wrangler.toml"
    else
        echo "   ⚠️  Could not extract database ID. You may need to:"
        echo "   1. Run: npx wrangler d1 create atl-tech-network-db"
        echo "   2. Copy the database_id into wrangler.toml manually"
    fi
else
    echo "✅ Database ID already configured in wrangler.toml"
fi

# Initialize local schema
echo ""
echo "📋 Initializing local database schema..."
npx wrangler d1 execute DB --local --file=./db/schema.sql

# Generate and run migration
echo ""
echo "📊 Migrating sample data to local D1..."
npx tsx scripts/migrate-to-d1.ts > db/seed.sql
npx wrangler d1 execute DB --local --file=./db/seed.sql

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo ""
    echo "🔑 Creating .env.local..."
    echo "ADMIN_PASSWORD=local-dev-password-123" > .env.local
    echo "   Created with default password: local-dev-password-123"
fi

echo ""
echo "================================="
echo "✅ Setup complete!"
echo ""
echo "To run locally with D1:"
echo "  npm run build && npm run pages:dev"
echo "  → Opens at http://localhost:8788"
echo ""
echo "To run in dev mode (fallback data):"
echo "  npm run dev"
echo "  → Opens at http://localhost:3000"
echo ""
echo "Admin panel: http://localhost:8788/admin/submissions"
echo "  Username: anything"
echo "  Password: local-dev-password-123"
echo ""
echo "🔥 The hearth is ready!"
