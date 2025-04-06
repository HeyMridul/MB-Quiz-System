"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Progress } from "../../components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { resultsApi } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import StudentLayout from "../../layouts/StudentLayout"

export default function StudentAnalytics() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const { currentUser } = useAuth()

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        // Get student results
        const resultsResponse = await resultsApi.getStudentResults(currentUser.email)
        const results = resultsResponse.data

        if (results.length === 0) {
          setAnalytics({
            totalQuizzes: 0,
            averageScore: 0,
            highestScore: 0,
            lowestScore: 0,
            quizzesByPerformance: [],
            recentActivity: [],
            strengthsWeaknesses: { strengths: [], weaknesses: [] },
          })
          setLoading(false)
          return
        }

        // Calculate analytics
        const totalQuizzes = results.length

        // Calculate scores
        const scores = results.map((result) => ({
          percentage: Math.round((result.score / result.totalQuestions) * 100),
          quizTitle: result.quizTitle,
          date: new Date(result.completedAt),
          score: result.score,
          totalQuestions: result.totalQuestions,
        }))

        const averageScore = Math.round(scores.reduce((sum, item) => sum + item.percentage, 0) / totalQuizzes)

        const highestScore = Math.max(...scores.map((item) => item.percentage))
        const lowestScore = Math.min(...scores.map((item) => item.percentage))

        // Sort quizzes by performance
        const quizzesByPerformance = [...scores].sort((a, b) => b.percentage - a.percentage)

        // Get recent activity
        const recentActivity = [...scores].sort((a, b) => b.date - a.date).slice(0, 5)

        // Determine strengths and weaknesses
        // For this demo, we'll consider >80% as strength and <60% as weakness
        const strengthsWeaknesses = {
          strengths: quizzesByPerformance.filter((quiz) => quiz.percentage >= 80).map((quiz) => quiz.quizTitle),
          weaknesses: quizzesByPerformance.filter((quiz) => quiz.percentage < 60).map((quiz) => quiz.quizTitle),
        }

        setAnalytics({
          totalQuizzes,
          averageScore,
          highestScore,
          lowestScore,
          quizzesByPerformance,
          recentActivity,
          strengthsWeaknesses,
        })
      } catch (error) {
        console.error("Failed to fetch analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [currentUser])

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex justify-center items-center min-h-[60vh]">Loading analytics...</div>
      </StudentLayout>
    )
  }

  if (!analytics || analytics.totalQuizzes === 0) {
    return (
      <StudentLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No data available</h2>
          <p className="text-muted-foreground mb-6">Complete some quizzes to see your performance analytics.</p>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Your Performance Analytics</h1>
        <p className="text-muted-foreground">Track your progress and identify areas for improvement</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quizzes Taken</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalQuizzes}</div>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.highestScore}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lowest Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.lowestScore}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance by Quiz</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          <TabsTrigger value="insights">Strengths & Weaknesses</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Performance</CardTitle>
              <CardDescription>Your performance across different quizzes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analytics.quizzesByPerformance.map((quiz, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{quiz.quizTitle}</span>
                      <span>{quiz.percentage}%</span>
                    </div>
                    <Progress value={quiz.percentage} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Score: {quiz.score}/{quiz.totalQuestions} • {quiz.date.toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your most recent quiz attempts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analytics.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{activity.quizTitle}</p>
                      <p className="text-sm text-muted-foreground">{activity.date.toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{activity.percentage}%</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.score}/{activity.totalQuestions}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Strengths & Weaknesses</CardTitle>
              <CardDescription>Areas where you excel and areas for improvement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-green-600 mb-2">Strengths (80%+ score)</h3>
                  {analytics.strengthsWeaknesses.strengths.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {analytics.strengthsWeaknesses.strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No strengths identified yet.</p>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-red-600 mb-2">Areas for Improvement (Below 60%)</h3>
                  {analytics.strengthsWeaknesses.weaknesses.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {analytics.strengthsWeaknesses.weaknesses.map((weakness, index) => (
                        <li key={index}>{weakness}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No weaknesses identified.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </StudentLayout>
  )
}

