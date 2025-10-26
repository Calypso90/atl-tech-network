# Technical Specification
## Atlanta Tech Network - Database Integration

**Version:** 1.0
**Date:** 2025-10-25
**Author:** Technical Team
**Status:** Draft

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (Next.js 15 / React 19)                           │
│  ┌────────────────────┐         ┌────────────────────────┐  │
│  │  Public Pages      │         │  Admin Panel           │  │
│  │  - /meetups        │         │  - /admin (protected)  │  │
│  │  - /conferences    │         │  - /admin/submissions  │  │
│  │  - /resources      │         │  - /admin/resources    │  │
│  │  - /tech-hubs      │         │                        │  │
│  └────────┬───────────┘         └──────────┬─────────────┘  │
│           │                                │                │
│           ▼                                ▼                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  API Routes (app/api/)                              │    │
│  │  ┌────────────────────┐  ┌──────────────────────┐   │    │
│  │  │  Public            │  │  Admin (Auth Req'd)  │   │    │
│  │  │  GET /resources    │  │  GET /admin/...      │   │    │
│  │  │  POST /submissions │  │  PATCH /admin/...    │   │    │
│  │  └────────────────────┘  └──────────────────────┘   │    │
│  └───────────────────┬─────────────────────────────────┘    │
└────────────────────────┼───────────────────────────────────┘
                         │
                         ▼
          ┌──────────────────────────────┐
          │  Next.js Middleware          │
          │  - HTTP Basic Auth           │
          │  - Rate Limiting             │
          │  - Request Validation        │
          └──────────────┬───────────────┘
                         │
                         ▼
          ┌──────────────────────────────┐
          │  Cloudflare D1 Database      │
          │  - resources (136+ rows)     │
          │  - submissions (pending)     │
          └──────────────────────────────┘
```

---

## 2. Database Design

### 2.1 Schema Definition

**File:** `db/schema.sql`

```sql
-- Resources table (approved, public content)
CREATE TABLE resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('meetup', 'conference', 'online', 'tech-hub')),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  tags TEXT NOT NULL,  -- JSON array: '["React","JavaScript"]'
  link TEXT NOT NULL,
  image TEXT NOT NULL,
  conference_date TEXT,  -- ISO 8601 date
  cfp_date TEXT,         -- ISO 8601 date
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Submissions table (pending moderation)
CREATE TABLE submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_type TEXT NOT NULL CHECK(submission_type IN ('new', 'edit')),
  resource_type TEXT NOT NULL CHECK(resource_type IN ('meetup', 'conference', 'online', 'tech-hub')),
  submitter_name TEXT NOT NULL,
  submitter_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),

  -- New resource fields
  name TEXT,
  website TEXT,
  description TEXT,
  tags TEXT,  -- JSON array

  -- Edit request fields
  existing_resource_name TEXT,
  update_reason TEXT,

  -- Metadata
  created_at TEXT DEFAULT (datetime('now')),
  reviewed_at TEXT,
  admin_notes TEXT
);

-- Indexes for query performance
CREATE INDEX idx_resources_type ON resources(type);
CREATE INDEX idx_resources_name ON resources(name);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_created ON submissions(created_at DESC);
```

### 2.2 Data Migration Script

**File:** `scripts/migrate-data.ts`

```typescript
import { sampleMeetups, sampleConferences, sampleOnlineResources, sampleTechHubs } from '../lib/sample-data'

interface D1Database {
  prepare(query: string): D1PreparedStatement
  batch(statements: D1PreparedStatement[]): Promise<D1Result[]>
}

export async function migrateData(db: D1Database) {
  const allResources = [
    ...sampleMeetups,
    ...sampleConferences,
    ...sampleOnlineResources,
    ...sampleTechHubs
  ]

  const statements = allResources.map(resource => {
    return db.prepare(`
      INSERT INTO resources (type, name, description, tags, link, image, conference_date, cfp_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      resource.type,
      resource.name,
      resource.description,
      JSON.stringify(resource.tags),
      resource.link,
      resource.image,
      resource.conferenceDate || null,
      resource.cfpDate || null
    )
  })

  const results = await db.batch(statements)

  console.log(`✅ Migrated ${results.length} resources`)
  console.log(`   - Meetups: ${sampleMeetups.length}`)
  console.log(`   - Conferences: ${sampleConferences.length}`)
  console.log(`   - Online Resources: ${sampleOnlineResources.length}`)
  console.log(`   - Tech Hubs: ${sampleTechHubs.length}`)

  return results
}
```

---

## 3. API Routes Implementation

### 3.1 Public API Routes

#### GET /api/resources

**File:** `app/api/resources/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getD1Database } from '@/lib/db'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const db = getD1Database()

    let query = 'SELECT * FROM resources WHERE 1=1'
    const params: string[] = []

    if (type) {
      query += ' AND type = ?'
      params.push(type)
    }

    query += ' ORDER BY name ASC'

    const stmt = params.length > 0
      ? db.prepare(query).bind(...params)
      : db.prepare(query)

    const { results } = await stmt.all()

    // Transform JSON strings back to arrays
    const resources = results.map(row => ({
      ...row,
      tags: JSON.parse(row.tags as string)
    }))

    return NextResponse.json({
      success: true,
      data: resources,
      count: resources.length
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch resources'
    }, { status: 500 })
  }
}
```

#### POST /api/submissions

**File:** `app/api/submissions/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getD1Database } from '@/lib/db'
import { checkRateLimit } from '@/lib/rate-limit'

export const runtime = 'edge'

const submissionSchema = z.object({
  submissionType: z.enum(['new', 'edit']),
  resourceType: z.enum(['meetup', 'conference', 'online', 'tech-hub']),
  submitterName: z.string().min(1).max(100),
  submitterEmail: z.string().email().max(100),
  name: z.string().max(200).optional(),
  website: z.string().url().max(500).optional(),
  description: z.string().max(1000).optional(),
  tags: z.string().max(500).optional(),
  existingResourceName: z.string().max(200).optional(),
  updateReason: z.string().max(1000).optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip || 'unknown'
    if (!checkRateLimit(ip, 10)) {
      return NextResponse.json({
        success: false,
        error: 'Too many submissions. Please try again in 1 hour.'
      }, { status: 429 })
    }

    // Parse and validate body
    const body = await request.json()
    const data = submissionSchema.parse(body)

    // Insert into database
    const db = getD1Database()
    const stmt = db.prepare(`
      INSERT INTO submissions (
        submission_type, resource_type, submitter_name, submitter_email,
        name, website, description, tags,
        existing_resource_name, update_reason
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.submissionType,
      data.resourceType,
      data.submitterName,
      data.submitterEmail,
      data.name || null,
      data.website || null,
      data.description || null,
      data.tags || null,
      data.existingResourceName || null,
      data.updateReason || null
    )

    const result = await stmt.run()

    return NextResponse.json({
      success: true,
      message: 'Submission received and pending review',
      submissionId: result.meta.last_row_id
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid submission data',
        details: error.errors
      }, { status: 400 })
    }

    console.error('Submission error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process submission'
    }, { status: 500 })
  }
}
```

### 3.2 Admin API Routes (Protected)

#### GET /api/admin/submissions

**File:** `app/api/admin/submissions/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { getD1Database } from '@/lib/db'

export const runtime = 'edge'

// Auth middleware handles authorization
export async function GET() {
  try {
    const db = getD1Database()
    const { results } = await db.prepare(`
      SELECT * FROM submissions
      WHERE status = 'pending'
      ORDER BY created_at DESC
    `).all()

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch submissions'
    }, { status: 500 })
  }
}
```

#### PATCH /api/admin/submissions/[id]

**File:** `app/api/admin/submissions/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getD1Database } from '@/lib/db'

export const runtime = 'edge'

const reviewSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  adminNotes: z.string().max(500).optional()
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, adminNotes } = reviewSchema.parse(body)

    const db = getD1Database()

    // If approved and it's a new resource, insert into resources table
    if (status === 'approved') {
      // Fetch submission details
      const { results } = await db.prepare(`
        SELECT * FROM submissions WHERE id = ?
      `).bind(params.id).all()

      if (results.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Submission not found'
        }, { status: 404 })
      }

      const submission = results[0]

      if (submission.submission_type === 'new') {
        // Insert into resources
        await db.prepare(`
          INSERT INTO resources (type, name, description, tags, link, image)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
          submission.resource_type,
          submission.name,
          submission.description,
          submission.tags,
          submission.website,
          '/placeholder.svg?height=200&width=300'  // Default image
        ).run()
      }
    }

    // Update submission status
    await db.prepare(`
      UPDATE submissions
      SET status = ?, reviewed_at = datetime('now'), admin_notes = ?
      WHERE id = ?
    `).bind(status, adminNotes || null, params.id).run()

    return NextResponse.json({
      success: true,
      message: `Submission ${status}`
    })

  } catch (error) {
    console.error('Review error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to review submission'
    }, { status: 500 })
  }
}
```

---

## 4. Authentication Implementation

### 4.1 Middleware

**File:** `middleware.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'

export const config = {
  matcher: '/admin/:path*',
}

export function middleware(request: NextRequest) {
  // Check for Basic Auth header
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !verifyAuth(authHeader)) {
    return new Response('Unauthorized', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin Panel"',
      },
    })
  }

  return NextResponse.next()
}

function verifyAuth(authHeader: string): boolean {
  try {
    const base64Credentials = authHeader.split(' ')[1]
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii')
    const [username, password] = credentials.split(':')

    // Check against environment variable
    const validPassword = process.env.ADMIN_PASSWORD

    if (!validPassword) {
      console.error('ADMIN_PASSWORD not set!')
      return false
    }

    return password === validPassword
  } catch (error) {
    console.error('Auth error:', error)
    return false
  }
}
```

### 4.2 Rate Limiting

**File:** `lib/rate-limit.ts`

```typescript
// In-memory rate limiting (resets on server restart)
// For production at scale, use Upstash Redis or Vercel KV

const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(identifier: string, limit: number = 10): boolean {
  const now = Date.now()
  const key = `ratelimit_${identifier}`
  const entry = rateLimitStore.get(key)

  // Clean up old entries (prevent memory leak)
  if (rateLimitStore.size > 10000) {
    rateLimitStore.clear()
  }

  if (!entry || entry.resetAt < now) {
    // New window
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + 3600000, // 1 hour from now
    })
    return true
  }

  if (entry.count >= limit) {
    return false
  }

  entry.count++
  return true
}

export function getRemainingAttempts(identifier: string, limit: number = 10): number {
  const entry = rateLimitStore.get(`ratelimit_${identifier}`)
  if (!entry || entry.resetAt < Date.now()) {
    return limit
  }
  return Math.max(0, limit - entry.count)
}
```

---

## 5. Database Connection

### 5.1 D1 Client Setup

**File:** `lib/db.ts`

```typescript
export interface D1Database {
  prepare(query: string): D1PreparedStatement
  batch(statements: D1PreparedStatement[]): Promise<D1Result[]>
  exec(query: string): Promise<D1ExecResult>
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
  all<T = unknown>(): Promise<D1Result<T>>
  run(): Promise<D1Result>
  first<T = unknown>(colName?: string): Promise<T | null>
}

export interface D1Result<T = unknown> {
  results: T[]
  success: boolean
  meta: {
    duration: number
    last_row_id?: number
    changes?: number
    rows_read?: number
    rows_written?: number
  }
}

export interface D1ExecResult {
  count: number
  duration: number
}

// Get D1 database instance
export function getD1Database(): D1Database {
  // In Edge runtime, D1 is available via environment bindings
  // @ts-expect-error - D1 is injected by Cloudflare
  return process.env.DB as D1Database
}
```

### 5.2 Wrangler Configuration

**File:** `wrangler.toml`

```toml
name = "atl-tech-network"
main = "src/index.ts"
compatibility_date = "2025-01-15"

[[d1_databases]]
binding = "DB"
database_name = "atl-tech-network-db"
database_id = "YOUR_DATABASE_ID"  # Set after creating database
```

---

## 6. Frontend Integration

### 6.1 Data Fetching Hook

**File:** `hooks/use-resources.ts`

```typescript
import { useState, useEffect } from 'react'
import type { Resource } from '@/components/resource-card'

interface UseResourcesResult {
  resources: Resource[]
  loading: boolean
  error: Error | null
}

export function useResources(type?: string): UseResourcesResult {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchResources() {
      try {
        setLoading(true)
        const url = type ? `/api/resources?type=${type}` : '/api/resources'
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error('Failed to fetch resources')
        }

        const data = await response.json()
        setResources(data.data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }, [type])

  return { resources, loading, error }
}
```

### 6.2 Updated Meetups Page

**File:** `app/meetups/page.tsx` (modified)

```typescript
'use client'

import { useResources } from '@/hooks/use-resources'
import { ResourceCard } from '@/components/resource-card'
import { useState } from 'react'

export default function MeetupsPage() {
  const { resources, loading, error } = useResources('meetup')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  if (loading) {
    return <div className="text-center py-20">Loading meetups...</div>
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">
      Error loading meetups. Please try again later.
    </div>
  }

  // Filter logic remains the same
  const filteredResources = selectedTags.length === 0
    ? resources
    : resources.filter(r =>
        r.tags.some(tag => selectedTags.includes(tag))
      )

  return (
    <div>
      {/* Existing UI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map(resource => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
    </div>
  )
}
```

---

## 7. Deployment Configuration

### 7.1 Environment Variables

**Vercel Dashboard → Settings → Environment Variables**

```bash
# Required for all environments
ADMIN_PASSWORD=<generated-strong-password>

# Cloudflare D1 binding (handled by wrangler.toml)
# DB is automatically injected in Edge runtime
```

### 7.2 Build Command

**File:** `package.json` (add scripts)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:setup": "wrangler d1 execute DB --file=./db/schema.sql",
    "db:migrate": "tsx scripts/migrate-data.ts"
  }
}
```

### 7.3 Deployment Steps

```bash
# 1. Create D1 database
wrangler d1 create atl-tech-network-db

# 2. Update wrangler.toml with database_id

# 3. Initialize schema
wrangler d1 execute DB --file=./db/schema.sql

# 4. Run migration
npm run db:migrate

# 5. Set environment variables in Vercel

# 6. Deploy
vercel --prod
```

---

## 8. Testing Strategy

### 8.1 API Testing

**File:** `tests/api.test.ts`

```typescript
import { describe, it, expect } from 'vitest'

describe('GET /api/resources', () => {
  it('returns all resources', async () => {
    const res = await fetch('http://localhost:3000/api/resources')
    const data = await res.json()

    expect(data.success).toBe(true)
    expect(data.data).toBeInstanceOf(Array)
    expect(data.count).toBeGreaterThan(0)
  })

  it('filters by type', async () => {
    const res = await fetch('http://localhost:3000/api/resources?type=meetup')
    const data = await res.json()

    expect(data.success).toBe(true)
    expect(data.data.every((r: any) => r.type === 'meetup')).toBe(true)
  })
})

describe('POST /api/submissions', () => {
  it('rejects invalid data', async () => {
    const res = await fetch('http://localhost:3000/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invalid: 'data' })
    })

    expect(res.status).toBe(400)
  })

  it('accepts valid submission', async () => {
    const res = await fetch('http://localhost:3000/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submissionType: 'new',
        resourceType: 'meetup',
        submitterName: 'Test User',
        submitterEmail: 'test@example.com',
        name: 'Test Meetup',
        website: 'https://example.com',
        description: 'A test meetup'
      })
    })

    const data = await res.json()
    expect(res.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.submissionId).toBeDefined()
  })
})

describe('Admin auth', () => {
  it('blocks unauthenticated requests', async () => {
    const res = await fetch('http://localhost:3000/api/admin/submissions')
    expect(res.status).toBe(401)
  })

  it('allows authenticated requests', async () => {
    const auth = Buffer.from(`admin:${process.env.ADMIN_PASSWORD}`).toString('base64')
    const res = await fetch('http://localhost:3000/api/admin/submissions', {
      headers: { 'Authorization': `Basic ${auth}` }
    })

    expect(res.status).toBe(200)
  })
})
```

---

## 9. Performance Optimization

### 9.1 Caching Strategy

```typescript
// Public API routes use Vercel Edge Cache
export async function GET(request: NextRequest) {
  // ... fetch data ...

  return NextResponse.json(data, {
    headers: {
      // Cache for 60s, serve stale up to 120s while revalidating
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
    }
  })
}
```

### 9.2 Database Query Optimization

```sql
-- Indexes for common queries
CREATE INDEX idx_resources_type ON resources(type);
CREATE INDEX idx_resources_name ON resources(name);

-- Query plan check
EXPLAIN QUERY PLAN SELECT * FROM resources WHERE type = 'meetup';
-- Should use idx_resources_type
```

---

## 10. Security Checklist

- [ ] ADMIN_PASSWORD is strong (20+ chars) and stored in env vars only
- [ ] HTTPS enforced (Vercel default)
- [ ] All SQL queries use parameterized statements (no string concatenation)
- [ ] Input validation with Zod on all API routes
- [ ] Rate limiting on public submission endpoint (10/hour)
- [ ] Admin routes protected with middleware
- [ ] No secrets in git repository
- [ ] Error messages don't leak sensitive info
- [ ] CORS headers set appropriately (same-origin only)

---

**Document Status:** Ready for Implementation
**Next Steps:** Create acceptance criteria, guardrails, and milestones
