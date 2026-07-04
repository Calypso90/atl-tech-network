# Deployment Guide
## Atlanta Tech Network - Cloudflare Pages + D1

This guide walks you through deploying the Atlanta Tech Network application to Cloudflare Pages with a D1 database.

---

## Prerequisites

- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier works)
- A [GitHub account](https://github.com)
- [Node.js](https://nodejs.org/) 18+ or [Bun](https://bun.sh/) installed locally
- The repository cloned to your local machine

---

## Part 1: Local Setup (Optional but Recommended)

Test the application locally before deploying.

### 1.1 Install Dependencies

```bash
# Using Bun (recommended)
bun install

# Or using npm
npm install
```

### 1.2 Login to Cloudflare

```bash
bunx wrangler login
# This opens a browser to authenticate with Cloudflare
```

### 1.3 Create the D1 Database

```bash
bunx wrangler d1 create atl-tech-network-db
```

You'll see output like:
```
✅ Successfully created DB 'atl-tech-network-db'

[[d1_databases]]
binding = "DB"
database_name = "atl-tech-network-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**Copy the `database_id`** and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "atl-tech-network-db"
database_id = "YOUR_DATABASE_ID_HERE"  # <-- Replace this
```

### 1.4 Initialize Local Database

```bash
# Create tables
bunx wrangler d1 execute DB --local --file=./db/schema.sql

# Migrate sample data
bunx tsx scripts/migrate-to-d1.ts > db/seed.sql
bunx wrangler d1 execute DB --local --file=./db/seed.sql
```

### 1.5 Set Local Environment Variables

```bash
echo "ADMIN_PASSWORD=your-secure-password-here" > .env.local
```

### 1.6 Run Locally

```bash
# Build and run with Cloudflare Pages dev server
bunx @cloudflare/next-on-pages
bunx wrangler pages dev .vercel/output/static --compatibility-flag=nodejs_compat
```

Open http://localhost:8788

---

## Part 2: Production Deployment

### 2.1 Create Cloudflare Pages Project

```bash
bunx wrangler pages project create atl-tech-network
```

When prompted:
- Production branch: `main`

### 2.2 Initialize Production Database

```bash
# Create tables in production D1
bunx wrangler d1 execute DB --remote --file=./db/schema.sql

# Seed with initial data
bunx wrangler d1 execute DB --remote --file=./db/seed.sql
```

### 2.3 Set Production Secrets

```bash
# Set the admin password (you'll be prompted to enter it)
bunx wrangler secret put ADMIN_PASSWORD
```

Enter a strong password when prompted. This protects the `/admin` routes.

### 2.4 Manual Deploy (First Time)

```bash
# Build for Cloudflare
bunx @cloudflare/next-on-pages

# Deploy
bunx wrangler pages deploy .vercel/output/static --project-name=atl-tech-network
```

Your site is now live at: `https://atl-tech-network.pages.dev`

---

## Part 3: GitHub Actions (Automatic Deploys)

Set up automatic deployments on every push to `main`.

### 3.1 Get Cloudflare Credentials

#### API Token

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click **Create Token**
3. Use the **"Edit Cloudflare Workers"** template
4. Add these permissions:
   - Account → Cloudflare Pages → Edit
   - Account → D1 → Edit
5. Click **Continue to summary** → **Create Token**
6. **Copy the token** (you won't see it again!)

#### Account ID

1. Go to https://dash.cloudflare.com
2. Click on any domain or the Workers/Pages section
3. Find **Account ID** in the right sidebar
4. Copy it

### 3.2 Add GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets:

| Name | Value |
|------|-------|
| `CLOUDFLARE_API_TOKEN` | Your API token from step 3.1 |
| `CLOUDFLARE_ACCOUNT_ID` | Your Account ID from step 3.1 |

### 3.3 How It Works

The workflow in `.github/workflows/deploy.yml` automatically:

| Event | Action |
|-------|--------|
| Pull Request to `main` | Builds and deploys a preview |
| Push/Merge to `main` | Runs D1 migrations and deploys to production |

Preview URLs follow the pattern:
```
https://<branch-name>.atl-tech-network.pages.dev
```

---

## Part 4: Ongoing Maintenance

### Adding New Resources

1. Go to the live site
2. Use the "Suggest a Resource" form
3. Log into `/admin/submissions` to approve

Or manually via CLI:
```bash
bunx wrangler d1 execute DB --remote --command "INSERT INTO resources (type, name, description, tags, link, image) VALUES ('meetup', 'New Meetup Name', 'Description here', '[\"Tag1\",\"Tag2\"]', 'https://example.com', '/placeholder.svg')"
```

### Viewing Database

```bash
# List all resources
bunx wrangler d1 execute DB --remote --command "SELECT id, type, name FROM resources"

# View pending submissions
bunx wrangler d1 execute DB --remote --command "SELECT * FROM submissions WHERE status='pending'"

# Count by type
bunx wrangler d1 execute DB --remote --command "SELECT type, COUNT(*) as count FROM resources GROUP BY type"
```

### Changing Admin Password

```bash
bunx wrangler secret put ADMIN_PASSWORD
# Enter new password when prompted
```

### Database Backup

```bash
# Export all data
bunx wrangler d1 export DB --remote --output=backup.sql
```

---

## Part 5: Custom Domain (Optional)

### 5.1 Add Domain in Cloudflare Pages

1. Go to Cloudflare Dashboard → Pages → `atl-tech-network`
2. Click **Custom domains** → **Set up a custom domain**
3. Enter your domain (e.g., `atltech.network`)
4. Follow the DNS setup instructions

### 5.2 If Domain is Already on Cloudflare

Cloudflare automatically configures DNS. Just add the custom domain in Pages settings.

### 5.3 If Domain is External

Add a CNAME record at your DNS provider:
```
Type: CNAME
Name: @ (or subdomain)
Target: atl-tech-network.pages.dev
```

---

## Troubleshooting

### "D1 database binding not found"

Make sure `wrangler.toml` has the correct `database_id`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "atl-tech-network-db"
database_id = "your-actual-database-id"
```

### Build Fails with Lockfile Error

Remove old lockfiles:
```bash
rm -f pnpm-lock.yaml package-lock.json
bun install
```

### 404 on Local Development

Make sure you built for Cloudflare Pages first:
```bash
bunx @cloudflare/next-on-pages
```

Then run:
```bash
bunx wrangler pages dev .vercel/output/static --compatibility-flag=nodejs_compat
```

### Admin Login Not Working

1. Check the password is set:
   ```bash
   bunx wrangler secret list
   ```
2. Re-set if needed:
   ```bash
   bunx wrangler secret put ADMIN_PASSWORD
   ```

### Submissions Not Saving

Check the D1 database is accessible:
```bash
bunx wrangler d1 execute DB --remote --command "SELECT 1"
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Cloudflare Pages (Edge)                                    │
│  ┌────────────────────────┐  ┌───────────────────────────┐  │
│  │  Static Assets         │  │  API Routes (Workers)     │  │
│  │  - HTML/CSS/JS         │  │  - GET /api/resources     │  │
│  │  - Images              │  │  - POST /api/submissions  │  │
│  │  - Fonts               │  │  - /api/admin/*           │  │
│  └────────────────────────┘  └─────────────┬─────────────┘  │
│                                            │                │
│                                            ▼                │
│                              ┌───────────────────────────┐  │
│                              │  Cloudflare D1 (SQLite)   │  │
│                              │  - resources table        │  │
│                              │  - submissions table      │  │
│                              └───────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Support

- **Cloudflare Pages Docs**: https://developers.cloudflare.com/pages
- **D1 Docs**: https://developers.cloudflare.com/d1
- **Wrangler CLI**: https://developers.cloudflare.com/workers/wrangler

---

*Last updated: December 2024*
