export async function GET(request, { params }) {
  try {
    const { id } = params

    const response = await fetch(`${process.env.BACKEND_URL}/api/instructors/${id}/schedule`, {
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
