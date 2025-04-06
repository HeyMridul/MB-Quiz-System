"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getLeaderboard } from "@/lib/quiz-service"
import { Badge } from "@/components/ui/badge"
import { Trophy } from "lucide-react"

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const leaderboardData = await getLeaderboard()
        setLeaderboard(leaderboardData)
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()

    // Set up an interval to refresh the leaderboard every 30 seconds
    const intervalId = setInterval(fetchLeaderboard, 30000)

    return () => clearInterval(intervalId)
  }, [])

  if (loading) {
    return <div className="flex justify-center items-center min-h-[60vh]">Loading leaderboard...</div>
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
        <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>

        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Quiz</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead className="text-right">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((entry, index) => (
                  <TableRow key={entry.id} className={index < 3 ? "bg-muted/30" : ""}>
                    <TableCell className="font-medium">
                      {index === 0 ? (
                        <div className="flex items-center">
                          <Trophy className="h-5 w-5 text-yellow-500 mr-1" />
                          <span>1st</span>
                        </div>
                      ) : index === 1 ? (
                        <div className="flex items-center">
                          <Trophy className="h-5 w-5 text-gray-400 mr-1" />
                          <span>2nd</span>
                        </div>
                      ) : index === 2 ? (
                        <div className="flex items-center">
                          <Trophy className="h-5 w-5 text-amber-700 mr-1" />
                          <span>3rd</span>
                        </div>
                      ) : (
                        `${index + 1}th`
                      )}
                    </TableCell>
                    <TableCell>
                      {entry.studentName}
                      {index < 3 && (
                        <Badge
                          variant={index === 0 ? "default" : index === 1 ? "secondary" : "outline"}
                          className="ml-2"
                        >
                          {index === 0 ? "Gold" : index === 1 ? "Silver" : "Bronze"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{entry.quizTitle}</TableCell>
                    <TableCell className="text-right">
                      {entry.score}/{entry.totalQuestions}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {Math.round((entry.score / entry.totalQuestions) * 100)}%
                    </TableCell>
                  </TableRow>
                ))}

                {leaderboard.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No results available yet. Be the first to complete a quiz!
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
            &copy; {new Date().getFullYear()} MB-Quiz. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

