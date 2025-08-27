import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const testUsers = [
  {
    id: "1",
    email: "admin@university.edu",
    password: "admin123",
    name: "Admin User",
    role: "ADMIN",
  },
  {
    id: "2",
    email: "instructor@university.edu",
    password: "instructor123",
    name: "John Smith",
    role: "INSTRUCTOR",
  },
  {
    id: "3",
    email: "student@university.edu",
    password: "student123",
    name: "Jane Doe",
    role: "STUDENT",
  },
]

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const user = testUsers.find((u) => u.email === credentials.email && u.password === credentials.password)

          if (user) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            }
          }

          // Uncomment below when you have your Spring Boot backend running:
          /*
          const response = await fetch(`${process.env.BACKEND_URL}/api/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          if (response.ok) {
            const user = await response.json()
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role, // ADMIN, INSTRUCTOR, STUDENT
            }
          }
          */

          return null
        } catch (error) {
          console.error("Authentication error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      session.user.role = token.role
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
