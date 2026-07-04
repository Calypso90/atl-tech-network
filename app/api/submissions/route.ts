/**
 * POST /api/submissions
 *
 * Public endpoint to submit new resource suggestions or edit requests.
 * Rate limited to prevent abuse.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { getD1Database } from '@/lib/db'
import { submissionSchema } from '@/lib/validations'
import { checkRateLimit, rateLimitHeaders } from '@/lib/rate-limit'

export const runtime = 'edge'

// Rate limit: 10 submissions per hour per IP
const RATE_LIMIT = 10
const RATE_WINDOW = 3600000 // 1 hour

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('cf-connecting-ip')
      || request.headers.get('x-forwarded-for')?.split(',')[0]
      || 'unknown'

    // Check rate limit
    if (!checkRateLimit(ip, RATE_LIMIT, RATE_WINDOW)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many submissions. Please try again later.'
        },
        {
          status: 429,
          headers: rateLimitHeaders(ip, RATE_LIMIT)
        }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = submissionSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid submission data',
          details: validationResult.error.flatten()
        },
        {
          status: 400,
          headers: rateLimitHeaders(ip, RATE_LIMIT)
        }
      )
    }

    const data = validationResult.data

    // Get D1 database
    const { env } = getRequestContext()
    const db = getD1Database(env)

    // Insert submission
    const stmt = db.prepare(`
      INSERT INTO submissions (
        submission_type,
        resource_type,
        submitter_name,
        submitter_email,
        name,
        website,
        description,
        tags,
        existing_resource_name,
        update_reason,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
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

    // Success response
    const isNewResource = data.submissionType === 'new'
    return NextResponse.json(
      {
        success: true,
        message: isNewResource
          ? 'Your resource suggestion has been submitted for review.'
          : 'Your update suggestion has been submitted for review.',
        submissionId: result.meta.last_row_id
      },
      {
        status: 201,
        headers: rateLimitHeaders(ip, RATE_LIMIT)
      }
    )
  } catch (error) {
    console.error('Error processing submission:', error)

    // Check for JSON parse errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body'
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process submission. Please try again.'
      },
      { status: 500 }
    )
  }
}
