export async function GET(request, { params }) {
  try {
    const { id } = params

    const response = await fetch(`${process.env.BACKEND_URL}/api/admin/programs/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch program")
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("Error fetching program:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()

    const response = await fetch(`${process.env.BACKEND_URL}/api/admin/programs/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error("Failed to update program")
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("Error updating program:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params

    const response = await fetch(`${process.env.BACKEND_URL}/api/admin/programs/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to delete program")
    }

    return new Response(null, { status: 204 })
  } catch (error) {
    console.error("Error deleting program:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
