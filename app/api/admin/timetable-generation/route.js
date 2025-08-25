export async function POST() {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/admin/timetable/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return Response.json(
        { message: errorData.message || "Failed to start timetable generation" },
        { status: response.status },
      )
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("Error starting timetable generation:", error)
    return Response.json({ message: "Internal Server Error" }, { status: 500 })
  }
}
