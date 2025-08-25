"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, User, Calendar, Clock } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { data: session } = useSession()
  const [timetableData, setTimetableData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState("")

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

  const filteredTimetable = timetableData?.departments
    ?.filter((department) =>
      department.courses.some(
        (course) =>
          course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.instructor.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    )
    .map((department) => ({
      ...department,
      courses: department.courses.filter(
        (course) =>
          course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.instructor.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    }))

  const timeSlots = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

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
              {filteredTimetable?.map((department) => (
                <Card key={department.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>{department.name}</span>
                      <Badge variant="outline">{department.courses.length} courses</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left p-3 font-semibold bg-muted">Course</th>
                            <th className="text-left p-3 font-semibold bg-muted">Code</th>
                            <th className="text-left p-3 font-semibold bg-muted">Instructor</th>
                            {timeSlots.map((day) => (
                              <th key={day} className="text-center p-3 font-semibold bg-muted min-w-[120px]">
                                {day}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {department.courses.map((course, index) => (
                            <tr
                              key={course.id}
                              className={`border-b border-border ${index % 2 === 0 ? "bg-background" : "bg-muted/30"}`}
                            >
                              <td className="p-3 font-medium">{course.name}</td>
                              <td className="p-3">
                                <Badge variant="outline">{course.code}</Badge>
                              </td>
                              <td className="p-3 text-muted-foreground">{course.instructor}</td>
                              {timeSlots.map((day) => {
                                const timeSlot = course.timeSlots?.find((slot) => slot.day === day)
                                return (
                                  <td key={day} className="p-3 text-center">
                                    {timeSlot ? (
                                      <div className="space-y-1">
                                        <div className="text-sm font-medium">
                                          {timeSlot.startTime} - {timeSlot.endTime}
                                        </div>
                                        <div className="text-xs text-muted-foreground">{timeSlot.room}</div>
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground">-</span>
                                    )}
                                  </td>
                                )
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredTimetable?.length === 0 && searchTerm && (
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
