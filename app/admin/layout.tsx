"use client"

import type React from "react"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { isAuthenticated, isAdmin, logout, getCurrentUser } from "@/lib/auth"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = useState<{ email: string; role: string } | null>(null)

  useEffect(() => {
    // Check if user is authenticated and is an admin
    if (!isAuthenticated() || !isAdmin()) {
      router.push("/auth/admin/login")
      return
    }

    // Get current user
    const currentUser = getCurrentUser()
    setUser(currentUser)
  }, [router])

  const handleLogout = () => {
    logout()
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
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </nav>
      </header>
      {children}
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

