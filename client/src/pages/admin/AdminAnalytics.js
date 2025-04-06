"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Progress } from "../../components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { adminApi, quizApi, resultsApi } from "../../services/api"
import AdminLayout from "../../layouts/AdminLayout"

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null)
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Get dashboard stats
        const statsResponse = await adminApi.getDashboardStats()
        const stats = statsResponse.data

        // Get all quizzes
        const quizzesResponse = await quizApi.getAllQuizzes()
        setQuizzes(quizzesResponse.data)

        // Get leaderboard
        const leaderboardResponse = await resultsApi.getLeaderboard()
        const leaderboard = leaderboardResponse.data

        // Calculate quiz difficulty
        const quizDifficulty = stats.quizPerformance
          .map((quiz) => ({
            id: quiz.id,
            title: quiz.title,
            averageScore: quiz.averageScore,
            attemptCount: quiz.attemptCount,
            difficulty: calculateDifficulty(quiz.averageScore),
          }))
          .sort((a, b) => a.averageScore - b.averageScore)

        // Calculate student engagement
        const studentEngagement = {
          highEngagement: Math.round((stats.quizzesTaken / stats.totalStudents) * 100) / 100,
          completionRate:
            stats.quizPerformance.reduce((sum, quiz) => sum + quiz.attemptCount / stats.totalStudents, 0) /
            stats.quizPerformance.length,
        }

        setAnalytics({
          ...stats,
          quizDifficulty,
          leaderboard: leaderboard.slice(0, 10),
          studentEngagement,
        })
      } catch (error) {
        console.error("Failed to fetch analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Helper function to calculate difficulty level
  const calculateDifficulty = (averageScore) => {
    if (averageScore >= 80) return "Easy"
    if (averageScore >= 60) return "Medium"
    return "Hard"
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-[60vh]">Loading analytics...</div>
      </AdminLayout>
    )
  }

  if (!analytics) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No data available</h2>
          <p className="text-muted-foreground mb-6">
            Create some quizzes and have students take them to see analytics.
          </p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Comprehensive insights into student performance and quiz effectiveness</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalQuizzes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quizzes Taken</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.quizzesTaken}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageScore}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="difficulty" className="space-y-4">
        <TabsList>
          <TabsTrigger value="difficulty">Quiz Difficulty Analysis</TabsTrigger>
          <TabsTrigger value="topStudents">Top Performing Students</TabsTrigger>
          <TabsTrigger value="engagement">Student Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="difficulty" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Difficulty Analysis</CardTitle>
              <CardDescription>Average performance across different quizzes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analytics.quizDifficulty.map((quiz) => (
                  <div key={quiz.id} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{quiz.title}</span>
                      <span
                        className={
                          quiz.difficulty === "Easy"
                            ? "text-green-600"
                            : quiz.difficulty === "Medium"
                              ? "text-amber-600"
                              : "text-red-600"
                        }
                      >
                        {quiz.difficulty} ({quiz.averageScore}%)
                      </span>
                    </div>
                    <Progress
                      value={quiz.averageScore}
                      className={`h-2 ${
                        quiz.difficulty === "Easy"
                          ? "bg-green-100"
                          : quiz.difficulty === "Medium"
                            ? "bg-amber-100"
                            : "bg-red-100"
                      }`}
                    />
                    <p className="text-xs text-muted-foreground">{quiz.attemptCount} attempts</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topStudents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Students</CardTitle>
              <CardDescription>Students with the highest scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.leaderboard.map((entry, index) => (
                  <div key={entry.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">
                        {index + 1}. {entry.studentName}
                      </p>
                      <p className="text-sm text-muted-foreground">{entry.quizTitle}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{Math.round((entry.score / entry.totalQuestions) * 100)}%</p>
                      <p className="text-sm text-muted-foreground">
                        {entry.score}/{entry.totalQuestions}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Engagement Metrics</CardTitle>
              <CardDescription>Insights into student participation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Average Quizzes per Student</span>
                    <span>{analytics.studentEngagement.highEngagement.toFixed(2)}</span>
                  </div>
                  <Progress value={Math.min(analytics.studentEngagement.highEngagement * 100, 100)} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Quiz Completion Rate</span>
                    <span>{(analytics.studentEngagement.completionRate * 100).toFixed(2)}%</span>
                  </div>
                  <Progress value={analytics.studentEngagement.completionRate * 100} className="h-2" />
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Quiz Participation Breakdown</h3>
                  <div className="space-y-4">
                    {analytics.quizPerformance.map((quiz) => (
                      <div key={quiz.id} className="flex items-center justify-between">
                        <span>{quiz.title}</span>
                        <span className="font-medium">
                          {quiz.attemptCount} / {analytics.totalStudents} students (
                          {Math.round((quiz.attemptCount / analytics.totalStudents) * 100)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  )
}

