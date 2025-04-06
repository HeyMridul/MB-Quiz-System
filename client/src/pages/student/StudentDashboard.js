"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { quizApi } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import StudentLayout from "../../layouts/StudentLayout"

export default function StudentDashboard() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const { currentUser } = useAuth()

  useEffect(() => {
    async function loadData() {
      try {
        const response = await quizApi.getAvailableQuizzes()
        setQuizzes(response.data)
      } catch (error) {
        console.error("Failed to load quizzes:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex justify-center items-center min-h-[60vh]">Loading...</div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Welcome, {currentUser?.firstName || "Student"}</h1>
        <p className="text-muted-foreground">Here are the available quizzes for you to take.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((quiz) => (
          <Card key={quiz._id}>
            <CardHeader>
              <CardTitle>{quiz.title}</CardTitle>
              <CardDescription>{quiz.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Questions: {quiz.questions.length}</p>
              <p className="text-sm">Time Limit: {quiz.timeLimit} minutes</p>
            </CardContent>
            <CardFooter>
              <Link to={`/student/quiz/${quiz._id}`} className="w-full">
                <Button className="w-full">Start Quiz</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}

        {quizzes.length === 0 && (
          <div className="col-span-full text-center py-12">
            <h2 className="text-xl font-semibold mb-2">No quizzes available</h2>
            <p className="text-muted-foreground mb-6">Check back later for new quizzes.</p>
          </div>
        )}
      </div>
    </StudentLayout>
  )
}

