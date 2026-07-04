/**
 * GET /api/admin/submissions
 *
 * Protected endpoint to list pending submissions.
 * Requires Basic Auth (handled by middleware.ts)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { getD1Database, type Submission } from '@/lib/db'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'

    const { env } = getRequestContext()
    const db = getD1Database(env)

    const { results } = await db.prepare(`
      SELECT * FROM submissions
      WHERE status = ?
      ORDER BY created_at DESC
    `).bind(status).all<Submission>()

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length
    })
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submissions' },
      { status: 500 }
    )
  }
}
