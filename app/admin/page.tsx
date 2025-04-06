"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAdminDashboardStats } from "@/lib/quiz-service"
import { getCurrentUser } from "@/lib/auth"

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const statsData = await getAdminDashboardStats()
        setStats(statsData)

        const currentUser = getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("Failed to load data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return <div className="flex justify-center items-center min-h-[60vh]">Loading...</div>
  }

  return (
    <main className="flex-1 container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Welcome, {user?.email?.split("@")[0] || "Admin"}</h1>
        <p className="text-muted-foreground">Here's an overview of your quiz system.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quizzes Taken</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.quizzesTaken}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent">
        <TabsList>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Quiz Submissions</CardTitle>
              <CardDescription>The latest quiz submissions from students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentSubmissions.map((submission: any) => (
                  <div key={submission.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{submission.studentName}</p>
                      <p className="text-sm text-muted-foreground">{submission.quizTitle}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {submission.score}/{submission.totalQuestions}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(submission.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Performance</CardTitle>
              <CardDescription>Performance metrics for each quiz</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.quizPerformance.map((quiz: any) => (
                  <div key={quiz.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{quiz.title}</p>
                      <p className="text-sm text-muted-foreground">{quiz.attemptCount} attempts</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{quiz.averageScore}%</p>
                      <p className="text-sm text-muted-foreground">{quiz.passRate}% pass rate</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}

