"use client"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { useAuth } from "../contexts/AuthContext"

export default function AdminLayout({ children }) {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link to="/" className="flex items-center justify-center">
          <span className="font-bold text-xl">MB-Quiz</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link to="/admin" className="text-sm font-medium hover:underline underline-offset-4">
            Dashboard
          </Link>
          <Link to="/admin/quizzes" className="text-sm font-medium hover:underline underline-offset-4">
            Manage Quizzes
          </Link>
          <Link to="/admin/students" className="text-sm font-medium hover:underline underline-offset-4">
            Student Results
          </Link>
          <Link to="/admin/analytics" className="text-sm font-medium hover:underline underline-offset-4">
            Analytics
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{currentUser?.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </nav>
      </header>
      <main className="flex-1 container py-6">{children}</main>
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

