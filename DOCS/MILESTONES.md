# Milestones & Timeline
## Atlanta Tech Network - Database Integration

**Version:** 1.0
**Date:** 2025-10-25
**Project Duration:** 8 hours (1 day sprint)
**Status:** Draft

---

## Project Overview

**Total Estimated Time:** 8 hours
**Team Size:** 1 developer
**Deployment Target:** Vercel (production)
**Go-Live Date:** TBD (within 1 week of kickoff)

---

## Milestone Breakdown

```
┌─────────────────────────────────────────────────────────────────┐
│ Timeline (8 hours total)                                        │
├─────────────────────────────────────────────────────────────────┤
│ M1: Setup      │████████│ 2h                                    │
│ M2: API Routes │████████████│ 2h                                │
│ M3: Frontend   │██████████│ 1.5h                                │
│ M4: Admin UI   │██████████│ 1.5h                                │
│ M5: Testing    │██████│ 1h                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Milestone 1: Database Setup & Migration
**Duration:** 2 hours
**Owner:** Developer
**Status:** Not Started

### Objectives
- Set up Cloudflare D1 database
- Initialize schema
- Migrate existing 136 resources from `sample-data.ts`
- Verify data integrity

### Tasks

#### 1.1 Create D1 Database (15 min)
- [ ] Install Wrangler CLI: `npm install -g wrangler`
- [ ] Authenticate with Cloudflare: `wrangler login`
- [ ] Create database: `wrangler d1 create atl-tech-network-db`
- [ ] Copy database ID to `wrangler.toml`

**Deliverable:** `wrangler.toml` configured with database ID

---

#### 1.2 Initialize Database Schema (20 min)
- [ ] Create `db/schema.sql` with tables and indexes
- [ ] Run schema: `wrangler d1 execute DB --file=./db/schema.sql`
- [ ] Verify tables created: `wrangler d1 execute DB --command="SELECT name FROM sqlite_master WHERE type='table'"`

**Deliverable:** `resources` and `submissions` tables created

---

#### 1.3 Write Migration Script (30 min)
- [ ] Create `scripts/migrate-data.ts`
- [ ] Import data from `lib/sample-data.ts`
- [ ] Transform tags to JSON strings
- [ ] Batch insert with D1 batch API

**Deliverable:** `migrate-data.ts` script ready to run

---

#### 1.4 Run Migration & Verify (20 min)
- [ ] Execute migration: `npm run db:migrate`
- [ ] Verify counts:
  ```sql
  SELECT type, COUNT(*) FROM resources GROUP BY type;
  -- Expected: meetup=68, conference=17, online=45, tech-hub=6
  ```
- [ ] Spot-check 10 random resources for accuracy
- [ ] Export backup: `wrangler d1 export DB > backups/initial-migration.sql`

**Deliverable:** 136 resources in database, backup created

---

#### 1.5 Setup Environment Variables (15 min)
- [ ] Generate admin password: `openssl rand -base64 24`
- [ ] Add to Vercel: `ADMIN_PASSWORD` (production)
- [ ] Add to Vercel: `ADMIN_PASSWORD` (preview)
- [ ] Add to local `.env.local`: `ADMIN_PASSWORD`
- [ ] Verify `.env*` in `.gitignore`

**Deliverable:** Environment variables configured

---

### Milestone 1 Exit Criteria
- ✅ D1 database created and accessible
- ✅ Schema initialized with all tables and indexes
- ✅ 136 resources migrated successfully
- ✅ Data integrity verified (counts match, no NULL required fields)
- ✅ Environment variables set in all environments
- ✅ Backup created

**Estimated Time:** 2 hours
**Actual Time:** ___ hours

---

## Milestone 2: API Routes Implementation
**Duration:** 2 hours
**Owner:** Developer
**Status:** Not Started

### Objectives
- Implement public API routes (GET resources, POST submissions)
- Implement admin API routes (GET/PATCH submissions, resources)
- Add authentication middleware
- Add rate limiting
- Add input validation

### Tasks

#### 2.1 Database Client Setup (15 min)
- [ ] Create `lib/db.ts` with D1 client interfaces
- [ ] Add `getD1Database()` helper function
- [ ] Test connection in API route

**Deliverable:** `lib/db.ts` ready for use

---

#### 2.2 Rate Limiting Utility (15 min)
- [ ] Create `lib/rate-limit.ts`
- [ ] Implement in-memory rate limiter
- [ ] Export `checkRateLimit()` function
- [ ] Test with mock requests

**Deliverable:** `lib/rate-limit.ts` functional

---

#### 2.3 Authentication Middleware (20 min)
- [ ] Create `middleware.ts` in root
- [ ] Implement HTTP Basic Auth check
- [ ] Verify `ADMIN_PASSWORD` from env
- [ ] Test with curl (authorized & unauthorized)

**Deliverable:** `/admin` routes protected

---

#### 2.4 Public API: GET /api/resources (20 min)
- [ ] Create `app/api/resources/route.ts`
- [ ] Implement GET handler with optional `?type=` filter
- [ ] Add caching headers (`Cache-Control`)
- [ ] Transform tags JSON → arrays
- [ ] Handle errors gracefully
- [ ] Test: `curl http://localhost:3000/api/resources`

**Deliverable:** GET /api/resources working

---

#### 2.5 Public API: POST /api/submissions (25 min)
- [ ] Create `app/api/submissions/route.ts`
- [ ] Define Zod validation schema
- [ ] Implement POST handler
- [ ] Add rate limiting (10/hour per IP)
- [ ] Insert into `submissions` table
- [ ] Return `submissionId`
- [ ] Test: `curl -X POST http://localhost:3000/api/submissions -d '{...}'`

**Deliverable:** POST /api/submissions working

---

#### 2.6 Admin API: GET /api/admin/submissions (10 min)
- [ ] Create `app/api/admin/submissions/route.ts`
- [ ] Fetch pending submissions (auth required)
- [ ] Order by `created_at DESC`
- [ ] Test with auth header

**Deliverable:** Admin can fetch pending submissions

---

#### 2.7 Admin API: PATCH /api/admin/submissions/[id] (15 min)
- [ ] Create `app/api/admin/submissions/[id]/route.ts`
- [ ] Implement approve/reject logic
- [ ] If approved + type=new → insert into `resources`
- [ ] Update submission status and `reviewed_at`
- [ ] Test approval flow

**Deliverable:** Admin can approve submissions

---

### Milestone 2 Exit Criteria
- ✅ GET /api/resources returns all resources
- ✅ GET /api/resources?type=meetup filters correctly
- ✅ POST /api/submissions accepts valid data, rejects invalid
- ✅ Rate limiting works (blocks after 10 submissions)
- ✅ Admin routes require authentication
- ✅ Admin can approve/reject submissions
- ✅ All routes have error handling
- ✅ Manual testing with curl/Postman successful

**Estimated Time:** 2 hours
**Actual Time:** ___ hours

---

## Milestone 3: Frontend Integration
**Duration:** 1.5 hours
**Owner:** Developer
**Status:** Not Started

### Objectives
- Replace static imports with API fetches
- Add loading states
- Update form submission
- Preserve existing UX (filtering, etc.)

### Tasks

#### 3.1 Create Data Fetching Hook (20 min)
- [ ] Create `hooks/use-resources.ts`
- [ ] Implement `useResources(type?)` hook
- [ ] Return `{ resources, loading, error }`
- [ ] Test in a page

**Deliverable:** `use-resources.ts` hook

---

#### 3.2 Update Meetups Page (15 min)
- [ ] Replace `import { sampleMeetups }` with `useResources('meetup')`
- [ ] Add loading spinner
- [ ] Add error message UI
- [ ] Verify filtering still works
- [ ] Test in browser

**Deliverable:** `/meetups` page uses API

---

#### 3.3 Update Conferences Page (10 min)
- [ ] Replace static import with `useResources('conference')`
- [ ] Add loading state
- [ ] Test in browser

**Deliverable:** `/conferences` page uses API

---

#### 3.4 Update Resources Page (15 min)
- [ ] Replace static import with `useResources('online')`
- [ ] Add loading state
- [ ] Verify tag filtering works
- [ ] Test in browser

**Deliverable:** `/resources` page uses API

---

#### 3.5 Update Tech Hubs Page (10 min)
- [ ] Replace static import with `useResources('tech-hub')`
- [ ] Add loading state
- [ ] Test in browser

**Deliverable:** `/tech-hubs` page uses API

---

#### 3.6 Update Home Page (10 min)
- [ ] Update preview sections to fetch from API
- [ ] Show first 6 items of each type
- [ ] Add loading states
- [ ] Test in browser

**Deliverable:** Home page uses API

---

#### 3.7 Update Submission Form (10 min)
- [ ] Update form to POST to `/api/submissions`
- [ ] Handle success response (show toast)
- [ ] Handle error response (show error toast)
- [ ] Handle rate limit error (show specific message)
- [ ] Test submission flow end-to-end

**Deliverable:** Form submissions work

---

### Milestone 3 Exit Criteria
- ✅ All pages fetch from API (no static imports)
- ✅ Loading states display correctly
- ✅ Error states display user-friendly messages
- ✅ Filtering/search still works
- ✅ Form submission creates database record
- ✅ No console errors
- ✅ Page load time <2s

**Estimated Time:** 1.5 hours
**Actual Time:** ___ hours

---

## Milestone 4: Admin Panel UI
**Duration:** 1.5 hours
**Owner:** Developer
**Status:** Not Started

### Objectives
- Create admin dashboard at `/admin`
- List pending submissions
- Approve/reject functionality
- Edit existing resources (optional for v1)

### Tasks

#### 4.1 Create Admin Dashboard Page (20 min)
- [ ] Create `app/admin/page.tsx`
- [ ] Add password prompt UI (browser handles auth)
- [ ] Fetch pending submissions from `/api/admin/submissions`
- [ ] Display in table/list format
- [ ] Show: type, name, submitter, date

**Deliverable:** Admin dashboard displays submissions

---

#### 4.2 Add Approve/Reject Actions (25 min)
- [ ] Add "Approve" button for each submission
- [ ] Add "Reject" button for each submission
- [ ] On click → PATCH `/api/admin/submissions/[id]`
- [ ] Show confirmation dialog
- [ ] Remove from list after action
- [ ] Show success toast

**Deliverable:** Admin can approve/reject submissions

---

#### 4.3 Add Resource Management (Optional - 30 min)
- [ ] Create `/admin/resources` page
- [ ] List all resources from `/api/admin/resources`
- [ ] Add inline edit functionality
- [ ] Add delete button with confirmation
- [ ] Test edit/delete flows

**Deliverable:** Admin can edit/delete resources (or skip for v1)

---

#### 4.4 Admin UI Polish (15 min)
- [ ] Add empty state ("No pending submissions")
- [ ] Add loading states
- [ ] Add error handling
- [ ] Style with Tailwind (match site design)
- [ ] Test responsiveness

**Deliverable:** Admin panel looks professional

---

### Milestone 4 Exit Criteria
- ✅ `/admin` route requires password
- ✅ Pending submissions displayed
- ✅ Approve/reject buttons work
- ✅ UI updates after actions
- ✅ Empty state shows when no submissions
- ✅ Mobile responsive
- ✅ No console errors

**Estimated Time:** 1.5 hours
**Actual Time:** ___ hours

---

## Milestone 5: Testing & Deployment
**Duration:** 1 hour
**Owner:** Developer
**Status:** Not Started

### Objectives
- End-to-end testing
- Security testing
- Performance testing
- Deploy to production
- Post-deployment verification

### Tasks

#### 5.1 Functional Testing (20 min)
- [ ] Test all public pages (meetups, conferences, resources, tech hubs, home)
- [ ] Test submission form (valid data)
- [ ] Test submission form (invalid data)
- [ ] Test rate limiting (submit 11 times)
- [ ] Test admin login (correct & wrong password)
- [ ] Test approve/reject flow
- [ ] Document any bugs found

**Deliverable:** All features tested, bugs documented

---

#### 5.2 Security Testing (15 min)
- [ ] Test SQL injection on all inputs
- [ ] Verify password not in client bundle: `grep -r "ADMIN_PASSWORD" .next/`
- [ ] Verify HTTPS redirect (if testing locally)
- [ ] Test auth bypass attempts
- [ ] Verify rate limits enforced

**Deliverable:** Security checklist passed

---

#### 5.3 Performance Testing (10 min)
- [ ] Run Lighthouse on all pages
- [ ] Verify Performance score >90
- [ ] Check API response times (Chrome DevTools Network tab)
- [ ] Verify caching headers present

**Deliverable:** Performance targets met

---

#### 5.4 Deploy to Production (10 min)
- [ ] Merge feature branch to `main`
- [ ] Push to GitHub
- [ ] Vercel auto-deploys
- [ ] Monitor deployment logs
- [ ] Verify deployment succeeded

**Deliverable:** Live on production URL

---

#### 5.5 Post-Deployment Verification (5 min)
- [ ] Visit production URL, verify all pages load
- [ ] Submit test resource, verify in admin panel
- [ ] Approve test submission, verify appears on site
- [ ] Check Vercel Analytics for errors

**Deliverable:** Production verified working

---

### Milestone 5 Exit Criteria
- ✅ All acceptance criteria met (see ACCEPTANCE_CRITERIA.md)
- ✅ Security tests passed
- ✅ Performance benchmarks met
- ✅ Deployed to production
- ✅ Post-deployment smoke test passed
- ✅ No critical bugs found

**Estimated Time:** 1 hour
**Actual Time:** ___ hours

---

## Risk Mitigation

### Potential Blockers & Solutions

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| D1 setup issues | Medium | High | Use local SQLite for development, migrate to D1 later |
| Authentication complexity | Low | Medium | Stick to HTTP Basic Auth (simplest option) |
| Data migration errors | Low | High | Test migration on local DB first, keep `sample-data.ts` as backup |
| Vercel deployment issues | Low | Medium | Test on preview deployment before production |
| Time overrun | Medium | Low | Cut optional features (resource editing in admin panel) |

---

## Success Criteria Summary

**Project is considered successful when:**
1. ✅ All 136 resources migrated to D1 database
2. ✅ User submissions captured in database (not lost)
3. ✅ Admin can approve/reject submissions via UI
4. ✅ All existing pages work identically (UX unchanged)
5. ✅ Cost remains $0/month (free tier)
6. ✅ Security audit passed (no vulnerabilities)
7. ✅ Performance maintained (<2s page loads)
8. ✅ Zero downtime during deployment

---

## Daily Standup Format (if multi-day)

**Yesterday:**
- Milestones completed: M1, M2
- Blockers: None

**Today:**
- Plan: Complete M3 (Frontend Integration)
- Expected completion: 1.5 hours

**Blockers:**
- None currently

---

## Post-Launch Checklist (Week 1)

- [ ] Monitor Vercel Analytics daily
- [ ] Check D1 usage daily (read/write quota)
- [ ] Review pending submissions daily
- [ ] Monitor error logs (Vercel logs)
- [ ] User feedback survey (if applicable)
- [ ] Document any issues in GitHub

---

## Future Enhancements (Out of Scope for v1)

**Week 2-4:**
- Email notifications to admin on new submissions
- Resource analytics (views, clicks)
- Bulk import/export resources

**Month 2-3:**
- User accounts (claim/update own resources)
- Full-text search (Algolia or Meilisearch)
- RSS feed for new resources
- Image upload for resources

**Month 6+:**
- API for third-party integrations
- Mobile app (React Native)
- Advanced filtering (date range, location, etc.)

---

## Timeline Visualization

```
Week 0 (Kickoff):
├─ Day 1: Milestones 1-5 (8 hours total)
└─ Day 2: Buffer for bugs/polish

Week 1 (Post-Launch):
├─ Daily: Monitor production
├─ Fix any critical bugs
└─ Document lessons learned

Week 2+:
└─ Plan future enhancements
```

---

## Approval & Sign-Off

**Project Plan Approved By:**
- [ ] Developer: _______________
- [ ] Client/Stakeholder: _______________
- [ ] Date: _______________

**Go-Live Approval:**
- [ ] All milestones complete
- [ ] All exit criteria met
- [ ] Client trained on admin panel
- [ ] Rollback plan documented
- [ ] Approved for production: _______________

---

**Document Status:** Ready for Kickoff
**Next Steps:** Begin Milestone 1 (Database Setup)
**Total Project Duration:** 8 hours (1 day sprint)
