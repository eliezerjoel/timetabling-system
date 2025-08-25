export async function GET() {
  try {
    // Call Spring Boot backend to get timetable data
    const response = await fetch(`${process.env.BACKEND_URL}/api/timetable`, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (response.status === 404) {
      return new Response(null, { status: 404 })
    }

    if (!response.ok) {
      throw new Error("Failed to fetch timetable")
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("Error fetching timetable:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
