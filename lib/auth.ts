"use client"

import Cookies from "js-cookie"

// Add Google login mock users
const MOCK_USERS = {
  students: [
    { email: "student@example.com", password: "password123" },
    { email: "test@example.com", password: "test123" },
  ],
  admins: [
    { email: "admin@example.com", password: "admin123" },
    { email: "teacher@example.com", password: "teacher123" },
  ],
  google: {
    students: [{ email: "student.google@gmail.com", name: "Student User" }],
    admins: [{ email: "admin.google@gmail.com", name: "Admin User" }],
  },
}

// Cookie configuration
const COOKIE_CONFIG = {
  expires: 7, // 7 days
  path: "/",
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
}

/**
 * Student login function
 */
export async function loginStudent(email: string, password: string, rememberMe: boolean): Promise<boolean> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Check if credentials match any student
  const student = MOCK_USERS.students.find(
    (user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password,
  )

  if (student) {
    // Set authentication cookies
    Cookies.set("auth", "true", {
      ...COOKIE_CONFIG,
      expires: rememberMe ? 7 : 1,
    })

    // Set user role cookie
    Cookies.set("role", "student", {
      ...COOKIE_CONFIG,
      expires: rememberMe ? 7 : 1,
    })

    // Store user info
    localStorage.setItem(
      "user",
      JSON.stringify({
        email: student.email,
        role: "student",
      }),
    )

    return true
  }

  return false
}

/**
 * Admin login function
 */
export async function loginAdmin(email: string, password: string, rememberMe: boolean): Promise<boolean> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Check if credentials match any admin
  const admin = MOCK_USERS.admins.find(
    (user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password,
  )

  if (admin) {
    // Set authentication cookies
    Cookies.set("auth", "true", {
      ...COOKIE_CONFIG,
      expires: rememberMe ? 7 : 1,
    })

    // Set admin role cookie
    Cookies.set("role", "admin", {
      ...COOKIE_CONFIG,
      expires: rememberMe ? 7 : 1,
    })

    // Set admin-specific cookie
    Cookies.set("admin", "true", {
      ...COOKIE_CONFIG,
      expires: rememberMe ? 7 : 1,
    })

    // Store user info
    localStorage.setItem(
      "user",
      JSON.stringify({
        email: admin.email,
        role: "admin",
      }),
    )

    return true
  }

  return false
}

// Add a new function for Google login
/**
 * Login with Google
 */
export async function loginWithGoogle(role: "student" | "admin"): Promise<boolean> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1200))

  try {
    // In a real app, this would redirect to Google OAuth
    // For demo purposes, we'll simulate a successful login

    // Set authentication cookies
    Cookies.set("auth", "true", COOKIE_CONFIG)

    // Set user role cookie
    Cookies.set("role", role, COOKIE_CONFIG)

    // Set admin-specific cookie if needed
    if (role === "admin") {
      Cookies.set("admin", "true", COOKIE_CONFIG)
    }

    // Create a mock Google user
    const mockEmail = role === "admin" ? "admin.google@gmail.com" : "student.google@gmail.com"

    // Store user info
    localStorage.setItem(
      "user",
      JSON.stringify({
        email: mockEmail,
        role: role,
        provider: "google",
      }),
    )

    return true
  } catch (error) {
    console.error("Error during Google login:", error)
    return false
  }
}

/**
 * Logout function
 */
export function logout(): void {
  // Remove all authentication cookies
  Cookies.remove("auth")
  Cookies.remove("role")
  Cookies.remove("admin")

  // Clear local storage
  localStorage.removeItem("user")

  // Redirect to home page
  window.location.href = "/"
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return Cookies.get("auth") === "true"
}

/**
 * Check if user is an admin
 */
export function isAdmin(): boolean {
  return Cookies.get("admin") === "true"
}

/**
 * Get current user info
 */
export function getCurrentUser(): { email: string; role: string } | null {
  const userStr = localStorage.getItem("user")
  if (!userStr) return null

  try {
    return JSON.parse(userStr)
  } catch (e) {
    return null
  }
}

