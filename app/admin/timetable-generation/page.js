"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Play, CheckCircle, AlertCircle, ArrowLeft, Clock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function TimetableGenerationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [generating, setGenerating] = useState(false)
  const [generationStatus, setGenerationStatus] = useState(null)
  const [lastGenerated, setLastGenerated] = useState(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.role !== "ADMIN") {
      router.push("/login")
      return
    }
    fetchGenerationStatus()
  }, [session, status, router])

  const fetchGenerationStatus = async () => {
    try {
      const response = await fetch("/api/admin/timetable-generation/status")
      if (response.ok) {
        const data = await response.json()
        setGenerationStatus(data.status)
        setLastGenerated(data.lastGenerated)
      }
    } catch (error) {
      console.error("Error fetching generation status:", error)
    }
  }

  const handleGenerateTimetable = async () => {
    setGenerating(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/admin/timetable-generation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSuccess("Timetable generation started successfully!")
        setGenerationStatus("generating")

        // Poll for completion
        const pollInterval = setInterval(async () => {
          try {
            const statusResponse = await fetch("/api/admin/timetable-generation/status")
            if (statusResponse.ok) {
              const statusData = await statusResponse.json()
              setGenerationStatus(statusData.status)

              if (statusData.status === "completed") {
                setSuccess("Timetable generated successfully!")
                setLastGenerated(new Date().toISOString())
                clearInterval(pollInterval)
              } else if (statusData.status === "failed") {
                setError("Timetable generation failed. Please try again.")
                clearInterval(pollInterval)
              }
            }
          } catch (error) {
            console.error("Error polling status:", error)
            clearInterval(pollInterval)
          }
        }, 2000)

        // Clear interval after 5 minutes to prevent infinite polling
        setTimeout(() => clearInterval(pollInterval), 300000)
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Failed to start timetable generation")
      }
    } catch (error) {
      console.error("Error generating timetable:", error)
      setError("Failed to start timetable generation")
    } finally {
      setGenerating(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <Calendar className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary">Timetable Generation</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Generation Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Current Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {generationStatus === "generating" && (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <Badge variant="secondary">Generating...</Badge>
                  </>
                )}
                {generationStatus === "completed" && (
                  <>
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  </>
                )}
                {generationStatus === "failed" && (
                  <>
                    <AlertCircle className="h-6 w-6 text-red-600" />
                    <Badge variant="destructive">Failed</Badge>
                  </>
                )}
                {!generationStatus && (
                  <>
                    <Clock className="h-6 w-6 text-muted-foreground" />
                    <Badge variant="outline">Ready</Badge>
                  </>
                )}
              </div>
              {lastGenerated && (
                <p className="text-sm text-muted-foreground">
                  Last generated: {new Date(lastGenerated).toLocaleString()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Generation Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Generate New Timetable</CardTitle>
            <CardDescription>
              This will create a new automated timetable based on current courses, instructors, and constraints. The
              process may take several minutes to complete.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Before generating:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Ensure all departments have been created</li>
                  <li>• Verify all courses are properly configured</li>
                  <li>• Check that instructor assignments are up to date</li>
                  <li>• Review room availability and constraints</li>
                </ul>
              </div>

              <Button
                onClick={handleGenerateTimetable}
                disabled={generating || generationStatus === "generating"}
                size="lg"
                className="w-full"
              >
                {generating || generationStatus === "generating" ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Generating Timetable...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Generate Timetable
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Generation History */}
        <Card>
          <CardHeader>
            <CardTitle>Generation History</CardTitle>
            <CardDescription>Recent timetable generation attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Generation completed successfully</p>
                    <p className="text-sm text-muted-foreground">December 15, 2024 at 2:30 PM</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Success</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium">Generation failed - insufficient data</p>
                    <p className="text-sm text-muted-foreground">December 14, 2024 at 10:15 AM</p>
                  </div>
                </div>
                <Badge variant="destructive">Failed</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Generation completed successfully</p>
                    <p className="text-sm text-muted-foreground">December 10, 2024 at 4:45 PM</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Success</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
