/**
 * GET /api/resources
 *
 * Public endpoint to fetch resources from D1 database.
 * Supports filtering by type and basic search.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { getD1Database, parseResource, type Resource } from '@/lib/db'
import { resourceQuerySchema } from '@/lib/validations'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const queryResult = resourceQuerySchema.safeParse({
      type: searchParams.get('type') || undefined,
      search: searchParams.get('search') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined
    })

    if (!queryResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
          details: queryResult.error.flatten()
        },
        { status: 400 }
      )
    }

    const { type, search, limit, offset } = queryResult.data

    // Get D1 database
    const { env } = getRequestContext()
    const db = getD1Database(env)

    // Build query
    let query = 'SELECT * FROM resources WHERE 1=1'
    const params: (string | number)[] = []

    if (type) {
      query += ' AND type = ?'
      params.push(type)
    }

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)'
      const searchPattern = `%${search}%`
      params.push(searchPattern, searchPattern)
    }

    query += ' ORDER BY name ASC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    // Execute query
    const stmt = db.prepare(query).bind(...params)
    const { results } = await stmt.all<Resource>()

    // Parse resources (convert JSON tags to arrays)
    const resources = results.map(parseResource)

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as count FROM resources WHERE 1=1'
    const countParams: string[] = []

    if (type) {
      countQuery += ' AND type = ?'
      countParams.push(type)
    }

    if (search) {
      countQuery += ' AND (name LIKE ? OR description LIKE ?)'
      const searchPattern = `%${search}%`
      countParams.push(searchPattern, searchPattern)
    }

    const countStmt = countParams.length > 0
      ? db.prepare(countQuery).bind(...countParams)
      : db.prepare(countQuery)
    const countResult = await countStmt.first<{ count: number }>()
    const total = countResult?.count ?? 0

    return NextResponse.json(
      {
        success: true,
        data: resources,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + resources.length < total
        }
      },
      {
        headers: {
          // Cache for 60 seconds, serve stale for 2 minutes while revalidating
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
        }
      }
    )
  } catch (error) {
    console.error('Error fetching resources:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch resources'
      },
      { status: 500 }
    )
  }
}
