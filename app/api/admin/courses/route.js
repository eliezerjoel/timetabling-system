export async function GET() {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/admin/courses`, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch courses")
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("Error fetching courses:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()

    const response = await fetch(`${process.env.BACKEND_URL}/api/admin/courses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error("Failed to create course")
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("Error creating course:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
