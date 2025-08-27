"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { LogOut, ArrowLeft } from "lucide-react"

export default function InstructorSchedule({ params }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [instructor, setInstructor] = useState(null)
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)

  const timeSlots = [
    "08:00-09:00",
    "09:00-10:00",
    "10:00-11:00",
    "11:00-12:00",
    "12:00-13:00",
    "13:00-14:00",
    "14:00-15:00",
    "15:00-16:00",
    "16:00-17:00",
    "17:00-18:00",
  ]

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.role !== "ADMIN") {
      router.push("/login")
      return
    }
    fetchInstructorSchedule()
  }, [session, status, router, params.id])

  const fetchInstructorSchedule = async () => {
    try {
      const response = await fetch(`/api/admin/instructors/${params.id}/schedule`)
      if (response.ok) {
        const data = await response.json()
        setInstructor(data.instructor)
        setSchedule(data.schedule)
      }
    } catch (error) {
      console.error("Error fetching instructor schedule:", error)
    } finally {
      setLoading(false)
    }
  }

  const getClassForSlot = (day, timeSlot) => {
    return schedule.find((cls) => cls.day.toLowerCase() === day.toLowerCase() && cls.timeSlot === timeSlot)
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-university-blue">{instructor?.name} - Schedule</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {session?.user?.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:text-university-blue transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <button
            onClick={() => router.push("/admin/instructors")}
            className="flex items-center space-x-2 text-university-blue hover:text-university-gold transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Instructors</span>
          </button>
        </nav>

        {/* Instructor Info */}
        {instructor && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructor Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Name</span>
                <p className="text-gray-900">{instructor.name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Email</span>
                <p className="text-gray-900">{instructor.email}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Department</span>
                <p className="text-gray-900">{instructor.department}</p>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Weekly Schedule</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  {days.map((day) => (
                    <th
                      key={day}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timeSlots.map((timeSlot) => (
                  <tr key={timeSlot}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{timeSlot}</td>
                    {days.map((day) => {
                      const classInfo = getClassForSlot(day, timeSlot)
                      return (
                        <td key={`${day}-${timeSlot}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {classInfo ? (
                            <div className="bg-university-blue bg-opacity-10 border border-university-blue rounded p-2">
                              <div className="font-medium text-university-blue">{classInfo.courseCode}</div>
                              <div className="text-xs text-gray-600">{classInfo.courseName}</div>
                              <div className="text-xs text-gray-600">Room: {classInfo.room}</div>
                            </div>
                          ) : (
                            <div className="text-gray-400 text-center">-</div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {schedule.length === 0 && (
          <div className="text-center py-8 text-gray-500">No schedule found for this instructor</div>
        )}
      </div>
    </div>
  )
}
