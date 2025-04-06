"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Trash2, ImagePlus } from "lucide-react"
import { createQuiz } from "@/lib/actions"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CreateQuizPage() {
  const router = useRouter()
  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    timeLimit: 30,
    isActive: true,
  })

  const [questions, setQuestions] = useState<any[]>([
    {
      text: "",
      image: "",
      options: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
    },
  ])

  const [currentTab, setCurrentTab] = useState("details")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleQuizDataChange = (field: string, value: any) => {
    setQuizData({
      ...quizData,
      [field]: value,
    })
  }

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const updatedQuestions = [...questions]
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    }
    setQuestions(updatedQuestions)
  }

  const handleOptionChange = (questionIndex: number, optionIndex: number, field: string, value: any) => {
    const updatedQuestions = [...questions]
    updatedQuestions[questionIndex].options[optionIndex] = {
      ...updatedQuestions[questionIndex].options[optionIndex],
      [field]: value,
    }
    setQuestions(updatedQuestions)
  }

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: "",
        image: "",
        options: [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
      },
    ])
    setCurrentQuestion(questions.length)
  }

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return

    const updatedQuestions = questions.filter((_, i) => i !== index)
    setQuestions(updatedQuestions)

    if (currentQuestion >= updatedQuestions.length) {
      setCurrentQuestion(updatedQuestions.length - 1)
    }
  }

  const handleImageUpload = (questionIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    const reader = new FileReader()

    reader.onloadend = () => {
      handleQuestionChange(questionIndex, "image", reader.result as string)
    }

    reader.readAsDataURL(file)
  }

  const validateQuiz = () => {
    // Check quiz details
    if (!quizData.title.trim()) {
      setError("Quiz title is required")
      setCurrentTab("details")
      return false
    }

    if (!quizData.description.trim()) {
      setError("Quiz description is required")
      setCurrentTab("details")
      return false
    }

    if (quizData.timeLimit <= 0) {
      setError("Time limit must be greater than 0")
      setCurrentTab("details")
      return false
    }

    // Check questions
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i]

      if (!question.text.trim()) {
        setError(`Question ${i + 1} text is required`)
        setCurrentTab("questions")
        setCurrentQuestion(i)
        return false
      }

      // Check if at least one option is marked as correct
      const hasCorrectOption = question.options.some((opt) => opt.isCorrect)
      if (!hasCorrectOption) {
        setError(`Question ${i + 1} must have at least one correct answer`)
        setCurrentTab("questions")
        setCurrentQuestion(i)
        return false
      }

      // Check if all options have text
      for (let j = 0; j < question.options.length; j++) {
        if (!question.options[j].text.trim()) {
          setError(`Option ${j + 1} in Question ${i + 1} is required`)
          setCurrentTab("questions")
          setCurrentQuestion(i)
          return false
        }
      }
    }

    return true
  }

  const handleSubmit = async () => {
    setError("")

    if (!validateQuiz()) {
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createQuiz({
        ...quizData,
        questions,
      })

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push("/admin/quizzes")
        }, 2000)
      } else {
        setError("Failed to create quiz. Please try again.")
      }
    } catch (error) {
      console.error("Failed to create quiz:", error)
      setError("An error occurred while creating the quiz. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="container py-8 max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-green-600">Quiz Created Successfully!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">Your quiz has been created and is now available for students.</p>
            <Button onClick={() => router.push("/admin/quizzes")}>Return to Quizzes</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link href="/" className="flex items-center justify-center">
          <span className="font-bold text-xl">MB-Quiz</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/admin" className="text-sm font-medium hover:underline underline-offset-4">
            Dashboard
          </Link>
          <Link href="/admin/quizzes" className="text-sm font-medium hover:underline underline-offset-4">
            Manage Quizzes
          </Link>
          <Link href="/admin/students" className="text-sm font-medium hover:underline underline-offset-4">
            Student Results
          </Link>
        </nav>
      </header>
      <main className="flex-1 container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Create New Quiz</h1>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="details">Quiz Details</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Quiz Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Quiz Title</Label>
                  <Input
                    id="title"
                    value={quizData.title}
                    onChange={(e) => handleQuizDataChange("title", e.target.value)}
                    placeholder="Enter quiz title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={quizData.description}
                    onChange={(e) => handleQuizDataChange("description", e.target.value)}
                    placeholder="Enter quiz description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    value={quizData.timeLimit}
                    onChange={(e) => handleQuizDataChange("timeLimit", Number.parseInt(e.target.value))}
                    min={1}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={quizData.isActive}
                    onCheckedChange={(checked) => handleQuizDataChange("isActive", checked)}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => setCurrentTab("questions")}>Continue to Questions</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="questions">
            <div className="grid gap-6 md:grid-cols-[250px_1fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {questions.map((_, index) => (
                      <Button
                        key={index}
                        variant={currentQuestion === index ? "default" : "outline"}
                        className="w-full justify-between"
                        onClick={() => setCurrentQuestion(index)}
                      >
                        Question {index + 1}
                        {questions.length > 1 && (
                          <Trash2
                            className="h-4 w-4 text-red-500"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeQuestion(index)
                            }}
                          />
                        )}
                      </Button>
                    ))}
                  </div>

                  <Button variant="outline" className="w-full mt-4" onClick={addQuestion}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Question
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Question {currentQuestion + 1}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="questionText">Question Text</Label>
                    <Textarea
                      id="questionText"
                      value={questions[currentQuestion].text}
                      onChange={(e) => handleQuestionChange(currentQuestion, "text", e.target.value)}
                      placeholder="Enter question text"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Question Image (Optional)</Label>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => document.getElementById(`image-upload-${currentQuestion}`)?.click()}
                      >
                        <ImagePlus className="mr-2 h-4 w-4" />
                        Upload Image
                      </Button>
                      <input
                        id={`image-upload-${currentQuestion}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(currentQuestion, e)}
                      />
                    </div>

                    {questions[currentQuestion].image && (
                      <div className="mt-2">
                        <img
                          src={questions[currentQuestion].image || "/placeholder.svg"}
                          alt="Question"
                          className="max-h-40 rounded-md"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => handleQuestionChange(currentQuestion, "image", "")}
                        >
                          Remove Image
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Label>Answer Options</Label>
                    {questions[currentQuestion].options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-2">
                        <Input
                          value={option.text}
                          onChange={(e) => handleOptionChange(currentQuestion, optionIndex, "text", e.target.value)}
                          placeholder={`Option ${optionIndex + 1}`}
                        />
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`correct-${currentQuestion}-${optionIndex}`}
                            checked={option.isCorrect}
                            onCheckedChange={(checked) =>
                              handleOptionChange(currentQuestion, optionIndex, "isCorrect", checked)
                            }
                          />
                          <Label htmlFor={`correct-${currentQuestion}-${optionIndex}`}>Correct</Label>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end mt-6 space-x-4">
              <Button variant="outline" onClick={() => setCurrentTab("details")}>
                Back to Details
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Creating Quiz..." : "Create Quiz"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
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

