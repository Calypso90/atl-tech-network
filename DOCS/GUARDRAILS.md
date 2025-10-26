# Guardrails & Constraints
## Atlanta Tech Network - Database Integration

**Version:** 1.0
**Date:** 2025-10-25
**Status:** Draft

---

## Purpose

This document defines the **non-negotiable constraints, limits, and safety measures** that must be enforced during development and operation of the database integration feature. These guardrails protect against cost overruns, security breaches, data loss, and poor user experience.

---

## 1. Cost Guardrails

### 1.1 Free Tier Limits - DO NOT EXCEED

**Cloudflare D1:**
- ✅ **Maximum:** 100,000 reads per day
- ✅ **Maximum:** 1,000 writes per day
- ✅ **Maximum:** 5 GB storage
- ⚠️ **Alert threshold:** 80% of any limit (80k reads, 800 writes, 4GB storage)
- 🚨 **Hard stop:** At 95% of limit, implement read-only mode

**Implementation:**
```typescript
// Add to API routes
const DAILY_READ_LIMIT = 100_000
const DAILY_WRITE_LIMIT = 1_000

async function checkQuota() {
  const { reads, writes } = await getUsageStats()

  if (reads > DAILY_READ_LIMIT * 0.95) {
    throw new Error('Daily read quota nearly exceeded. Contact admin.')
  }

  if (writes > DAILY_WRITE_LIMIT * 0.95) {
    // Disable submissions, show maintenance message
    return { writesDisabled: true }
  }
}
```

**Monitoring:**
- Daily email report of D1 usage
- Slack/Discord alert at 80% threshold
- Dashboard showing current usage vs limits

---

### 1.2 Vercel Free Tier Limits

- ✅ **Maximum:** 100 GB bandwidth per month
- ✅ **Maximum:** 100 GB-hours serverless function execution
- ⚠️ **Alert threshold:** 80 GB bandwidth, 80 GB-hours execution
- 🚨 **Hard stop:** At 95%, enable aggressive caching

**Mitigation:**
- Enable aggressive Edge caching (increase TTL to 300s if needed)
- Compress all API responses
- Use Cloudflare CDN in front of Vercel (if exceeded)

---

### 1.3 Zero-Cost Mandate

**CRITICAL RULE:** This project MUST remain free to operate (non-technical client).

**Allowed costs:**
- $0/month baseline (preferred)
- Maximum $5/month if D1 free tier exceeded (emergency only)

**Forbidden costs:**
- Auth services (Clerk, Auth0, etc.)
- Third-party databases (Supabase, PlanetScale, etc.)
- Email services in v1 (can add later if needed)
- Monitoring services (use free tiers only)

**If limits are hit:**
1. Optimize queries first
2. Increase caching TTL
3. Implement read-only mode during peak hours
4. Only as last resort: Upgrade to D1 paid tier ($5/month)

---

## 2. Security Guardrails

### 2.1 Authentication - NON-NEGOTIABLE

**Rules:**
- ❌ **NEVER** store password in git, code, or client-side bundle
- ❌ **NEVER** use weak password (minimum 20 characters, alphanumeric + symbols)
- ❌ **NEVER** disable HTTPS (Vercel enforces by default)
- ✅ **ALWAYS** use environment variables for secrets
- ✅ **ALWAYS** use HTTP Basic Auth over HTTPS
- ✅ **ALWAYS** rate limit authentication attempts

**Password requirements:**
```bash
# Generate password:
openssl rand -base64 24  # Minimum 24 chars

# Store securely:
# - Vercel environment variables
# - Client's password manager (1Password, Bitwarden)
# - Encrypted backup (in case of emergency)
```

**Rotation policy:**
- Rotate password every 90 days
- Rotate immediately if:
  - Suspected compromise
  - Admin device lost/stolen
  - Former team member had access

---

### 2.2 SQL Injection Prevention - ZERO TOLERANCE

**Rules:**
- ❌ **NEVER** concatenate user input into SQL queries
- ❌ **NEVER** use template literals for SQL with user data
- ✅ **ALWAYS** use parameterized queries (`.bind()`)
- ✅ **ALWAYS** validate input with Zod before queries

**Banned patterns:**
```typescript
// ❌ NEVER DO THIS
const query = `SELECT * FROM resources WHERE name = '${userInput}'`

// ❌ NEVER DO THIS
const query = `SELECT * FROM resources WHERE name = "${req.body.name}"`
```

**Required patterns:**
```typescript
// ✅ ALWAYS DO THIS
const stmt = db.prepare('SELECT * FROM resources WHERE name = ?')
  .bind(userInput)
```

**Testing:**
- All endpoints tested with SQLMap
- Automated tests with malicious payloads
- Code review checklist item: "All queries parameterized?"

---

### 2.3 Rate Limiting - MANDATORY

**Public endpoints:**
- Submissions: 10 requests per hour per IP
- Resources fetch: 100 requests per hour per IP (generous for browsing)

**Admin endpoints:**
- Login attempts: 10 failed attempts per hour per IP
- API calls: No limit (authenticated admin only)

**Implementation:**
```typescript
// Enforce these limits in middleware
const RATE_LIMITS = {
  'POST /api/submissions': { limit: 10, window: 3600 },
  'GET /api/resources': { limit: 100, window: 3600 },
  'POST /admin/*': { limit: 10, window: 3600 },  // Login attempts
}
```

**Escalation:**
- If same IP hits limit 3x in a day → block for 24 hours
- If coordinated attack detected → enable Cloudflare protection

---

### 2.4 Input Validation - STRICT

**Rules:**
- ✅ **ALWAYS** validate all API inputs with Zod
- ✅ **ALWAYS** sanitize user-provided text
- ✅ **ALWAYS** enforce max lengths
- ❌ **NEVER** trust client-side validation alone

**Maximum field lengths:**
```typescript
const FIELD_LIMITS = {
  name: 200,
  description: 1000,
  email: 100,
  website: 500,
  tags: 500,
  updateReason: 1000,
}
```

**Forbidden characters:**
- No control characters (except newlines in descriptions)
- No `<script>` tags (XSS prevention)
- Validate URLs with strict regex

---

## 3. Data Integrity Guardrails

### 3.1 Data Validation - STRICT SCHEMA

**Required fields (cannot be NULL):**
- `type` - Must be one of 4 enum values
- `name` - 1-200 characters
- `description` - 1-1000 characters
- `link` - Valid URL
- `submitter_email` - Valid email format

**Database constraints:**
```sql
-- Enforced at DB level
CHECK(type IN ('meetup', 'conference', 'online', 'tech-hub'))
CHECK(length(name) >= 1 AND length(name) <= 200)
CHECK(length(description) >= 1)
```

---

### 3.2 Data Migration - ZERO DATA LOSS

**Pre-migration checklist:**
- [ ] Backup `sample-data.ts` to separate file
- [ ] Count resources: 68 meetups, 17 conferences, 45 online, 6 tech hubs
- [ ] Test migration on local D1 database first
- [ ] Verify counts match after migration
- [ ] Spot-check 10 random resources for accuracy

**Rollback plan:**
- Keep `sample-data.ts` in codebase for 30 days post-launch
- Can revert to static data if critical issues found
- Database export script ready before go-live

**Post-migration verification:**
```sql
-- Run these queries and compare to expected
SELECT type, COUNT(*) FROM resources GROUP BY type;
-- Expected: meetup=68, conference=17, online=45, tech-hub=6

SELECT COUNT(*) FROM resources WHERE tags IS NULL OR tags = '';
-- Expected: 0 (all resources have tags)

SELECT COUNT(*) FROM resources WHERE link NOT LIKE 'http%';
-- Expected: 0 (all links are URLs)
```

---

### 3.3 Backup Strategy

**Automated backups:**
- Cloudflare D1 handles automatic backups (point-in-time recovery)
- No additional backup service needed (avoid costs)

**Manual backups:**
- Export database to JSON weekly (first 3 months)
- Store in git repository under `backups/` (gitignored)
- Admin can download backup via admin panel

**Recovery plan:**
- RTO (Recovery Time Objective): 1 hour
- RPO (Recovery Point Objective): 24 hours (daily backups)

---

## 4. Performance Guardrails

### 4.1 Response Time Limits - HARD CAPS

**Maximum acceptable latency (p95):**
- GET /api/resources: 200ms
- POST /api/submissions: 300ms
- Admin endpoints: 300ms
- Page loads: 2 seconds

**If exceeded:**
1. Add database indexes
2. Increase cache TTL
3. Optimize queries (EXPLAIN QUERY PLAN)
4. Enable query result caching

**Monitoring:**
- Vercel Analytics dashboard
- Weekly performance report
- Alert if p95 > threshold for 5 minutes

---

### 4.2 Database Query Optimization

**Rules:**
- ✅ **ALWAYS** use indexes for WHERE clauses
- ✅ **ALWAYS** limit result sets (no `SELECT * FROM resources` without LIMIT)
- ❌ **NEVER** do client-side joins (use SQL JOINs)
- ❌ **NEVER** fetch more data than needed

**Query budgets:**
- Single resource fetch: 1 query
- List resources: 1 query (with indexes)
- Submit resource: 1 query (INSERT)
- Approve submission: 2 queries (UPDATE + INSERT)

---

### 4.3 Caching Strategy - AGGRESSIVE

**Public endpoints:**
- Cache all GET requests
- TTL: 60 seconds (stale-while-revalidate: 120s)
- Invalidate on resource updates

**Admin endpoints:**
- No caching (always fresh data)

**Client-side:**
- Use SWR or React Query for automatic caching
- Deduplicate requests (if user clicks "Meetups" twice, only 1 fetch)

---

## 5. User Experience Guardrails

### 5.1 Error Messages - USER-FRIENDLY

**Rules:**
- ❌ **NEVER** show database errors to users
- ❌ **NEVER** show stack traces in production
- ✅ **ALWAYS** show actionable error messages
- ✅ **ALWAYS** log detailed errors server-side

**Example error messages:**
```typescript
// ❌ BAD
"Error: D1_ERROR: unable to prepare statement"

// ✅ GOOD
"We're having trouble loading resources. Please try again in a moment."

// ❌ BAD
"Validation error: submitterEmail must be a valid email"

// ✅ GOOD
"Please enter a valid email address (e.g., you@example.com)"
```

---

### 5.2 Loading States - REQUIRED

**Rules:**
- ✅ **ALWAYS** show loading spinner during data fetches
- ✅ **ALWAYS** disable submit buttons while processing
- ✅ **ALWAYS** show success confirmation after actions
- ❌ **NEVER** leave user guessing if action succeeded

**Timeout limits:**
- API requests: 10 second timeout
- If exceeded: Show error, allow retry

---

### 5.3 Form Validation - CLIENT + SERVER

**Rules:**
- ✅ Client-side validation for instant feedback
- ✅ Server-side validation as source of truth
- ✅ Show specific field errors (not generic "form invalid")

**Example:**
- User submits form with invalid email
- Client shows error before submission
- If bypassed, server validates and returns 400 with field error

---

## 6. Development Guardrails

### 6.1 Code Quality - MINIMUM STANDARDS

**Required before merge:**
- [ ] TypeScript errors: 0
- [ ] ESLint errors: 0
- [ ] All tests pass
- [ ] No `console.log` in production code (use proper logger)
- [ ] No `@ts-ignore` without justification comment
- [ ] All API routes have error handling

---

### 6.2 Git Workflow - PROTECTED MAIN

**Rules:**
- ❌ **NEVER** commit directly to `main`
- ❌ **NEVER** force push to `main`
- ✅ **ALWAYS** use feature branches
- ✅ **ALWAYS** test on preview deployment before merging

**Branch naming:**
- `feature/add-database-integration`
- `fix/submission-form-validation`
- `chore/update-dependencies`

---

### 6.3 Secrets Management - ZERO LEAKS

**Pre-commit checks:**
- [ ] No `.env` files committed
- [ ] No `ADMIN_PASSWORD` in code
- [ ] No API tokens in code
- [ ] `.gitignore` includes `.env*`

**Tools:**
- Use `git-secrets` or `gitleaks` to scan for secrets
- Pre-commit hook rejects commits with secrets

---

## 7. Deployment Guardrails

### 7.1 Staging First - MANDATORY

**Rules:**
- ✅ **ALWAYS** deploy to Vercel preview first
- ✅ **ALWAYS** test all flows on preview URL
- ✅ **ALWAYS** get approval before production deploy
- ❌ **NEVER** deploy directly to production

**Checklist before production:**
- [ ] All acceptance criteria met
- [ ] Manual testing completed
- [ ] Performance benchmarks passed
- [ ] Security audit passed
- [ ] Client approval received

---

### 7.2 Rollback Plan - READY

**If deployment fails:**
1. Immediately revert Vercel deployment
2. Restore database from backup (if needed)
3. Notify stakeholders
4. Debug in staging
5. Re-deploy after fix verified

**Zero-downtime requirement:**
- Database schema changes must be backward-compatible
- API changes must not break existing frontend

---

### 7.3 Environment Parity

**Rules:**
- ✅ Development, staging, production use same D1 schema
- ✅ Environment variables documented in README
- ❌ No "works on my machine" issues

**Differences allowed:**
- Database size (dev/staging can be smaller)
- `ADMIN_PASSWORD` value (different per environment)

---

## 8. Operational Guardrails

### 8.1 Monitoring - REQUIRED

**Metrics to track:**
- API error rate (target: <0.1%)
- API response time (p50, p95, p99)
- Database query count (daily reads/writes)
- User submissions per day
- Admin approval rate

**Alerts:**
- Error rate >1% for 5 minutes
- Response time p95 >500ms for 5 minutes
- D1 quota >80%
- Zero submissions for 7 days (possible bug)

---

### 8.2 Incident Response

**If production issue detected:**
1. Assess severity (P0 = site down, P1 = feature broken, P2 = minor bug)
2. P0: Rollback immediately, debug later
3. P1: Fix within 4 hours or rollback
4. P2: Fix in next release
5. Document incident in postmortem

---

### 8.3 Support - DEFINED SLA

**Response times:**
- User submission issues: 24 hours
- Admin panel issues: 4 hours
- Site down: Immediate (rollback)

**Support channels:**
- GitHub issues for bug reports
- Email for urgent issues
- Admin documentation for self-service

---

## 9. Compliance Guardrails

### 9.1 Data Privacy

**User data collected:**
- Submitter name (required)
- Submitter email (required)
- Submission timestamp (automatic)

**Rules:**
- ✅ No tracking/analytics cookies without consent (use Vercel Analytics privacy mode)
- ✅ Email addresses not shared with third parties
- ✅ Users can request deletion of submission (manual process)

---

### 9.2 Accessibility

**Minimum standards:**
- WCAG 2.1 AA compliance
- All forms keyboard navigable
- Screen reader tested
- Color contrast ratios meet standards

---

## 10. Emergency Overrides

**When guardrails can be temporarily bypassed:**
- Site down due to DDoS → enable aggressive rate limiting (stricter than normal)
- Database corruption → restore from backup (may lose <24hrs of data)
- Security breach → take site offline, investigate, restore

**Approval required:**
- Client approval for any guardrail override
- Document reason and duration
- Restore guardrails ASAP

---

## Summary: Red Lines (Never Cross)

1. ❌ Never exceed $5/month operational cost
2. ❌ Never store passwords in code or git
3. ❌ Never deploy to production without staging test
4. ❌ Never use string concatenation for SQL queries
5. ❌ Never lose user data during migration
6. ❌ Never show database errors to end users
7. ❌ Never disable HTTPS
8. ❌ Never skip input validation on API routes
9. ❌ Never commit secrets to git
10. ❌ Never deploy with failing tests

**Violation consequences:**
- Immediate rollback
- Root cause analysis
- Process improvement to prevent recurrence

---

**Document Status:** Approved
**Enforced By:** All team members
**Review Frequency:** Every 90 days or after incidents
