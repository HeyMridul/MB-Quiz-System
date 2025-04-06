"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"
import { resultsApi, quizApi } from "../../services/api"
import AdminLayout from "../../layouts/AdminLayout"

export default function AdminStudentsPage() {
  const [results, setResults] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedQuiz, setSelectedQuiz] = useState("all")

  useEffect(() => {
    async function fetchData() {
      try {
        // Get all quizzes for the filter dropdown
        const quizzesResponse = await quizApi.getAllQuizzes()
        setQuizzes(quizzesResponse.data)

        // Get all results initially
        const resultsResponse = await resultsApi.getAllResults()
        setResults(resultsResponse.data)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter results based on search term and selected quiz
  const filteredResults = results.filter((result) => {
    const matchesSearch =
      searchTerm === "" ||
      result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.quizTitle.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesQuiz = selectedQuiz === "all" || result.quizId === selectedQuiz

    return matchesSearch && matchesQuiz
  })

  const handleQuizChange = async (quizId) => {
    setSelectedQuiz(quizId)
    setLoading(true)

    try {
      let resultsData

      if (quizId === "all") {
        // Get all results
        const response = await resultsApi.getAllResults()
        resultsData = response.data
      } else {
        // Get results for specific quiz
        const response = await resultsApi.getStudentResultsByQuiz(quizId)
        resultsData = response.data
      }

      setResults(resultsData)
    } catch (error) {
      console.error("Failed to fetch results:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-[60vh]">Loading results...</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Student Results</h1>
        <p className="text-muted-foreground">View and filter student quiz results</p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            type="search"
            placeholder="Search by student name or quiz title..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <div>
          <Label htmlFor="quiz-filter">Filter by Quiz</Label>
          <Select value={selectedQuiz} onValueChange={handleQuizChange}>
            <SelectTrigger id="quiz-filter">
              <SelectValue placeholder="Select a quiz" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Quizzes</SelectItem>
              {quizzes.map((quiz) => (
                <SelectItem key={quiz._id} value={quiz._id}>
                  {quiz.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedQuiz === "all"
              ? "All Results"
              : `Results for ${quizzes.find((q) => q._id === selectedQuiz)?.title || "Selected Quiz"}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Quiz</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time Taken</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.length > 0 ? (
                filteredResults.map((result) => (
                  <TableRow key={result._id}>
                    <TableCell className="font-medium">{result.studentName}</TableCell>
                    <TableCell>{result.quizTitle}</TableCell>
                    <TableCell>
                      {result.score}/{result.totalQuestions}
                    </TableCell>
                    <TableCell>{Math.round((result.score / result.totalQuestions) * 100)}%</TableCell>
                    <TableCell>{new Date(result.completedAt).toLocaleDateString()}</TableCell>
                    <TableCell>{result.timeTaken} minutes</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="link"
                        onClick={() => (window.location.href = `/admin/students/results/${result._id}`)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No results found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  )
}

