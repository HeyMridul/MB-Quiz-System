"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Trash } from "lucide-react"
import { getAllQuizzes } from "@/lib/quiz-service"
import { deleteQuizAction } from "@/lib/actions"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ManageQuizzesPage() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [quizToDelete, setQuizToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const fetchQuizzes = async () => {
    try {
      const quizzesData = await getAllQuizzes()
      setQuizzes(quizzesData)
    } catch (error) {
      console.error("Failed to fetch quizzes:", error)
      setError("Failed to load quizzes. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const handleDeleteQuiz = async () => {
    if (!quizToDelete) return

    setIsDeleting(true)
    try {
      await deleteQuizAction(quizToDelete.id)
      setSuccess(`Quiz "${quizToDelete.title}" has been deleted.`)
      setQuizzes(quizzes.filter((quiz) => quiz.id !== quizToDelete.id))

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("")
      }, 3000)
    } catch (error) {
      console.error("Failed to delete quiz:", error)
      setError("Failed to delete quiz. Please try again.")
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
      setQuizToDelete(null)
    }
  }

  const openDeleteDialog = (quiz) => {
    setQuizToDelete(quiz)
    setShowDeleteDialog(true)
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-[60vh]">Loading quizzes...</div>
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
          <h1 className="text-2xl font-bold">Manage Quizzes</h1>
          <Link href="/admin/quizzes/create">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Quiz
            </Button>
          </Link>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <Card key={quiz.id}>
              <CardHeader>
                <CardTitle>{quiz.title}</CardTitle>
                <CardDescription>{quiz.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Questions:</span>
                    <span>{quiz.questionCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Time Limit:</span>
                    <span>{quiz.timeLimit} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <span className={quiz.isActive ? "text-green-500" : "text-red-500"}>
                      {quiz.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link href={`/admin/quizzes/${quiz.id}`}>
                  <Button variant="outline">View</Button>
                </Link>
                <div className="flex space-x-2">
                  <Link href={`/admin/quizzes/${quiz.id}/edit`}>
                    <Button>Edit</Button>
                  </Link>
                  <Button variant="destructive" size="icon" onClick={() => openDeleteDialog(quiz)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}

          {quizzes.length === 0 && (
            <div className="col-span-full text-center py-12">
              <h2 className="text-xl font-semibold mb-2">No quizzes available</h2>
              <p className="text-muted-foreground mb-6">Create your first quiz to get started.</p>
              <Link href="/admin/quizzes/create">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Quiz
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} MB-Quiz. All rights reserved.
          </p>
        </div>
      </footer>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the quiz "{quizToDelete?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteQuiz} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

