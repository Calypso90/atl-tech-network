# Acceptance Criteria
## Atlanta Tech Network - Database Integration

**Version:** 1.0
**Date:** 2025-10-25
**Status:** Draft

---

## Overview

This document defines the **specific, testable criteria** that must be met before the database integration feature can be considered complete and ready for production deployment.

**Definition of Done:**
All acceptance criteria below must be verified as ✅ PASS before release.

---

## 1. Database Setup & Migration

### AC-1.1: D1 Database Created
- [ ] Cloudflare D1 database created with name `atl-tech-network-db`
- [ ] Database ID recorded in `wrangler.toml`
- [ ] Connection tested successfully from local environment
- [ ] Connection tested successfully from Vercel edge runtime

**Test:** Run `wrangler d1 info DB` and verify database exists

---

### AC-1.2: Schema Initialized
- [ ] `resources` table created with all fields matching spec
- [ ] `submissions` table created with all fields matching spec
- [ ] All CHECK constraints working (test with invalid data)
- [ ] All indexes created (type, name, status, created_at)
- [ ] Default values working (created_at, status)

**Test:** Run `wrangler d1 execute DB --command="SELECT * FROM sqlite_master WHERE type='table'"` and verify both tables exist

---

### AC-1.3: Data Migration Completed
- [ ] All 136 existing resources migrated from `sample-data.ts`
- [ ] Resource count verification: 68 meetups, 17 conferences, 45 online, 6 tech hubs
- [ ] All tags properly converted to JSON strings
- [ ] All dates in ISO 8601 format where applicable
- [ ] No data loss (manual spot check 10 random resources)

**Test:**
```sql
SELECT type, COUNT(*) FROM resources GROUP BY type;
-- Expected: meetup=68, conference=17, online=45, tech-hub=6
```

---

## 2. Public API Endpoints

### AC-2.1: GET /api/resources (All Resources)
- [ ] Returns HTTP 200 on success
- [ ] Returns JSON with `{success: true, data: [], count: number}` structure
- [ ] Returns all 136+ resources from database
- [ ] Resources include all fields: id, type, name, description, tags, link, image
- [ ] Tags returned as arrays (not JSON strings)
- [ ] Response cached with `Cache-Control` header (60s max-age)
- [ ] Returns empty array (not error) if database empty
- [ ] Returns HTTP 500 with error message on database failure

**Test:**
```bash
curl http://localhost:3000/api/resources
# Verify: status 200, data.length >= 136, data[0].tags is array
```

---

### AC-2.2: GET /api/resources?type=X (Filtered Resources)
- [ ] Returns only resources matching `type` parameter
- [ ] Works for all types: meetup, conference, online, tech-hub
- [ ] Returns HTTP 400 for invalid type
- [ ] Count matches filtered results
- [ ] Response cached

**Test:**
```bash
curl http://localhost:3000/api/resources?type=meetup
# Verify: all results have type="meetup", count=68
```

---

### AC-2.3: POST /api/submissions (User Submission)
- [ ] Returns HTTP 201 on successful submission
- [ ] Returns `{success: true, submissionId: number}` on success
- [ ] Validates all required fields (submitterName, submitterEmail, etc.)
- [ ] Returns HTTP 400 with validation errors for invalid data
- [ ] Rate limiting works (blocks after 10 requests/hour from same IP)
- [ ] Returns HTTP 429 when rate limit exceeded
- [ ] Submission stored in `submissions` table with status="pending"
- [ ] Both "new" and "edit" submission types work
- [ ] Optional fields stored as NULL when not provided

**Test:**
```bash
# Valid submission
curl -X POST http://localhost:3000/api/submissions \
  -H "Content-Type: application/json" \
  -d '{"submissionType":"new","resourceType":"meetup","submitterName":"Test","submitterEmail":"test@example.com","name":"Test Meetup","website":"https://test.com","description":"Test"}'

# Verify: status 201, submissionId returned, record in DB

# Invalid submission (missing required field)
curl -X POST http://localhost:3000/api/submissions \
  -H "Content-Type: application/json" \
  -d '{"submissionType":"new"}'

# Verify: status 400, error message returned
```

---

## 3. Admin Authentication

### AC-3.1: HTTP Basic Auth Protection
- [ ] `/admin` route requires authentication
- [ ] Unauthenticated request returns HTTP 401
- [ ] Response includes `WWW-Authenticate: Basic` header
- [ ] Browser shows password prompt on first visit
- [ ] Correct password grants access (HTTP 200)
- [ ] Incorrect password returns HTTP 401
- [ ] Password from `ADMIN_PASSWORD` env var (not hardcoded)
- [ ] Works in both local and production environments

**Test:**
```bash
# No auth - should fail
curl http://localhost:3000/admin
# Verify: status 401

# Wrong password - should fail
curl -u admin:wrongpass http://localhost:3000/admin
# Verify: status 401

# Correct password - should succeed
curl -u admin:$ADMIN_PASSWORD http://localhost:3000/admin
# Verify: status 200
```

---

### AC-3.2: Auth Rate Limiting
- [ ] Admin login attempts rate limited (10/hour per IP)
- [ ] Blocks after 10 failed attempts
- [ ] Returns HTTP 429 when limit exceeded
- [ ] Successful auth resets counter

**Test:**
```bash
# Try 11 wrong passwords rapidly
for i in {1..11}; do
  curl -u admin:wrong$i http://localhost:3000/admin
done
# Verify: 11th request returns 429
```

---

## 4. Admin API Endpoints

### AC-4.1: GET /api/admin/submissions
- [ ] Requires authentication (401 if not authenticated)
- [ ] Returns only pending submissions
- [ ] Ordered by created_at DESC (newest first)
- [ ] Includes all submission fields
- [ ] Returns empty array if no pending submissions

**Test:**
```bash
curl -u admin:$ADMIN_PASSWORD http://localhost:3000/api/admin/submissions
# Verify: status 200, only pending submissions returned
```

---

### AC-4.2: PATCH /api/admin/submissions/[id] (Approve/Reject)
- [ ] Requires authentication
- [ ] Updates submission status to "approved" or "rejected"
- [ ] Sets `reviewed_at` timestamp
- [ ] Allows optional `adminNotes` field
- [ ] When approving "new" submission: creates resource in `resources` table
- [ ] When approving "edit" submission: does NOT auto-update (manual edit required)
- [ ] Returns HTTP 404 for non-existent submission ID
- [ ] Returns HTTP 400 for invalid status value

**Test:**
```bash
# Approve a submission
curl -X PATCH http://localhost:3000/api/admin/submissions/1 \
  -u admin:$ADMIN_PASSWORD \
  -H "Content-Type: application/json" \
  -d '{"status":"approved","adminNotes":"Looks good!"}'

# Verify:
# 1. Submission status updated to "approved" in DB
# 2. If type=new, new resource created in resources table
# 3. reviewed_at timestamp set
```

---

### AC-4.3: GET /api/admin/resources
- [ ] Requires authentication
- [ ] Returns all resources from database
- [ ] Includes all fields
- [ ] Ordered by name ASC

**Test:**
```bash
curl -u admin:$ADMIN_PASSWORD http://localhost:3000/api/admin/resources
# Verify: status 200, all resources returned
```

---

### AC-4.4: PATCH /api/admin/resources/[id] (Update Resource)
- [ ] Requires authentication
- [ ] Updates specified fields of existing resource
- [ ] Updates `updated_at` timestamp
- [ ] Returns HTTP 404 for non-existent resource ID
- [ ] Validates updated data (e.g., valid URL, type, etc.)

**Test:**
```bash
curl -X PATCH http://localhost:3000/api/admin/resources/1 \
  -u admin:$ADMIN_PASSWORD \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name","description":"Updated description"}'

# Verify: resource updated in DB, updated_at changed
```

---

### AC-4.5: DELETE /api/admin/resources/[id]
- [ ] Requires authentication
- [ ] Soft-deletes or hard-deletes resource (specify in implementation)
- [ ] Returns HTTP 404 for non-existent resource ID
- [ ] Returns success message on deletion

**Test:**
```bash
curl -X DELETE http://localhost:3000/api/admin/resources/999 \
  -u admin:$ADMIN_PASSWORD

# Verify: resource removed from resources table
```

---

## 5. Frontend Integration

### AC-5.1: Meetups Page (/meetups)
- [ ] Fetches data from `/api/resources?type=meetup`
- [ ] Shows loading state while fetching
- [ ] Renders all meetup cards after load
- [ ] Tag filtering still works (client-side on fetched data)
- [ ] Shows error message on fetch failure
- [ ] Page load time < 2 seconds
- [ ] No console errors

**Test:**
- Visit `/meetups` in browser
- Verify: loading spinner → meetup cards appear → filtering works

---

### AC-5.2: Conferences Page (/conferences)
- [ ] Fetches data from `/api/resources?type=conference`
- [ ] Shows loading state while fetching
- [ ] Renders all conference cards with dates
- [ ] Shows error message on fetch failure
- [ ] Page load time < 2 seconds

**Test:**
- Visit `/conferences` in browser
- Verify: conferences display correctly with dates

---

### AC-5.3: Resources Page (/resources)
- [ ] Fetches data from `/api/resources?type=online`
- [ ] Shows loading state while fetching
- [ ] Tag filtering works
- [ ] Shows error message on fetch failure
- [ ] Page load time < 2 seconds

**Test:**
- Visit `/resources` in browser
- Verify: online resources display and filter correctly

---

### AC-5.4: Tech Hubs Page (/tech-hubs)
- [ ] Fetches data from `/api/resources?type=tech-hub`
- [ ] Shows loading state while fetching
- [ ] Renders all tech hub cards
- [ ] Shows error message on fetch failure
- [ ] Page load time < 2 seconds

**Test:**
- Visit `/tech-hubs` in browser
- Verify: tech hubs display correctly

---

### AC-5.5: Home Page (/)
- [ ] All preview sections fetch correct data
- [ ] No duplicate data fetching
- [ ] Shows "View All" buttons linking to full pages
- [ ] Page load time < 2 seconds

**Test:**
- Visit `/` in browser
- Verify: all sections display correctly

---

### AC-5.6: Submission Form
- [ ] POSTs to `/api/submissions` on submit
- [ ] Shows success toast on successful submission
- [ ] Shows error toast on failed submission
- [ ] Form clears after successful submission
- [ ] Validates required fields before submission
- [ ] Shows rate limit error if user submits too many times

**Test:**
- Fill out form and submit
- Verify: success toast appears, form clears, submission in DB

---

## 6. Admin Panel UI

### AC-6.1: Admin Login (/admin)
- [ ] Shows browser password prompt on first visit
- [ ] Redirects to admin dashboard after successful auth
- [ ] Shows error message on failed auth
- [ ] Persists login in browser session (no re-login needed)

**Test:**
- Visit `/admin` in incognito window
- Enter correct password
- Verify: dashboard loads, no re-prompt on page refresh

---

### AC-6.2: Submissions List (/admin)
- [ ] Displays all pending submissions
- [ ] Shows submission type (new/edit), resource type, submitter info
- [ ] Shows "Approve" and "Reject" buttons for each submission
- [ ] Updates UI after approval/rejection (removes from list)
- [ ] Shows empty state if no pending submissions

**Test:**
- Log in to `/admin`
- Verify: pending submissions listed correctly
- Click "Approve" on one submission
- Verify: submission disappears from list

---

### AC-6.3: Resource Management (/admin/resources)
- [ ] Lists all resources from database
- [ ] Allows inline editing of resource fields
- [ ] Allows deleting resources
- [ ] Shows confirmation dialog before deletion
- [ ] Updates UI after edits/deletions

**Test:**
- Visit `/admin/resources`
- Edit a resource
- Verify: changes saved to DB and reflected in public pages

---

## 7. Performance Requirements

### AC-7.1: API Response Times
- [ ] GET /api/resources: p95 < 200ms
- [ ] POST /api/submissions: p95 < 300ms
- [ ] All admin endpoints: p95 < 300ms

**Test:** Run load test with `autocannon` or similar:
```bash
npx autocannon -c 10 -d 30 http://localhost:3000/api/resources
# Verify: p95 latency < 200ms
```

---

### AC-7.2: Page Load Times
- [ ] All public pages load in < 2 seconds (p95)
- [ ] Lighthouse Performance score > 90
- [ ] No increase from current baseline (1.2s)

**Test:** Run Lighthouse audit on all pages

---

### AC-7.3: Caching Effectiveness
- [ ] GET /api/resources returns `Cache-Control` header
- [ ] Vercel Edge Cache hit rate > 80% (check analytics)
- [ ] Cache invalidates within 60 seconds of data updates

**Test:**
```bash
curl -I http://localhost:3000/api/resources
# Verify: Cache-Control header present
```

---

## 8. Security Requirements

### AC-8.1: SQL Injection Prevention
- [ ] All queries use parameterized statements (no string interpolation)
- [ ] Tested with malicious input (e.g., `'; DROP TABLE resources; --`)
- [ ] No SQL errors leaked in responses

**Test:**
```bash
curl -X POST http://localhost:3000/api/submissions \
  -H "Content-Type: application/json" \
  -d '{"submitterEmail":"test@example.com'; DROP TABLE resources; --"}'

# Verify: query doesn't execute, returns validation error
```

---

### AC-8.2: Input Validation
- [ ] All API routes validate with Zod schemas
- [ ] Invalid data returns HTTP 400 with helpful errors
- [ ] No unvalidated data reaches database

**Test:** Send invalid data to each endpoint and verify 400 responses

---

### AC-8.3: Authentication Security
- [ ] ADMIN_PASSWORD not in git repository
- [ ] ADMIN_PASSWORD not in client-side code (check bundle)
- [ ] HTTPS enforced (check Vercel settings)
- [ ] No password visible in browser DevTools Network tab

**Test:**
```bash
git log --all -p -S 'ADMIN_PASSWORD' | grep -v '.env'
# Verify: no results (password never committed)
```

---

### AC-8.4: Rate Limiting
- [ ] Submission endpoint limited to 10/hour per IP
- [ ] Admin login limited to 10 attempts/hour per IP
- [ ] Returns HTTP 429 when exceeded
- [ ] Limits reset after 1 hour

**Test:** Automated script to send 11 requests and verify 11th fails

---

## 9. Reliability & Error Handling

### AC-9.1: Database Connection Failures
- [ ] App handles D1 unavailability gracefully
- [ ] Shows user-friendly error (not stack trace)
- [ ] Logs error server-side for debugging
- [ ] Does not crash the app

**Test:** Temporarily break DB connection, verify error handling

---

### AC-9.2: Malformed Requests
- [ ] Invalid JSON returns HTTP 400
- [ ] Missing Content-Type handled gracefully
- [ ] Extra fields in request body ignored (no errors)

**Test:**
```bash
curl -X POST http://localhost:3000/api/submissions \
  -H "Content-Type: application/json" \
  -d 'invalid json'

# Verify: 400 error, not 500
```

---

### AC-9.3: Edge Cases
- [ ] Empty database returns empty array (not error)
- [ ] Duplicate submission (same email/name) allowed (no unique constraint)
- [ ] Very long text fields truncated or rejected (per schema)
- [ ] Special characters in text fields handled correctly (emojis, unicode)

**Test:** Submit resource with emoji in name, verify stored correctly

---

## 10. Deployment & Configuration

### AC-10.1: Environment Variables
- [ ] `ADMIN_PASSWORD` set in Vercel production environment
- [ ] `ADMIN_PASSWORD` set in Vercel preview environments
- [ ] D1 database binding configured in `wrangler.toml`
- [ ] No hardcoded secrets in codebase

**Test:** Check Vercel dashboard > Settings > Environment Variables

---

### AC-10.2: Build & Deploy
- [ ] `npm run build` succeeds with no errors
- [ ] No TypeScript errors (`npm run lint` passes)
- [ ] No ESLint errors
- [ ] Production deployment succeeds
- [ ] Zero downtime during deployment

**Test:**
```bash
npm run build
npm run lint
# Verify: both succeed with exit code 0
```

---

### AC-10.3: Post-Deployment Verification
- [ ] All public pages load correctly in production
- [ ] Admin panel accessible with correct password
- [ ] API endpoints return correct data
- [ ] Submission form works end-to-end
- [ ] Existing resources all present (count = 136+)

**Test:** Manually test all flows on production URL

---

## 11. Documentation

### AC-11.1: Code Documentation
- [ ] All API routes have TSDoc comments
- [ ] Complex functions have explanatory comments
- [ ] README updated with setup instructions
- [ ] Environment variables documented

**Test:** Review code for comment coverage

---

### AC-11.2: Admin Documentation
- [ ] Admin user guide created (how to review submissions)
- [ ] Password reset instructions documented
- [ ] Troubleshooting guide for common issues

**Test:** Have non-technical person follow admin guide

---

## Summary Checklist

Before marking this feature as **COMPLETE**, verify:

- [ ] All 11 sections above have all items checked
- [ ] Manual testing completed on staging environment
- [ ] Manual testing completed on production environment
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Non-technical client trained on admin panel
- [ ] Rollback plan documented (if needed)
- [ ] Monitoring/alerts configured (database errors, rate limits)

---

**Approved By:** _______________
**Date:** _______________
**Release Version:** v2.0.0
