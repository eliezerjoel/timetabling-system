export async function POST() {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/timetable/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
        body: JSON.stringify({
          semester: "Sem1",
          academicYear: "2025-2026",
        }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return Response.json(
        { message: errorData.message || "Failed to start timetable generation" },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("Timetable generation started:", data)
    return Response.json(data)
  } catch (error) {
    console.error("Error starting timetable generation:", error)
    return Response.json({ message: "Internal Server Error" }, { status: 500 })
  }
}
