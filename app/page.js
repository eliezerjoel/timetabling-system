"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Calendar, Clock, LogOut } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { data: session } = useSession()
  const [timetableData, setTimetableData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState("")

  const timeSlots = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]

  useEffect(() => {
    fetchTimetable()
  }, [])

  const fetchTimetable = async () => {
    try {
      const response = await fetch("/api/timetable")
      if (response.ok) {
        const data = await response.json()
        setTimetableData(data)
      } else if (response.status === 404) {
        setTimetableData(null)
      } else {
        setError("Failed to load timetable")
      }
    } catch (error) {
      console.error("Error fetching timetable:", error)
      setError("Failed to load timetable")
    } finally {
      setLoading(false)
    }
  }

  // Organize data to group by day and department
  const organizeByDayAndDepartment = (departments) => {
    const organized = []

    departments?.forEach((department) => {
      const departmentData = {
        departmentId: department.departmentId,
        departmentName: department.departmentName,
        daySchedules: {},
      }

      // Initialize days
      timeSlots.forEach((day) => {
        departmentData.daySchedules[day] = []
      })

      // Group classes by day
      department.classes?.forEach((cls) => {
        if (departmentData.daySchedules[cls.day]) {
          departmentData.daySchedules[cls.day].push({
            courseId: cls.id,
            courseCode: cls.courseCode,
            courseName: cls.courseName,
            instructor: cls.instructor,
            timeSlot: `${cls.startTime} - ${cls.endTime}`,
            room: cls.room || null,
          })
        }
      })

      organized.push(departmentData)
    })

    return organized
  }

  // Filter the timetable based on the search term
  const filteredTimetable = timetableData?.departments
    ?.filter((department) =>
      department.classes.some(
        (cls) =>
          cls.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cls.courseCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          department.departmentName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .map((department) => ({
      ...department,
      classes: department.classes.filter(
        (cls) =>
          cls.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cls.courseCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          department.departmentName?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))

  const organizedTimetable = timetableData ? organizeByDayAndDepartment(filteredTimetable) : null

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading timetable...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Calendar className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary">University Timetabling</h1>
            </div>
            <div className="flex items-center space-x-4">
              {session ? (
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary" className="capitalize">
                    {session.user.role?.toLowerCase()}
                  </Badge>
                  <span className="text-sm text-muted-foreground">Welcome, {session.user.name}</span>
                  {session.user.role === "ADMIN" && (
                    <Button asChild size="sm">
                      <Link href="/admin">Admin Dashboard</Link>
                    </Button>
                  )}
                  {session.user.role === "INSTRUCTOR" && (
                    <Button asChild size="sm">
                      <Link href="/instructor">My Schedule</Link>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </Button>
                </div>
              ) : (
                <Button asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Card className="mb-6 border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {!timetableData ? (
          <Card className="text-center">
            <CardContent className="pt-6">
              <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Timetable Available</h2>
              <p className="text-muted-foreground">
                Timetable has not yet been generated. Please contact an administrator.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Search Bar */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search courses, codes, or instructors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Timetable Display */}
            <div className="space-y-8">
              {organizedTimetable?.map((department) => (
                <div key={department.departmentId} className="border border-border rounded-lg overflow-hidden">
                  {/* Department Header */}
                  <div className="bg-primary text-primary-foreground p-4 text-center">
                    <h2 className="text-lg font-bold">{department.departmentName}</h2>
                  </div>

                  {/* Day-by-day Schedule */}
                  <div className="bg-card">
                    {timeSlots.map((day) => {
                      const dayClasses = department.daySchedules[day]
                      if (!dayClasses || dayClasses.length === 0) return null

                      return (
                        <div key={day} className="border-b border-border last:border-b-0">
                          {/* Day Header */}
                          <div className="bg-muted p-3">
                            <h3 className="font-semibold text-center">{day}</h3>
                          </div>

                          {/* Classes Table */}
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-border bg-muted/50">
                                  <th className="text-left p-3 font-medium">Course</th>
                                  <th className="text-left p-3 font-medium">Instructor</th>
                                  <th className="text-left p-3 font-medium">Timeslot</th>
                                </tr>
                              </thead>
                              <tbody>
                                {dayClasses.map((classItem, index) => (
                                  <tr
                                    key={`${classItem.courseId}-${classItem.timeSlot}-${index}`}
                                    className="border-b border-border last:border-b-0 hover:bg-muted/30"
                                  >
                                    <td className="p-3">
                                      <div>
                                        <span className="font-medium">{classItem.courseCode}</span>
                                        <span className="ml-2 text-muted-foreground">{classItem.courseName}</span>
                                      </div>
                                    </td>
                                    <td className="p-3 text-muted-foreground">{classItem.instructor}</td>
                                    <td className="p-3">
                                      <div>
                                        <span className="font-medium">{classItem.timeSlot}</span>
                                        {classItem.room && (
                                          <div className="text-xs text-muted-foreground">{classItem.room}</div>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {organizedTimetable?.length === 0 && searchTerm && (
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No Results Found</h2>
                  <p className="text-muted-foreground">
                    No courses match your search term "{searchTerm}". Try a different search.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  )
}
