/**
 * Next.js Middleware
 *
 * Protects /admin routes with HTTP Basic Authentication.
 * For production, consider Cloudflare Access for stronger security.
 */

import { NextRequest, NextResponse } from 'next/server'

// Protect all /admin routes and /api/admin routes
export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
}

export function middleware(request: NextRequest) {
  // Check for Authorization header
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !isValidAuth(authHeader)) {
    // Return 401 with WWW-Authenticate header to prompt browser login dialog
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin Panel", charset="UTF-8"'
      }
    })
  }

  // Auth valid, continue to route
  return NextResponse.next()
}

/**
 * Validate Basic Auth credentials
 */
function isValidAuth(authHeader: string): boolean {
  try {
    // Extract base64 credentials from "Basic <base64>"
    const [scheme, encoded] = authHeader.split(' ')

    if (scheme !== 'Basic' || !encoded) {
      return false
    }

    // Decode base64 credentials
    const decoded = atob(encoded)
    const [username, password] = decoded.split(':')

    // Get expected password from environment
    // In Cloudflare Pages, this is set in the dashboard or wrangler.toml [vars]
    const expectedPassword = process.env.ADMIN_PASSWORD

    if (!expectedPassword) {
      console.error('ADMIN_PASSWORD environment variable not set!')
      return false
    }

    // Simple validation: any username, correct password
    // For production, you might want to validate username too
    return password === expectedPassword
  } catch (error) {
    console.error('Auth validation error:', error)
    return false
  }
}
