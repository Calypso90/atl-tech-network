-- Atlanta Tech Network Database Schema
-- Run with: wrangler d1 execute DB --file=./db/schema.sql

-- Resources table: approved, public content
CREATE TABLE IF NOT EXISTS resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('meetup', 'conference', 'online', 'tech-hub')),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  tags TEXT NOT NULL,  -- JSON array: '["React","JavaScript"]'
  link TEXT NOT NULL,
  image TEXT,
  conference_date TEXT,  -- ISO 8601 date for conferences
  cfp_date TEXT,         -- Call for papers deadline
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Submissions table: pending user submissions for moderation
CREATE TABLE IF NOT EXISTS submissions (
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
  tags TEXT,  -- JSON array or comma-separated

  -- Edit request fields
  existing_resource_name TEXT,
  update_reason TEXT,

  -- Metadata
  created_at TEXT DEFAULT (datetime('now')),
  reviewed_at TEXT,
  admin_notes TEXT
);

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_name ON resources(name);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_created ON submissions(created_at DESC);
