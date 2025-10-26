# Product Requirements Document (PRD)
## Atlanta Tech Network - Database Integration

**Version:** 1.0
**Date:** 2025-10-25
**Owner:** Drew Schillinger
**Status:** Draft

---

## 1. Executive Summary

Transform Atlanta Tech Network from a static resource directory into a dynamic, community-driven platform by integrating Cloudflare D1 database. This enables real-time resource submissions, admin moderation, and scalable content management.

**Problem:** Currently, all 136 resources are hardcoded in TypeScript. User submissions via the form are lost (logged to console only). Adding/updating resources requires code changes and redeployment.

**Solution:** Implement Cloudflare D1 serverless SQL database with API routes for CRUD operations and admin moderation workflow, secured with **simple password-based auth** (free, secure, minimal setup).

**Impact:**
- Enable community-driven content growth
- Reduce maintenance overhead for non-technical client
- Allow real-time updates without code deployments
- Preserve all existing functionality and UX
- **Cost: $0/month (100% free tier)**

---

## 2. Authentication Strategy (Secure & Free)

### Chosen Approach: **HTTP Basic Auth + Environment Variables**

**Why this approach:**
- ✅ **FREE** - No third-party auth service needed
- ✅ **Secure** - Credentials never stored in code, transmitted over HTTPS
- ✅ **Simple** - Single admin, no user management needed
- ✅ **Vercel native** - Works perfectly with environment variables
- ✅ **Zero maintenance** - No OAuth flows, sessions, or tokens

**How it works:**
1. Admin panel routes (`/admin/*`) check for HTTP Basic Auth header
2. Password stored in Vercel environment variable: `ADMIN_PASSWORD`
3. Browser prompts for username/password on first visit
4. Credentials cached by browser (no re-login needed)
5. All traffic over HTTPS (enforced by Vercel)

**Security measures:**
- Strong password (20+ chars, generated)
- HTTPS-only (enforced by Vercel)
- Rate limiting on auth attempts (10/hour per IP)
- Password rotation every 90 days
- No password in git/code (environment variable only)

**Alternative considered & rejected:**
- ❌ **Clerk/Auth0** - $25/month, overkill for single admin
- ❌ **NextAuth.js** - Requires database for sessions, adds complexity
- ❌ **Magic Links** - Requires email service, slower UX
- ❌ **API Keys** - Less secure, harder to rotate

---

## 3. Goals & Success Metrics

### Primary Goals
1. **Enable dynamic resource management** - Add/edit/delete resources via database
2. **Capture user submissions** - Store form submissions for admin review
3. **Zero downtime migration** - Migrate 136 existing resources without service interruption
4. **Maintain performance** - No degradation in page load times (<2s)
5. **Secure admin access** - Only authorized admin can approve/edit resources

### Success Metrics
| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| Resource addition time | ~30 min (code + deploy) | <2 min (admin panel) | Week 1 |
| User submissions captured | 0% | 100% | Week 1 |
| Page load time | 1.2s | <2s | Week 2 |
| Database uptime | N/A | 99.9% | Ongoing |
| Monthly operational cost | $0 | **$0 (free tier)** | Ongoing |
| Unauthorized admin access | N/A | 0 attempts succeed | Ongoing |

---

## 4. User Stories

### Story 1: Community Member Submits Resource
**As a** Atlanta tech community member
**I want to** suggest a new meetup group to the directory
**So that** others can discover it and the community grows

**Acceptance:** Form submission creates database record with status "pending"

---

### Story 2: Admin Reviews Submissions (Secure)
**As a** site administrator
**I want to** securely log in and review pending submissions
**So that** I can ensure quality while keeping the site secure

**Acceptance:**
- `/admin` route prompts for password
- Correct password grants access
- Wrong password shows "Unauthorized" error
- Session persists in browser (no re-login)

---

### Story 3: Visitor Browses Resources
**As a** visitor to the site
**I want to** browse and filter meetups/conferences
**So that** I can find relevant tech events

**Acceptance:** All existing filtering and browsing works identically to current implementation

---

### Story 4: Admin Updates Resource
**As a** site administrator
**I want to** update a resource's website link directly
**So that** I don't need to edit code and redeploy

**Acceptance:** Admin panel allows editing any resource field with immediate effect

---

## 5. Functional Requirements

### 5.1 Database Schema
- **Resources table**: Stores meetups, conferences, online resources, tech hubs
- **Submissions table**: Stores pending user-submitted resources
- **Fields match existing TypeScript interfaces** for zero breaking changes

### 5.2 API Routes (Public)
- `GET /api/resources` - Fetch all approved resources (public, cached)
- `GET /api/resources/[type]` - Fetch resources by type (public, cached)
- `POST /api/submissions` - Create new submission (public, rate-limited)

### 5.3 API Routes (Admin - Auth Required)
- `GET /api/admin/submissions` - List pending submissions
- `PATCH /api/admin/submissions/[id]` - Approve/reject submission
- `GET /api/admin/resources` - List all resources
- `PATCH /api/admin/resources/[id]` - Update resource
- `DELETE /api/admin/resources/[id]` - Delete resource

**Auth middleware:**
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !verifyAuth(authHeader)) {
      return new Response('Unauthorized', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Admin Area"' }
      })
    }
  }
}

function verifyAuth(authHeader: string): boolean {
  const [username, password] = atob(authHeader.split(' ')[1]).split(':')
  return password === process.env.ADMIN_PASSWORD
}
```

### 5.4 Frontend Changes
- Update pages to fetch from API routes instead of importing static data
- Add loading states during data fetches
- Update form submission to POST to API
- Client-side filtering remains unchanged (operates on fetched data)

### 5.5 Admin Panel (Simple & Secure)
- Protected route at `/admin` (HTTP Basic Auth)
- List pending submissions with approve/reject buttons
- Edit existing resources inline
- No session management needed (browser handles auth)

### 5.6 Data Migration
- One-time script to seed D1 database with existing 136 resources from `sample-data.ts`
- Run during initial deployment
- Verify data integrity (counts, field completeness)

---

## 6. Non-Functional Requirements

### 6.1 Performance
- API response time: <200ms (p95)
- Page load time: <2s (unchanged from current)
- Database queries optimized with indexes on `type` and `id` fields
- Public API routes cached with Vercel Edge Cache (60s TTL)

### 6.2 Security
- **Admin auth:** HTTP Basic Auth with strong password (20+ chars)
- **HTTPS-only:** Enforced by Vercel (credentials never sent in plaintext)
- **SQL injection:** Prevented via parameterized queries
- **Rate limiting:** 10 submissions/hour per IP, 10 auth attempts/hour per IP
- **Input validation:** Zod schemas on all API routes
- **No secrets in code:** All credentials in environment variables
- **Password rotation:** Every 90 days (manual process)

### 6.3 Reliability
- Cloudflare D1 SLA: 99.9% uptime
- Graceful error handling with user-friendly messages
- Fallback to empty state if database unavailable

### 6.4 Scalability
- Free tier supports 100k reads/day, 1k writes/day
- Current traffic: ~500 visitors/day = ~2k reads/day
- Headroom: 50x current traffic before paid tier needed

### 6.5 Maintainability
- Zero ongoing maintenance required (serverless)
- Clear migration path to paid tier if needed ($5/month)
- Code organized with separation of concerns (models, routes, utils)

---

## 7. Out of Scope (Not in This Release)

❌ **User accounts** - No multi-user support, single admin only
❌ **Email notifications** - Admin checks panel manually for submissions
❌ **Advanced search** - Existing client-side filtering sufficient
❌ **Resource analytics** - No usage tracking yet
❌ **Image uploads** - Images remain in `/public` directory
❌ **API versioning** - Single version, internal use only
❌ **Multi-tenant** - Single site instance
❌ **2FA/MFA** - Basic auth sufficient for v1
❌ **Audit logs** - No tracking of admin actions

---

## 8. Technical Constraints

- **Database:** Cloudflare D1 (serverless SQL)
- **Hosting:** Vercel (existing)
- **Framework:** Next.js 15 (existing)
- **Auth:** HTTP Basic Auth (free, native)
- **Free tier limits:** 100k reads/day, 1k writes/day, 5GB storage
- **No breaking changes** to existing frontend UX
- **Backward compatible** with existing TypeScript interfaces

---

## 9. Dependencies & Assumptions

### Dependencies
- Cloudflare account with D1 access
- Wrangler CLI for D1 database management
- Environment variables:
  - `ADMIN_PASSWORD` - Strong password for admin access
  - `CLOUDFLARE_D1_API_TOKEN` - D1 database credentials
  - `DATABASE_ID` - D1 database ID

### Assumptions
- Single administrator (non-technical client)
- Traffic remains <10k visitors/month (free tier sufficient)
- Resources update frequency: <10 per day
- User submissions: <20 per week
- No real-time sync requirements (eventual consistency OK)
- Admin accesses from trusted devices (home/office)

---

## 10. Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| D1 free tier exceeded | Low | Medium | Monitor usage, upgrade to $5/month if needed |
| Data migration errors | Low | High | Test migration script on staging, verify counts |
| API performance issues | Low | Medium | Add caching layer, optimize queries |
| Admin password leaked | Low | High | Use strong generated password, rotate quarterly, HTTPS-only |
| Spam submissions | Medium | Low | Rate limiting (10/hour), add CAPTCHA if needed |
| Brute force auth attempts | Low | Medium | Rate limit to 10 attempts/hour, IP-based blocking |

---

## 11. Timeline & Phases

**Phase 1: Database & Auth Setup (2 hours)**
- Set up Cloudflare D1 database
- Create schema
- Run migration script
- Verify data
- Set up environment variables (ADMIN_PASSWORD)

**Phase 2: API Routes (2 hours)**
- Implement auth middleware
- Implement GET /api/resources (public, cached)
- Implement POST /api/submissions (public, rate-limited)
- Implement admin API routes (auth required)
- Add validation and error handling
- Test with Postman/curl

**Phase 3: Frontend Integration (1.5 hours)**
- Update pages to fetch from API
- Update form submission
- Add loading states
- Test all user flows

**Phase 4: Admin Panel (1.5 hours)**
- Create /admin route with HTTP Basic Auth
- List pending submissions
- Approve/reject actions
- Edit resource form

**Phase 5: Testing & Deployment (1 hour)**
- End-to-end testing
- Security testing (auth bypass attempts)
- Staging deployment
- Set production environment variables
- Production deployment
- Post-deployment verification

**Total: 8 hours**

---

## 12. Security Implementation Details

### Password Generation
```bash
# Generate strong password (20 chars, alphanumeric + symbols)
openssl rand -base64 20
# Example output: kJ8x2mP9vQ4nR7sT6wY3zA==
```

### Vercel Environment Variable Setup
```bash
# Set via Vercel CLI
vercel env add ADMIN_PASSWORD
# Or via Vercel Dashboard: Settings > Environment Variables
```

### Rate Limiting Implementation
```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Free tier: Vercel Edge Config (built-in, no cost)
const ratelimit = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(ip: string, limit = 10): boolean {
  const now = Date.now()
  const key = `ratelimit_${ip}`
  const entry = ratelimit.get(key)

  if (!entry || entry.resetAt < now) {
    ratelimit.set(key, { count: 1, resetAt: now + 3600000 }) // 1 hour
    return true
  }

  if (entry.count >= limit) {
    return false
  }

  entry.count++
  return true
}
```

### Auth Testing Checklist
- [ ] Correct password grants access
- [ ] Wrong password returns 401
- [ ] No password returns 401
- [ ] Password not visible in network requests
- [ ] HTTPS enforced (test http:// redirect)
- [ ] Rate limiting blocks after 10 failed attempts
- [ ] Browser caches credentials (no re-login)

---

## 13. Open Questions

1. **Admin password:** Generate via OpenSSL or let client choose? (Recommend: generate)
2. **Password rotation:** Manual or automated reminder? (Recommend: calendar reminder every 90 days)
3. **Backup admin access:** Emergency password? (Recommend: yes, store in client's password manager)
4. **IP whitelist:** Restrict admin to specific IPs? (Recommend: no, adds complexity)

---

## 14. Appendix

### A. Current Data Model (from sample-data.ts)
```typescript
interface Resource {
  id: string
  type: "meetup" | "conference" | "online" | "tech-hub"
  name: string
  description: string
  tags: string[]
  link: string
  image: string
  conferenceDate?: string  // conferences only
  cfpDate?: string         // conferences only
}
```

### B. Proposed Database Schema
```sql
-- Resources table (approved content)
CREATE TABLE resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('meetup', 'conference', 'online', 'tech-hub')),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  tags TEXT NOT NULL,  -- JSON array as text: '["React","JavaScript"]'
  link TEXT NOT NULL,
  image TEXT NOT NULL,
  conference_date TEXT,  -- ISO 8601: '2025-10-17'
  cfp_date TEXT,         -- ISO 8601: '2025-06-15'
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

  -- Resource data (for new submissions)
  name TEXT,
  website TEXT,
  description TEXT,
  tags TEXT,

  -- Edit data (for update submissions)
  existing_resource_name TEXT,
  update_reason TEXT,

  created_at TEXT DEFAULT (datetime('now')),
  reviewed_at TEXT,
  admin_notes TEXT
);

-- Indexes for performance
CREATE INDEX idx_resources_type ON resources(type);
CREATE INDEX idx_submissions_status ON submissions(status);
```

### C. API Response Format
```json
// GET /api/resources?type=meetup
{
  "success": true,
  "data": [
    {
      "id": "1",
      "type": "meetup",
      "name": "React ATL",
      "description": "React developers community...",
      "tags": ["Frontend", "React", "JavaScript"],
      "link": "https://meetup.com/react-atl",
      "image": "/react-atl.png"
    }
  ],
  "count": 68
}

// POST /api/submissions
{
  "success": true,
  "message": "Submission received and pending review",
  "submissionId": 42
}

// Error response (401 Unauthorized)
{
  "success": false,
  "error": "Unauthorized - Invalid credentials"
}

// Error response (429 Rate Limit)
{
  "success": false,
  "error": "Too many requests - Try again in 1 hour"
}
```

### D. Cost Breakdown (Monthly)

| Service | Component | Free Tier | Our Usage | Cost |
|---------|-----------|-----------|-----------|------|
| **Cloudflare D1** | Database | 100k reads, 1k writes | ~2k reads/day | **$0** |
| **Vercel** | Hosting | 100GB bandwidth | ~5GB/month | **$0** |
| **HTTP Basic Auth** | Authentication | Unlimited | Single admin | **$0** |
| **Vercel Edge Cache** | API caching | Unlimited | All GET requests | **$0** |
| **Rate Limiting** | In-memory (no service) | Unlimited | Form + auth | **$0** |
| **TOTAL** | | | | **$0/month** |

**Comparison to paid auth:**
- Clerk: $25/month
- Auth0: $23/month
- **Our approach: $0/month** ✅

---

**Document Status:** Ready for Review
**Next Steps:** Create technical specification, acceptance criteria, guardrails, and milestones
