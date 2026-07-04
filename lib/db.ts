/**
 * D1 Database Client Wrapper
 *
 * Provides typed access to Cloudflare D1 database.
 * In production, DB is injected via Cloudflare bindings.
 * In local dev, wrangler provides a local SQLite instance.
 */

// D1 Types (Cloudflare Workers types)
export interface D1Database {
  prepare(query: string): D1PreparedStatement
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>
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

// Resource types matching our schema
export interface Resource {
  id: number
  type: 'meetup' | 'conference' | 'online' | 'tech-hub'
  name: string
  description: string
  tags: string  // JSON array stored as string
  link: string
  image: string | null
  conference_date: string | null
  cfp_date: string | null
  created_at: string
  updated_at: string
}

export interface Submission {
  id: number
  submission_type: 'new' | 'edit'
  resource_type: 'meetup' | 'conference' | 'online' | 'tech-hub'
  submitter_name: string
  submitter_email: string
  status: 'pending' | 'approved' | 'rejected'
  name: string | null
  website: string | null
  description: string | null
  tags: string | null
  existing_resource_name: string | null
  update_reason: string | null
  created_at: string
  reviewed_at: string | null
  admin_notes: string | null
}

// Parsed resource with tags as array (for frontend use)
export interface ParsedResource extends Omit<Resource, 'tags'> {
  tags: string[]
}

/**
 * Get D1 database instance from Cloudflare environment bindings
 *
 * In Next.js API routes on Cloudflare Pages, access via:
 *   import { getRequestContext } from '@cloudflare/next-on-pages'
 *   const { env } = getRequestContext()
 *   const db = env.DB
 */
export function getD1Database(env: { DB: D1Database }): D1Database {
  if (!env.DB) {
    throw new Error('D1 database binding not found. Ensure wrangler.toml is configured correctly.')
  }
  return env.DB
}

/**
 * Parse a resource row from D1, converting JSON string tags to array
 */
export function parseResource(row: Resource): ParsedResource {
  return {
    ...row,
    tags: parseJsonArray(row.tags)
  }
}

/**
 * Safely parse JSON array string, returning empty array on failure
 */
export function parseJsonArray(jsonString: string | null): string[] {
  if (!jsonString) return []
  try {
    const parsed = JSON.parse(jsonString)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    // If not valid JSON, try comma-separated
    return jsonString.split(',').map(s => s.trim()).filter(Boolean)
  }
}

/**
 * Convert array to JSON string for storage
 */
export function stringifyTags(tags: string[]): string {
  return JSON.stringify(tags)
}
