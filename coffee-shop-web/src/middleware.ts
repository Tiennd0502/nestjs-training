import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware(async (auth, request) => {
  if (!isProtectedRoute(request)) {
    return
  }

  await auth.protect()
})

export const config = {
  matcher: ['/dashboard/:path*'],
}
