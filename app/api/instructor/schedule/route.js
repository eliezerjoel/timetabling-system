import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "INSTRUCTOR") {
      return new Response("Unauthorized", { status: 401 })
    }

    // Call Spring Boot backend to get instructor's schedule
    const response = await fetch(`${process.env.BACKEND_URL}/api/instructor/${session.user.id}/schedule`, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (response.status === 404) {
      return new Response(null, { status: 404 })
    }

    if (!response.ok) {
      throw new Error("Failed to fetch instructor schedule")
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("Error fetching instructor schedule:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
