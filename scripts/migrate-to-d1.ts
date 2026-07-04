/**
 * Migration Script: Sample Data to D1
 *
 * Migrates hardcoded sample data from lib/sample-data.ts to Cloudflare D1.
 *
 * Usage:
 *   1. Create D1 database: wrangler d1 create atl-tech-network-db
 *   2. Update wrangler.toml with database_id
 *   3. Run schema: wrangler d1 execute DB --local --file=./db/schema.sql
 *   4. Run migration: npx tsx scripts/migrate-to-d1.ts
 *
 * For production:
 *   wrangler d1 execute DB --file=./db/schema.sql
 *   Then use the generated SQL file or Wrangler dashboard to import data
 */

import {
  sampleMeetups,
  sampleConferences,
  sampleOnlineResources,
  sampleTechHubs
} from '../lib/sample-data'

interface Resource {
  id: string
  type: string
  name: string
  description: string
  tags: string[]
  link: string
  image: string
  date?: string
  cfpDate?: string
}

// Escape single quotes for SQL
function escapeSQL(str: string): string {
  return str.replace(/'/g, "''")
}

// Generate INSERT statements
function generateInserts(resources: Resource[], type: string): string[] {
  return resources.map(resource => {
    const tags = JSON.stringify(resource.tags)
    const image = resource.image || '/placeholder.svg'
    const conferenceDate = resource.date || null
    const cfpDate = resource.cfpDate || null

    return `INSERT INTO resources (type, name, description, tags, link, image, conference_date, cfp_date)
VALUES ('${type}', '${escapeSQL(resource.name)}', '${escapeSQL(resource.description)}', '${escapeSQL(tags)}', '${escapeSQL(resource.link)}', '${escapeSQL(image)}', ${conferenceDate ? `'${conferenceDate}'` : 'NULL'}, ${cfpDate ? `'${cfpDate}'` : 'NULL'});`
  })
}

// Main migration
function generateMigrationSQL(): string {
  const statements: string[] = [
    '-- Auto-generated migration from sample-data.ts',
    `-- Generated: ${new Date().toISOString()}`,
    '',
    '-- Clear existing data (optional - comment out to preserve)',
    'DELETE FROM resources;',
    '',
    '-- Reset auto-increment',
    'DELETE FROM sqlite_sequence WHERE name="resources";',
    '',
    '-- Meetups',
    ...generateInserts(sampleMeetups as Resource[], 'meetup'),
    '',
    '-- Conferences',
    ...generateInserts(sampleConferences as Resource[], 'conference'),
    '',
    '-- Online Resources',
    ...generateInserts(sampleOnlineResources as Resource[], 'online'),
    '',
    '-- Tech Hubs',
    ...generateInserts(sampleTechHubs as Resource[], 'tech-hub'),
  ]

  return statements.join('\n')
}

// Output to stdout or file
const sql = generateMigrationSQL()

// Count resources
const totalCount =
  sampleMeetups.length +
  sampleConferences.length +
  sampleOnlineResources.length +
  sampleTechHubs.length

console.log(sql)
console.error(`\n-- Migration generated successfully!`)
console.error(`-- Total resources: ${totalCount}`)
console.error(`--   Meetups: ${sampleMeetups.length}`)
console.error(`--   Conferences: ${sampleConferences.length}`)
console.error(`--   Online Resources: ${sampleOnlineResources.length}`)
console.error(`--   Tech Hubs: ${sampleTechHubs.length}`)
console.error(``)
console.error(`-- To apply locally:`)
console.error(`--   npx tsx scripts/migrate-to-d1.ts > db/seed.sql`)
console.error(`--   wrangler d1 execute DB --local --file=./db/seed.sql`)
console.error(``)
console.error(`-- To apply to production:`)
console.error(`--   npx tsx scripts/migrate-to-d1.ts > db/seed.sql`)
console.error(`--   wrangler d1 execute DB --file=./db/seed.sql`)
