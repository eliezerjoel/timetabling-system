export async function GET() {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/timetable/generation-status`, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch generation status")
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("Error fetching generation status:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
