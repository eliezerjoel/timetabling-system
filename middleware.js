import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Additional middleware logic can be added here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Allow access to login page and home page
        if (pathname === "/login" || pathname === "/") {
          return true
        }

        // Protect admin routes
        if (pathname.startsWith("/admin")) {
          return token?.role === "ADMIN"
        }

        // Protect instructor routes
        if (pathname.startsWith("/instructor")) {
          return token?.role === "INSTRUCTOR"
        }

        // Allow access to other routes if authenticated
        return !!token
      },
    },
  },
)

export const config = {
  matcher: ["/admin/:path*", "/instructor/:path*"],
}
