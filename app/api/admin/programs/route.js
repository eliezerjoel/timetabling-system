export async function GET() {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/programs`, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch programs")
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("Error fetching programs:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()

    const response = await fetch(`${process.env.BACKEND_URL}/api/programs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error("Failed to create program")
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("Error creating program:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
