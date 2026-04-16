import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Stub: extend later with auth checks and redirect unauthorized users
 * away from /dashboard (see project rules).
 */
export function middleware(request: NextRequest) {
  void request
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
