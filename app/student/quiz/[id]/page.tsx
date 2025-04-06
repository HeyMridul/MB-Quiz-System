"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"
import { getQuizById } from "@/lib/quiz-service"
import { submitQuiz } from "@/lib/actions"
import { getCurrentUser } from "@/lib/auth"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function QuizPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [quiz, setQuiz] = useState<any>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const quizData = await getQuizById(params.id)
        if (!quizData) {
          setError("Quiz not found")
          setLoading(false)
          return
        }
        setQuiz(quizData)
        setTimeLeft(quizData.timeLimit * 60)
        setStartTime(new Date())
        setLoading(false)

        // Get current user
        const currentUser = getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("Failed to fetch quiz:", error)
        setError("Failed to load quiz. Please try again.")
        setLoading(false)
      }
    }

    fetchQuiz()
  }, [params.id])

  useEffect(() => {
    if (timeLeft <= 0 || !quiz) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, quiz])

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading quiz...</div>
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <Alert variant="destructive" className="max-w-md mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/student")}>Return to Dashboard</Button>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Quiz not found</h2>
        <p className="text-muted-foreground mb-6">The quiz you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.push("/student")}>Return to Dashboard</Button>
      </div>
    )
  }

  const handleAnswerChange = (value: string) => {
    setAnswers({ ...answers, [currentQuestion]: value })
  }

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    if (submitting) return

    setSubmitting(true)
    try {
      // Calculate time taken in minutes
      const endTime = new Date()
      const timeTakenMs = startTime ? endTime.getTime() - startTime.getTime() : 0
      const timeTakenMinutes = Math.ceil(timeTakenMs / (1000 * 60))

      const formattedAnswers = Object.entries(answers).map(([questionIndex, answer]) => ({
        questionId: quiz.questions[Number.parseInt(questionIndex)].id,
        answer,
      }))

      const result = await submitQuiz({
        quizId: params.id,
        answers: formattedAnswers,
        userEmail: user?.email || "student@example.com",
        timeTaken: timeTakenMinutes,
      })

      // Store the result ID in localStorage to show it on the results page
      localStorage.setItem(
        "lastQuizResult",
        JSON.stringify({
          resultId: result.resultId,
          score: result.score,
          totalQuestions: result.totalQuestions,
          percentage: result.percentage,
        }),
      )

      router.push(`/student/results?quizId=${params.id}`)
    } catch (error) {
      console.error("Failed to submit quiz:", error)
      setError("Failed to submit quiz. Please try again.")
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const question = quiz.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  return (
    <div className="container py-8 max-w-3xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">{quiz.title}</h1>
        <div className="text-lg font-semibold">Time Left: {formatTime(timeLeft)}</div>
      </div>

      <Progress value={progress} className="mb-6" />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            Question {currentQuestion + 1} of {quiz.questions.length}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-lg mb-4">{question.text}</div>

          {question.image && (
            <div className="mb-4 flex justify-center">
              <Image
                src={question.image || "/placeholder.svg"}
                alt="Question diagram"
                width={400}
                height={300}
                className="rounded-md"
              />
            </div>
          )}

          <RadioGroup value={answers[currentQuestion] || ""} onValueChange={handleAnswerChange} className="space-y-3">
            {question.options.map((option: any, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option.id} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`}>{option.text}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
            Previous
          </Button>

          {currentQuestion < quiz.questions.length - 1 ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Quiz"}
            </Button>
          )}
        </CardFooter>
      </Card>

      <div className="flex justify-between">
        <div>
          Question {currentQuestion + 1} of {quiz.questions.length}
        </div>
        <Button variant="outline" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Submitting..." : "Finish Quiz"}
        </Button>
      </div>
    </div>
  )
}

