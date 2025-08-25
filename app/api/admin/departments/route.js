export async function GET() {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/admin/departments`, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch departments")
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("Error fetching departments:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()

    const response = await fetch(`${process.env.BACKEND_URL}/api/admin/departments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error("Failed to create department")
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("Error creating department:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
