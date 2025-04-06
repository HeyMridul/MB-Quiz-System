"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getStudentResultsByEmail } from "@/lib/quiz-service"
import { getCurrentUser } from "@/lib/auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"

export default function ResultsPage({ searchParams }: { searchParams: { quizId?: string } }) {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [lastResult, setLastResult] = useState<any>(null)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Get current user
        const currentUser = getCurrentUser()
        setUser(currentUser)

        if (currentUser?.email) {
          const resultsData = await getStudentResultsByEmail(currentUser.email)
          setResults(resultsData)
        }

        // Check if there's a last quiz result in localStorage
        const storedResult = localStorage.getItem("lastQuizResult")
        if (storedResult) {
          setLastResult(JSON.parse(storedResult))
          // Clear it after retrieving
          localStorage.removeItem("lastQuizResult")
        }
      } catch (error) {
        console.error("Failed to fetch results:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [searchParams.quizId])

  if (loading) {
    return <div className="flex justify-center items-center min-h-[60vh]">Loading results...</div>
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link href="/" className="flex items-center justify-center">
          <span className="font-bold text-xl">MB-Quiz</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/student" className="text-sm font-medium hover:underline underline-offset-4">
            Dashboard
          </Link>
          <Link href="/student/results" className="text-sm font-medium hover:underline underline-offset-4">
            My Results
          </Link>
          <Link href="/student/leaderboard" className="text-sm font-medium hover:underline underline-offset-4">
            Leaderboard
          </Link>
        </nav>
      </header>
      <main className="flex-1 container py-6">
        <h1 className="text-2xl font-bold mb-6">My Results</h1>

        {lastResult && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-800">
              Quiz completed! You scored {lastResult.score} out of {lastResult.totalQuestions} ({lastResult.percentage}
              %)
            </AlertDescription>
          </Alert>
        )}

        {results.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">No results found</h2>
            <p className="text-muted-foreground mb-6">You haven't completed any quizzes yet.</p>
            <Link href="/student">
              <Button>Go to Dashboard</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {results.map((result) => (
              <Card key={result.id}>
                <CardHeader>
                  <CardTitle>{result.quizTitle}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Score</p>
                      <p className="text-2xl font-bold">
                        {result.score}/{result.totalQuestions}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Percentage</p>
                      <p className="text-2xl font-bold">{Math.round((result.score / result.totalQuestions) * 100)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date Completed</p>
                      <p>{new Date(result.completedAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Time Taken</p>
                      <p>{result.timeTaken} minutes</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Link href={`/student/results/${result.id}`}>
                      <Button variant="outline" className="w-full">
                        View Detailed Results
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} MB-Quiz. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

