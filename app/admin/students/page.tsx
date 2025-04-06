import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { getStudentResults } from "@/lib/quiz-service"

export default async function StudentResultsPage({ searchParams }: { searchParams: { search?: string } }) {
  const results = await getStudentResults(undefined, searchParams.search)

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link href="/" className="flex items-center justify-center">
          <span className="font-bold text-xl">QuizMaster</span>
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
        <h1 className="text-2xl font-bold mb-6">Student Results</h1>

        <div className="mb-6">
          <form>
            <Input
              type="search"
              name="search"
              placeholder="Search by student name or quiz title..."
              className="max-w-md"
              defaultValue={searchParams.search}
            />
          </form>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Results</CardTitle>
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
                {results.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell className="font-medium">{result.studentName}</TableCell>
                    <TableCell>{result.quizTitle}</TableCell>
                    <TableCell>
                      {result.score}/{result.totalQuestions}
                    </TableCell>
                    <TableCell>{Math.round((result.score / result.totalQuestions) * 100)}%</TableCell>
                    <TableCell>{new Date(result.completedAt).toLocaleDateString()}</TableCell>
                    <TableCell>{result.timeTaken} minutes</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/students/results/${result.id}`}>
                        <span className="text-blue-500 hover:underline">View Details</span>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}

                {results.length === 0 && (
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
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} QuizMaster. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

