/**
 * PATCH /api/admin/submissions/[id]
 *
 * Protected endpoint to approve/reject a submission.
 * If approved and it's a 'new' submission, creates the resource.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { getD1Database, type Submission } from '@/lib/db'
import { reviewSchema } from '@/lib/validations'

export const runtime = 'edge'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validate request
    const validationResult = reviewSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request',
          details: validationResult.error.flatten()
        },
        { status: 400 }
      )
    }

    const { status, adminNotes } = validationResult.data

    const { env } = getRequestContext()
    const db = getD1Database(env)

    // Get submission
    const submission = await db.prepare(`
      SELECT * FROM submissions WHERE id = ?
    `).bind(id).first<Submission>()

    if (!submission) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      )
    }

    if (submission.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Submission already reviewed' },
        { status: 400 }
      )
    }

    // If approving a new resource, insert it
    if (status === 'approved' && submission.submission_type === 'new') {
      await db.prepare(`
        INSERT INTO resources (type, name, description, tags, link, image)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        submission.resource_type,
        submission.name,
        submission.description,
        submission.tags || '[]',
        submission.website,
        '/placeholder.svg'
      ).run()
    }

    // Update submission status
    await db.prepare(`
      UPDATE submissions
      SET status = ?, reviewed_at = datetime('now'), admin_notes = ?
      WHERE id = ?
    `).bind(status, adminNotes || null, id).run()

    return NextResponse.json({
      success: true,
      message: `Submission ${status}`
    })
  } catch (error) {
    console.error('Error reviewing submission:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to review submission' },
      { status: 500 }
    )
  }
}
