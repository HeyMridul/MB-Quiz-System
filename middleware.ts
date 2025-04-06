import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === "/" || path.startsWith("/auth/") || path.startsWith("/terms")

  // Get authentication status from cookies
  const isAuthenticated = request.cookies.has("auth") && request.cookies.get("auth")?.value === "true"

  // Check if the path is for admin routes
  const isAdminPath = path.startsWith("/admin")

  // Check if the user is an admin
  const isAdmin = request.cookies.has("admin") && request.cookies.get("admin")?.value === "true"

  // Get user role
  const userRole = request.cookies.get("role")?.value

  // Redirect logic
  if (!isPublicPath && !isAuthenticated) {
    // Redirect unauthenticated users to login
    return NextResponse.redirect(new URL("/auth/student/login", request.url))
  }

  if (isAdminPath && !isAdmin) {
    // Redirect non-admin users trying to access admin routes
    return NextResponse.redirect(new URL("/auth/admin/login", request.url))
  }

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && path.startsWith("/auth/")) {
    if (userRole === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url))
    } else {
      return NextResponse.redirect(new URL("/student", request.url))
    }
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}

