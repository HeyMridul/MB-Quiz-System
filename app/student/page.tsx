"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getAvailableQuizzes } from "@/lib/quiz-service"
import { getCurrentUser } from "@/lib/auth"

export default function StudentDashboard() {
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const quizzesData = await getAvailableQuizzes()
        setQuizzes(quizzesData)

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
        <h1 className="text-2xl font-bold">Welcome, {user?.email?.split("@")[0] || "Student"}</h1>
        <p className="text-muted-foreground">Here are the available quizzes for you to take.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((quiz) => (
          <Card key={quiz.id}>
            <CardHeader>
              <CardTitle>{quiz.title}</CardTitle>
              <CardDescription>{quiz.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Questions: {quiz.questionCount}</p>
              <p className="text-sm">Time Limit: {quiz.timeLimit} minutes</p>
            </CardContent>
            <CardFooter>
              <Link href={`/student/quiz/${quiz.id}`} className="w-full">
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
    </main>
  )
}

