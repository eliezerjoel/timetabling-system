"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, MapPin, Users, BookOpen, Home } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function InstructorDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [schedule, setSchedule] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.role !== "INSTRUCTOR") {
      router.push("/login")
      return
    }
    fetchInstructorSchedule()
  }, [session, status, router])

  const fetchInstructorSchedule = async () => {
    try {
      const response = await fetch("/api/instructor/schedule")
      if (response.ok) {
        const data = await response.json()
        setSchedule(data)
      } else if (response.status === 404) {
        setSchedule(null)
      } else {
        setError("Failed to load schedule")
      }
    } catch (error) {
      console.error("Error fetching schedule:", error)
      setError("Failed to load schedule")
    } finally {
      setLoading(false)
    }
  }

  const timeSlots = [
    "08:00 - 09:00",
    "09:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
    "12:00 - 13:00",
    "13:00 - 14:00",
    "14:00 - 15:00",
    "15:00 - 16:00",
    "16:00 - 17:00",
    "17:00 - 18:00",
  ]

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

  const getClassForTimeSlot = (day, timeSlot) => {
    if (!schedule?.classes) return null
    return schedule.classes.find((cls) => cls.day === day && cls.timeSlot === timeSlot)
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session || session.user.role !== "INSTRUCTOR") {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Calendar className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary">My Schedule</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">Instructor</Badge>
              <span className="text-sm text-muted-foreground">Welcome, {session.user.name}</span>
              <Button asChild variant="outline" size="sm">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  View Full Timetable
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!schedule ? (
          <Card className="text-center">
            <CardContent className="pt-6">
              <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Schedule Available</h2>
              <p className="text-muted-foreground">
                You don't have any classes assigned yet. Please contact the administrator.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Schedule Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Classes</p>
                      <p className="text-2xl font-bold">{schedule.classes?.length || 0}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Courses</p>
                      <p className="text-2xl font-bold">{schedule.totalCourses || 0}</p>
                    </div>
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Weekly Hours</p>
                      <p className="text-2xl font-bold">{schedule.weeklyHours || 0}</p>
                    </div>
                    <Clock className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Rooms Used</p>
                      <p className="text-2xl font-bold">{schedule.roomsUsed || 0}</p>
                    </div>
                    <MapPin className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Schedule Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Weekly Schedule</span>
                </CardTitle>
                <CardDescription>Your personalized teaching schedule for the week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 font-semibold bg-muted min-w-[120px]">Time</th>
                        {daysOfWeek.map((day) => (
                          <th key={day} className="text-center p-3 font-semibold bg-muted min-w-[180px]">
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {timeSlots.map((timeSlot, index) => (
                        <tr
                          key={timeSlot}
                          className={`border-b border-border ${index % 2 === 0 ? "bg-background" : "bg-muted/30"}`}
                        >
                          <td className="p-3 font-medium text-sm">{timeSlot}</td>
                          {daysOfWeek.map((day) => {
                            const classInfo = getClassForTimeSlot(day, timeSlot)
                            return (
                              <td key={day} className="p-2">
                                {classInfo ? (
                                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-center">
                                    <div className="font-semibold text-sm text-primary mb-1">
                                      {classInfo.courseCode}
                                    </div>
                                    <div className="text-xs text-muted-foreground mb-1">{classInfo.courseName}</div>
                                    <div className="flex items-center justify-center space-x-1 text-xs text-muted-foreground">
                                      <MapPin className="h-3 w-3" />
                                      <span>{classInfo.room}</span>
                                    </div>
                                    {classInfo.students && (
                                      <div className="flex items-center justify-center space-x-1 text-xs text-muted-foreground mt-1">
                                        <Users className="h-3 w-3" />
                                        <span>{classInfo.students} students</span>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="h-16 flex items-center justify-center text-muted-foreground text-xs">
                                    Free
                                  </div>
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

            {/* Today's Classes */}
            {schedule.todayClasses && schedule.todayClasses.length > 0 && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Today's Classes</span>
                  </CardTitle>
                  <CardDescription>Your classes scheduled for today</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {schedule.todayClasses.map((classInfo, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-semibold text-sm">
                            {classInfo.timeSlot.split(":")[0]}
                          </div>
                          <div>
                            <h4 className="font-semibold">{classInfo.courseName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {classInfo.courseCode} • {classInfo.timeSlot}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{classInfo.room}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{classInfo.students} students</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  )
}
